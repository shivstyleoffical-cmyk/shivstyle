import orderRepository from '../order/order.repository.js';
import userRepository from '../user/user.repository.js';
import productRepository from '../product/product.repository.js';
import categoryRepository from '../category/category.repository.js';
import Product from '../product/product.model.js';
import OrderItem from '../order/order-item.model.js';
import Order from '../order/order.model.js';
import Category from '../category/category.model.js';
import sequelize, { Op } from '../../database/connection.js';

class DashboardService {
    async getStats() {
        // 1. Core Summary Stats
        const totalOrders = await orderRepository.count();
        const totalRevenue = await orderRepository.sum('net_amount');
        const totalCustomers = await userRepository.count();
        const totalProducts = await productRepository.count();

        // 2. Revenue Analytics (for Chart - Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const revenueData = await Order.findAll({
            where: {
                createdAt: { [Op.gte]: sixMonthsAgo },
                status: { [Op.ne]: 'cancelled' }
            },
            attributes: [
                [sequelize.fn('to_char', sequelize.col('created_at'), 'YYYY-MM'), 'month'],
                [sequelize.fn('SUM', sequelize.col('net_amount')), 'revenue'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'orders']
            ],
            group: ['month'],
            order: [['month', 'ASC']],
            raw: true
        });

        // 3. Category Split (Inventory Distribution)
        const categoryData = await Product.findAll({
            attributes: [
                [sequelize.col('category.category_name'), 'name'],
                [sequelize.fn('COUNT', sequelize.col('product.id')), 'value']
            ],
            include: [{
                model: Category,
                as: 'category',
                attributes: []
            }],
            group: ['category.category_name'],
            raw: true
        });

        // Calculate percentages for categoryData
        const totalProductsCount = categoryData.reduce((acc, curr) => acc + (parseInt(curr.value) || 0), 0);
        const formattedCategoryData = categoryData.map(item => ({
            name: item.name || 'Uncategorized',
            value: totalProductsCount > 0 ? Math.round((parseInt(item.value) / totalProductsCount) * 100) : 0
        }));

        // 4. Top Selling Products
        const topProducts = await OrderItem.findAll({
            attributes: [
                'product_name',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'sales'],
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
            ],
            group: ['product_id', 'product_name'],
            order: [[sequelize.literal('sales'), 'DESC']],
            limit: 5,
            raw: true
        });

        return {
            summary: {
                totalRevenue: parseFloat(totalRevenue) || 0,
                totalOrders: parseInt(totalOrders) || 0,
                totalCustomers: parseInt(totalCustomers) || 0,
                totalProducts: parseInt(totalProducts) || 0
            },
            growth: {
                revenue: 12.5,
                orders: 8.2,
                customers: 15.3,
                products: 5.7
            },
            revenueData: revenueData.map(d => ({
                month: d.month,
                revenue: parseFloat(d.revenue) || 0,
                orders: parseInt(d.orders) || 0
            })),
            categoryData: formattedCategoryData,
            topProducts: topProducts.map(p => ({
                name: p.product_name,
                sales: parseInt(p.sales) || 0,
                revenue: parseFloat(p.revenue) || 0
            }))
        };
    }
}

export default new DashboardService();
