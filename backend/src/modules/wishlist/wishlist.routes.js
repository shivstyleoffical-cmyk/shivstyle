import express from 'express';
import {
    addToWishlist,
    removeFromWishlist,
    getUserWishlist,
    checkWishlistStatus,
    clearWishlist,
    moveToCart,
    getWishlistCount
} from './wishlist.controller.js';

import { authMiddleware } from '../../middleware/authMiddleware.js';
import { validateAddToWishlist } from './wishlist.validators.js';

const wishlistRoutes = express.Router();

// All wishlist routes require authentication
wishlistRoutes.use(authMiddleware);

// Wishlist CRUD operations
wishlistRoutes.post('/add', validateAddToWishlist, addToWishlist);
wishlistRoutes.delete('/remove/:wishlist_id', removeFromWishlist);
wishlistRoutes.get('/', getUserWishlist);
wishlistRoutes.get('/check', checkWishlistStatus);
wishlistRoutes.delete('/clear', clearWishlist);
wishlistRoutes.post('/move-to-cart/:wishlist_id', moveToCart);
wishlistRoutes.get('/count', getWishlistCount);

export default wishlistRoutes;
