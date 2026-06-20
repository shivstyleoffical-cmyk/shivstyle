import { check } from 'express-validator';

export const validateRegisterUser = [
    check('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),

    check('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email must be valid'),

    check('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    check('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .isMobilePhone().withMessage('Phone number must be valid'),

    check('address')
        .trim()
        .notEmpty().withMessage('Address is required')
        .isLength({ min: 10 }).withMessage('Address must be at least 10 characters'),
];

export const validateLoginUser = [
    check('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email must be valid'),

    check('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const validateResendOtp = [
    check('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email must be valid'),
];

export const validateVerifyOtp = [
    check('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email must be valid'),

    check('otp_code')
        .notEmpty().withMessage('OTP code is required')
        .isLength({ min: 6, max: 6 }).withMessage('OTP code must be exactly 6 characters'),
];

export const forgotPasswordValidation = [
    check('email').isEmail().withMessage('Valid email required')
];

export const verifyOtpValidation = [
    check('email').isEmail(),
    check('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
];

export const resetPasswordValidation = [
    check('email').isEmail(),
    check('otp').isLength({ min: 6, max: 6 }),
    check('newPassword').isLength({ min: 6 }).withMessage('Password too short')
];
