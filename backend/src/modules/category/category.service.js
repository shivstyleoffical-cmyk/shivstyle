import categoryRepository from './category.repository.js';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } from '../../integrations/storage/cloudinary.utils.js';
import Product from '../product/product.model.js';

/**
 * CategoryService handles business logic for categories.
 * It does not know about Sequelize concepts (like Op or where clauses).
 */
class CategoryService {
    async createCategory(data, file) {
        const { category_name, description, parent_cat_id, status } = data;
        let { url_slug } = data;

        const parentId = (parent_cat_id === '' || parent_cat_id === 'null' || parent_cat_id === 'undefined') ? null : parent_cat_id;

        // Auto-generate slug if not provided
        if (!url_slug || url_slug.trim() === '') {
            url_slug = category_name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        }

        const existingCategory = await categoryRepository.findBySlug(url_slug);
        if (existingCategory) {
            const error = new Error('URL slug already exists');
            error.statusCode = 409;
            throw error;
        }

        if (parentId) {
            const parentCategory = await categoryRepository.findById(parentId);
            if (!parentCategory) {
                const error = new Error('Parent category not found');
                error.statusCode = 404;
                throw error;
            }
        }

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

        const createdCategory = await categoryRepository.create({
            category_name,
            url_slug,
            description,
            parent_cat_id: parentId,
            status: status || 'active',
            image_url: imageUrl,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        if (data.product_ids) {
            let productIdsArray = [];
            try {
                productIdsArray = JSON.parse(data.product_ids);
            } catch (e) {
                productIdsArray = data.product_ids.split(',').filter(Boolean);
            }
            if (productIdsArray.length > 0) {
                await Product.update(
                    { category_id: createdCategory.id },
                    { where: { id: productIdsArray } }
                );
            }
        }

        return createdCategory;
    }

    async getAllCategories(queryParams) {
        const {
            page = 1,
            limit = 20,
            status,
            parent_cat_id,
            search,
            sortBy = 'category_name',
            sortOrder = 'ASC'
        } = queryParams;

        let finalStatus = status;
        if (status && status !== 'all') {
            finalStatus = status;
        } else if (!status) {
            finalStatus = 'active';
        } else if (status === 'all') {
            finalStatus = undefined;
        }

        const result = await categoryRepository.listCategories({
            page: parseInt(page),
            limit: parseInt(limit),
            status: finalStatus,
            parent_cat_id,
            searchString: search,
            sortBy,
            sortOrder
        });

        return {
            categories: result.rows,
            pagination: {
                total: result.count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(result.count / limit),
                hasNextPage: parseInt(page) < Math.ceil(result.count / limit),
                hasPrevPage: parseInt(page) > 1,
                limit: parseInt(limit)
            }
        };
    }

    async getCategoryById(id) {
        const category = await categoryRepository.findById(id, { includeChildren: true, includeProducts: true });
        if (!category) {
            const error = new Error('Category not found');
            error.statusCode = 404;
            throw error;
        }
        return category;
    }

    async getCategoryBySlug(slug) {
        const category = await categoryRepository.findBySlugDetailed(slug);
        if (!category) {
            const error = new Error('Category not found');
            error.statusCode = 404;
            throw error;
        }
        return category;
    }

    async updateCategory(id, data, file) {
        const { category_name, description, parent_cat_id, status } = data;
        let { url_slug } = data;

        const parentId = (parent_cat_id === '' || parent_cat_id === 'null' || parent_cat_id === 'undefined') ? null : parent_cat_id;

        const category = await categoryRepository.findById(id);
        if (!category) {
            const error = new Error('Category not found');
            error.statusCode = 404;
            throw error;
        }

        // Handle slug automation
        if (!url_slug && category_name && category_name !== category.category_name) {
            url_slug = category_name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        }

        if (url_slug && url_slug !== category.url_slug) {
            const existingCategory = await categoryRepository.findBySlug(url_slug, id);
            if (existingCategory) {
                const error = new Error('URL slug already exists');
                error.statusCode = 409;
                throw error;
            }
        }

        if (parentId) {
            const parentCategory = await categoryRepository.findById(parentId);
            if (!parentCategory) {
                const error = new Error('Parent category not found');
                error.statusCode = 404;
                throw error;
            }
        }

        let newImageUrl = category.image_url;
        if (file) {
            try {
                if (category.image_url && category.image_url.includes('cloudinary.com')) {
                    const oldPublicId = extractPublicIdFromUrl(category.image_url);
                    if (oldPublicId) {
                        await deleteFromCloudinary(oldPublicId);
                    }
                }

                const uploadResult = await uploadToCloudinary(file.buffer, 'categories');
                newImageUrl = uploadResult.url;
            } catch (uploadError) {
                const error = new Error(`Failed to upload image: ${uploadError.message}`);
                error.statusCode = 500;
                throw error;
            }
        }

        category.category_name = category_name || category.category_name;
        category.url_slug = url_slug || category.url_slug;
        category.description = description !== undefined ? description : category.description;
        category.parent_cat_id = parent_cat_id !== undefined ? parentId : category.parent_cat_id;
        category.status = status || category.status;
        category.image_url = newImageUrl;
        category.updatedAt = new Date();

        const updatedCategory = await category.save();

        if (data.product_ids) {
            let productIdsArray = [];
            try {
                productIdsArray = JSON.parse(data.product_ids);
            } catch (e) {
                productIdsArray = data.product_ids.split(',').filter(Boolean);
            }
            if (productIdsArray.length > 0) {
                await Product.update(
                    { category_id: updatedCategory.id },
                    { where: { id: productIdsArray } }
                );
            }
        }

        return updatedCategory;
    }

    async deleteCategory(id) {
        const category = await categoryRepository.findById(id);
        if (!category) {
            const error = new Error('Category not found');
            error.statusCode = 404;
            throw error;
        }

        const productCount = await categoryRepository.countProducts(id);
        if (productCount > 0) {
            const error = new Error('Cannot delete category with active products');
            error.statusCode = 400;
            throw error;
        }

        const childrenCount = await categoryRepository.countChildren(id);
        if (childrenCount > 0) {
            const error = new Error('Cannot delete category with active subcategories');
            error.statusCode = 400;
            throw error;
        }

        if (category.image_url && category.image_url.includes('cloudinary.com')) {
            try {
                const publicId = extractPublicIdFromUrl(category.image_url);
                if (publicId) {
                    await deleteFromCloudinary(publicId);
                }
            } catch (deleteError) {
                console.error('Failed to delete image from Cloudinary:', deleteError);
            }
        }

        await category.destroy();

        return true;
    }

    async getCategoryTree() {
        const categories = await categoryRepository.getFullTree();

        const buildTree = (items, parentId = null) => {
            return items
                .filter(item => item.parent_cat_id === parentId)
                .map(item => ({
                    ...item.toJSON(),
                    children: buildTree(items, item.id)
                }));
        };

        return buildTree(categories);
    }
}

export default new CategoryService();
