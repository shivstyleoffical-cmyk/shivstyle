import express from 'express';
import {
    getAllLocations,
    getActiveLocations,
    createLocation,
    updateLocation,
    deleteLocation
} from './location.controller.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { adminOrSuperAdminMiddleware } from '../user/user.middleware.js';

const locationRoutes = express.Router();

// Public routes
locationRoutes.get('/', getAllLocations);
locationRoutes.get('/active', getActiveLocations);

// Admin routes
locationRoutes.get('/admin/all', authMiddleware, adminOrSuperAdminMiddleware, getAllLocations);
locationRoutes.post('/admin/create', authMiddleware, adminOrSuperAdminMiddleware, createLocation);
locationRoutes.put('/admin/:id', authMiddleware, adminOrSuperAdminMiddleware, updateLocation);
locationRoutes.delete('/admin/:id', authMiddleware, adminOrSuperAdminMiddleware, deleteLocation);

export default locationRoutes;
