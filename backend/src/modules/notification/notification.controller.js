import notificationService from './notification.service.js';

export const getAllNotifications = async (req, res, next) => {
    try {
        const result = await notificationService.getAllNotifications(req.query);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const createNotification = async (req, res, next) => {
    try {
        const notification = await notificationService.createNotification(req.body);
        res.status(201).json({ success: true, message: 'Notification created successfully', notification });
    } catch (error) {
        next(error);
    }
};

export const deleteNotification = async (req, res, next) => {
    try {
        const result = await notificationService.deleteNotification(req.params.id);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};
