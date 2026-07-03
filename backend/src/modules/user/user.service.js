import userRepository from './user.repository.js';
import config from '../../config/config.js';
import User from './user.model.js';
import Address from './address.model.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import mailer from '../../integrations/email/email.service.js';
import { enumRole } from '../../shared/constants/roles.js';
import {
    Forgot_Password_Email_Template,
    Verification_Email_Template,
    Welcome_Email_Template
} from '../../integrations/email/email.templates.js';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } from '../../integrations/storage/cloudinary.utils.js';
import sequelize from '../../database/connection.js';

class UserService {
    async registerUser(data) {
        const { name, password, email, phone, address, role: roleName, referral_code } = data;

        const allowedRoles = enumRole;
        const requestedRole = roleName || 'customer'; // Default to customer
        if (!allowedRoles.includes(requestedRole)) {
            const error = new Error('Invalid role specified');
            error.statusCode = 400;
            throw error;
        }

        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }


        let roleData = await userRepository.findRoleByName(requestedRole);
        if (!roleData) {
            // Self-healing: Create role if missing
            console.log(`ℹ️ Role ${requestedRole} not found. Creating it...`);
            roleData = await userRepository.createRole({
                id: uuidv4(),
                role_name: requestedRole,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        let referrer = null;
        if (referral_code) {
            referrer = await userRepository.findByReferralCode(referral_code);
            if (!referrer) {
                const error = new Error('Invalid Referral Code');
                error.statusCode = 400;
                throw error;
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const result = await sequelize.transaction(async (t) => {
            const myReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

            const newUser = await userRepository.create({
                id: uuidv4(),
                name,
                password: hashedPassword,
                email,
                phone,
                referral_code: myReferralCode,
                referred_by: referrer ? referrer.id : null,
                coins: referrer ? 10 : 0,
                is_verified: false,
                otp_code: otp,
                otp_expires_at: new Date(Date.now() + 10 * 60 * 1000),
                createdAt: new Date(),
                updatedAt: new Date()
            }, t);

            if (referrer) {
                referrer.coins = (referrer.coins || 0) + 10;
                await userRepository.saveUser(referrer, t);
            }

            if (address) {
                await userRepository.createAddress({
                    id: uuidv4(),
                    user_id: newUser.id,
                    address_line1: address,
                    is_default: true
                }, t);
            }

            await userRepository.addRoleToUser(newUser, roleData, t);

            return newUser;
        });

        // Send Email (outside transaction ideally, or careful handling)
        const emailHtml = Verification_Email_Template.replace('{verificationCode}', otp);
        await mailer.sendmail(result.email, 'Your Verification Code', emailHtml);

        return {
            id: result.id,
            name: result.name,
            email: result.email,
            phone: result.phone,
            address: address // Return the address from arguments
        };
    }

    async loginUser(data) {
        const { email, password } = data;

        const user = await userRepository.findByEmail(email, true, true, true); // Include addresses
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        // Check verification status directly on user
        if (!user.is_verified) {
            const now = new Date();
            if (user.otp_expires_at && now > user.otp_expires_at) {
                const error = new Error('OTP expired. Please request a new one.');
                error.statusCode = 403;
                error.resend_otp = true;
                throw error;
            } else {
                const error = new Error('Email not verified. Please check your inbox.');
                error.statusCode = 403;
                throw error;
            }
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            config.jwt.secret,
            { expiresIn: config.jwt.expiration }
        );

        const userJson = user.toJSON();
        delete userJson.password;
        delete userJson.otp_code;
        delete userJson.otp_expires_at;
        delete userJson.reset_otp;
        delete userJson.reset_otp_expires_at;

        userJson.roles = user.roles.map(r => r.role_name);

        return { user: userJson, token };
    }

    async loginWithPhone(phone, firebaseUid, referralCode) {
        // Try finding by firebase_uid first
        let user = await User.findOne({ where: { firebase_uid: firebaseUid }, include: ['roles', 'addresses'] });

        if (!user && phone) {
            // Fallback: Try finding by phone if UID not found (user exists from manual reg maybe)
            user = await User.findOne({ where: { phone }, include: ['roles', 'addresses'] });
            if (user) {
                // Link the firebase_uid to existing user
                user.firebase_uid = firebaseUid;
                await user.save();
            }
        }

        // --- TESTING ONLY: Auto-Refill for your specific test account ---
        // This ensures you have coins to test the "Redeem" feature
        if (user && user.phone === '+911234567898' && user.coins < 60) {
            user.coins = 100;
            await user.save();
        }
        // ----------------------------------------------------------------

        if (user && !user.referral_code) {
            user.referral_code = Math.random().toString(36).substring(2, 8).toUpperCase();
            user.coins = user.coins || 0;
            await user.save();
        }

        if (!user) {
            // Register new user
            let roleData = await userRepository.findRoleByName('customer');
            if (!roleData) {
                // Self-healing: Create role if missing
                console.log('ℹ️ Default role "customer" not found. Creating it...');
                roleData = await userRepository.createRole({
                    id: uuidv4(),
                    role_name: 'customer',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }

            let referrer = null;
            if (referralCode) {
                referrer = await userRepository.findByReferralCode(referralCode);
            }

            user = await sequelize.transaction(async (t) => {
                const myReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

                const newUser = await userRepository.create({
                    id: uuidv4(),
                    name: phone ? 'User ' + phone.slice(-4) : 'User',
                    email: null,
                    password: null,
                    phone: phone,
                    firebase_uid: firebaseUid,
                    referral_code: myReferralCode,
                    coins: referrer ? 50 : 0,
                    referred_by: referrer ? referrer.id : null,
                    is_verified: true, // Auto-verified by Firebase
                    createdAt: new Date(),
                    updatedAt: new Date()
                }, t);

                if (referrer) {
                    referrer.coins = (referrer.coins || 0) + 50;
                    await userRepository.saveUser(referrer, t);
                }

                await userRepository.addRoleToUser(newUser, roleData, t);
                return newUser;
            });

            // Re-fetch to populate roles/addresses fully if needed, or just construct object
            // For simplicity, let's just re-fetch to be consistent
            user = await userRepository.findById(user.id, false, true, true);
        }

        const token = jwt.sign(
            { userId: user.id },
            config.jwt.secret,
            { expiresIn: config.jwt.expiration }
        );

        const userJson = user.toJSON();
        delete userJson.password;
        delete userJson.otp_code;
        delete userJson.otp_expires_at;
        delete userJson.reset_otp;
        delete userJson.reset_otp_expires_at;

        userJson.roles = user.roles ? user.roles.map(r => r.role_name) : [];

        return { user: userJson, token };
    }

    async resendOtp(email) {
        const user = await userRepository.findByEmail(email, false);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        if (user.is_verified) {
            return { message: 'User already verified.' };
        }

        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp_code = newOtp;
        user.otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);
        await userRepository.saveUser(user);

        const emailHtml = Verification_Email_Template.replace('{verificationCode}', newOtp);
        await mailer.sendmail(user.email, 'Your New Verification Code', emailHtml);

        return { message: 'New OTP sent to your email.' };
    }

    async verifyOtp(email, otp_code) {
        const user = await userRepository.findByEmail(email, false);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        if (user.is_verified) {
            throw { statusCode: 400, message: 'User already verified.' };
        }

        if (user.otp_expires_at && new Date() > user.otp_expires_at) {
            const error = new Error('OTP expired. Please request a new one.');
            error.statusCode = 403;
            error.resend_otp = true;
            throw error;
        }

        if (user.otp_code !== otp_code) {
            const error = new Error('Invalid OTP');
            error.statusCode = 401;
            throw error;
        }

        user.is_verified = true;
        user.otp_code = null;
        user.otp_expires_at = null;
        await userRepository.saveUser(user);

        const welcomeHtml = Welcome_Email_Template.replace('{name}', user.name);
        await mailer.sendmail(user.email, 'Welcome!', welcomeHtml);

        return { message: 'Email verified successfully.' };
    }

    async forgotPassword(email) {
        const user = await userRepository.findByEmail(email, false);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
        user.reset_otp = resetOtp;
        user.reset_otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);
        await userRepository.saveUser(user);

        const emailHtml = Forgot_Password_Email_Template.replace('{resetCode}', resetOtp);
        await mailer.sendmail(user.email, 'Password Reset Code', emailHtml);

        return { message: 'Reset OTP sent to your email' };
    }

    async verifyResetOtp(email, otp) {
        const user = await userRepository.findByEmail(email, false);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        if (!user.reset_otp || user.reset_otp !== otp) {
            const error = new Error('Invalid OTP');
            error.statusCode = 401;
            throw error;
        }

        if (user.reset_otp_expires_at < new Date()) {
            const error = new Error('OTP expired');
            error.statusCode = 403;
            throw error;
        }

        return { message: 'OTP verified. You can now reset your password.' };
    }

    async resetPassword(email, otp, newPassword) {
        const user = await userRepository.findByEmail(email, false);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        if (user.reset_otp !== otp || user.reset_otp_expires_at < new Date()) {
            const error = new Error('Invalid or expired OTP');
            error.statusCode = 403;
            throw error;
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.reset_otp = null;
        user.reset_otp_expires_at = null;
        await userRepository.saveUser(user);

        return { message: 'Password reset successful.' };
    }

    async getUserProfile(userId) {
        const user = await userRepository.findById(userId, false, true, true); // Include addresses
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        if (!user.referral_code) {
            user.referral_code = Math.random().toString(36).substring(2, 8).toUpperCase();
            user.coins = user.coins || 0;
            await user.save();
        }

        const userJson = user.toJSON();
        delete userJson.password;
        delete userJson.otp_code;
        delete userJson.otp_expires_at;
        delete userJson.reset_otp;
        delete userJson.reset_otp_expires_at;

        userJson.roles = user.roles.map(r => r.role_name);

        return userJson;
    }

    async updateUserProfile(userId, data, file) {
        const { phone, address, name } = data; // Added name update capability too
        const user = await userRepository.findById(userId, false, false, true); // Include addresses
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        let newImageUrl = user.image;

        if (file) {
            try {
                if (user.image && user.image.includes('cloudinary.com')) {
                    const oldPublicId = extractPublicIdFromUrl(user.image);
                    if (oldPublicId) await deleteFromCloudinary(oldPublicId);
                }
                const uploadResult = await uploadToCloudinary(file.buffer, 'profiles');
                newImageUrl = uploadResult.url;
            } catch (err) {
                const error = new Error(`Failed to upload image: ${err.message}`);
                error.statusCode = 500;
                throw error;
            }
        }

        if (phone) user.phone = phone;
        if (name) user.name = name;
        user.image = newImageUrl; // Always set image (new or old)

        await userRepository.saveUser(user);

        // Handle address update
        if (address) {
            const defaultAddress = user.addresses ? user.addresses.find(a => a.is_default) : null;
            if (defaultAddress) {
                defaultAddress.address_line1 = address;
                await defaultAddress.save();
            } else {
                await userRepository.createAddress({
                    id: uuidv4(),
                    user_id: user.id,
                    address_line1: address,
                    is_default: true
                });
            }
        }

        // Fetch fresh data
        const updatedUser = await userRepository.findById(userId, false, true, true);
        const response = updatedUser.toJSON();
        delete response.password;
        delete response.otp_code; delete response.otp_expires_at;
        delete response.reset_otp; delete response.reset_otp_expires_at;
        response.roles = updatedUser.roles.map(r => r.role_name);

        return response;
    }

    async getAllUsers(params = {}) {
        const { page = 1, limit = 10, role, search, is_verified } = params;
        const offset = (page - 1) * limit;

        const where = {};
        if (search) {
            const { Op } = await import('sequelize');
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { phone: { [Op.iLike]: `%${search}%` } }
            ];
        }
        if (is_verified !== undefined && is_verified !== null && is_verified !== '') {
            where.is_verified = is_verified === 'true' || is_verified === true;
        }

        const include = [
            {
                model: User.sequelize.models.role,
                as: 'roles',
                through: { attributes: [] },
                attributes: ['role_name']
            },
            {
                model: Address,
                as: 'addresses'
            }
        ];

        if (role) {
            include[0].where = { role_name: role };
        }

        const { count, rows } = await User.findAndCountAll({
            where,
            include,
            distinct: true, // Required when including multiple models to get correct count
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        const users = rows.map(u => {
            const userJson = u.toJSON();
            delete userJson.password;
            delete userJson.otp_code;
            delete userJson.otp_expires_at;
            delete userJson.reset_otp;
            delete userJson.reset_otp_expires_at;
            userJson.roles = u.roles.map(r => r.role_name);
            return userJson;
        });

        return {
            users,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        };
    }

    // Address Management
    async getUserAddresses(userId) {
        return await userRepository.findAddressesByUserId(userId);
    }

    async addAddress(userId, data) {
        const {
            full_name,
            phone,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country,
            is_default
        } = data;

        try {
            return await sequelize.transaction(async (t) => {
                if (is_default) {
                    // Unset other defaults
                    await Address.update(
                        { is_default: false },
                        { where: { user_id: userId }, transaction: t }
                    );
                }

                const addressCount = await Address.count({ where: { user_id: userId } });

                const newAddress = await userRepository.createAddress({
                    id: uuidv4(),
                    user_id: userId,
                    full_name,
                    phone,
                    address_line1,
                    address_line2,
                    city,
                    state,
                    postal_code,
                    country: country || 'India',
                    is_default: addressCount === 0 ? true : (is_default || false),
                }, t);

                return newAddress;
            });
        } catch (error) {
            console.error('Error in UserService.addAddress:', error);
            throw error;
        }
    }

    async updateAddress(userId, addressId, data) {
        const {
            full_name,
            phone,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country,
            is_default
        } = data;

        const address = await Address.findOne({ where: { id: addressId, user_id: userId } });

        if (!address) {
            const error = new Error('Address not found');
            error.statusCode = 404;
            throw error;
        }

        try {
            return await sequelize.transaction(async (t) => {
                if (is_default) {
                    // Unset other defaults
                    await Address.update(
                        { is_default: false },
                        { where: { user_id: userId }, transaction: t }
                    );
                }

                await address.update({
                    full_name,
                    phone,
                    address_line1,
                    address_line2,
                    city,
                    state,
                    postal_code,
                    country,
                    is_default: is_default || address.is_default
                }, { transaction: t });

                return address;
            });
        } catch (error) {
            console.error('Error in UserService.updateAddress:', error);
            throw error;
        }
    }

    async deleteAddress(userId, addressId) {
        const address = await Address.findOne({ where: { id: addressId, user_id: userId } });
        if (!address) {
            const error = new Error('Address not found');
            error.statusCode = 404;
            throw error;
        }

        const wasDefault = address.is_default;
        await address.destroy();

        // If we deleted the default, make the most recent one default
        if (wasDefault) {
            const nextAddress = await Address.findOne({
                where: { user_id: userId },
                order: [['created_at', 'DESC']]
            });
            if (nextAddress) {
                nextAddress.is_default = true;
                await nextAddress.save();
            }
        }

        return { message: 'Address deleted successfully' };
    }

    async setDefaultAddress(userId, addressId) {
        const address = await Address.findOne({ where: { id: addressId, user_id: userId } });
        if (!address) {
            const error = new Error('Address not found');
            error.statusCode = 404;
            throw error;
        }

        return await sequelize.transaction(async (t) => {
            await Address.update(
                { is_default: false },
                { where: { user_id: userId }, transaction: t }
            );

            address.is_default = true;
            await address.save({ transaction: t });

            return address;
        });
    }

    /**
     * Delete a single customer and all their associations (orders, addresses, wishlist, roles)
     */
    async deleteUser(id) {
        const { Op } = await import('sequelize');
        const user = await User.findByPk(id);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        return await sequelize.transaction(async (t) => {
            // Find all user orders
            const orders = await sequelize.models.order.findAll({ where: { user_id: id }, transaction: t });
            const orderIds = orders.map(o => o.id);

            if (orderIds.length > 0) {
                await sequelize.models.orderShippingAddress.destroy({ where: { order_id: { [Op.in]: orderIds } }, transaction: t });
                await sequelize.models.orderItem.destroy({ where: { order_id: { [Op.in]: orderIds } }, transaction: t });
                await sequelize.models.order.destroy({ where: { id: { [Op.in]: orderIds } }, transaction: t });
            }

            await Address.destroy({ where: { user_id: id }, transaction: t });
            await sequelize.models.wishlist.destroy({ where: { user_id: id }, transaction: t });
            await sequelize.models.notification.destroy({ where: { user_id: id }, transaction: t });
            await sequelize.models.userRole.destroy({ where: { user_id: id }, transaction: t });
            await user.destroy({ transaction: t });
            return true;
        });
    }

    /**
     * Bulk delete customers and all their associations (Admin only)
     */
    async bulkDeleteUsers(ids) {
        if (!ids || !Array.isArray(ids) || ids.length === 0) return false;
        const { Op } = await import('sequelize');

        return await sequelize.transaction(async (t) => {
            await sequelize.models.userRole.destroy({ where: { user_id: { [Op.in]: ids } }, transaction: t });
            await Address.destroy({ where: { user_id: { [Op.in]: ids } }, transaction: t });
            await sequelize.models.wishlist.destroy({ where: { user_id: { [Op.in]: ids } }, transaction: t });
            await sequelize.models.notification.destroy({ where: { user_id: { [Op.in]: ids } }, transaction: t });

            const orders = await sequelize.models.order.findAll({ 
                where: { user_id: { [Op.in]: ids } }, 
                attributes: ['id'],
                transaction: t 
            });
            const orderIds = orders.map(o => o.id);

            if (orderIds.length > 0) {
                await sequelize.models.orderShippingAddress.destroy({ where: { order_id: { [Op.in]: orderIds } }, transaction: t });
                await sequelize.models.orderItem.destroy({ where: { order_id: { [Op.in]: orderIds } }, transaction: t });
                await sequelize.models.order.destroy({ where: { id: { [Op.in]: orderIds } }, transaction: t });
            }

            await User.destroy({ where: { id: { [Op.in]: ids } }, transaction: t });
            return true;
        });
    }
}

export default new UserService();
