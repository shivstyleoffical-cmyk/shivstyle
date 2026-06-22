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

// TEMPORARY: Seed 3 real products into production DB
router.post('/seed-real-products', async (req, res) => {
    try {
        const JEANS_CAT   = '3b19dadf-328f-4a67-889d-6481f449048b'; // Men → Jeans
        const TSHIRTS_CAT = 'a194cc22-5210-4ccf-8edb-1c3fb8aa5a01'; // Men → T-Shirts

        const productsToSeed = [
            {
                product_name: 'ShivStyle Slim Fit Denim Jeans',
                url_slug: 'shivstyle-slim-fit-denim-jeans',
                description: '<p>Crafted from premium stretch denim, these slim-fit jeans offer the perfect blend of comfort and style. Featuring a classic 5-pocket design with a tapered leg and mid-rise waist — ideal for everyday wear.</p><ul><li>Material: 98% Cotton, 2% Elastane</li><li>Fit: Slim Fit</li><li>Rise: Mid Rise</li><li>Occasion: Casual, Smart Casual</li></ul>',
                price: 1299.00,
                original_price: 1299.00,
                stock_quantity: 50,
                status: 'active',
                category_id: JEANS_CAT,
                brand: 'ShivStyle',
                tags: 'jeans, men, denim, slim fit, casual',
                is_featured: true,
                is_trending: true,
                is_new_arrival: true,
                is_on_sale: false,
                image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
                average_rating: '4.50',
                total_reviews: 12
            },
            {
                product_name: 'ShivStyle Graphic Oversized T-Shirt',
                url_slug: 'shivstyle-graphic-oversized-tshirt',
                description: '<p>Make a statement with this premium graphic oversized T-shirt. Made from 100% combed cotton with a relaxed boxy silhouette — the ultimate streetwear essential.</p><ul><li>Material: 100% Combed Cotton (240 GSM)</li><li>Fit: Oversized / Boxy</li><li>Neckline: Round Neck</li><li>Occasion: Casual, Streetwear</li></ul>',
                price: 699.00,
                original_price: 699.00,
                stock_quantity: 100,
                status: 'active',
                category_id: TSHIRTS_CAT,
                brand: 'ShivStyle',
                tags: 'tshirt, men, graphic, oversized, streetwear, casual',
                is_featured: true,
                is_trending: false,
                is_new_arrival: true,
                is_on_sale: false,
                image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
                average_rating: '4.80',
                total_reviews: 28
            },
            {
                product_name: 'ShivStyle Cargo Jogger Jeans',
                url_slug: 'shivstyle-cargo-jogger-jeans',
                description: '<p>Limited time sale! Get our best-selling cargo jogger jeans at an unbeatable price. Made from soft denim with elastic waistband and multiple cargo pockets — comfort meets function.</p><ul><li>Material: 95% Cotton, 5% Lycra</li><li>Fit: Jogger / Relaxed</li><li>Waist: Elastic with Drawstring</li><li>Pockets: 6 including 2 cargo</li><li>Occasion: Casual, Outdoor</li></ul>',
                price: 899.00,
                original_price: 1499.00,
                stock_quantity: 30,
                status: 'active',
                category_id: JEANS_CAT,
                brand: 'ShivStyle',
                tags: 'jeans, sale, cargo, jogger, men, discount',
                is_featured: false,
                is_trending: true,
                is_new_arrival: false,
                is_on_sale: true,
                image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80',
                average_rating: '4.30',
                total_reviews: 7
            }
        ];

        const results = [];
        for (const p of productsToSeed) {
            const [product, created] = await Product.findOrCreate({
                where: { url_slug: p.url_slug },
                defaults: p
            });
            results.push({ name: product.product_name, price: product.price, created });
        }

        return res.status(200).json({ success: true, seeded: results });
    } catch (err) {
        console.error('Real product seeding error:', err);
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
