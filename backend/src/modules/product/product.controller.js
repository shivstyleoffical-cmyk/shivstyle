import { validationResult } from 'express-validator';
import productService from './product.service.js';

/**
 * Enhanced Product Controller with comprehensive endpoints
 */

export const createProduct = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            const err = new Error('Validation failed');
            err.statusCode = 422;
            err.errors = error.array();
            return next(err);
        }

        const product = await productService.createProduct(req.body, req.files);
        return res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        next(error);
    }
};

export const getAllProducts = async (req, res, next) => {
    try {
        const result = await productService.getAllProducts(req.query);
        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
};

export const getProductById = async (req, res, next) => {
    try {
        const product = await productService.getProductById(req.params.id);
        return res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        next(error);
    }
};

export const getProductBySlug = async (req, res, next) => {
    try {
        const product = await productService.getProductBySlug(req.params.slug);
        return res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            const err = new Error('Validation failed');
            err.statusCode = 422;
            err.errors = error.array();
            return next(err);
        }

        const product = await productService.updateProduct(req.params.id, req.body, req.files);
        return res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        await productService.deleteProduct(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getProductsByCategory = async (req, res, next) => {
    try {
        const result = await productService.getProductsByCategory(req.params.category_id, req.query);
        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
};

export const searchProducts = async (req, res, next) => {
    try {
        const result = await productService.searchProducts(req.query);
        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
};

export const getFeaturedProducts = async (req, res, next) => {
    try {
        const result = await productService.getFeaturedProducts(req.query);
        return res.status(200).json({
            success: true,
            message: 'Featured products',
            ...result
        });
    } catch (error) {
        next(error);
    }
};

export const getTrendingProducts = async (req, res, next) => {
    try {
        const result = await productService.getTrendingProducts(req.query);
        return res.status(200).json({
            success: true,
            message: 'Trending products',
            ...result
        });
    } catch (error) {
        next(error);
    }
};

export const getNewArrivals = async (req, res, next) => {
    try {
        const result = await productService.getNewArrivals(req.query);
        return res.status(200).json({
            success: true,
            message: 'New arrivals',
            ...result
        });
    } catch (error) {
        next(error);
    }
};

export const getBestSellers = async (req, res, next) => {
    try {
        const result = await productService.getBestSellers(req.query);
        return res.status(200).json({
            success: true,
            message: 'Best selling products',
            ...result
        });
    } catch (error) {
        next(error);
    }
};

export const getRecommendedProducts = async (req, res, next) => {
    try {
        const result = await productService.getRecommendedProducts(req.query);
        return res.status(200).json({
            success: true,
            message: 'Recommended products',
            ...result
        });
    } catch (error) {
        next(error);
    }
};

export const getSimilarProducts = async (req, res, next) => {
    try {
        const result = await productService.getSimilarProducts(req.params.id, req.query);
        return res.status(200).json({
            success: true,
            message: 'Similar products',
            ...result
        });
    } catch (error) {
        next(error);
    }
};

export const getFilterOptions = async (req, res, next) => {
    try {
        const result = await productService.getFilterOptions(req.query);
        return res.status(200).json({
            success: true,
            message: 'Available filter options',
            filters: result
        });
    } catch (error) {
        next(error);
    }
};
