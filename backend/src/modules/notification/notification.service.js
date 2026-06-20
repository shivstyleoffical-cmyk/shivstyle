import Notification from './notification.model.js';
import { v4 as uuidv4 } from 'uuid';

class NotificationService {
    async getAllNotifications(params = {}) {
        const { page = 1, limit = 10, search, type } = params;
        const offset = (page - 1) * limit;

        const where = {};
        if (type) where.type = type;
        if (search) {
            const { Op } = await import('sequelize');
            where[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { message: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Notification.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        return {
            notifications: rows,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        };
    }

    async createNotification(data) {
        const notification = await Notification.create({
            id: uuidv4(),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return notification;
    }

    async deleteNotification(id) {
        const notification = await Notification.findByPk(id);
        if (!notification) {
            const error = new Error('Notification not found');
            error.statusCode = 404;
            throw error;
        }
        await notification.destroy();
        return { message: 'Notification deleted successfully' };
    }

    async markAsRead(id) {
        const notification = await Notification.findByPk(id);
        if (notification) {
            notification.is_read = true;
            await notification.save();
        }
        return notification;
    }
}

export default new NotificationService();
