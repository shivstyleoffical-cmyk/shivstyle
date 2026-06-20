import { validationResult } from 'express-validator';
import orderService from './order.service.js';

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

