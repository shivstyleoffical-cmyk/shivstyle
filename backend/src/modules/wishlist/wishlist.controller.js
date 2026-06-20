import { validationResult } from 'express-validator';
import wishlistService from './wishlist.service.js';

export const addToWishlist = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            const err = new Error('Validation failed');
            err.statusCode = 422;
            err.errors = error.array();
            return next(err);
        }

        const wishlistItem = await wishlistService.addToWishlist(req.user.userId, req.body);
        return res.status(201).json({
            success: true,
            message: 'Product added to wishlist successfully',
            wishlist_item: wishlistItem
        });
    } catch (error) {
        next(error);
    }
};

export const removeFromWishlist = async (req, res, next) => {
    try {
        await wishlistService.removeFromWishlist(req.user.userId, req.params.wishlist_id);
        return res.status(200).json({
            success: true,
            message: 'Product removed from wishlist successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getUserWishlist = async (req, res, next) => {
    try {
        const result = await wishlistService.getUserWishlist(req.user.userId, req.query);
        return res.status(200).json({
            success: true,
            ...result,
            ...result.pagination
        });
    } catch (error) {
        next(error);
    }
};

export const checkWishlistStatus = async (req, res, next) => {
    try {
        const result = await wishlistService.checkWishlistStatus(req.user.userId, req.query.product_id, req.query.product_variant_id);
        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
};

export const clearWishlist = async (req, res, next) => {
    try {
        const count = await wishlistService.clearWishlist(req.user.userId);
        return res.status(200).json({
            success: true,
            message: 'Wishlist cleared successfully',
            deleted_count: count
        });
    } catch (error) {
        next(error);
    }
};

export const moveToCart = async (req, res, next) => {
    try {
        await wishlistService.moveToCart(req.user.userId, req.params.wishlist_id, req.body.quantity || 1);
        return res.status(200).json({
            success: true,
            message: 'Product moved to cart successfully',
            note: 'Cart functionality needs to be implemented'
        });
    } catch (error) {
        next(error);
    }
};

export const getWishlistCount = async (req, res, next) => {
    try {
        const count = await wishlistService.getWishlistCount(req.user.userId);
        return res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        next(error);
    }
};
