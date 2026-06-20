import express from 'express';
import {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    updatePaymentStatus,
    cancelOrder,
    getAllOrders,
    getOrderStatistics,
    updateDeliveryTracking,
    markAsDelivered
} from './order.controller.js';

import { authMiddleware } from '../../middleware/authMiddleware.js';
import { adminOrSuperAdminMiddleware } from '../user/user.middleware.js';
import { validateCreateOrder, validateUpdateOrderStatus, validateUpdatePaymentStatus } from './order.validators.js';

const orderRoutes = express.Router();

// User order routes (require authentication)
orderRoutes.use(authMiddleware);

orderRoutes.post('/create', validateCreateOrder, createOrder);
orderRoutes.get('/my-orders', getUserOrders);
orderRoutes.get('/:id', getOrderById);
orderRoutes.put('/:id/payment-status', validateUpdatePaymentStatus, updatePaymentStatus);
orderRoutes.put('/:id/cancel', cancelOrder);

// Admin routes (admin only)
orderRoutes.get('/admin/all', authMiddleware, adminOrSuperAdminMiddleware, getAllOrders);
orderRoutes.get('/admin/statistics', authMiddleware, adminOrSuperAdminMiddleware, getOrderStatistics);
orderRoutes.put('/admin/:id/status', authMiddleware, adminOrSuperAdminMiddleware, validateUpdateOrderStatus, updateOrderStatus);

// Delivery tracking routes (optional - for future use)
orderRoutes.put('/admin/:id/delivery-tracking', authMiddleware, adminOrSuperAdminMiddleware, updateDeliveryTracking);
orderRoutes.put('/admin/:id/mark-delivered', authMiddleware, adminOrSuperAdminMiddleware, markAsDelivered);

export default orderRoutes;
