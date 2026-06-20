import Category from './category.model.js';
import Product from '../product/product.model.js';
import { Op } from 'sequelize';

/**
 * CategoryRepository encapsulates all database operations for categories.
 * Business logic should not pass Sequelize specific objects here.
 */
class CategoryRepository {
    async create(categoryData) {
        return await Category.create(categoryData);
    }

    async findAndCountAll(options) {
        return await Category.findAndCountAll(options);
    }

    async findAll(options) {
        return await Category.findAll(options);
    }

    async findBySlug(slug, excludeId = null) {
        const where = { url_slug: slug };
        if (excludeId) {
            where.id = { [Op.ne]: excludeId };
        }
        return await Category.findOne({ where });
    }

    async findBySlugDetailed(slug) {
        return await Category.findOne({
            where: { url_slug: slug, status: 'active' },
            include: [
                {
                    model: Category,
                    as: 'parent',
                    attributes: ['id', 'category_name', 'url_slug']
                },
                {
                    model: Category,
                    as: 'children',
                    attributes: ['id', 'category_name', 'url_slug', 'status']
                },
                {
                    model: Product,
                    as: 'products',
                    attributes: ['id', 'product_name', 'price', 'image_url', 'description'],
                    where: { status: 'active' },
                    required: false
                }
            ]
        });
    }

    async findById(id, { includeChildren = false, includeProducts = false } = {}) {
        const include = [];
        if (includeChildren) {
            include.push({ model: Category, as: 'parent', attributes: ['id', 'category_name', 'url_slug'] });
            include.push({ model: Category, as: 'children', attributes: ['id', 'category_name', 'url_slug', 'status'] });
        }
        if (includeProducts) {
            include.push({
                model: Product,
                as: 'products',
                attributes: ['id', 'product_name', 'price', 'image_url', 'description'],
                where: { status: 'active' },
                required: false
            });
        }
        return await Category.findByPk(id, { include });
    }

    async countProducts(categoryId) {
        return await Product.count({
            where: { category_id: categoryId, status: 'active' }
        });
    }

    async countChildren(parentId) {
        return await Category.count({
            where: { parent_cat_id: parentId, status: 'active' }
        });
    }

    async listCategories({ page = 1, limit = 10, status, parent_cat_id, searchString, sortBy = 'category_name', sortOrder = 'ASC' } = {}) {
        const offset = (page - 1) * limit;
        const where = {};
        if (status) where.status = status;
        if (parent_cat_id) where.parent_cat_id = parent_cat_id;
        if (searchString) {
            where[Op.or] = [
                { category_name: { [Op.iLike]: `%${searchString}%` } },
                { description: { [Op.iLike]: `%${searchString}%` } }
            ];
        }

        // Whitelist allowed sort columns to prevent injection
        const allowedSortColumns = ['category_name', 'status', 'createdAt', 'updatedAt'];
        const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'category_name';
        const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        return await Category.findAndCountAll({
            where,
            limit,
            offset,
            include: [
                { model: Category, as: 'parent', attributes: ['id', 'category_name', 'url_slug'] },
                { model: Category, as: 'children', attributes: ['id', 'category_name', 'url_slug', 'status'] }
            ],
            order: [[safeSortBy, safeSortOrder]]
        });
    }

    async getFullTree() {
        return await Category.findAll({
            where: { status: 'active' },
            include: [
                {
                    model: Category,
                    as: 'children',
                    where: { status: 'active' },
                    required: false,
                    include: [
                        {
                            model: Product,
                            as: 'products',
                            attributes: ['id', 'product_name'],
                            where: { status: 'active' },
                            required: false
                        }
                    ]
                },
                {
                    model: Product,
                    as: 'products',
                    attributes: ['id', 'product_name'],
                    where: { status: 'active' },
                    required: false
                }
            ],
            order: [['category_name', 'ASC']]
        });
    }

    async delete(id) {
        const category = await Category.findByPk(id);
        if (category) return await category.destroy();
        return null;
    }
}

export default new CategoryRepository();
