import { check } from 'express-validator';

export const validateCreateProduct = [
    check('product_name')
        .trim()
        .notEmpty().withMessage('Product name is required')
        .isLength({ min: 2, max: 200 }).withMessage('Product name must be between 2 and 200 characters'),

    check('url_slug')
        .optional()
        .trim()
        .matches(/^[a-z0-9-]+$/).withMessage('URL slug must contain only lowercase letters, numbers, and hyphens')
        .isLength({ min: 2, max: 100 }).withMessage('URL slug must be between 2 and 100 characters'),

    check('category_id')
        .notEmpty().withMessage('Category ID is required')
        .isUUID().withMessage('Category ID must be a valid UUID'),

    check('description')
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters'),

    check('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0.01 }).withMessage('Price must be a positive number'),

    check('stock_quantity')
        .optional()
        .isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer')
        .default(0),

    check('status')
        .optional()
        .isIn(['active', 'inactive']).withMessage('Status must be either active or inactive')
        .default('active'),

    check('variants')
        .optional()
        .custom((value) => {
            if (value === null || value === undefined) {
                return true; // Allow null/undefined
            }

            // If it's a string, try to parse it as JSON
            if (typeof value === 'string') {
                try {
                    const parsed = JSON.parse(value);
                    if (!Array.isArray(parsed)) {
                        throw new Error('Variants must be an array');
                    }
                    return true;
                } catch (error) {
                    throw new Error('Variants must be a valid JSON array');
                }
            }

            // If it's already an array, validate it
            if (!Array.isArray(value)) {
                throw new Error('Variants must be an array');
            }

            return true;
        }),
];

export const validateUpdateProduct = [
    check('product_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 }).withMessage('Product name must be between 2 and 200 characters'),

    check('url_slug')
        .optional()
        .trim()
        .matches(/^[a-z0-9-]+$/).withMessage('URL slug must contain only lowercase letters, numbers, and hyphens')
        .isLength({ min: 2, max: 100 }).withMessage('URL slug must be between 2 and 100 characters'),

    check('category_id')
        .optional()
        .isUUID().withMessage('Category ID must be a valid UUID'),

    check('description')
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters'),

    check('price')
        .optional()
        .isFloat({ min: 0.01 }).withMessage('Price must be a positive number'),

    check('stock_quantity')
        .optional()
        .isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),

    check('status')
        .optional()
        .isIn(['active', 'inactive']).withMessage('Status must be either active or inactive'),

    check('variants')
        .optional()
        .custom((value) => {
            if (value === null || value === undefined) {
                return true; // Allow null/undefined
            }

            // If it's a string, try to parse it as JSON
            if (typeof value === 'string') {
                try {
                    const parsed = JSON.parse(value);
                    if (!Array.isArray(parsed)) {
                        throw new Error('Variants must be an array');
                    }
                    return true;
                } catch (error) {
                    throw new Error('Variants must be a valid JSON array');
                }
            }

            // If it's already an array, validate it
            if (!Array.isArray(value)) {
                throw new Error('Variants must be an array');
            }

            return true;
        }),
];
