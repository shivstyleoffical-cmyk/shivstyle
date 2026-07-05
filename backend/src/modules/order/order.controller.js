import { validationResult } from 'express-validator';
import orderService from './order.service.js';
import { bookShipment } from '../checkout/checkout.controller.js';
import Order from './order.model.js';
import OrderShippingAddress from './order-shipping-address.model.js';
import shiprocketService from '../../integrations/delivery/shiprocket.service.js';

export const trackOrder = async (req, res, next) => {
    try {
        const { order_number, identifier } = req.body;
        const order = await orderService.lookupOrder(order_number, identifier);
        return res.status(200).json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

export const createOrder = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            console.log('❌ Validation Errors:', error.array());
            const err = new Error('Validation failed');
            err.statusCode = 422;
            err.errors = error.array();
            return next(err);
        }

        const order = await orderService.createOrder(req.user.userId, req.body);

        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order
        });
    } catch (error) {
        next(error);
    }
};

export const getUserOrders = async (req, res, next) => {
    try {
        const result = await orderService.getUserOrders(req.user.userId, req.query);
        return res.status(200).json({
            success: true,
            ...result,
            ...result.pagination
        });
    } catch (error) {
        next(error);
    }
};

export const getOrderById = async (req, res, next) => {
    try {
        const order = await orderService.getOrderById(req.user.userId, req.params.id);
        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        next(error);
    }
};

export const getOrderByIdAdmin = async (req, res, next) => {
    try {
        const order = await orderService.getOrderByIdAdmin(req.params.id);
        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            const err = new Error('Validation failed');
            err.statusCode = 422;
            err.errors = error.array();
            return next(err);
        }

        const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
        return res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        next(error);
    }
};

export const updatePaymentStatus = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            const err = new Error('Validation failed');
            err.statusCode = 422;
            err.errors = error.array();
            return next(err);
        }

        const order = await orderService.updatePaymentStatus(
            req.params.id,
            req.body.payment_status,
            req.body.payment_transaction_id
        );
        return res.status(200).json({
            success: true,
            message: 'Payment status updated successfully',
            order
        });
    } catch (error) {
        next(error);
    }
};

export const cancelOrder = async (req, res, next) => {
    try {
        await orderService.cancelOrder(req.user.userId, req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getAllOrders = async (req, res, next) => {
    try {
        const result = await orderService.getAllOrders(req.query);
        return res.status(200).json({
            success: true,
            ...result,
            ...result.pagination
        });
    } catch (error) {
        next(error);
    }
};

export const getOrderStatistics = async (req, res, next) => {
    try {
        const result = await orderService.getOrderStatistics(req.query.period);
        return res.status(200).json({
            success: true,
            statistics: result
        });
    } catch (error) {
        next(error);
    }
};

export const updateDeliveryTracking = async (req, res, next) => {
    try {
        const order = await orderService.updateDeliveryTracking(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: 'Delivery tracking updated successfully',
            order
        });
    } catch (error) {
        next(error);
    }
};

export const markAsDelivered = async (req, res, next) => {
    try {
        const order = await orderService.markAsDelivered(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: 'Order marked as delivered',
            order
        });
    } catch (error) {
        next(error);
    }
};

export const deleteOrder = async (req, res, next) => {
    try {
        await orderService.deleteOrder(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const bulkDeleteOrders = async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'No order IDs provided' });
        }
        await orderService.bulkDeleteOrders(ids);
        return res.status(200).json({
            success: true,
            message: `${ids.length} orders deleted successfully`
        });
    } catch (error) {
        next(error);
    }
};

export const manualBookShipment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { weight, length, breadth, height, pickupLocation } = req.body;
        const result = await bookShipment(id, { weight, length, breadth, height, pickupLocation });
        if (!result) {
            return res.status(400).json({ success: false, message: 'Failed to book shipment on Shiprocket. Please verify address/pincode.' });
        }
        return res.status(200).json({
            success: true,
            message: 'Shipment successfully booked on Shiprocket!',
            tracking: result
        });
    } catch (error) {
        next(error);
    }
};

export const updateOrderShippingAddress = async (req, res, next) => {
    try {
        const { id } = req.params;
        const address = await orderService.updateShippingAddress(id, req.body);
        return res.status(200).json({
            success: true,
            message: 'Shipping address updated successfully',
            address
        });
    } catch (error) {
        next(error);
    }
};

export const getManualShippingRates = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { weight = 0.5, pickupLocation = 'Primary' } = req.body;

        const order = await Order.findByPk(id, {
            include: [{ model: OrderShippingAddress, as: 'shippingAddress' }]
        });

        if (!order || !order.shippingAddress) {
            return res.status(404).json({ success: false, message: 'Order or shipping address not found' });
        }

        const pickupPincode = pickupLocation === 'Primary' 
            ? (process.env.STORE_PICKUP_PINCODE || '734001')
            : (process.env.STORE_WAREHOUSE_PINCODE || '734001');

        const deliveryPincode = order.shippingAddress.postal_code;

        console.log(`[Admin Rate Query] pickup=${pickupPincode}, delivery=${deliveryPincode}, weight=${weight}kg`);

        const rates = await shiprocketService.getShippingRates({
            weight: parseFloat(weight) || 0.5,
            pickupPincode,
            deliveryPincode
        });

        return res.status(200).json({
            success: true,
            rates: rates || []
        });
    } catch (error) {
        console.error("[Admin Rate Query Error]:", error.message);
        return res.status(400).json({ 
            success: false, 
            message: `Failed to fetch shipping rates: ${error.message}` 
        });
    }
};

export const getPickupLocationsList = async (req, res, next) => {
    try {
        const locations = await shiprocketService.getPickupLocations();
        return res.status(200).json({
            success: true,
            locations: locations || []
        });
    } catch (error) {
        console.error("[Admin Pickup Locations Query Error]:", error.message);
        return res.status(400).json({ 
            success: false, 
            message: `Failed to fetch pickup locations: ${error.message}` 
        });
    }
};

