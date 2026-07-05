import express from 'express';
import {
    trackOrder,
    createOrder,
    getUserOrders,
    getOrderById,
    getOrderByIdAdmin,
    updateOrderStatus,
    updatePaymentStatus,
    cancelOrder,
    getAllOrders,
    getOrderStatistics,
    updateDeliveryTracking,
    markAsDelivered,
    deleteOrder,
    bulkDeleteOrders,
    manualBookShipment,
    updateOrderShippingAddress,
    getManualShippingRates,
    getPickupLocationsList
} from './order.controller.js';

import { authMiddleware } from '../../middleware/authMiddleware.js';
import { adminOrSuperAdminMiddleware } from '../user/user.middleware.js';
import { validateCreateOrder, validateUpdateOrderStatus, validateUpdatePaymentStatus } from './order.validators.js';
import rateLimit from 'express-rate-limit';

const orderRoutes = express.Router();

// Public order tracking — rate limited (5 attempts per IP per 15 minutes)
const trackOrderLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many tracking attempts. Please try again in 15 minutes.' }
});
orderRoutes.post('/track', trackOrderLimiter, trackOrder);

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
orderRoutes.get('/admin/:id', authMiddleware, adminOrSuperAdminMiddleware, getOrderByIdAdmin);
orderRoutes.put('/admin/:id/status', authMiddleware, adminOrSuperAdminMiddleware, validateUpdateOrderStatus, updateOrderStatus);

// Admin Manual Shiprocket routes
orderRoutes.post('/admin/:id/book-shipment', authMiddleware, adminOrSuperAdminMiddleware, manualBookShipment);
orderRoutes.put('/admin/:id/shipping-address', authMiddleware, adminOrSuperAdminMiddleware, updateOrderShippingAddress);
orderRoutes.post('/admin/:id/shipping-rates', authMiddleware, adminOrSuperAdminMiddleware, getManualShippingRates);
orderRoutes.get('/admin/shiprocket/pickup-locations', authMiddleware, adminOrSuperAdminMiddleware, getPickupLocationsList);

// Delivery tracking routes (optional - for future use)
orderRoutes.put('/admin/:id/delivery-tracking', authMiddleware, adminOrSuperAdminMiddleware, updateDeliveryTracking);
orderRoutes.put('/admin/:id/mark-delivered', authMiddleware, adminOrSuperAdminMiddleware, markAsDelivered);
orderRoutes.delete('/admin/:id', authMiddleware, adminOrSuperAdminMiddleware, deleteOrder);
orderRoutes.delete('/admin/orders/bulk', authMiddleware, adminOrSuperAdminMiddleware, bulkDeleteOrders);

export default orderRoutes;
