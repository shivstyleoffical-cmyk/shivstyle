import { validationResult } from 'express-validator';
import userService from './user.service.js';

export const registerUser = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            const err = new Error('Validation failed');
            err.statusCode = 422;
            err.errors = error.array();
            return next(err);
        }

        const result = await userService.registerUser(req.body);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully. Verification email sent.',
            user: result
        });
    } catch (error) {
        next(error);
    }
};

export const loginUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const err = new Error('Validation failed');
            err.statusCode = 422;
            err.errors = errors.array();
            return next(err);
        }

        const { user, token } = await userService.loginUser(req.body);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user,
            token
        });
    } catch (error) {
        next(error);
    }
};

export const loginWithPhone = async (req, res, next) => {
    try {
        const { phone, firebaseUid, referralCode } = req.body;
        if (!phone && !firebaseUid) {
            const err = new Error('Phone number or Firebase UID is required');
            err.statusCode = 422;
            return next(err);
        }

        const { user, token } = await userService.loginWithPhone(phone, firebaseUid, referralCode);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user,
            token
        });
    } catch (error) {
        next(error);
    }
};

export const resendOtp = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const err = new Error('Validation failed');
            err.statusCode = 422;
            err.errors = errors.array();
            return next(err);
        }

        const result = await userService.resendOtp(req.body.email);
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const verifyOtp = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const err = new Error('Validation failed');
            err.statusCode = 422;
            err.errors = errors.array();
            return next(err);
        }

        const result = await userService.verifyOtp(req.body.email, req.body.otp_code);
        return res.status(200).json({ success: true, ...result });

    } catch (error) {
        if (error.statusCode) { // If it's a known error with status code
            return next(error);
        }
        // If it's a thrown object { statusCode, message }
        if (error.statusCode && error.message) {
            const err = new Error(error.message);
            err.statusCode = error.statusCode;
            if (error.resend_otp) err.resend_otp = true;
            return next(err);
        }
        next(error);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const result = await userService.forgotPassword(req.body.email);
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const verifyResetOtp = async (req, res, next) => {
    try {
        const result = await userService.verifyResetOtp(req.body.email, req.body.otp);
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const result = await userService.resetPassword(req.body.email, req.body.otp, req.body.newPassword);
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const getUserProfile = async (req, res, next) => {
    try {
        const user = await userService.getUserProfile(req.user.userId);
        return res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

export const updateUserProfile = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            const err = new Error('Validation failed');
            err.statusCode = 422;
            err.errors = error.array();
            return next(err);
        }

        const user = await userService.updateUserProfile(req.user.userId, req.body, req.file);
        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            user
        });
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = async (req, res, next) => {
    try {
        const result = await userService.getAllUsers(req.query);
        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
};

// Address Controllers
export const getUserAddresses = async (req, res, next) => {
    try {
        const addresses = await userService.getUserAddresses(req.user.userId);
        return res.status(200).json({ success: true, addresses });
    } catch (error) {
        next(error);
    }
};

export const addAddress = async (req, res, next) => {
    try {
        const address = await userService.addAddress(req.user.userId, req.body);
        return res.status(201).json({ success: true, message: 'Address added successfully', address });
    } catch (error) {
        next(error);
    }
};

export const updateAddress = async (req, res, next) => {
    try {
        const address = await userService.updateAddress(req.user.userId, req.params.id, req.body);
        return res.status(200).json({ success: true, message: 'Address updated successfully', address });
    } catch (error) {
        next(error);
    }
};

export const deleteAddress = async (req, res, next) => {
    try {
        const result = await userService.deleteAddress(req.user.userId, req.params.id);
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const setDefaultAddress = async (req, res, next) => {
    try {
        const address = await userService.setDefaultAddress(req.user.userId, req.params.id);
        return res.status(200).json({ success: true, message: 'Default address updated', address });
    } catch (error) {
        next(error);
    }
};
