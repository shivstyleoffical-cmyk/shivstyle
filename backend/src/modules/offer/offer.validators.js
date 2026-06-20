import { check } from 'express-validator';

export const validateCreateOffer = [
    check('code')
        .notEmpty().withMessage('Coupon code is required')
        .isLength({ min: 3, max: 20 }).withMessage('Coupon code must be between 3 and 20 characters'),

    check('discount_type')
        .notEmpty().withMessage('Discount type is required')
        .isIn(['fixed', 'percentage']).withMessage('Discount type must be fixed or percentage'),

    check('discount_value')
        .notEmpty().withMessage('Discount value is required')
        .isFloat({ min: 0.01 }).withMessage('Discount value must be a positive number'),

    check('start_date')
        .notEmpty().withMessage('Start date is required')
        .isISO8601().withMessage('Start date must be a valid date'),

    check('end_date')
        .notEmpty().withMessage('End date is required')
        .isISO8601().withMessage('End date must be a valid date'),

    check('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),

    check('status')
        .optional()
        .isIn(['active', 'inactive']).withMessage('Status must be either active or inactive'),

    check()
        .custom((value, { req }) => {
            const startDate = new Date(req.body.start_date);
            const endDate = new Date(req.body.end_date);

            if (startDate >= endDate) {
                throw new Error('End date must be after start date');
            }
            return true;
        }),
];

export const validateUpdateOffer = [
    check('code')
        .optional()
        .isLength({ min: 3, max: 20 }).withMessage('Coupon code must be between 3 and 20 characters'),

    check('discount_type')
        .optional()
        .isIn(['fixed', 'percentage']).withMessage('Discount type must be fixed or percentage'),

    check('discount_value')
        .optional()
        .isFloat({ min: 0.01 }).withMessage('Discount value must be a positive number'),

    check('start_date')
        .optional()
        .isISO8601().withMessage('Start date must be a valid date'),

    check('end_date')
        .optional()
        .isISO8601().withMessage('End date must be a valid date'),

    check('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),

    check('status')
        .optional()
        .isIn(['active', 'inactive']).withMessage('Status must be either active or inactive'),
];
