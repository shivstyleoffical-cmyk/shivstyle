import Offer from './offer.model.js';
import { v4 as uuidv4 } from 'uuid';

class OfferService {
    async getAllOffers(params = {}) {
        const { page = 1, limit = 100, status, search, sortBy = 'created_at', sortOrder = 'DESC' } = params;
        const offset = (page - 1) * limit;

        const where = {};
        if (status) {
            where.status = status;
        }
        if (search) {
            const { Op } = await import('sequelize');
            where[Op.or] = [
                { code: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Offer.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortOrder.toUpperCase()]]
        });

        return {
            offers: rows,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        };
    }

    async getOfferById(id) {
        const offer = await Offer.findByPk(id);
        if (!offer) {
            const error = new Error('Offer not found');
            error.statusCode = 404;
            throw error;
        }
        return offer;
    }

    async createOffer(data) {
        const offer = await Offer.create({
            id: uuidv4(),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return offer;
    }

    async updateOffer(id, data) {
        const offer = await this.getOfferById(id);
        await offer.update({
            ...data,
            updatedAt: new Date()
        });
        return offer;
    }

    async deleteOffer(id) {
        const offer = await this.getOfferById(id);
        await offer.destroy();
        return { message: 'Offer deleted successfully' };
    }

    async validateCoupon(code, subtotal) {
        const offer = await Offer.findOne({
            where: {
                code,
                status: 'active'
            }
        });

        if (!offer) {
            const error = new Error('Invalid or expired coupon code');
            error.statusCode = 400;
            throw error;
        }

        const now = new Date();
        if (now < new Date(offer.start_date) || now > new Date(offer.end_date)) {
            const error = new Error('This coupon has expired');
            error.statusCode = 400;
            throw error;
        }

        if (offer.usage_limit && offer.used_count >= offer.usage_limit) {
            const error = new Error('This coupon usage limit has been reached');
            error.statusCode = 400;
            throw error;
        }

        if (subtotal < parseFloat(offer.min_order_amount)) {
            const error = new Error(`Order subtotal must be at least ₹${offer.min_order_amount} to use this coupon`);
            error.statusCode = 400;
            throw error;
        }

        let discountAmount = 0;
        if (offer.discount_type === 'percentage') {
            discountAmount = (subtotal * parseFloat(offer.discount_value)) / 100;
            if (offer.max_discount_amount && discountAmount > parseFloat(offer.max_discount_amount)) {
                discountAmount = parseFloat(offer.max_discount_amount);
            }
        } else {
            discountAmount = parseFloat(offer.discount_value);
        }

        return {
            id: offer.id,
            code: offer.code,
            discount_type: offer.discount_type,
            discount_value: offer.discount_value,
            discount_amount: discountAmount,
            final_total: subtotal - discountAmount
        };
    }
}

export default new OfferService();
