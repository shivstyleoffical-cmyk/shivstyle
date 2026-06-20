import { check } from 'express-validator';

export const validateUserProfile = [
    check('phone')
        .optional()
        .matches(/^\+?\d{10,15}$/).withMessage('Phone number must be valid'),

    check('address')
        .optional()
        .isLength({ min: 10 }).withMessage('Address must be at least 10 characters'),

    check('image')
        .optional()
        .custom((value, { req }) => {
            if (!req.file) return true; // No file is fine
            if (req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/png' || req.file.mimetype === 'image/jpg') {
                return true;
            }
            throw new Error('Only .png, .jpg and .jpeg format allowed!');
        }),
]
