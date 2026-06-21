import express from 'express';
import * as productController from './product.controller.js';
import { validateCreateProduct, validateUpdateProduct } from './product.validators.js';
import { uploadMultiple, uploadSingle } from '../../middleware/multer.js';

const router = express.Router();

/**
 * Enhanced Product Routes with comprehensive filtering and search
 */

// ==================== PUBLIC ROUTES ====================

// Get all products with advanced filtering
router.get('/', productController.getAllProducts);

// Search products with autocomplete support
router.get('/search', productController.searchProducts);

// Get featured products
router.get('/featured', productController.getFeaturedProducts);

// Get trending products
router.get('/trending', productController.getTrendingProducts);

// Get new arrivals
router.get('/new-arrivals', productController.getNewArrivals);

// Get best sellers
router.get('/best-sellers', productController.getBestSellers);

// Get recommended products
router.get('/recommended', productController.getRecommendedProducts);

// Get filter options (brands, price range, sizes, colors)
router.get('/filters', productController.getFilterOptions);

// Get products by category
router.get('/category/:category_id', productController.getProductsByCategory);

// Get product by slug
router.get('/slug/:slug', productController.getProductBySlug);

// Get similar products
router.get('/:id/similar', productController.getSimilarProducts);

// Get product by ID (should be last to avoid conflicts)
router.get('/:id', productController.getProductById);

import Product from './product.model.js';
import Category from '../category/category.model.js';

router.post('/seed-test-product', async (req, res) => {
    try {
        const category = await Category.findOne({ where: { status: 'active' } });
        const categoryId = category ? category.id : null;

        const [product, created] = await Product.findOrCreate({
            where: { url_slug: 'magic-checkout-test-product' },
            defaults: {
                product_name: 'Magic Checkout Test Product',
                url_slug: 'magic-checkout-test-product',
                price: 1.00,
                stock_quantity: 999,
                status: 'active',
                image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
                description: 'This is a temporary ₹1 test product used to test and verify the Razorpay Magic Checkout live integration.',
                category_id: categoryId,
                brand: 'ShivStyle',
                tags: 'test, magic-checkout',
                is_featured: false,
                is_trending: false,
                is_new_arrival: true,
                is_on_sale: false,
                average_rating: '5.00',
                total_reviews: 1
            }
        });

        return res.status(200).json({
            success: true,
            message: created ? 'Test product created successfully' : 'Test product already exists',
            product
        });
    } catch (err) {
        console.error('Seeding error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

import { authMiddleware } from '../../middleware/authMiddleware.js';
import { adminMiddleware } from '../user/user.middleware.js';

// ==================== ADMIN ROUTES ====================

// Apply protection to all admin routes below
router.use(authMiddleware, adminMiddleware);

// Create product
router.post('/', uploadMultiple, validateCreateProduct, productController.createProduct);

// Update product
router.put('/:id', uploadMultiple, validateUpdateProduct, productController.updateProduct);

// Delete product
router.delete('/:id', productController.deleteProduct);

export default router;
