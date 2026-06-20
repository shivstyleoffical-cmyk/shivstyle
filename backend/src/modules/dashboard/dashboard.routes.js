import express from 'express';
import { getDashboardStats } from './dashboard.controller.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { adminOrSuperAdminMiddleware } from '../user/user.middleware.js';

const dashboardRoutes = express.Router();

dashboardRoutes.get('/stats', authMiddleware, adminOrSuperAdminMiddleware, getDashboardStats);

export default dashboardRoutes;
