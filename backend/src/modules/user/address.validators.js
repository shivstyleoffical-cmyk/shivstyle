import { check } from 'express-validator';

export const validateCreateShippingAddress = [
    check('full_name')
        .notEmpty().withMessage('Full name is required'),

    check('address_line1')
        .notEmpty().withMessage('Address line 1 is required')
        .isLength({ min: 5, max: 255 }).withMessage('Address must be between 5 and 255 characters'),

    check('address_line2')
        .optional()
        .isLength({ max: 255 }),

    check('state')
        .notEmpty().withMessage('State is required')
        .isLength({ min: 2, max: 50 }).withMessage('State must be between 2 and 50 characters'),

    check('city')
        .notEmpty().withMessage('City is required')
        .isLength({ min: 2, max: 50 }).withMessage('City must be between 2 and 50 characters'),

    check('postal_code')
        .notEmpty().withMessage('Postal code is required')
        .isLength({ min: 4, max: 10 }).withMessage('Postal code must be between 4 and 10 characters'),

    check('country')
        .notEmpty().withMessage('Country is required'),

    check('phone')
        .notEmpty().withMessage('Phone number is required'),
];

export const validateUpdateShippingAddress = [
    check('full_name').optional(),
    check('address_line1').optional().isLength({ min: 5, max: 255 }),
    check('address_line2').optional(),
    check('state').optional().isLength({ min: 2, max: 50 }),
    check('city').optional().isLength({ min: 2, max: 50 }),
    check('postal_code').optional().isLength({ min: 4, max: 10 }),
    check('country').optional(),
    check('phone').optional(),
];

