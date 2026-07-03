import { validationResult } from 'express-validator';
import orderService from './order.service.js';

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

