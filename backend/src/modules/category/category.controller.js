import { validationResult } from 'express-validator';
import categoryService from './category.service.js';

export const createCategory = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            const err = new Error('Validation failed');
            err.statusCode = 422;
            err.errors = error.array();
            return next(err);
        }

        const category = await categoryService.createCategory(req.body, req.file);

        return res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        next(error);
    }
};

export const getAllCategories = async (req, res, next) => {
    try {
        const result = await categoryService.getAllCategories(req.query);

        return res.status(200).json({
            success: true,
            categories: result.categories,
            ...result.pagination
        });
    } catch (error) {
        next(error);
    }
};

export const getCategoryById = async (req, res, next) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id);

        return res.status(200).json({
            success: true,
            category
        });
    } catch (error) {
        next(error);
    }
};

export const getCategoryBySlug = async (req, res, next) => {
    try {
        const category = await categoryService.getCategoryBySlug(req.params.slug);

        return res.status(200).json({
            success: true,
            category
        });
    } catch (error) {
        next(error);
    }
};

export const updateCategory = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            const err = new Error('Validation failed');
            err.statusCode = 422;
            err.errors = error.array();
            return next(err);
        }

        const category = await categoryService.updateCategory(req.params.id, req.body, req.file);

        return res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            category
        });
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (req, res, next) => {
    try {
        await categoryService.deleteCategory(req.params.id);

        return res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getCategoryTree = async (req, res, next) => {
    try {
        const categoryTree = await categoryService.getCategoryTree();

        return res.status(200).json({
            success: true,
            categories: categoryTree
        });
    } catch (error) {
        next(error);
    }
};
