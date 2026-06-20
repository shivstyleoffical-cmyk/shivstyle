import { check } from 'express-validator';

export const validateAddToWishlist = [
    check('product_id')
        .notEmpty().withMessage('Product ID is required')
        .isUUID().withMessage('Product ID must be a valid UUID'),

    check('product_variant_id')
        .optional()
        .isUUID().withMessage('Product variant ID must be a valid UUID'),
];
