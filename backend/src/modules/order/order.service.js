import orderRepository from './order.repository.js';
import { Op } from 'sequelize';
import productRepository from '../product/product.repository.js';
import Address from '../user/address.model.js';
import sequelize from '../../database/connection.js';
import OrderItem from './order-item.model.js';
import OrderShippingAddress from './order-shipping-address.model.js';
import ProductVariant from '../product/product-variant.model.js';
import Product from '../product/product.model.js';
import User from '../user/user.model.js';
import offerService from '../offer/offer.service.js';

const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
};

const calculateOrderAmounts = async (items, discountCode = null, shippingAmount = 0) => {
    let subtotal = 0;
    for (const item of items) {
        subtotal += (item.price * item.quantity);
    }

    let discountAmount = 0;

    if (discountCode) {
        try {
            const validation = await offerService.validateCoupon(discountCode, subtotal);
            discountAmount = validation.discount_amount;
        } catch (e) {
            // If coupon fails during final order, we could either throw or proceed without discount
            // Standard practice is to throw so user knows why price changed
            throw e;
        }
    }

    const netAmount = (subtotal - discountAmount) + shippingAmount;

    return {
        total_amount: subtotal,
        discount_amount: discountAmount,
        gross_amount: subtotal - discountAmount,
        shipping_amount: shippingAmount,
        net_amount: netAmount
    };
};

class OrderService {
    /**
     * Creates an order directly handling cart logic.
     * Uses a transaction to ensure data integrity across Order, Items, Stock, and Cart.
     */
    async createOrder(userId, data) {
        const {
            items,
            shipping_address_id,
            custom_shipping_address,
            coupon_code,
            use_coins = false, // New Flag
            payment_type = 'cod',
            payment_transaction_id = null
        } = data;

        if (!items || !Array.isArray(items) || items.length === 0) {
            const error = new Error('Order items are required');
            error.statusCode = 400;
            throw error;
        }

        const user = await User.findByPk(userId);
        if (!user) throw new Error('User not found');

        let coinsRedeemed = 0;
        let coinDiscount = 0;

        // 1. Calculate Coin Discount if requested
        if (use_coins) {
            if (user.coins < 50) {
                const error = new Error('You need a minimum of 50 coins to redeem points.');
                error.statusCode = 400;
                throw error;
            }
            coinsRedeemed = user.coins;
            coinDiscount = user.coins; // 1 Coin = 1 Rupee (Simple Logic)
        }

        const orderItemsData = [];

        // 2. Validate Stock & Prepare Items
        for (const item of items) {
            const { product_id, product_variant_id, quantity } = item;

            if (!product_id) {
                const error = new Error('Product ID is required for each item');
                error.statusCode = 400;
                throw error;
            }

            const product = await productRepository.findById(product_id); // Assuming this exists or use Product.findByPk

            if (!product || product.status !== 'active') {
                const error = new Error(`Product not found or inactive`);
                error.statusCode = 404;
                throw error;
            }

            let variant = null;
            if (product_variant_id) {
                variant = await ProductVariant.findByPk(product_variant_id);
                if (!variant) {
                    const error = new Error(`Product variant not found`);
                    error.statusCode = 404;
                    throw error;
                }
            }

            const basePrice = parseFloat(product.price) || 0;
            const itemPrice = variant
                ? basePrice + parseFloat(variant.price_adjustment || 0)
                : basePrice;
            const stockQuantity = variant ? variant.stock_quantity : product.stock_quantity;
            const itemTotal = quantity * itemPrice;

            if (stockQuantity < quantity) {
                const error = new Error(`Insufficient stock for ${product.product_name}`);
                error.statusCode = 400;
                throw error;
            }

            orderItemsData.push({
                product_id: product.id,
                product_variant_id: variant ? variant.id : null,
                product_name: product.product_name,
                color: variant ? variant.color : null,
                size: variant ? variant.size : null,
                price: itemPrice,
                quantity: quantity,
                total_amount: itemTotal
            });
        }

        // 3. Prepare Address
        let shippingAddressData;
        if (custom_shipping_address) {
            shippingAddressData = custom_shipping_address;
        } else if (shipping_address_id) {
            const savedAddress = await Address.findByPk(shipping_address_id);
            if (!savedAddress) {
                const error = new Error('Shipping address not found');
                error.statusCode = 404;
                throw error;
            }
            // Use address fields from savedAddress
            shippingAddressData = {
                full_name: savedAddress.full_name,
                address_line1: savedAddress.address_line1,
                address_line2: savedAddress.address_line2,
                city: savedAddress.city,
                state: savedAddress.state,
                postal_code: savedAddress.postal_code,
                country: savedAddress.country || 'India',
                phone: savedAddress.phone
            };
        } else {
            const error = new Error('Shipping address is required');
            error.statusCode = 400;
            throw error;
        }

        const amounts = await calculateOrderAmounts(orderItemsData, coupon_code, 50);

        // Apply Coin Discount
        if (coinDiscount > 0) {
            // Ensure we don't discount more than total
            if (coinDiscount > amounts.total_amount) {
                coinDiscount = amounts.total_amount;
                coinsRedeemed = coinDiscount;
            }
            amounts.discount_amount += coinDiscount;
            amounts.gross_amount = amounts.total_amount - amounts.discount_amount;
            amounts.net_amount = amounts.gross_amount + amounts.shipping_amount;
        }

        // 4. Execution within Transaction
        return await sequelize.transaction(async (t) => {
            // Deduct Coins from User
            if (coinsRedeemed > 0) {
                user.coins -= coinsRedeemed;
                await user.save({ transaction: t });
            }

            // Create Order
            const order = await orderRepository.create({
                user_id: userId,
                order_number: generateOrderNumber(),
                total_amount: amounts.total_amount,
                discount_amount: amounts.discount_amount,
                gross_amount: amounts.gross_amount,
                shipping_amount: amounts.shipping_amount,
                net_amount: amounts.net_amount,
                status: 'placed',
                payment_status: payment_type === 'cod' ? 'not_paid' : 'paid',
                payment_type,
                payment_transaction_id,
                createdAt: new Date(),
                updatedAt: new Date()
            }, t);

            // Create Order Items and Update Stock
            for (const item of orderItemsData) {
                await orderRepository.createItem({
                    order_id: order.id,
                    ...item,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }, t);

                if (item.product_variant_id) {
                    const variant = await ProductVariant.findByPk(item.product_variant_id, { transaction: t });
                    variant.stock_quantity -= item.quantity;
                    await variant.save({ transaction: t });
                } else {
                    const product = await Product.findByPk(item.product_id, { transaction: t });
                    product.stock_quantity -= item.quantity;
                    await product.save({ transaction: t });
                }
            }

            // Create Order Shipping Address
            await orderRepository.createShippingAddress({
                order_id: order.id,
                shipping_address_id: shipping_address_id || null,
                full_name: shippingAddressData.full_name,
                address_line1: shippingAddressData.address_line1,
                address_line2: shippingAddressData.address_line2,
                city: shippingAddressData.city,
                state: shippingAddressData.state,
                country: shippingAddressData.country,
                postal_code: shippingAddressData.postal_code,
                phone: shippingAddressData.phone,
                createdAt: new Date(),
                updatedAt: new Date()
            }, t);

            return order;
        });
    }

    async getUserOrders(userId, query) {
        const { page = 1, limit = 10, status, payment_status, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
        const offset = (page - 1) * limit;

        const whereClause = { user_id: userId };
        if (status) whereClause.status = status;
        if (payment_status) whereClause.payment_status = payment_status;

        const result = await orderRepository.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortOrder.toUpperCase()]],
            include: [
                {
                    model: OrderItem,
                    as: 'orderItems',
                    attributes: ['id', 'product_name', 'color', 'size', 'price', 'quantity', 'total_amount']
                },
                {
                    model: OrderShippingAddress,
                    as: 'shippingAddress',
                    attributes: ['full_name', 'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country', 'phone']
                }
            ]
        });

        return {
            orders: result.rows,
            pagination: {
                total: result.count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(result.count / limit),
                hasNextPage: parseInt(page) < Math.ceil(result.count / limit),
                hasPrevPage: parseInt(page) > 1
            }
        };
    }

    async getOrderById(userId, id) {
        const order = await orderRepository.findOne({ id, user_id: userId }, [
            {
                model: OrderItem,
                as: 'orderItems',
                attributes: ['id', 'product_name', 'color', 'size', 'price', 'quantity', 'total_amount']
            },
            {
                model: OrderShippingAddress,
                as: 'shippingAddress',
                attributes: ['full_name', 'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country', 'phone']
            }
        ]);

        if (!order) {
            const error = new Error('Order not found');
            error.statusCode = 404;
            throw error;
        }
        return order;
    }

    async updateOrderStatus(id, status) {
        const order = await orderRepository.findByPk(id);
        if (!order) {
            const error = new Error('Order not found');
            error.statusCode = 404;
            throw error;
        }

        order.status = status;
        order.updatedAt = new Date();
        return await orderRepository.save(order);
    }

    async updatePaymentStatus(id, payment_status, transaction_id = null) {
        const order = await orderRepository.findByPk(id);
        if (!order) {
            const error = new Error('Order not found');
            error.statusCode = 404;
            throw error;
        }

        order.payment_status = payment_status;
        if (transaction_id) order.payment_transaction_id = transaction_id;
        order.updatedAt = new Date();
        return await orderRepository.save(order);
    }

    async cancelOrder(userId, id) {
        const order = await orderRepository.findOne({ id, user_id: userId });
        if (!order) {
            const error = new Error('Order not found');
            error.statusCode = 404;
            throw error;
        }

        if (order.status === 'delivered') {
            const error = new Error('Cannot cancel delivered order');
            error.statusCode = 400;
            throw error;
        }

        return await sequelize.transaction(async (t) => {
            const orderItems = await OrderItem.findAll({ where: { order_id: id }, transaction: t });
            for (const item of orderItems) {
                if (item.product_variant_id) {
                    const variant = await ProductVariant.findByPk(item.product_variant_id, { transaction: t });
                    variant.stock_quantity += item.quantity;
                    await variant.save({ transaction: t });
                } else {
                    const product = await Product.findByPk(item.product_id, { transaction: t });
                    product.stock_quantity += item.quantity;
                    await product.save({ transaction: t });
                }
            }

            order.status = 'cancelled';
            order.updatedAt = new Date();
            await orderRepository.save(order, t);
            return true;
        });
    }

    async getAllOrders(query) {
        const { page = 1, limit = 10, status, payment_status, payment_type, sortBy = 'createdAt', sortOrder = 'DESC', search } = query;
        const offset = (page - 1) * limit;
        const whereClause = {};
        if (status) whereClause.status = status;
        if (payment_status) whereClause.payment_status = payment_status;
        if (payment_type) whereClause.payment_type = payment_type;
        if (search) {
            whereClause.order_number = { [Op.iLike]: `%${search}%` };
        }

        const userWhere = search ? {
            [Op.or]: [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ]
        } : {};

        // If searching by user fields, we need to do a broader query
        // Use OR across order_number and user fields
        if (search) {
            delete whereClause.order_number;
        }

        const result = await orderRepository.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortOrder.toUpperCase()]],
            include: [
                { model: OrderItem, as: 'orderItems' },
                { model: OrderShippingAddress, as: 'shippingAddress' },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'phone', 'image'],
                    ...(search ? { where: userWhere, required: false } : {})
                }
            ],
            ...(search ? {
                where: {
                    ...whereClause,
                    [Op.or]: [
                        { order_number: { [Op.iLike]: `%${search}%` } },
                        { '$user.name$': { [Op.iLike]: `%${search}%` } },
                        { '$user.email$': { [Op.iLike]: `%${search}%` } }
                    ]
                }
            } : {})
        });

        return {
            orders: result.rows,
            total: result.count,
            pagination: {
                total: result.count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(result.count / limit),
                hasNextPage: parseInt(page) < Math.ceil(result.count / limit),
                hasPrevPage: parseInt(page) > 1
            }
        };
    }

    async getOrderStatistics(period = 'month') {
        const now = new Date();
        let dateFilter;
        // ... (statistics logic keeps using Op/sequelize but encapsulated in service)
        // Ideally, move aggregation to repository for better DB abstraction
        return await orderRepository.getStats(period);
    }

    /**
     * Update delivery tracking information
     */
    async updateDeliveryTracking(id, trackingData) {
        const order = await orderRepository.findByPk(id);
        if (!order) {
            const error = new Error('Order not found');
            error.statusCode = 404;
            throw error;
        }

        const { tracking_number, delivery_partner, estimated_delivery_date, delivery_notes } = trackingData;

        if (tracking_number) order.tracking_number = tracking_number;
        if (delivery_partner) order.delivery_partner = delivery_partner;
        if (estimated_delivery_date) order.estimated_delivery_date = estimated_delivery_date;
        if (delivery_notes) order.delivery_notes = delivery_notes;

        order.updatedAt = new Date();
        return await orderRepository.save(order);
    }

    /**
     * Mark order as delivered
     */
    async markAsDelivered(id, deliveryData = {}) {
        const order = await orderRepository.findByPk(id);
        if (!order) {
            const error = new Error('Order not found');
            error.statusCode = 404;
            throw error;
        }

        order.status = 'delivered';
        order.actual_delivery_date = deliveryData.actual_delivery_date || new Date();
        if (deliveryData.delivery_notes) {
            order.delivery_notes = deliveryData.delivery_notes;
        }
        order.updatedAt = new Date();

        return await orderRepository.save(order);
    }

}

export default new OrderService();
