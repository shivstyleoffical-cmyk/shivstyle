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
