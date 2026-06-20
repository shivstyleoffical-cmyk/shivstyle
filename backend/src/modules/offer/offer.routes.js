import express from 'express';
import {
    getAllOffers,
    getOfferById,
    createOffer,
    updateOffer,
    deleteOffer,
    validateCoupon
} from './offer.controller.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { adminOrSuperAdminMiddleware } from '../user/user.middleware.js';
import { validateCreateOffer, validateUpdateOffer } from './offer.validators.js';

const offerRoutes = express.Router();

// Public routes (maybe users need to see active offers)
offerRoutes.get('/', getAllOffers);
offerRoutes.post('/validate', validateCoupon);
offerRoutes.get('/:id', getOfferById);

// Admin routes
offerRoutes.use(authMiddleware, adminOrSuperAdminMiddleware);

offerRoutes.post('/', validateCreateOffer, createOffer);
offerRoutes.put('/:id', validateUpdateOffer, updateOffer);
offerRoutes.delete('/:id', deleteOffer);

export default offerRoutes;
