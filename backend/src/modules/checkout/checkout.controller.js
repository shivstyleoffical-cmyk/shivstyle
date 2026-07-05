import { v4 as uuidv4 } from 'uuid';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import config from '../../config/config.js';
import { Op } from 'sequelize';
import User from '../user/user.model.js';
import Role from '../user/role.model.js';
import Order from '../order/order.model.js';
import OrderItem from '../order/order-item.model.js';
import OrderShippingAddress from '../order/order-shipping-address.model.js';
import OrderService from '../order/order.service.js';
import ProductVariant from '../product/product-variant.model.js';
import Product from '../product/product.model.js';
import shiprocketService from '../../integrations/delivery/shiprocket.service.js';
import Offer from '../offer/offer.model.js';
import OfferService from '../offer/offer.service.js';
import mailer from '../../integrations/email/email.service.js';
import { Order_Placed_Email_Template, Order_Shipped_Email_Template } from '../../integrations/email/email.templates.js';

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummyKeyId123',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummySecret123'
});

/**
 * Helper to log requests and responses to production database for auditing
 */
const logToDb = async (endpoint, method, headers, body, response) => {
    try {
        await Order.sequelize.query(
            `INSERT INTO request_logs (endpoint, method, headers, body, response) VALUES (:endpoint, :method, :headers, :body, :response)`,
            {
                replacements: {
                    endpoint,
                    method,
                    headers: typeof headers === 'object' ? JSON.stringify(headers) : String(headers),
                    body: typeof body === 'object' ? JSON.stringify(body) : String(body),
                    response: typeof response === 'object' ? JSON.stringify(response) : String(response)
                }
            }
        );
    } catch (err) {
        console.error(`[DB Log Error] Failed to write log for ${endpoint}:`, err);
    }
};

/**
 * Helper to book Shiprocket shipment for an order
 */
export const bookShipment = async (orderId, packageOverrides = {}) => {
    try {
        const order = await Order.findByPk(orderId, {
            include: [
                { model: OrderItem, as: 'orderItems' },
                { model: OrderShippingAddress, as: 'shippingAddress' },
                { model: User, as: 'user' }
            ]
        });

        if (!order || !order.shippingAddress) {
            console.error(`Order ${orderId} or shipping address not found for Shiprocket booking`);
            return null;
        }

        const { weight = 0.5, length = 15, breadth = 15, height = 10, pickupLocation = 'Primary' } = packageOverrides;
        const orderDate = new Date(order.createdAt || Date.now()).toISOString().split('T')[0];
        const shippingAddress = order.shippingAddress;

        const shipmentData = {
            orderId: order.order_number,
            orderDate: orderDate,
            items: order.orderItems.map(item => ({
                name: item.product_name,
                id: item.product_id,
                quantity: item.quantity,
                price: parseFloat(item.price),
                sku: item.product_variant_id || item.product_id
            })),
            pickupAddress: { locationName: pickupLocation },
            deliveryAddress: {
                name: shippingAddress.full_name || 'Customer',
                address: `${shippingAddress.address_line1} ${shippingAddress.address_line2 || ''}`.trim(),
                city: shippingAddress.city,
                pincode: shippingAddress.postal_code,
                state: shippingAddress.state,
                country: shippingAddress.country || 'India',
                email: order.user?.email || 'guest@shivstyle.com',
                phone: (shippingAddress.phone || order.user?.phone || '9999999999').replace(/\D/g, '').slice(-10)
            },
            weight: parseFloat(weight) || 0.5,
            dimensions: {
                length: parseInt(length) || 15,
                breadth: parseInt(breadth) || 15,
                height: parseInt(height) || 10
            },
            paymentMethod: order.payment_type === 'cod' ? 'cod' : 'prepaid',
            subtotal: parseFloat(order.total_amount)
        };

        // Standard pricing fallback if credentials are dry
        if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
            console.log(`[Shiprocket] Credentials dry. Skipping API booking for order ${order.order_number}.`);
            order.delivery_partner = 'Shiprocket (Mock)';
            order.tracking_number = 'SR-MOCK-' + Math.floor(100000 + Math.random() * 900000);
            order.estimated_delivery_date = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
            await order.save();
            sendOrderShippedEmail(order.id);
            return order;
        }

        const result = await shiprocketService.createShipment(shipmentData);
        order.delivery_partner = result.courierName || 'Shiprocket';
        order.tracking_number = result.awb || result.shipmentId;
        order.estimated_delivery_date = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
        await order.save();

        sendOrderShippedEmail(order.id);

        console.log(`[Shiprocket] Shipment created successfully for ${order.order_number}: AWB ${order.tracking_number}`);
        return result;
    } catch (error) {
        console.error(`[Shiprocket] Error booking shipment for order ${orderId}:`, error.message);
        try {
            const order = await Order.findByPk(orderId);
            if (order) {
                order.delivery_partner = 'Shiprocket (Pending)';
                order.tracking_number = 'SR-PEND-' + Math.floor(100000 + Math.random() * 900000);
                await order.save();
            }
        } catch (dbErr) {
            console.error("Failed to update delivery failure tracking:", dbErr);
        }
        return null;
    }
};

/**
 * Helper to increment the usage count of a coupon code applied to an order
 */
const incrementCouponUsage = async (order) => {
    if (order.coupon_code && !order.coupon_used_incremented) {
        try {
            await Offer.increment('used_count', {
                by: 1,
                where: { code: order.coupon_code }
            });
            order.coupon_used_incremented = true;
            await order.save();
            console.log(`[Magic Checkout] Incremented usage count for coupon: ${order.coupon_code}`);
        } catch (offerErr) {
            console.error("[Magic Checkout] Failed to increment coupon used_count:", offerErr);
        }
    }
};

/**
 * Send order confirmation email to customer
 */
export const sendOrderPlacedEmail = async (orderId) => {
    try {
        const order = await Order.findByPk(orderId, {
            include: [{ model: User, as: 'user' }]
        });
        if (!order || !order.user || !order.user.email) return;

        const html = Order_Placed_Email_Template
            .replace('{name}', order.user.name || 'Customer')
            .replace('{orderNumber}', order.order_number)
            .replace('{netAmount}', `₹${parseFloat(order.net_amount).toFixed(2)}`)
            .replace('{paymentType}', order.payment_type || 'prepaid')
            .replace('{year}', String(new Date().getFullYear()));

        await mailer.sendmail(order.user.email, `Order Confirmation - ${order.order_number}`, html);
        console.log(`✉️ [Email] Order confirmation sent successfully to ${order.user.email} for order ${order.order_number}`);
    } catch (err) {
        console.error(`❌ [Email Error] Failed to send order placed email for order ${orderId}:`, err.message);
    }
};

/**
 * Send order shipped/tracking email to customer
 */
export const sendOrderShippedEmail = async (orderId) => {
    try {
        const order = await Order.findByPk(orderId, {
            include: [{ model: User, as: 'user' }]
        });
        if (!order || !order.user || !order.user.email || !order.tracking_number) return;

        const html = Order_Shipped_Email_Template
            .replace('{name}', order.user.name || 'Customer')
            .replace('{orderNumber}', order.order_number)
            .replace('{courier}', order.delivery_partner || 'Shiprocket')
            .replace(/{trackingNumber}/g, order.tracking_number)
            .replace('{year}', String(new Date().getFullYear()));

        await mailer.sendmail(order.user.email, `Your ShivStyle order ${order.order_number} has been shipped!`, html);
        console.log(`✉️ [Email] Tracking details sent successfully to ${order.user.email} for order ${order.order_number}`);
    } catch (err) {
        console.error(`❌ [Email Error] Failed to send order shipped email for order ${orderId}:`, err.message);
    }
};

/**
 * Step 1: Initiate Checkout Session
 * Creates a pending order in the database and returns Razorpay order options.
 */
export const initiateCheckout = async (req, res, next) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Items are required' });
        }

        // Fetch db items & prices
        const dbItems = [];
        for (const item of items) {
            const prod = await Product.findByPk(item.id || item.product_id);
            if (!prod) {
                return res.status(404).json({ success: false, message: `Product not found: ${item.id}` });
            }

            let price = parseFloat(prod.price);
            if (item.variantId) {
                const variant = await ProductVariant.findByPk(item.variantId);
                if (variant) {
                    price = parseFloat(prod.price) + parseFloat(variant.price_adjustment || 0);
                }
            }

            const cleanDescription = prod.description
                ? prod.description.replace(/<[^>]*>/g, '').substring(0, 120).trim()
                : 'Premium streetwear apparel from ShivStyle.';

            dbItems.push({
                product_id: prod.id,
                product_variant_id: item.variantId || null,
                quantity: item.quantity,
                price: price,
                name: prod.product_name || 'ShivStyle Item',
                description: cleanDescription || 'Premium streetwear apparel.',
                image_url: prod.image_url || 'https://www.shivstyles.in/logo.png'
            });
        }

        // Create temporary Guest User for checkout tracking
        const myReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const temporaryGuest = await User.create({
            id: uuidv4(),
            name: 'Guest Customer',
            email: null,
            phone: null,
            is_verified: false,
            referral_code: myReferralCode,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const roleData = await Role.findOne({ where: { role_name: 'customer' } });
        if (roleData) {
            await temporaryGuest.addRole(roleData);
        }

        // Placeholder shipping address to pass OrderService validation
        const custom_shipping_address = {
            full_name: 'Guest Customer',
            address_line1: 'Pending Checkout',
            address_line2: '',
            city: 'Pending',
            state: 'Pending',
            postal_code: '000000',
            country: 'India',
            phone: '0000000000'
        };

        const order = await OrderService.createOrder(temporaryGuest.id, {
            items: dbItems,
            custom_shipping_address,
            payment_type: 'upi',
            use_coins: false
        });

        // Ensure newly initiated checkout order is marked as unpaid until verified
        order.payment_status = 'not_paid';
        await order.save();

        // Calculate amount from items directly — order.net_amount may be null/0 from OrderService
        const itemsTotal = dbItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderNetAmount = parseFloat(order.net_amount) || parseFloat(order.total_amount) || itemsTotal;
        const amountInPaisa = Math.round(orderNetAmount * 100);

        console.log(`[Checkout] Order amount: ₹${orderNetAmount} (${amountInPaisa} paise) | Items total: ₹${itemsTotal}`);

        if (!amountInPaisa || amountInPaisa <= 0) {
            return res.status(400).json({ success: false, message: 'Could not calculate order amount. Please try again.' });
        }

        let razorpayOrderId = '';
        let isMock = false;

        const lineItems = dbItems.map(item => {
            const itemPriceInPaise = Math.round(item.price * 100);
            return {
                sku: String(item.product_variant_id || item.product_id),
                variant_id: String(item.product_variant_id || item.product_id),
                name: String(item.name || 'ShivStyle Item'),
                price: itemPriceInPaise,
                offer_price: itemPriceInPaise,
                quantity: Number(item.quantity),
                description: String(item.description || 'Premium streetwear apparel.'),
                image_url: String(item.image_url)
            };
        });

        try {
            const razorpayOptions = {
                amount: amountInPaisa,
                currency: 'INR',
                receipt: order.order_number,
                payment_capture: 1,
                line_items_total: Math.round(itemsTotal * 100),
                line_items: lineItems
            };

            const razorpayOrder = await razorpay.orders.create(razorpayOptions);
            razorpayOrderId = razorpayOrder.id;
            order.payment_transaction_id = razorpayOrderId;
            await order.save();
        } catch (rzpErr) {
            const errMsg = rzpErr?.error?.description || rzpErr?.message || JSON.stringify(rzpErr);
            console.warn("Razorpay order generation failed on checkout initiation, falling back to mock sandbox:", errMsg);
            razorpayOrderId = 'order_mock_' + Math.random().toString(36).substring(2, 12);
            order.payment_transaction_id = razorpayOrderId;
            await order.save();
            isMock = true;
        }

        return res.status(200).json({
            success: true,
            orderId: order.id,
            orderNumber: order.order_number,
            razorpayOrderId,
            amount: amountInPaisa,
            currency: 'INR',
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummyKeyId123',
            isMock
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Step 2: Complete Checkout Session
 * Called by the 3rd party hosted portal to submit details and load the payment processor.
 */
export const completeCheckout = async (req, res, next) => {
    try {
        const { orderId, customerDetails, shippingAddress, paymentMethod } = req.body;

        const order = await Order.findByPk(orderId, {
            include: [{ model: OrderItem, as: 'orderItems' }]
        });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order session not found' });
        }

        // Update Guest User details
        const guestUserId = order.user_id;
        const email = customerDetails.email ? customerDetails.email.trim().toLowerCase() : null;

        if (email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                // Link order to existing user instead of temporary guest user
                order.user_id = existingUser.id;
                await order.save();

                let userChanged = false;
                const finalName = customerDetails.name && customerDetails.name !== 'Guest Customer' ? customerDetails.name : null;
                if (finalName && (!existingUser.name || existingUser.name === 'Guest Customer')) {
                    existingUser.name = finalName;
                    userChanged = true;
                }
                if (customerDetails.phone && !existingUser.phone) {
                    existingUser.phone = customerDetails.phone;
                    userChanged = true;
                }
                if (userChanged) {
                    await existingUser.save();
                }

                // Delete the temporary guest user to clean up
                try {
                    const guestUser = await User.findByPk(guestUserId);
                    if (guestUser && guestUser.id !== existingUser.id) {
                        await guestUser.destroy();
                    }
                } catch (destroyErr) {
                    console.warn("Failed to delete temporary guest user:", destroyErr.message);
                }
            } else {
                const user = await User.findByPk(guestUserId);
                if (user) {
                    user.name = customerDetails.name || user.name;
                    user.email = email;
                    user.phone = customerDetails.phone || user.phone;
                    user.is_verified = true;
                    await user.save();
                }
            }
        } else {
            const user = await User.findByPk(guestUserId);
            if (user) {
                user.name = customerDetails.name || user.name;
                user.phone = customerDetails.phone || user.phone;
                user.is_verified = true;
                await user.save();
            }
        }

        // Update Shipping Address details
        const shippingRecord = await OrderShippingAddress.findOne({ where: { order_id: orderId } });
        if (shippingRecord) {
            shippingRecord.full_name = customerDetails.name;
            shippingRecord.address_line1 = shippingAddress.address_line1;
            shippingRecord.address_line2 = shippingAddress.address_line2 || '';
            shippingRecord.city = shippingAddress.city;
            shippingRecord.state = shippingAddress.state;
            shippingRecord.postal_code = shippingAddress.postal_code;
            shippingRecord.phone = customerDetails.phone;
            await shippingRecord.save();
        }

        if (paymentMethod === 'cod') {
            order.payment_type = 'cod';
            order.payment_status = 'not_paid';
            order.status = 'placed';
            await order.save();

            // Increment coupon usage
            await incrementCouponUsage(order);

            // Send order confirmation email (non-blocking)
            sendOrderPlacedEmail(order.id);

            // Book Shiprocket shipment (Disabled: Admin will proceed manually from dashboard)
            // await bookShipment(order.id);

            return res.status(200).json({
                success: true,
                paymentMethod: 'cod',
                orderId: order.id,
                orderNumber: order.order_number
            });
        }

        // Online payment Razorpay options
        order.payment_type = 'upi'; // Map to upi enum
        order.payment_status = 'not_paid';
        await order.save();

        const amountInPaisa = Math.round(parseFloat(order.net_amount) * 100);

        try {
            const razorpayOptions = {
                amount: amountInPaisa,
                currency: 'INR',
                receipt: order.order_number,
                payment_capture: 1
            };

            const razorpayOrder = await razorpay.orders.create(razorpayOptions);

            order.payment_transaction_id = razorpayOrder.id;
            await order.save();

            return res.status(200).json({
                success: true,
                paymentMethod: 'razorpay',
                orderId: order.id,
                orderNumber: order.order_number,
                razorpayOrderId: razorpayOrder.id,
                amount: amountInPaisa,
                currency: 'INR',
                key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummyKeyId123',
                customer: {
                    name: customerDetails.name,
                    email: customerDetails.email || 'guest@shivstyle.com',
                    phone: customerDetails.phone
                }
            });
        } catch (rzpErr) {
            console.error("Razorpay order failed inside Magic portal:", rzpErr);
            // Sandbox simulation mode
            const mockRazorpayOrderId = 'order_mock_' + Math.random().toString(36).substring(2, 12);
            order.payment_transaction_id = mockRazorpayOrderId;
            await order.save();

            return res.status(200).json({
                success: true,
                paymentMethod: 'razorpay',
                orderId: order.id,
                orderNumber: order.order_number,
                razorpayOrderId: mockRazorpayOrderId,
                amount: amountInPaisa,
                currency: 'INR',
                key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummyKeyId123',
                isMock: true,
                customer: {
                    name: customerDetails.name,
                    email: customerDetails.email || 'guest@shivstyle.com',
                    phone: customerDetails.phone
                }
            });
        }

    } catch (error) {
        next(error);
    }
};

/**
 * Fetch Order info for checkout portal initialization
 */
export const getCheckoutOrder = async (req, res, next) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                { model: OrderItem, as: 'orderItems' }
            ]
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Checkout session expired' });
        }

        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify Razorpay payment signature
 */
export const verifyPayment = async (req, res, next) => {
    try {
        const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const isMockOrder = razorpayOrderId.startsWith('order_mock_');

        if (isMockOrder) {
            // Update Guest User details with sandbox dummy credentials
            const user = await User.findByPk(order.user_id);
            if (user) {
                user.name = 'Rajen Kumar';
                user.email = 'rajen.test_' + Math.random().toString(36).substring(2, 10) + '@gmail.com';
                user.phone = '9876543210';
                user.is_verified = true;
                await user.save();
            }

            // Update placeholder Shipping Address with realistic mock address details
            const shippingRecord = await OrderShippingAddress.findOne({ where: { order_id: orderId } });
            if (shippingRecord) {
                shippingRecord.full_name = 'Rajen Kumar';
                shippingRecord.address_line1 = '123 ShivStyle Residency, MG Road';
                shippingRecord.address_line2 = 'Near Central Mall';
                shippingRecord.city = 'Bengaluru';
                shippingRecord.state = 'Karnataka';
                shippingRecord.postal_code = '560001';
                shippingRecord.phone = '9876543210';
                await shippingRecord.save();
            }

            order.payment_type = 'upi';
            order.payment_status = 'paid';
            order.payment_transaction_id = razorpayPaymentId || 'pay_mock_' + Math.random().toString(36).substring(2, 12);
            order.status = 'placed';
            await order.save();

            // Increment coupon usage
            await incrementCouponUsage(order);

            // Send order confirmation email (non-blocking)
            sendOrderPlacedEmail(order.id);

            // Book Shiprocket shipment (Disabled: Admin will proceed manually from dashboard)
            // await bookShipment(order.id);

            return res.status(200).json({
                success: true,
                message: 'Payment verified (Sandbox)',
                orderId: order.id
            });
        }

        const keySecret = process.env.RAZORPAY_KEY_SECRET || 'dummySecret123';
        const hmac = crypto.createHmac('sha256', keySecret);
        hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature === razorpaySignature) {
            // Fetch final order/customer information collected by 3rd-party checkout
            let shippingAddress = null;
            let customerDetails = { name: 'Guest Customer', email: null, phone: null };
            let rzpPaymentDetails = null;

            try {
                // Query Razorpay ORDER endpoint — Magic Checkout stores address in customer_details
                const rzpOrderDetails = await razorpay.orders.fetch(razorpayOrderId);
                console.log('[verifyPayment] Razorpay order customer_details:', JSON.stringify(rzpOrderDetails?.customer_details));

                // Magic Checkout puts address & identity under customer_details
                const custDetails = rzpOrderDetails?.customer_details;
                if (custDetails) {
                    customerDetails.name = custDetails.name || customerDetails.name;
                    customerDetails.email = custDetails.email || customerDetails.email;
                    customerDetails.phone = custDetails.contact || customerDetails.phone;

                    // Prefer shipping_address, fall back to billing_address
                    const rzpAddress = custDetails.shipping_address || custDetails.billing_address;
                    if (rzpAddress) {
                        shippingAddress = rzpAddress;
                    }
                }

                // Also query the PAYMENT endpoint for any remaining fields
                rzpPaymentDetails = await razorpay.payments.fetch(razorpayPaymentId);
                if (rzpPaymentDetails) {
                    // Only override if not already set by order customer_details
                    if (!customerDetails.email && rzpPaymentDetails.email) {
                        customerDetails.email = rzpPaymentDetails.email;
                    }
                    if (!customerDetails.phone && rzpPaymentDetails.contact) {
                        customerDetails.phone = rzpPaymentDetails.contact;
                    }
                    if (!customerDetails.name || customerDetails.name === 'Guest Customer') {
                        customerDetails.name = rzpPaymentDetails.notes?.name ||
                            rzpPaymentDetails.email?.split('@')[0] ||
                            customerDetails.name;
                    }

                    // Fallback: address from payment notes
                    if (!shippingAddress && rzpPaymentDetails.notes?.shipping_address) {
                        try {
                            shippingAddress = JSON.parse(rzpPaymentDetails.notes.shipping_address);
                        } catch (e) {
                            shippingAddress = { line1: rzpPaymentDetails.notes.shipping_address, city: 'Pending', state: 'Pending', postal_code: '000000' };
                        }
                    }
                }
            } catch (rzpFetchErr) {
                console.error("Failed to fetch shipping/customer details from Razorpay:", rzpFetchErr.message);
            }

            // Save customer profile details
            const guestUserId = order.user_id;
            const email = customerDetails.email ? customerDetails.email.trim().toLowerCase() : null;

            if (email) {
                const existingUser = await User.findOne({ where: { email } });
                if (existingUser) {
                    order.user_id = existingUser.id;
                    await order.save();

                    let userChanged = false;
                    const finalName = customerDetails.name && customerDetails.name !== 'Guest Customer' ? customerDetails.name : null;
                    if (finalName && (!existingUser.name || existingUser.name === 'Guest Customer')) {
                        existingUser.name = finalName;
                        userChanged = true;
                    }
                    if (customerDetails.phone && !existingUser.phone) {
                        existingUser.phone = customerDetails.phone;
                        userChanged = true;
                    }
                    if (userChanged) {
                        await existingUser.save();
                    }

                    // Delete the temporary guest user to clean up
                    try {
                        const guestUser = await User.findByPk(guestUserId);
                        if (guestUser && guestUser.id !== existingUser.id) {
                            await guestUser.destroy();
                        }
                    } catch (destroyErr) {
                        console.warn("Failed to delete temporary guest user:", destroyErr.message);
                    }
                } else {
                    const user = await User.findByPk(guestUserId);
                    if (user) {
                        user.name = customerDetails.name && customerDetails.name !== 'Guest Customer' ? customerDetails.name : user.name;
                        user.email = email;
                        user.phone = customerDetails.phone || user.phone;
                        user.is_verified = true;
                        await user.save();
                    }
                }
            } else {
                const user = await User.findByPk(guestUserId);
                if (user) {
                    user.name = customerDetails.name && customerDetails.name !== 'Guest Customer' ? customerDetails.name : user.name;
                    user.phone = customerDetails.phone || user.phone;
                    user.is_verified = true;
                    await user.save();
                }
            }

            // Save actual delivery shipping address details
            const shippingRecord = await OrderShippingAddress.findOne({ where: { order_id: orderId } });
            if (shippingRecord) {
                if (shippingAddress) {
                    // Magic Checkout uses: line1, line2, zipcode, name, primary (city), secondary (state)
                    shippingRecord.full_name = shippingAddress.name || customerDetails.name || 'Customer';
                    shippingRecord.address_line1 = shippingAddress.line1 || shippingAddress.address_line1 || 'Provided on checkout';
                    shippingRecord.address_line2 = shippingAddress.line2 || shippingAddress.address_line2 || '';
                    shippingRecord.city = shippingAddress.city || shippingAddress.primary || 'Provided on checkout';
                    shippingRecord.state = shippingAddress.state || shippingAddress.secondary || 'Provided on checkout';
                    shippingRecord.postal_code = shippingAddress.zipcode || shippingAddress.postal_code || shippingAddress.pincode || '000000';
                    shippingRecord.phone = customerDetails.phone || '0000000000';
                } else {
                    // At minimum update name and phone from payment details
                    shippingRecord.full_name = customerDetails.name || shippingRecord.full_name;
                    shippingRecord.phone = customerDetails.phone || shippingRecord.phone;
                }
                await shippingRecord.save();
            }

            // If actual amount paid is different (due to promo coupon applied in Magic Checkout modal), update order totals
            if (rzpPaymentDetails && rzpPaymentDetails.amount) {
                const actualPaidAmount = parseFloat(rzpPaymentDetails.amount) / 100;
                if (actualPaidAmount > 0 && actualPaidAmount !== parseFloat(order.net_amount)) {
                    order.net_amount = actualPaidAmount;
                    order.discount_amount = Math.max(0, parseFloat(order.total_amount) + parseFloat(order.shipping_amount) - actualPaidAmount);
                    order.gross_amount = parseFloat(order.total_amount) - order.discount_amount;
                }
            }

            let paymentType = 'upi';
            let paymentStatus = 'paid';

            if (rzpPaymentDetails && rzpPaymentDetails.method) {
                const method = rzpPaymentDetails.method.toLowerCase();
                paymentType = method;
                if (method === 'cod') {
                    paymentStatus = 'not_paid';
                } else {
                    paymentStatus = 'paid';
                }
            }

            order.payment_type = paymentType;
            order.payment_status = paymentStatus;
            order.payment_transaction_id = razorpayPaymentId;
            order.status = 'placed';
            await order.save();

            // Increment coupon usage
            await incrementCouponUsage(order);

            // Send order confirmation email (non-blocking)
            sendOrderPlacedEmail(order.id);

            // Book Shiprocket shipment (Disabled: Admin will proceed manually from dashboard)
            // await bookShipment(order.id);

            return res.status(200).json({
                success: true,
                message: 'Payment verified',
                orderId: order.id
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Signature verification failed'
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Razorpay Webhook listener (in case user leaves window early)
 */
export const handleWebhook = async (req, res, next) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhooksecret123';

        const shasum = crypto.createHmac('sha256', webhookSecret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if (digest !== signature) {
            return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
        }

        const event = req.body.event;
        if (event === 'payment.captured') {
            const paymentEntity = req.body.payload.payment.entity;
            const rzpOrderId = paymentEntity.order_id;
            const rzpPaymentId = paymentEntity.id;

            const order = await Order.findOne({ where: { payment_transaction_id: rzpOrderId } });
            if (order && order.payment_status !== 'paid') {
                order.payment_status = 'paid';
                order.payment_transaction_id = rzpPaymentId;
                if (paymentEntity.method) {
                    order.payment_type = paymentEntity.method.toLowerCase();
                }
                order.status = 'placed';
                await order.save();

                // Increment coupon usage
                await incrementCouponUsage(order);

                // Book Shiprocket shipment (Disabled: Admin will proceed manually from dashboard)
                // await bookShipment(order.id);
                console.log(`[Webhook] Order ${order.order_number} marked as Paid via Webhook.`);
            }
        }

        return res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error("Webhook processing failed:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Razorpay Magic Checkout Shipping Info API
 * Called by Razorpay servers to check serviceability for each saved address.
 *
 * Razorpay REQUEST body:
 * {
 *   order_id: "order_xxx",
 *   customer: { contact: "+91xxx", email: "x@x.com" },
 *   addresses: [
 *     { id: "addr_001", zipcode: "734001", country: "in", name: "...", line1: "..." },
 *     { id: "addr_002", zipcode: "560001", country: "in", ... }
 *   ]
 * }
 *
 * Razorpay EXPECTED response:
 * {
 *   addresses: [
 *     { id: "addr_001", serviceable: true, cod: true, cod_fee: 0, shipping_fee: 0 },
 *     { id: "addr_002", serviceable: true, cod: true, cod_fee: 0, shipping_fee: 0 }
 *   ]
 */
export const getMagicShippingInfo = async (req, res, next) => {
    let responseData = null;
    try {
        console.log("SHIPPING INFO REQUEST HEADERS:", req.headers);
        console.log("SHIPPING INFO REQUEST BODY:", req.body);

        const order_id = req.body.order_id || req.query.order_id;
        const razorpay_order_id = req.body.razorpay_order_id || req.query.razorpay_order_id;
        const addresses = req.body.addresses || req.query.addresses;

        const lookupIds = [];
        if (razorpay_order_id) lookupIds.push(razorpay_order_id);
        if (order_id) lookupIds.push(order_id);

        let order = null;
        if (lookupIds.length > 0) {
            order = await Order.findOne({
                where: {
                    [Op.or]: [
                        { payment_transaction_id: { [Op.in]: lookupIds } },
                        { order_number: { [Op.in]: lookupIds } }
                    ]
                },
                include: [{ model: OrderItem, as: 'orderItems' }]
            });
        }

        const subtotal = order ? parseFloat(order.total_amount || 0) : 0;
        const totalItemsCount = order?.orderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 1;
        const FREE_SHIPPING_THRESHOLD = 999;

        // Function to resolve shipping fee for a single pincode
        const resolveShippingFee = async (pincode) => {
            // Free Shipping threshold
            if (subtotal >= FREE_SHIPPING_THRESHOLD) {
                console.log(`[Magic Checkout] Order subtotal (₹${subtotal}) >= ₹${FREE_SHIPPING_THRESHOLD}. Free Shipping applied.`);
                return 0;
            }

            // Shiprocket calculation
            if (process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_EMAIL !== 'dummy@example.com') {
                try {
                    const weight = totalItemsCount * 0.3; // standard 300g per apparel item
                    console.log(`[Magic Checkout] Querying Shiprocket rates: pickup=${process.env.STORE_PICKUP_PINCODE}, delivery=${pincode}, weight=${weight}kg`);

                    const rates = await shiprocketService.getShippingRates({
                        weight,
                        pickupPincode: process.env.STORE_PICKUP_PINCODE || '734001',
                        deliveryPincode: pincode
                    });

                    if (rates && rates.length > 0) {
                        // Filter out zero/invalid rates and sort to find the cheapest
                        const validRates = rates.filter(r => r.rate !== undefined && r.rate !== null).map(r => parseFloat(r.rate));
                        if (validRates.length > 0) {
                            const cheapestRate = Math.min(...validRates);
                            console.log(`[Magic Checkout] Shiprocket returned ${rates.length} rates. Cheapest: ₹${cheapestRate}`);
                            return cheapestRate;
                        }
                    }
                } catch (shiprocketErr) {
                    console.error("[Magic Checkout] Shiprocket rate API query failed, falling back to flat ₹50:", shiprocketErr.message);
                }
            } else {
                console.log("[Magic Checkout] Shiprocket credentials dry or dummy. Falling back to flat ₹50.");
            }

            return 50; // Standard Flat Fallback (₹50)
        };

        if (Array.isArray(addresses) && addresses.length > 0) {
            const responseAddresses = [];
            for (let index = 0; index < addresses.length; index++) {
                const addr = addresses[index];
                const pincode = addr.zipcode || addr.postal_code || '110001';
                const calculatedFee = await resolveShippingFee(pincode);
                const calculatedFeeInPaise = Math.round(calculatedFee * 100);

                // Update shipping amount in local database order representation so the invoice matches
                if (order && index === 0) {
                    order.shipping_amount = calculatedFee;
                    order.net_amount = (parseFloat(order.total_amount || 0) - parseFloat(order.discount_amount || 0)) + calculatedFee;
                    await order.save();
                    console.log(`[Magic Checkout] Updated Order ${order.order_number} locally: Shipping=₹${calculatedFee}, Net=₹${order.net_amount}`);
                }

                responseAddresses.push({
                    id: addr.id !== undefined && addr.id !== null ? addr.id : index,
                    serviceable: true,
                    cod: true,
                    cod_fee: 0,
                    shipping_fee: calculatedFeeInPaise
                });
            }

            responseData = { addresses: responseAddresses };
            console.log("SHIPPING INFO RESPONSE BODY:", responseData);
            res.setHeader('Content-Type', 'application/json');
            await logToDb('/api/checkout/shipping-info', req.method, req.headers, req.body, responseData);
            return res.status(200).json(responseData);
        }

        // Fallback: flat format for older Razorpay API versions
        const defaultFee = await resolveShippingFee('110001');
        const defaultFeeInPaise = Math.round(defaultFee * 100);
        responseData = {
            serviceable: true,
            cod: false,
            cod_fee: 0,
            shipping_fee: defaultFeeInPaise
        };
        console.log("SHIPPING INFO RESPONSE BODY (flat fallback):", responseData);
        res.setHeader('Content-Type', 'application/json');
        await logToDb('/api/checkout/shipping-info', req.method, req.headers, req.body, responseData);
        return res.status(200).json(responseData);

    } catch (error) {
        console.error('Shipping Error:', error);
        responseData = {
            serviceable: true,
            cod: false,
            cod_fee: 0,
            shipping_fee: 5000 // ₹50 fallback in case of server errors
        };
        console.log("SHIPPING INFO RESPONSE BODY (error fallback):", responseData);
        res.setHeader('Content-Type', 'application/json');
        await logToDb('/api/checkout/shipping-info', req.method, req.headers, req.body, responseData);
        return res.status(200).json(responseData);
    }
};

/**
 * Razorpay Magic Checkout Get Promotions API
 * Called by Razorpay to list all active coupons to the user.
 */
export const getMagicPromotions = async (req, res, next) => {
    let responseData = null;
    try {
        const activeOffers = await Offer.findAll({
            where: { status: 'active' }
        });

        const promotions = activeOffers.map(offer => {
            const displayValue = offer.discount_type === 'percentage'
                ? `${parseFloat(offer.discount_value)}%`
                : `₹${parseFloat(offer.discount_value)}`;

            return {
                id: offer.code,
                code: offer.code,
                summary: `${displayValue} Off`,
                description: offer.description || `Get ${displayValue} discount on your order using code ${offer.code}.`
            };
        });

        responseData = {
            success: true,
            promotions
        };
        console.log("GET PROMOTIONS REQUEST HEADERS:", req.headers);
        console.log("GET PROMOTIONS REQUEST BODY:", req.body);
        console.log("GET PROMOTIONS RESPONSE BODY:", responseData);
        res.setHeader('Content-Type', 'application/json');
        await logToDb('/api/checkout/promotions', req.method, req.headers, req.body, responseData);
        return res.status(200).json(responseData);
    } catch (error) {
        console.error('[Magic Checkout] Get Promotions error:', error);
        responseData = { promotions: [] };
        await logToDb('/api/checkout/promotions', req.method, req.headers, req.body, responseData);
        return res.status(200).json(responseData);
    }
};

export const applyMagicPromotion = async (req, res, next) => {
    let responseData = null;
    try {
        console.log("APPLY PROMOTION REQUEST HEADERS:", req.headers);
        console.log("APPLY PROMOTION REQUEST BODY:", req.body);

        const body = req.body || {};
        const query = req.query || {};

        // Extract order ID with all possible keys (crucial for Razorpay custom integrations)
        const order_id = body.order_id || body.razorpay_order_id || body.reference_id || query.order_id || query.razorpay_order_id || query.reference_id;

        // Extract coupon code with all possible keys
        let code = body.code || body.coupon_code || body.promotion_code || query.code || query.coupon_code || query.promotion_code;
        if (!code && (body.coupon || query.coupon)) {
            const couponSource = body.coupon || query.coupon;
            code = typeof couponSource === 'object' ? couponSource.code : couponSource;
        }
        if (!code && (body.promotion || query.promotion)) {
            const promoSource = body.promotion || query.promotion;
            code = typeof promoSource === 'object' ? (promoSource.code || promoSource.reference_id) : promoSource;
        }

        if (code && typeof code === 'string') {
            code = code.trim().toUpperCase();
        }

        if (!order_id) {
            responseData = {
                success: false,
                error: {
                    code: 'BAD_REQUEST_ERROR',
                    description: 'Order ID is required',
                    source: 'business',
                    step: 'apply_promotion',
                    reason: 'missing_order_id'
                }
            };
            console.log("APPLY PROMOTION RESPONSE BODY:", responseData);
            res.setHeader('Content-Type', 'application/json');
            await logToDb('/api/checkout/apply-promotion', req.method, req.headers, req.body, responseData);
            return res.status(200).json(responseData);
        }

        const order = await Order.findOne({
            where: {
                [Op.or]: [
                    { payment_transaction_id: order_id },
                    { order_number: order_id }
                ]
            }
        });

        if (!order) {
            console.warn(`[Magic Checkout] Order not found for Razorpay Order ID / reference: ${order_id}`);
            responseData = {
                success: false,
                error: {
                    code: 'BAD_REQUEST_ERROR',
                    description: 'Order not found',
                    source: 'business',
                    step: 'apply_promotion',
                    reason: 'order_not_found'
                }
            };
            console.log("APPLY PROMOTION RESPONSE BODY:", responseData);
            res.setHeader('Content-Type', 'application/json');
            await logToDb('/api/checkout/apply-promotion', req.method, req.headers, req.body, responseData);
            return res.status(200).json(responseData);
        }

        if (!code) {
            // Update database order record to clear the coupon details
            order.coupon_code = null;
            order.discount_amount = 0;
            order.gross_amount = parseFloat(order.total_amount);
            order.net_amount = order.gross_amount + parseFloat(order.shipping_amount);
            await order.save();

            responseData = {
                success: true,
                message: 'Coupon removed successfully'
            };
            console.log("APPLY PROMOTION RESPONSE BODY (coupon removed):", responseData);
            res.setHeader('Content-Type', 'application/json');
            await logToDb('/api/checkout/apply-promotion', req.method, req.headers, req.body, responseData);
            return res.status(200).json(responseData);
        }

        try {
            // Validate against the database using OfferService
            const validation = await OfferService.validateCoupon(code, parseFloat(order.total_amount));
            const discountInPaise = Math.round(validation.discount_amount * 100);

            console.log(`[Magic Checkout] Coupon ${code} validated successfully. Discount: ₹${validation.discount_amount}`);

            // Save the applied coupon and update totals in the database order record
            order.coupon_code = validation.code;
            order.discount_amount = validation.discount_amount;
            order.gross_amount = parseFloat(order.total_amount) - validation.discount_amount;
            order.net_amount = order.gross_amount + parseFloat(order.shipping_amount);
            await order.save();

            responseData = {
                success: true,
                discount_amount: discountInPaise,
                amount: discountInPaise,
                message: `${validation.code} applied successfully`,
                promotion: {
                    reference_id: validation.code,
                    type: 'coupon',
                    code: validation.code,
                    value: discountInPaise,
                    value_type: 'fixed_amount',
                    description: `${validation.code} applied successfully`
                }
            };
            console.log("APPLY PROMOTION RESPONSE BODY:", responseData);
            res.setHeader('Content-Type', 'application/json');
            await logToDb('/api/checkout/apply-promotion', req.method, req.headers, req.body, responseData);
            return res.status(200).json(responseData);
        } catch (validationErr) {
            console.warn(`[Magic Checkout] Coupon validation failed for ${code}:`, validationErr.message);

            // Revert order discount if validation fails (e.g. coupon expired or invalid)
            order.coupon_code = null;
            order.discount_amount = 0;
            order.gross_amount = parseFloat(order.total_amount);
            order.net_amount = order.gross_amount + parseFloat(order.shipping_amount);
            await order.save();

            responseData = {
                success: false,
                error: {
                    code: 'BAD_REQUEST_ERROR',
                    description: validationErr.message || 'Invalid coupon code',
                    source: 'business',
                    step: 'apply_promotion',
                    reason: 'invalid_coupon'
                }
            };
            console.log("APPLY PROMOTION RESPONSE BODY (validation failed):", responseData);
            res.setHeader('Content-Type', 'application/json');
            await logToDb('/api/checkout/apply-promotion', req.method, req.headers, req.body, responseData);
            return res.status(200).json(responseData);
        }
    } catch (error) {
        console.error('[Magic Checkout] Apply Promotion error:', error);
        responseData = {
            success: false,
            error: {
                code: 'SERVER_ERROR',
                description: 'Internal server error processing coupon',
                source: 'business',
                step: 'apply_promotion',
                reason: 'internal_server_error'
            }
        };
        console.log("APPLY PROMOTION RESPONSE BODY:", responseData);
        res.setHeader('Content-Type', 'application/json');
        await logToDb('/api/checkout/apply-promotion', req.method, req.headers, req.body, responseData);
        return res.status(200).json(responseData);
    }
};

/**
 * Cancel initiated checkout session (restores stock, cleans up draft order)
 */
export const cancelCheckout = async (req, res, next) => {
    try {
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).json({ success: false, message: 'orderId is required' });
        }

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Only cancel if payment is not paid
        if (order.payment_status === 'not_paid') {
            await Order.sequelize.transaction(async (t) => {
                // 1. Restore stock
                const orderItems = await OrderItem.findAll({ where: { order_id: orderId }, transaction: t });
                for (const item of orderItems) {
                    if (item.product_variant_id) {
                        const variant = await ProductVariant.findByPk(item.product_variant_id, { transaction: t });
                        if (variant) {
                            variant.stock_quantity += item.quantity;
                            await variant.save({ transaction: t });
                        }
                    } else {
                        const product = await Product.findByPk(item.product_id, { transaction: t });
                        if (product) {
                            product.stock_quantity += item.quantity;
                            await product.save({ transaction: t });
                        }
                    }
                }

                // 2. Delete shipping address
                await OrderShippingAddress.destroy({ where: { order_id: orderId }, transaction: t });

                // 3. Delete order items
                await OrderItem.destroy({ where: { order_id: orderId }, transaction: t });

                // 4. Delete order
                await Order.destroy({ where: { id: orderId }, transaction: t });

                // 5. If temporary guest user, clean it up as well
                const user = await User.findByPk(order.user_id, { transaction: t });
                if (user && !user.email && !user.phone) {
                    await user.destroy({ transaction: t });
                }
            });

            console.log(`[Checkout] Cancelled checkout session and cleaned up order: ${orderId}`);
            return res.status(200).json({ success: true, message: 'Checkout cancelled and stock restored' });
        }

        return res.status(400).json({ success: false, message: 'Cannot cancel a paid or processed order' });
    } catch (error) {
        next(error);
    }
};

/**
 * Public Webhook endpoint for Shiprocket tracking status updates
 */
export const handleShiprocketWebhook = async (req, res, next) => {
    try {
        const { awb, current_status } = req.body;

        console.log(`[Shiprocket Webhook Received] AWB: ${awb}, Status: ${current_status}`);

        if (!awb || !current_status) {
            return res.status(400).json({ success: false, message: 'Missing awb or current_status in body' });
        }

        // Find the order by tracking number
        const order = await Order.findOne({
            where: { tracking_number: awb }
        });

        if (!order) {
            console.log(`[Shiprocket Webhook] No matching order found for AWB: ${awb}`);
            return res.status(200).json({ success: true, message: 'Webhook received. AWB not found in our records.' });
        }

        const prevStatus = order.status;
        const normalizedStatus = current_status.toString().toLowerCase().trim();

        // Map Shiprocket status to local order status
        if (normalizedStatus === 'delivered') {
            order.status = 'delivered';

            // If Cash on Delivery, mark the payment status as paid upon successful delivery!
            if (order.payment_type === 'COD' || order.payment_type === 'cod') {
                order.payment_status = 'paid';
                console.log(`[Shiprocket Webhook] COD order ${order.order_number} marked as Paid upon delivery.`);
            }
        } else if (
            normalizedStatus === 'cancelled' ||
            normalizedStatus === 'rto_delivered' ||
            normalizedStatus.includes('rto')
        ) {
            order.status = 'cancelled';
        } else if (
            normalizedStatus === 'shipped' ||
            normalizedStatus === 'in-transit' ||
            normalizedStatus === 'out_for_delivery' ||
            normalizedStatus === 'reached_destination'
        ) {
            order.status = 'shipped';
        }

        if (order.status !== prevStatus || order.changed()) {
            await order.save();
            console.log(`[Shiprocket Webhook] Updated Order ${order.order_number} status from ${prevStatus} to ${order.status}`);
        } else {
            console.log(`[Shiprocket Webhook] Status for Order ${order.order_number} remains unchanged: ${order.status}`);
        }

        return res.status(200).json({ success: true, message: 'Webhook processed successfully' });
    } catch (error) {
        console.error('[Shiprocket Webhook Error]:', error.message);
        next(error);
    }
};
