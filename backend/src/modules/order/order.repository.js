import Order from './order.model.js';
import OrderItem from './order-item.model.js';
import OrderShippingAddress from './order-shipping-address.model.js';
import sequelize, { Op } from '../../database/connection.js';

/**
 * OrderRepository abstracts the Sequelize ORM.
 * All DB specific logic (like Op.gte or grouping) is encapsulated here.
 */
class OrderRepository {
    async create(orderData, transaction = null) {
        return await Order.create(orderData, { transaction });
    }

    async createItem(itemData, transaction = null) {
        return await OrderItem.create(itemData, { transaction });
    }

    async createShippingAddress(addressData, transaction = null) {
        return await OrderShippingAddress.create(addressData, { transaction });
    }

    async findOne(whereClause, include = []) {
        return await Order.findOne({ where: whereClause, include });
    }

    async findByPk(id, transaction = null) {
        return await Order.findByPk(id, { transaction });
    }

    async findAndCountAll(options) {
        return await Order.findAndCountAll(options);
    }

    async save(order, transaction = null) {
        return await order.save({ transaction });
    }

    async count(whereClause) {
        return await Order.count({ where: whereClause });
    }

    async sum(field, whereClause) {
        return await Order.sum(field, { where: whereClause });
    }

    /**
     * Encapsulated analytics logic. 
     * Making this a repository method allows us to migrate to a different DB 
     * (like a Data Warehouse or MongoDB) without changing the Service logic.
     */
    async getStats(period) {
        const now = new Date();
        let dateFilter;

        switch (period) {
            case 'week':
                dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                dateFilter = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const breakdown = await Order.findAll({
            where: {
                createdAt: { [Op.gte]: dateFilter }
            },
            attributes: [
                'status',
                'payment_status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('net_amount')), 'total_revenue']
            ],
            group: ['status', 'payment_status']
        });

        const totalOrders = await this.count({
            createdAt: { [Op.gte]: dateFilter }
        });

        const totalRevenue = await this.sum('net_amount', {
            createdAt: { [Op.gte]: dateFilter }
        });

        return {
            period,
            totalOrders,
            totalRevenue: totalRevenue || 0,
            breakdown
        };
    }
}

export default new OrderRepository();
