import { check } from 'express-validator';

export const validateCreateCategory = [
    check('category_name')
        .trim()
        .notEmpty().withMessage('Category name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Category name must be between 2 and 100 characters'),

    check('url_slug')
        .optional()
        .trim()
        .matches(/^[a-z0-9-]+$/).withMessage('URL slug must contain only lowercase letters, numbers, and hyphens')
        .isLength({ min: 2, max: 50 }).withMessage('URL slug must be between 2 and 50 characters'),

    check('parent_cat_id')
        .optional()
        .custom((value) => {
            if (value === null || value === undefined || value === '') {
                return true; // Allow null/undefined/empty for optional fields
            }
            // Check if it's a valid UUID
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(value)) {
                throw new Error('Parent category ID must be a valid UUID');
            }
            return true;
        }),

    check('status')
        .optional()
        .isIn(['active', 'inactive']).withMessage('Status must be either active or inactive'),
];

export const validateUpdateCategory = [
    check('category_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Category name must be between 2 and 100 characters'),

    check('url_slug')
        .optional()
        .trim()
        .matches(/^[a-z0-9-]+$/).withMessage('URL slug must contain only lowercase letters, numbers, and hyphens')
        .isLength({ min: 2, max: 50 }).withMessage('URL slug must be between 2 and 50 characters'),

    check('parent_cat_id')
        .optional()
        .custom((value) => {
            if (value === null || value === undefined || value === '') {
                return true; // Allow null/undefined/empty for optional fields
            }
            // Check if it's a valid UUID
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(value)) {
                throw new Error('Parent category ID must be a valid UUID');
            }
            return true;
        }),

    check('status')
        .optional()
        .isIn(['active', 'inactive']).withMessage('Status must be either active or inactive'),
];
