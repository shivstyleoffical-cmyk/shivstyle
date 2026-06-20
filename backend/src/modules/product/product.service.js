import productRepository from './product.repository.js';
import Category from '../category/category.model.js';
import ProductVariant from './product-variant.model.js';
import ProductImage from './product-image.model.js';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } from '../../integrations/storage/cloudinary.utils.js';
import { v4 as uuidv4 } from 'uuid';
import sequelize, { Op } from '../../database/connection.js';

class ProductService {
    /**
     * Enhanced getAllProducts with comprehensive filtering, sorting, and pagination
     */
    async getAllProducts(queryParams) {
        const {
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'DESC',
            category_id,
            subcategory_id,
            status = 'active',
            search,
            minPrice,
            maxPrice,
            inStock,
            brand,
            tags,
            is_featured,
            is_trending,
            is_new_arrival,
            sizes,
            colors,
            fabric,
            sleeves,
            minRating
        } = queryParams;

        const offset = (page - 1) * limit;
        let whereClause = {};

        // If status is provided and not 'all', filter by it. 
        // Default to 'active' only if no specific status is requested.
        if (status && status !== 'all') {
            whereClause.status = status;
        } else if (!status) {
            whereClause.status = 'active';
        }

        // Category filtering
        if (subcategory_id) {
            whereClause.category_id = subcategory_id;
        } else if (category_id) {
            // Get all subcategories under this parent
            const subcategories = await Category.findAll({
                where: { parent_cat_id: category_id, status: 'active' },
                attributes: ['id']
            });
            const categoryIds = [category_id, ...subcategories.map(sc => sc.id)];
            whereClause.category_id = { [Op.in]: categoryIds };
        }

        // Search functionality (case-insensitive, partial match)
        if (search) {
            whereClause[Op.or] = [
                { product_name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
                { tags: { [Op.iLike]: `%${search}%` } },
                { brand: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Price range filtering
        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
        }

        // Stock filtering
        if (inStock === 'true') {
            whereClause.stock_quantity = { [Op.gt]: 0 };
        }

        // Brand filtering
        if (brand) {
            whereClause.brand = brand;
        }

        // Tags filtering
        if (tags) {
            whereClause.tags = { [Op.iLike]: `%${tags}%` };
        }

        // Featured/Trending/New Arrival filters
        if (is_featured === 'true') whereClause.is_featured = true;
        if (is_trending === 'true') whereClause.is_trending = true;
        if (is_new_arrival === 'true') whereClause.is_new_arrival = true;

        // Rating filter
        if (minRating) {
            whereClause.average_rating = { [Op.gte]: parseFloat(minRating) };
        }

        // Build include array
        const includeArray = [
            {
                model: Category,
                as: 'category',
                // If fetching for public (active products), category must also be active
                where: (!status || status === 'active') ? { status: 'active' } : {},
                required: (!status || status === 'active')
            },
            {
                model: ProductImage,
                as: 'images',
                where: { status: 'active' },
                required: false,
                order: [['image_order', 'ASC']]
            },
            {
                model: ProductVariant,
                as: 'variants',
                attributes: ['id', 'variant_name', 'variant_value', 'price_adjustment', 'stock_quantity', 'status'],
                required: false
            }
        ];

        // Size/Color/Fabric/Sleeves filtering
        if (sizes) {
            const sizeArray = sizes.split(',');
            whereClause[Op.and] = whereClause[Op.and] || [];
            whereClause[Op.and].push({
                [Op.or]: [
                    ...sizeArray.map(s => ({
                        [Op.or]: [
                            { tags: { [Op.iLike]: `%${s}%` } },
                            { description: { [Op.iLike]: `%${s}%` } }
                        ]
                    })),
                    {
                        id: {
                            [Op.in]: sequelize.literal(`(
                                SELECT DISTINCT "product_id" 
                                FROM "product_variants" 
                                WHERE "variant_name" = 'Size' 
                                  AND "variant_value" IN (${sizeArray.map(s => `'${s}'`).join(',')})
                            )`)
                        }
                    }
                ]
            });
        }

        if (colors) {
            const colorArray = colors.split(',');
            whereClause[Op.and] = whereClause[Op.and] || [];
            whereClause[Op.and].push({
                [Op.or]: [
                    ...colorArray.map(c => ({
                        [Op.or]: [
                            { product_name: { [Op.iLike]: `%${c}%` } },
                            { tags: { [Op.iLike]: `%${c}%` } },
                            { description: { [Op.iLike]: `%${c}%` } }
                        ]
                    })),
                    {
                        id: {
                            [Op.in]: sequelize.literal(`(
                                SELECT DISTINCT "product_id" 
                                FROM "product_variants" 
                                WHERE "variant_name" = 'Color' 
                                  AND "variant_value" IN (${colorArray.map(c => `'${c}'`).join(',')})
                            )`)
                        }
                    }
                ]
            });
        }

        if (fabric) {
            const fabricArray = fabric.split(',');
            whereClause[Op.and] = whereClause[Op.and] || [];
            whereClause[Op.and].push({
                [Op.or]: fabricArray.map(f => ({
                    [Op.or]: [
                        { product_name: { [Op.iLike]: `%${f}%` } },
                        { description: { [Op.iLike]: `%${f}%` } },
                        { tags: { [Op.iLike]: `%${f}%` } }
                    ]
                }))
            });
        }

        if (sleeves) {
            const sleevesArray = sleeves.split(',');
            whereClause[Op.and] = whereClause[Op.and] || [];
            whereClause[Op.and].push({
                [Op.or]: sleevesArray.map(sl => {
                    const s = sl.toLowerCase();
                    if (s.includes('short')) {
                        return {
                            [Op.or]: [
                                { tags: { [Op.iLike]: '%short sleeve%' } },
                                { tags: { [Op.iLike]: '%tee%' } },
                                { tags: { [Op.iLike]: '%t-shirt%' } },
                                { tags: { [Op.iLike]: '%half sleeve%' } },
                                { description: { [Op.iLike]: '%short sleeve%' } },
                                { description: { [Op.iLike]: '%half sleeve%' } }
                            ]
                        };
                    }
                    if (s.includes('long')) {
                        return {
                            [Op.or]: [
                                { tags: { [Op.iLike]: '%long sleeve%' } },
                                { tags: { [Op.iLike]: '%full sleeve%' } },
                                { tags: { [Op.iLike]: '%jacket%' } },
                                { tags: { [Op.iLike]: '%blouse%' } },
                                { description: { [Op.iLike]: '%long sleeve%' } },
                                { description: { [Op.iLike]: '%full sleeve%' } }
                            ]
                        };
                    }
                    if (s.includes('sleeveless')) {
                        return {
                            [Op.or]: [
                                { tags: { [Op.iLike]: '%sleeveless%' } },
                                { tags: { [Op.iLike]: '%tank%' } },
                                { description: { [Op.iLike]: '%sleeveless%' } }
                            ]
                        };
                    }
                    return { tags: { [Op.iLike]: `%${s}%` } };
                })
            });
        }

        let orderClause;
        if (sortBy === 'relevance') {
            if (search) {
                orderClause = [
                    [sequelize.literal(`CASE WHEN product_name ILIKE '${search}%' THEN 1 WHEN product_name ILIKE '%${search}%' THEN 2 ELSE 3 END`), 'ASC'],
                    ['average_rating', 'DESC']
                ];
            } else {
                orderClause = [['createdAt', 'DESC']];
            }
        } else {
            orderClause = [[sortBy, sortOrder.toUpperCase()]];
        }

        const result = await productRepository.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: orderClause,
            include: includeArray,
            distinct: true
        });

        const products = result.rows.map(product => {
            const productJson = product.toJSON();
            if (productJson.variants) {
                productJson.variants = productJson.variants.map(v => ({
                    ...v,
                    price: parseFloat(productJson.price) + parseFloat(v.price_adjustment || 0),
                    size: v.variant_name === 'Size' || v.variant_name === 'Size-Color' ? (v.variant_name === 'Size-Color' ? v.variant_value.split('-')[0] : v.variant_value) : null,
                    color: v.variant_name === 'Color' || v.variant_name === 'Size-Color' ? (v.variant_name === 'Size-Color' ? v.variant_value.split('-')[1] : v.variant_value) : null
                }));
            }
            return productJson;
        });

        return {
            products,
            pagination: {
                total: result.count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(result.count / limit),
                hasNextPage: parseInt(page) < Math.ceil(result.count / limit),
                hasPrevPage: parseInt(page) > 1,
                limit: parseInt(limit)
            },
            filters: {
                category_id,
                subcategory_id,
                search,
                minPrice,
                maxPrice,
                brand,
                tags,
                is_featured,
                is_trending,
                is_new_arrival
            }
        };
    }

    /**
     * Get Featured Products
     */
    async getFeaturedProducts(queryParams) {
        const { limit = 10, page = 1 } = queryParams;
        const offset = (page - 1) * limit;

        const result = await productRepository.findAndCountAll({
            where: {
                status: 'active',
                is_featured: true
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'category_name', 'url_slug'],
                    where: { status: 'active' },
                    required: true
                },
                { model: ProductImage, as: 'images', where: { status: 'active' }, required: false }
            ]
        });

        return {
            products: result.rows,
            total: result.count,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(result.count / limit),
                hasNextPage: parseInt(page) < Math.ceil(result.count / limit)
            }
        };
    }

    /**
     * Get Trending Products
     */
    async getTrendingProducts(queryParams) {
        const { limit = 10, page = 1, period = 'week' } = queryParams;
        const offset = (page - 1) * limit;

        const now = new Date();
        let dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (period === 'month') dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (period === 'year') dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

        const result = await productRepository.findAndCountAll({
            where: {
                status: 'active',
                is_trending: true,
                createdAt: { [Op.gte]: dateFilter }
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['average_rating', 'DESC'], ['createdAt', 'DESC']],
            include: [
                { model: Category, as: 'category', where: { status: 'active' }, required: true },
                { model: ProductImage, as: 'images', where: { status: 'active' }, required: false }
            ]
        });

        return {
            products: result.rows,
            total: result.count,
            period,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(result.count / limit)
            }
        };
    }

    /**
     * Get New Arrivals
     */
    async getNewArrivals(queryParams) {
        const { limit = 10, page = 1, days = 30 } = queryParams;
        const offset = (page - 1) * limit;
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(days));

        const result = await productRepository.findAndCountAll({
            where: {
                status: 'active',
                is_new_arrival: true,
                createdAt: { [Op.gte]: daysAgo }
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            include: [
                { model: Category, as: 'category', where: { status: 'active' }, required: true },
                { model: ProductImage, as: 'images', where: { status: 'active' }, required: false }
            ]
        });

        return {
            products: result.rows,
            total: result.count,
            days: parseInt(days),
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(result.count / limit)
            }
        };
    }

    /**
     * Get Best Sellers (based on ratings and reviews)
     */
    async getBestSellers(queryParams) {
        const { limit = 10, page = 1 } = queryParams;
        const offset = (page - 1) * limit;

        const result = await productRepository.findAndCountAll({
            where: {
                status: 'active',
                average_rating: { [Op.gte]: 4.0 },
                total_reviews: { [Op.gte]: 10 }
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['average_rating', 'DESC'], ['total_reviews', 'DESC']],
            include: [
                { model: Category, as: 'category', where: { status: 'active' }, required: true },
                { model: ProductImage, as: 'images', where: { status: 'active' }, required: false }
            ]
        });

        return {
            products: result.rows,
            total: result.count,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(result.count / limit)
            }
        };
    }

    /**
     * Get Recommended Products
     */
    async getRecommendedProducts(queryParams) {
        const { product_id, category_id, limit = 6, exclude_current = true } = queryParams;

        let whereClause = { status: 'active' };
        let excludeIds = [];

        if (product_id) {
            const current = await productRepository.findByPk(product_id);
            if (current) {
                whereClause.category_id = current.category_id;
                if (exclude_current === 'true' || exclude_current === true) {
                    excludeIds.push(product_id);
                }
            }
        } else if (category_id) {
            whereClause.category_id = category_id;
        }

        if (excludeIds.length > 0) {
            whereClause.id = { [Op.notIn]: excludeIds };
        }

        const result = await productRepository.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            order: [[sequelize.literal('RANDOM()')]],
            include: [
                { model: Category, as: 'category', where: { status: 'active' }, required: true },
                { model: ProductImage, as: 'images', where: { status: 'active' }, required: false }
            ]
        });

        return {
            products: result.rows,
            total: result.count,
            type: product_id ? 'similar_product' : 'category_based'
        };
    }

    /**
     * Get Similar Products (based on category and price range)
     */
    async getSimilarProducts(productId, queryParams) {
        const { limit = 6 } = queryParams;

        const currentProduct = await productRepository.findByPk(productId);
        if (!currentProduct) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }

        const priceRange = currentProduct.price * 0.3; // 30% price range

        const result = await productRepository.findAndCountAll({
            where: {
                status: 'active',
                category_id: currentProduct.category_id,
                id: { [Op.ne]: productId },
                price: {
                    [Op.between]: [
                        currentProduct.price - priceRange,
                        currentProduct.price + priceRange
                    ]
                }
            },
            limit: parseInt(limit),
            order: [[sequelize.literal('RANDOM()')]],
            include: [
                { model: Category, as: 'category', where: { status: 'active' }, required: true },
                { model: ProductImage, as: 'images', where: { status: 'active' }, required: false }
            ]
        });

        return {
            products: result.rows,
            total: result.count
        };
    }

    /**
     * Advanced Search with autocomplete support
     */
    async searchProducts(queryParams) {
        const {
            q,
            page = 1,
            limit = 20,
            sortBy = 'relevance',
            sortOrder = 'DESC',
            category_id,
            minPrice,
            maxPrice,
            autocomplete = false
        } = queryParams;

        if (!q) {
            const error = new Error('Search query is required');
            error.statusCode = 400;
            throw error;
        }

        const offset = (page - 1) * limit;
        const searchTerm = q.trim();

        let whereClause = {
            status: 'active',
            [Op.or]: [
                { product_name: { [Op.iLike]: `%${searchTerm}%` } },
                { description: { [Op.iLike]: `%${searchTerm}%` } },
                { tags: { [Op.iLike]: `%${searchTerm}%` } },
                { brand: { [Op.iLike]: `%${searchTerm}%` } }
            ]
        };

        if (category_id) whereClause.category_id = category_id;

        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
        }

        // For autocomplete, return limited results with just names
        if (autocomplete === 'true') {
            const results = await productRepository.findAll({
                where: whereClause,
                attributes: ['id', 'product_name', 'url_slug', 'image_url', 'price'],
                include: [
                    { model: Category, as: 'category', where: { status: 'active' }, required: true }
                ],
                limit: 10,
                order: [['product_name', 'ASC']]
            });
            return { suggestions: results };
        }

        // Determine sort order
        let orderClause;
        if (sortBy === 'relevance') {
            // Prioritize exact matches in product name
            orderClause = [
                [sequelize.literal(`CASE WHEN product_name ILIKE '${searchTerm}%' THEN 1 WHEN product_name ILIKE '%${searchTerm}%' THEN 2 ELSE 3 END`), 'ASC'],
                ['average_rating', 'DESC']
            ];
        } else {
            orderClause = [[sortBy, sortOrder.toUpperCase()]];
        }

        const result = await productRepository.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: orderClause,
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'category_name', 'url_slug'],
                    where: { status: 'active' },
                    required: true
                },
                { model: ProductImage, as: 'images', where: { status: 'active' }, required: false },
                { model: ProductVariant, as: 'variants', required: false }
            ],
            distinct: true
        });

        return {
            products: result.rows,
            searchTerm,
            pagination: {
                total: result.count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(result.count / limit),
                hasNextPage: parseInt(page) < Math.ceil(result.count / limit),
                hasPrevPage: parseInt(page) > 1
            }
        };
    }

    /**
     * Get Product by ID with full details
     */
    async getProductById(id) {
        const product = await productRepository.getDetailedProduct({ id, status: 'active' });

        // Final check: product is found but its category might be inactive
        if (!product || (product.category && product.category.status === 'inactive')) {
            const error = new Error('Product not found or unavailable');
            error.statusCode = 404;
            throw error;
        }

        const productJson = product.toJSON();
        if (productJson.variants) {
            productJson.variants = productJson.variants.map(v => ({
                ...v,
                price: parseFloat(productJson.price) + parseFloat(v.price_adjustment || 0),
                size: v.variant_name === 'Size' || v.variant_name === 'Size-Color' ? (v.variant_name === 'Size-Color' ? v.variant_value.split('-')[0] : v.variant_value) : null,
                color: v.variant_name === 'Color' || v.variant_name === 'Size-Color' ? (v.variant_name === 'Size-Color' ? v.variant_value.split('-')[1] : v.variant_value) : null
            }));
        }
        return productJson;
    }

    /**
     * Get Product by Slug with full details
     */
    async getProductBySlug(slug) {
        const product = await productRepository.getDetailedProduct({ url_slug: slug, status: 'active' });

        // Final check: product is found but its category might be inactive
        if (!product || (product.category && product.category.status === 'inactive')) {
            const error = new Error('Product not found or unavailable');
            error.statusCode = 404;
            throw error;
        }

        const productJson = product.toJSON();
        if (productJson.variants) {
            productJson.variants = productJson.variants.map(v => ({
                ...v,
                price: parseFloat(productJson.price) + parseFloat(v.price_adjustment || 0),
                size: v.variant_name === 'Size' || v.variant_name === 'Size-Color' ? (v.variant_name === 'Size-Color' ? v.variant_value.split('-')[0] : v.variant_value) : null,
                color: v.variant_name === 'Color' || v.variant_name === 'Size-Color' ? (v.variant_name === 'Size-Color' ? v.variant_value.split('-')[1] : v.variant_value) : null
            }));
        }
        return productJson;
    }

    /**
     * Get Products by Category
     */
    async getProductsByCategory(categoryId, queryParams) {
        return this.getAllProducts({ ...queryParams, category_id: categoryId });
    }

    /**
     * Get available filter options for products
     */
    async getFilterOptions(queryParams) {
        const { category_id } = queryParams;
        let whereClause = { status: 'active' };

        if (category_id) {
            whereClause.category_id = category_id;
        }

        // Get unique brands
        const brands = await productRepository.findAll({
            where: whereClause,
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('brand')), 'brand']],
            raw: true
        });

        // Get price range
        const priceRange = await productRepository.findOne({
            where: whereClause,
            attributes: [
                [sequelize.fn('MIN', sequelize.col('price')), 'minPrice'],
                [sequelize.fn('MAX', sequelize.col('price')), 'maxPrice']
            ],
            raw: true
        });

        // Get available sizes and colors from variants
        const sizes = await ProductVariant.findAll({
            where: { variant_name: 'Size', status: 'active' },
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('variant_value')), 'size']],
            raw: true
        });

        const colors = await ProductVariant.findAll({
            where: { variant_name: 'Color', status: 'active' },
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('variant_value')), 'color']],
            raw: true
        });

        return {
            brands: brands.map(b => b.brand).filter(Boolean),
            priceRange: {
                min: parseFloat(priceRange?.minPrice || 0),
                max: parseFloat(priceRange?.maxPrice || 1000)
            },
            sizes: sizes.map(s => s.size).filter(Boolean),
            colors: colors.map(c => c.color).filter(Boolean)
        };
    }

    // ... Keep existing create, update, delete methods from original service
    async createProduct(data, files) {
        // Keep original implementation
        const {
            product_name, category_id, description,
            price, stock_quantity, status = 'active', variants,
            brand, tags, is_featured, is_trending, is_new_arrival,
            discount_percentage, original_price
        } = data;

        let { url_slug } = data;

        // Auto-generate slug if not provided
        if (!url_slug || url_slug.trim() === '') {
            url_slug = product_name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + uuidv4().substring(0, 6);
        }

        const existingProduct = await productRepository.findOne({ where: { url_slug } });
        if (existingProduct) {
            const error = new Error('URL slug already exists');
            error.statusCode = 409;
            throw error;
        }

        const category = await Category.findByPk(category_id);
        if (!category) {
            const error = new Error('Category not found');
            error.statusCode = 404;
            throw error;
        }

        let primaryImageUrl = null;
        const uploadedImages = [];

        if (files && files.length > 0) {
            if (files.length < 2) {
                const error = new Error('Minimum 2 images are required for a product');
                error.statusCode = 400;
                throw error;
            }
            if (files.length > 6) {
                const error = new Error('Maximum 6 images are allowed for a product');
                error.statusCode = 400;
                throw error;
            }

            try {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const uploadResult = await uploadToCloudinary(file.buffer, 'products');
                    uploadedImages.push({
                        image_url: uploadResult.url,
                        image_order: i,
                        is_primary: i === 0
                    });
                    if (i === 0) primaryImageUrl = uploadResult.url;
                }
            } catch (uploadError) {
                const error = new Error(`Failed to upload image: ${uploadError.message}`);
                error.statusCode = 500;
                throw error;
            }
        } else {
            const error = new Error('At least 2 images are required for a product');
            error.statusCode = 400;
            throw error;
        }

        const newProduct = await productRepository.create({
            product_name,
            url_slug,
            category_id,
            description,
            price: parseFloat(price),
            stock_quantity: stock_quantity ? parseInt(stock_quantity) : 0,
            status: status || 'active',
            image_url: primaryImageUrl,
            brand,
            tags,
            is_featured: is_featured === 'true' || is_featured === true,
            is_trending: is_trending === 'true' || is_trending === true,
            is_new_arrival: is_new_arrival === 'true' || is_new_arrival === true,
            discount_percentage: discount_percentage ? parseFloat(discount_percentage) : 0,
            original_price: original_price ? parseFloat(original_price) : null,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        for (const imageData of uploadedImages) {
            await productRepository.addImage({
                product_id: newProduct.id,
                ...imageData,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        if (variants) {
            let parsedVariants = variants;
            if (typeof variants === 'string') {
                try {
                    parsedVariants = JSON.parse(variants);
                } catch (e) {
                    console.error('Error parsing variants', e);
                }
            }

            if (Array.isArray(parsedVariants)) {
                for (const variant of parsedVariants) {
                    // Handle combinations of size and color
                    let name = 'Variant';
                    let value = '';

                    if (variant.size && variant.color) {
                        name = 'Size-Color';
                        value = `${variant.size}-${variant.color}`;
                    } else if (variant.size) {
                        name = 'Size';
                        value = variant.size;
                    } else if (variant.color) {
                        name = 'Color';
                        value = variant.color;
                    }

                    const basePrice = parseFloat(price);
                    const variantPrice = variant.price ? parseFloat(variant.price) : basePrice;
                    const priceAdjustment = variant.price_adjustment !== undefined ? parseFloat(variant.price_adjustment) : (variantPrice - basePrice);

                    await productRepository.addVariant({
                        product_id: newProduct.id,
                        variant_name: name,
                        variant_value: value,
                        price_adjustment: priceAdjustment,
                        stock_quantity: parseInt(variant.stock_quantity || 0),
                        status: variant.is_active === false ? 'inactive' : 'active',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
            }
        }

        return newProduct;
    }

    async updateProduct(id, data, files) {
        // Keep original implementation with new fields
        const product = await productRepository.findByPk(id);
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }

        const {
            product_name, url_slug, category_id, description,
            price, stock_quantity, status, variants,
            brand, tags, is_featured, is_trending, is_new_arrival,
            discount_percentage, original_price, existing_images
        } = data;

        // --- Handle Images ---
        let finalImageUrl = product.image_url;
        let parsedExistingImages = [];
        if (existing_images) {
            try {
                parsedExistingImages = typeof existing_images === 'string' ? JSON.parse(existing_images) : existing_images;
            } catch (e) {
                console.error('Error parsing existing images', e);
            }
        }

        // Get current images from DB to identify which to delete
        const currentImages = await ProductImage.findAll({ where: { product_id: id } });

        // Identify images to remove from Cloudinary and DB
        const keptImageIds = parsedExistingImages.map(img => img.id);
        const imagesToDelete = currentImages.filter(img => !keptImageIds.includes(img.id));

        for (const img of imagesToDelete) {
            try {
                if (img.image_url && img.image_url.includes('cloudinary.com')) {
                    const publicId = extractPublicIdFromUrl(img.image_url);
                    if (publicId) await deleteFromCloudinary(publicId);
                }
                await img.destroy();
            } catch (err) {
                console.error(`Failed to delete image ${img.id}:`, err);
            }
        }

        // Upload new images
        const newUploadedImages = [];
        if (files && files.length > 0) {
            try {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const uploadResult = await uploadToCloudinary(file.buffer, 'products');
                    const newImg = await productRepository.addImage({
                        product_id: id,
                        image_url: uploadResult.url,
                        image_order: parsedExistingImages.length + i,
                        is_primary: parsedExistingImages.length === 0 && i === 0,
                        status: 'active',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                    newUploadedImages.push(newImg);
                }
            } catch (err) {
                const error = new Error(`Failed to upload images: ${err.message}`);
                error.statusCode = 500;
                throw error;
            }
        }

        // Determine the primary image URL for the product record
        if (newUploadedImages.length > 0 && parsedExistingImages.length === 0) {
            finalImageUrl = newUploadedImages[0].image_url;
        } else if (parsedExistingImages.length > 0) {
            finalImageUrl = parsedExistingImages[0].image_url;
        } else if (newUploadedImages.length === 0 && parsedExistingImages.length === 0) {
            finalImageUrl = null;
        }

        // --- Update Product Record ---
        if (url_slug && url_slug !== product.url_slug) {
            const existing = await productRepository.findOne({
                where: { url_slug, id: { [Op.ne]: id } }
            });
            if (existing) {
                const error = new Error('URL slug already exists');
                error.statusCode = 409;
                throw error;
            }
        }

        if (category_id) {
            const category = await Category.findByPk(category_id);
            if (!category) {
                const error = new Error('Category not found');
                error.statusCode = 404;
                throw error;
            }
        }

        await productRepository.update(product, {
            product_name,
            url_slug: url_slug || product.url_slug, // Preserve existing slug if not provided
            category_id,
            description,
            price: price ? parseFloat(price) : undefined,
            stock_quantity: stock_quantity ? parseInt(stock_quantity) : undefined,
            status,
            image_url: finalImageUrl,
            brand,
            tags,
            is_featured: is_featured !== undefined ? (is_featured === 'true' || is_featured === true) : undefined,
            is_trending: is_trending !== undefined ? (is_trending === 'true' || is_trending === true) : undefined,
            is_new_arrival: is_new_arrival !== undefined ? (is_new_arrival === 'true' || is_new_arrival === true) : undefined,
            discount_percentage: discount_percentage ? parseFloat(discount_percentage) : undefined,
            original_price: original_price ? parseFloat(original_price) : undefined,
            updatedAt: new Date()
        });

        if (variants) {
            let parsedVariants = variants;
            if (typeof variants === 'string') {
                try {
                    parsedVariants = JSON.parse(variants);
                } catch (e) { }
            }

            if (Array.isArray(parsedVariants)) {
                await productRepository.removeVariants(id);
                for (const variant of parsedVariants) {
                    // Handle combinations of size and color
                    let name = 'Variant';
                    let value = '';

                    if (variant.size && variant.color) {
                        name = 'Size-Color';
                        value = `${variant.size}-${variant.color}`;
                    } else if (variant.size) {
                        name = 'Size';
                        value = variant.size;
                    } else if (variant.color) {
                        name = 'Color';
                        value = variant.color;
                    }

                    const basePrice = price ? parseFloat(price) : parseFloat(product.price);
                    const variantPrice = variant.price ? parseFloat(variant.price) : (basePrice + parseFloat(variant.price_adjustment || 0));
                    const priceAdjustment = variantPrice - basePrice;

                    await productRepository.addVariant({
                        product_id: id,
                        variant_name: name,
                        variant_value: value,
                        price_adjustment: priceAdjustment,
                        stock_quantity: parseInt(variant.stock_quantity || 0),
                        status: variant.is_active === false ? 'inactive' : 'active',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
            }
        }

        return product;
    }

    async deleteProduct(id) {
        // Keep original implementation
        const product = await productRepository.findByPk(id);
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }

        if (product.image_url && product.image_url.includes('cloudinary.com')) {
            try {
                const publicId = extractPublicIdFromUrl(product.image_url);
                if (publicId) await deleteFromCloudinary(publicId);
            } catch (e) {
                console.error('Failed to delete image', e);
            }
        }

        await productRepository.delete(id);
        await productRepository.removeVariantsWhere({ product_id: id });
        return true;
    }
}

export default new ProductService();
