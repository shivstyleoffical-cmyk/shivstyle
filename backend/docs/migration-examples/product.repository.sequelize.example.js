/**
 * EXAMPLE: Product Repository with Sequelize (CURRENT)
 * 
 * This is what you have now. All Sequelize-specific code is here.
 */

import Product from './product.model.js';
import { Op } from 'sequelize';

class ProductRepositorySequelize {
    async findById(id) {
        return await Product.findByPk(id);
    }

    async listProducts({ page = 1, limit = 10, searchString, minPrice, maxPrice }) {
        const offset = (page - 1) * limit;
        const where = { status: 'active' };

        if (searchString) {
            where[Op.or] = [
                { product_name: { [Op.iLike]: `%${searchString}%` } }
            ];
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = minPrice;
            if (maxPrice) where.price[Op.lte] = maxPrice;
        }

        return await Product.findAndCountAll({ where, limit, offset });
    }

    async create(data) {
        return await Product.create(data);
    }

    async update(product, data) {
        Object.assign(product, data);
        return await product.save();
    }
}

export default new ProductRepositorySequelize();
