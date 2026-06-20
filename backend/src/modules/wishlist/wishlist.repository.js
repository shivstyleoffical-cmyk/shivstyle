import Wishlist from './wishlist.model.js';
import Product from '../product/product.model.js';
import ProductVariant from '../product/product-variant.model.js';
import ProductImage from '../product/product-image.model.js';
import Category from '../category/category.model.js';

class WishlistRepository {
    async create(data) {
        return await Wishlist.create(data);
    }

    async findOne(whereClause) {
        return await Wishlist.findOne({ where: whereClause });
    }

    async findOneWithDetails(whereClause) {
        return await Wishlist.findOne({
            where: whereClause,
            include: [
                { model: Product, as: 'product' },
                { model: ProductVariant, as: 'variant' }
            ]
        });
    }

    async delete(whereClause) {
        return await Wishlist.destroy({ where: whereClause });
    }

    async count(whereClause) {
        return await Wishlist.count({ where: whereClause });
    }

    async findAndCountAll(whereClause, limit, offset, order) {
        return await Wishlist.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order,
            include: [
                {
                    model: Product,
                    as: 'product',
                    where: { status: 'active' },
                    include: [
                        {
                            model: Category,
                            as: 'category',
                            attributes: ['id', 'category_name', 'url_slug']
                        },
                        {
                            model: ProductImage,
                            as: 'images',
                            attributes: ['id', 'image_url', 'image_order', 'is_primary', 'status'],
                            where: { status: 'active' },
                            required: false,
                            order: [['image_order', 'ASC']]
                        }
                    ]
                },
                {
                    model: ProductVariant,
                    as: 'variant',
                    required: false
                }
            ]
        });
    }
}

export default new WishlistRepository();
