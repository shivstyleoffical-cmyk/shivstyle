import express from 'express';
import {
    getAllNotifications,
    createNotification,
    deleteNotification
} from './notification.controller.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { adminOrSuperAdminMiddleware } from '../user/user.middleware.js';

const notificationRoutes = express.Router();

notificationRoutes.use(authMiddleware, adminOrSuperAdminMiddleware);

notificationRoutes.get('/', getAllNotifications);
notificationRoutes.post('/', createNotification);
notificationRoutes.delete('/:id', deleteNotification);

export default notificationRoutes;
