import offerService from './offer.service.js';
import { validationResult } from 'express-validator';

export const getAllOffers = async (req, res, next) => {
    try {
        const result = await offerService.getAllOffers(req.query);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const getOfferById = async (req, res, next) => {
    try {
        const offer = await offerService.getOfferById(req.params.id);
        res.status(200).json({ success: true, offer });
    } catch (error) {
        next(error);
    }
};

export const createOffer = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed');
            error.statusCode = 422;
            error.errors = errors.array();
            throw error;
        }

        const offer = await offerService.createOffer(req.body);
        res.status(201).json({ success: true, message: 'Offer created successfully', offer });
    } catch (error) {
        next(error);
    }
};

export const updateOffer = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed');
            error.statusCode = 422;
            error.errors = errors.array();
            throw error;
        }

        const offer = await offerService.updateOffer(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Offer updated successfully', offer });
    } catch (error) {
        next(error);
    }
};

export const deleteOffer = async (req, res, next) => {
    try {
        const result = await offerService.deleteOffer(req.params.id);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const validateCoupon = async (req, res, next) => {
    try {
        const { code, subtotal } = req.body;
        if (!code || !subtotal) {
            const error = new Error('Coupon code and subtotal are required');
            error.statusCode = 400;
            throw error;
        }

        const result = await offerService.validateCoupon(code, parseFloat(subtotal));
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};
