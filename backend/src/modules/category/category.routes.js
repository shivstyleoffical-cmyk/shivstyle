import express from 'express';
import multer from 'multer';
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
    getCategoryTree
} from './category.controller.js';

import { authMiddleware } from '../../middleware/authMiddleware.js';
import { adminOrSuperAdminMiddleware } from '../user/user.middleware.js';
import { validateCreateCategory, validateUpdateCategory } from './category.validators.js';

const categoryRoutes = express.Router();

// Configure multer to use memory storage for Cloudinary uploads
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // max 5MB
});


// Public routes
categoryRoutes.get('/', getAllCategories);
categoryRoutes.get('/tree', getCategoryTree);
categoryRoutes.get('/:id', getCategoryById);
categoryRoutes.get('/slug/:slug', getCategoryBySlug);

// Protected routes (admin only)
categoryRoutes.post('/', authMiddleware, adminOrSuperAdminMiddleware, upload.single('image'), validateCreateCategory, createCategory);
categoryRoutes.put('/:id', authMiddleware, adminOrSuperAdminMiddleware, upload.single('image'), validateUpdateCategory, updateCategory);
categoryRoutes.delete('/:id', authMiddleware, adminOrSuperAdminMiddleware, deleteCategory);

export default categoryRoutes;
