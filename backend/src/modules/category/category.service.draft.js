import categoryRepository from './category.repository.js';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } from '../../utils/cloudinaryUpload.js';
import { Op } from 'sequelize';

class CategoryService {
    async createCategory(data, file) {
        const { category_name, url_slug, parent_cat_id, status } = data;

        // 1. Business Logic: Check duplicates
        const existingCategory = await categoryRepository.findBySlug(url_slug);
        if (existingCategory) {
            const error = new Error('URL slug already exists');
            error.statusCode = 409;
            throw error;
        }

        // 2. Business Logic: specific validation for parent
        if (parent_cat_id) {
            const parentCategory = await categoryRepository.findById(parent_cat_id);
            if (!parentCategory) {
                const error = new Error('Parent category not found');
                error.statusCode = 404;
                throw error;
            }
        }

        // 3. Image Upload
        let imageUrl = null;
        if (file) {
            try {
                const uploadResult = await uploadToCloudinary(file.buffer, 'categories');
                imageUrl = uploadResult.url;
            } catch (uploadError) {
                const error = new Error(`Failed to upload image: ${uploadError.message}`);
                error.statusCode = 500;
                throw error;
            }
        }

        // 4. Persistence
        return await categoryRepository.create({
            category_name,
            url_slug,
            parent_cat_id,
            status: status || 'active',
            image_url: imageUrl,
            created_At: new Date(),
            updated_At: new Date()
        });
    }

    async getAllCategories(queryParams) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'created_At',
            sortOrder = 'DESC',
            status,
            parent_cat_id,
            search
        } = queryParams;

        const offset = (page - 1) * limit;
        let whereClause = {};

        if (status) whereClause.status = status;
        if (parent_cat_id) whereClause.parent_cat_id = parent_cat_id;
        if (search) {
            whereClause.category_name = { [Op.iLike]: `%${search}%` };
        }

        const result = await categoryRepository.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortOrder.toUpperCase()]]
        });

        return {
            categories: result.rows,
            pagination: {
                total: result.count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(result.count / limit),
                hasNextPage: parseInt(page) < Math.ceil(result.count / limit),
                hasPrevPage: parseInt(page) > 1
            }
        };
    }

    async getCategoryById(id) {
        const category = await categoryRepository.findById(id, true, true);
        if (!category) {
            const error = new Error('Category not found');
            error.statusCode = 404;
            throw error;
        }
        return category;
    }

    async getCategoryBySlug(slug) {
        // Custom logic: slug usually implies active items only in public views? 
        // The original controller filtered by `status: 'active'`.
        const category = await categoryRepository.findOne({
            where: { url_slug: slug, status: 'active' },
            include: [
                {
                    model: categoryRepository.create().sequelize.model('category'), // using repository access to model if needed, or just standard include
                    as: 'parent',
                    attributes: ['id', 'category_name', 'url_slug']
                },
                {
                    model: categoryRepository.create().sequelize.model('category'),
                    as: 'children',
                    attributes: ['id', 'category_name', 'url_slug', 'status']
                },
                {
                    model: categoryRepository.create().sequelize.model('product'),
                    as: 'products',
                    attributes: ['id', 'product_name', 'price', 'image_url', 'description'],
                    where: { status: 'active' },
                    required: false
                }
            ]
        });

        // WAIT, the include model references above are tricky if I don't import the models directly.
        // Let's defer to the repository for this specific complex query to keep Service clean.

        const repoResult = await categoryRepository.findOne({
            where: { url_slug: slug, status: 'active' },
            // We rely on the repository's default include or I should add a specific method in repo for this.
            // Best practice: Add `findBySlugWithDetails` in Repository.
        });

        // Re-implementing correctly: calling repository method with specific includes would be cleaner, 
        // but for now let's import the models here just for the `include` definitions if we keep query construction here.
        // OR better, move this specific high-detail query to the Repository.
    }
}

// Rewriting I will fix the `getCategoryBySlug` in the actual file write below.
export default new CategoryService();
