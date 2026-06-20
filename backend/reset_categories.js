import sequelize from './src/database/connection.js';
import Category from './src/modules/category/category.model.js';
import Product from './src/modules/product/product.model.js';
import './src/database/associations.js';

const createSlug = (name) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
};

const resetCategories = async () => {
    try {
        console.log('🔄 Starting categories & products reset...');

        console.log('🗑️  Clearing existing categories and products...');
        await sequelize.query(`TRUNCATE TABLE "products" RESTART IDENTITY CASCADE`);
        await sequelize.query(`TRUNCATE TABLE "categories" RESTART IDENTITY CASCADE`);

        console.log('📂 Seeding 2 categories...');
        const categories = [
            {
                category_name: 'T-Shirts',
                description: 'Comfortable and stylish T-Shirts for all occasions',
                image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
                status: 'active'
            },
            {
                category_name: 'Jeans',
                description: 'Classic and modern denim jeans',
                image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
                status: 'active'
            }
        ];

        const createdCategories = {};
        for (const cat of categories) {
            const category = await Category.create({
                ...cat,
                url_slug: createSlug(cat.category_name),
                createdAt: new Date(),
                updatedAt: new Date()
            });
            createdCategories[cat.category_name] = category;
            console.log(`  ✓ Created: ${cat.category_name}`);
        }

        console.log('📦 Seeding products...');
        const products = [
            {
                product_name: 'Classic White T-Shirt',
                category: 'T-Shirts',
                description: 'Essential 100% cotton crew neck white t-shirt.',
                price: 19.99,
                stock_quantity: 100,
                brand: 'UrbanWear',
                tags: 't-shirt, white, casual, basic',
                is_featured: true,
                is_trending: true,
                is_new_arrival: false,
                image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
                average_rating: 4.8,
                total_reviews: 120
            },
            {
                product_name: 'Graphic Print T-Shirt',
                category: 'T-Shirts',
                description: 'Soft cotton blend t-shirt with modern graphic print.',
                price: 24.99,
                stock_quantity: 50,
                brand: 'StreetStyle',
                tags: 't-shirt, graphic, casual',
                is_featured: false,
                is_trending: true,
                is_new_arrival: true,
                image_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500',
                average_rating: 4.5,
                total_reviews: 85
            },
            {
                product_name: 'Classic Blue Denim Jeans',
                category: 'Jeans',
                description: 'Timeless straight-fit blue denim jeans.',
                price: 49.99,
                stock_quantity: 80,
                brand: 'DenimCo',
                tags: 'jeans, denim, blue, classic',
                is_featured: true,
                is_trending: true,
                is_new_arrival: false,
                image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
                average_rating: 4.7,
                total_reviews: 210
            },
            {
                product_name: 'Black Slim Fit Jeans',
                category: 'Jeans',
                description: 'Modern slim fit black jeans with stretch comfort.',
                price: 54.99,
                original_price: 69.99,
                discount_percentage: 21,
                stock_quantity: 60,
                brand: 'UrbanWear',
                tags: 'jeans, black, slim-fit',
                is_featured: false,
                is_trending: false,
                is_new_arrival: true,
                image_url: 'https://images.unsplash.com/photo-1584865288642-42078afe6942?w=500',
                average_rating: 4.6,
                total_reviews: 145
            },
            {
                product_name: 'Distressed Ripped Jeans',
                category: 'Jeans',
                description: 'Trendy distressed light blue jeans.',
                price: 59.99,
                stock_quantity: 40,
                brand: 'StreetStyle',
                tags: 'jeans, ripped, distressed, light-blue',
                is_featured: true,
                is_trending: true,
                is_new_arrival: false,
                image_url: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=500',
                average_rating: 4.4,
                total_reviews: 95
            }
        ];

        for (const prod of products) {
            const category = createdCategories[prod.category];
            await Product.create({
                product_name: prod.product_name,
                url_slug: createSlug(prod.product_name),
                category_id: category.id,
                description: prod.description,
                price: prod.price,
                original_price: prod.original_price || null,
                discount_percentage: prod.discount_percentage || 0,
                stock_quantity: prod.stock_quantity,
                brand: prod.brand,
                tags: prod.tags,
                is_featured: prod.is_featured || false,
                is_trending: prod.is_trending || false,
                is_new_arrival: prod.is_new_arrival || false,
                image_url: prod.image_url,
                average_rating: prod.average_rating || 0,
                total_reviews: prod.total_reviews || 0,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`  ✓ Created product: ${prod.product_name}`);
        }

        console.log('\n✅ Categories and Products reset completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting categories:', error);
        process.exit(1);
    }
};

resetCategories();
