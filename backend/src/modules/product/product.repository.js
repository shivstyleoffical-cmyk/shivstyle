import Product from './product.model.js';
import ProductVariant from './product-variant.model.js';
import ProductImage from './product-image.model.js';
import Category from '../category/category.model.js';
import { Op } from 'sequelize';

/**
 * ProductRepository encapsulates all product-related persistence logic.
 * Swapping Sequelize for another DB adapter only requires changes here.
 */
class ProductRepository {
    async create(productData, transaction = null) {
        return await Product.create(productData, { transaction });
    }

    async findAndCountAll(options) {
        return await Product.findAndCountAll(options);
    }

    async findAll(options) {
        return await Product.findAll(options);
    }

    async findByPk(id) {
        return await Product.findByPk(id);
    }

    async findOne(options) {
        return await Product.findOne(options);
    }

    async findById(id, { includeRelations = false } = {}) {
        if (!includeRelations) return await Product.findByPk(id);

        return await this.getDetailedProduct({ id });
    }

    async findBySlug(slug) {
        return await this.getDetailedProduct({ url_slug: slug });
    }

    async listProducts({
        page = 1,
        limit = 10,
        status = 'active',
        category_id,
        searchString,
        minPrice,
        maxPrice,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
    } = {}) {
        const offset = (page - 1) * limit;
        const where = { status };

        if (category_id) where.category_id = category_id;
        if (searchString) {
            where[Op.or] = [
                { product_name: { [Op.iLike]: `%${searchString}%` } },
                { description: { [Op.iLike]: `%${searchString}%` } }
            ];
        }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = minPrice;
            if (maxPrice) where.price[Op.lte] = maxPrice;
        }

        return await Product.findAndCountAll({
            where,
            limit,
            offset,
            order: [[sortBy, sortOrder.toUpperCase()]],
            include: [{ model: Category, as: 'category', attributes: ['id', 'category_name'] }]
        });
    }

    async update(product, updateData, transaction = null) {
        Object.assign(product, updateData);
        return await product.save({ transaction });
    }

    async delete(id) {
        const product = await Product.findByPk(id);
        if (product) {
            // Hard delete the product
            return await product.destroy();
        }
        return null;
    }

    async addImage(imageData, transaction = null) {
        return await ProductImage.create(imageData, { transaction });
    }

    async addVariant(variantData, transaction = null) {
        return await ProductVariant.create(variantData, { transaction });
    }

    async removeImagesByProductId(productId, transaction = null) {
        return await ProductImage.destroy({ where: { product_id: productId }, transaction });
    }

    async deactivateVariantsByProductId(productId, transaction = null) {
        return await ProductVariant.update(
            { status: 'inactive', updatedAt: new Date() },
            { where: { product_id: productId }, transaction }
        );
    }

    async removeVariants(productId, transaction = null) {
        return await ProductVariant.destroy({
            where: { product_id: productId },
            transaction
        });
    }

    async removeVariantsWhere(whereClause, transaction = null) {
        return await ProductVariant.destroy({
            where: whereClause,
            transaction
        });
    }

    async getDetailedProduct(whereClause) {
        return await Product.findOne({
            where: whereClause,
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'category_name', 'url_slug']
                },
                {
                    model: ProductVariant,
                    as: 'variants',
                    required: false
                },
                {
                    model: ProductImage,
                    as: 'images',
                    where: { status: 'active' },
                    required: false
                }
            ]
        });
    }

    async getJustArrived(limit = 10) {
        return await Product.findAll({
            where: { status: 'active' },
            limit,
            order: [['createdAt', 'DESC']],
            include: [{ model: Category, as: 'category' }]
        });
    }

    async count(whereClause = {}) {
        return await Product.count({ where: whereClause });
    }

    async sum(field, whereClause = {}) {
        return await Product.sum(field, { where: whereClause });
    }
}

export default new ProductRepository();
