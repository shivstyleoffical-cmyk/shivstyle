import { check } from 'express-validator';

export const validateCreateOrder = [
    check('items')
        .isArray({ min: 1 }).withMessage('Items must be a non-empty array'),

    check('items.*.product_id')
        .notEmpty().withMessage('Product ID is required for each item')
        .isString().withMessage('Product ID must be valid'),

    check('items.*.quantity')
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),

    check('shipping_address_id')
        .optional({ nullable: true, checkFalsy: true })
        .notEmpty().withMessage('Shipping address ID cannot be empty'),

    check('custom_shipping_address')
        .optional({ nullable: true, checkFalsy: true })
        .isObject().withMessage('Custom shipping address must be an object'),

    check('custom_shipping_address.address_line1')
        .optional()
        .notEmpty().withMessage('Address Line 1 is required')
        .isLength({ min: 5, max: 255 }).withMessage('Address Line 1 must be between 5 and 255 characters'),

    check('custom_shipping_address.state')
        .optional()
        .notEmpty().withMessage('State is required')
        .isLength({ min: 2, max: 50 }).withMessage('State must be between 2 and 50 characters'),

    check('custom_shipping_address.city')
        .optional()
        .notEmpty().withMessage('City is required')
        .isLength({ min: 2, max: 50 }).withMessage('City must be between 2 and 50 characters'),

    check('custom_shipping_address.postal_code')
        .optional()
        .notEmpty().withMessage('Postal code is required')
        .matches(/^[a-zA-Z0-9\s-]{3,10}$/).withMessage('Postal code must be valid'),

    check('coupon_code')
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('Coupon code must be a string'),

    check('payment_type')
        .optional({ nullable: true, checkFalsy: true })
        .isIn(['netbanking', 'upi', 'cod']).withMessage('Payment type must be netbanking, upi, or cod'),

    check('payment_transaction_id')
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('Payment transaction ID must be a string'),

    check()
        .custom((value, { req }) => {
            if (!req.body.shipping_address_id && !req.body.custom_shipping_address) {
                throw new Error('Either shipping_address_id or custom_shipping_address is required');
            }
            if (!req.body.items || req.body.items.length === 0) {
                throw new Error('Items are required');
            }
            return true;
        }),
];

export const validateUpdateOrderStatus = [
    check('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['placed', 'confirmed', 'processing', 'shipping', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned']).withMessage('Invalid status'),
];

export const validateUpdatePaymentStatus = [
    check('payment_status')
        .notEmpty().withMessage('Payment status is required')
        .isIn(['paid', 'not_paid']).withMessage('Payment status must be paid or not_paid'),

    check('payment_transaction_id')
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('Payment transaction ID must be a string'),
];
