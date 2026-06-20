import wishlistRepository from './wishlist.repository.js';
import Product from '../product/product.model.js';
import ProductVariant from '../product/product-variant.model.js';

class WishlistService {
    async addToWishlist(userId, data) {
        const { product_id, product_variant_id } = data;

        const product = await Product.findOne({ where: { id: product_id, status: 'active' } });
        if (!product) {
            const error = new Error('Product not found or inactive');
            error.statusCode = 404;
            throw error;
        }

        if (product_variant_id) {
            const variant = await ProductVariant.findOne({
                where: { id: product_variant_id, product_id, status: 'active' }
            });
            if (!variant) {
                const error = new Error('Product variant not found or inactive');
                error.statusCode = 404;
                throw error;
            }
        }

        const existing = await wishlistRepository.findOne({
            user_id: userId,
            product_id,
            product_variant_id: product_variant_id || null
        });

        if (existing) {
            const error = new Error('Product already in wishlist');
            error.statusCode = 409;
            throw error;
        }

        return await wishlistRepository.create({
            user_id: userId,
            product_id,
            product_variant_id: product_variant_id || null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    async removeFromWishlist(userId, wishlistId) {
        const wishlistItem = await wishlistRepository.findOne({ id: wishlistId, user_id: userId });
        if (!wishlistItem) {
            const error = new Error('Wishlist item not found');
            error.statusCode = 404;
            throw error;
        }
        await wishlistItem.destroy();
        return true;
    }

    async getUserWishlist(userId, query) {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
        const offset = (page - 1) * limit;

        const result = await wishlistRepository.findAndCountAll(
            { user_id: userId },
            parseInt(limit),
            parseInt(offset),
            [[sortBy, sortOrder.toUpperCase()]]
        );

        return {
            wishlist_items: result.rows,
            total: result.count,
            pagination: {
                total: result.count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(result.count / limit),
                hasNextPage: parseInt(page) < Math.ceil(result.count / limit),
                hasPrevPage: parseInt(page) > 1
            }
        };
    }

    async checkWishlistStatus(userId, productId, variantId) {
        const wishlistItem = await wishlistRepository.findOne({
            user_id: userId,
            product_id: productId,
            product_variant_id: variantId || null
        });
        return {
            is_in_wishlist: !!wishlistItem,
            wishlist_item: wishlistItem
        };
    }

    async clearWishlist(userId) {
        return await wishlistRepository.delete({ user_id: userId });
    }

    async getWishlistCount(userId) {
        return await wishlistRepository.count({ user_id: userId });
    }

    async moveToCart(userId, wishlistId, quantity) {
        const wishlistItem = await wishlistRepository.findOneWithDetails({ id: wishlistId, user_id: userId });

        if (!wishlistItem) {
            const error = new Error('Wishlist item not found');
            error.statusCode = 404;
            throw error;
        }

        if (wishlistItem.product.status !== 'active') {
            const error = new Error('Product is no longer available');
            error.statusCode = 400;
            throw error;
        }

        const availableStock = wishlistItem.variant
            ? wishlistItem.variant.stock_quantity
            : wishlistItem.product.stock_quantity;

        if (availableStock < quantity) {
            const error = new Error('Insufficient stock');
            error.statusCode = 400;
            throw error;
        }

        // Note: The original controller just deletes the item and says "Cart functionality needs to be implemented".
        // In a real scenario, I should call CartService.addToCart here?
        // Since this is a refactor to match existing functionality, I will replicate the behavior: delete from wishlist.
        // BUT, since we have CartService available now, I COULD hook it up.
        // However, sticking to the existing logic is safer to avoid breaking changes or circular dependencies if not careful.
        // Actually, CartService depends on CartRepo. WishlistService depends on WishlistRepo.
        // If I import CartService here, it should be fine.
        // For now, I will stick to "remove from wishlist" as per original code.

        await wishlistItem.destroy();
        return true;
    }
}

export default new WishlistService();
