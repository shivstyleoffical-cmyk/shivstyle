import sequelize from './src/database/connection.js';
import Category from './src/modules/category/category.model.js';
import Product from './src/modules/product/product.model.js';
import ProductVariant from './src/modules/product/product-variant.model.js';
import './src/database/associations.js';

const createSlug = (name) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
};

const seedNewCategories = async () => {
    try {
        console.log('🔄 Starting Kids and Women categories seeding...');

        console.log('📂 Seeding 2 categories...');
        const categories = [
            {
                category_name: 'Kids',
                description: 'Stylish and playful clothing for kids',
                image_url: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=400',
                status: 'active'
            },
            {
                category_name: 'Women',
                description: 'Elegant and modern womenswear',
                image_url: 'https://images.unsplash.com/photo-1515347619252-7d2d27038e9c?w=400',
                status: 'active'
            }
        ];

        const createdCategories = {};
        for (const cat of categories) {
            // Check if exists first
            let category = await Category.findOne({ where: { url_slug: createSlug(cat.category_name) } });
            if (!category) {
                category = await Category.create({
                    ...cat,
                    url_slug: createSlug(cat.category_name),
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                console.log(`  ✓ Created: ${cat.category_name}`);
            } else {
                console.log(`  ✓ Already exists: ${cat.category_name}`);
            }
            createdCategories[cat.category_name] = category;
        }

        console.log('📦 Seeding products...');
        const products = [
            // Kids Products
            {
                product_name: 'Kids Graphic Tee',
                category: 'Kids',
                description: 'Comfortable and playful graphic tee for kids.',
                price: 14.99,
                stock_quantity: 120,
                brand: 'LittleStyle',
                tags: 'kids, t-shirt, graphic',
                is_featured: true,
                image_url: 'https://images.unsplash.com/photo-1519238396035-7c5e533c3757?w=500'
            },
            {
                product_name: 'Kids Denim Overalls',
                category: 'Kids',
                description: 'Classic denim overalls for everyday play.',
                price: 29.99,
                stock_quantity: 50,
                brand: 'LittleStyle',
                tags: 'kids, denim, overalls',
                image_url: 'https://images.unsplash.com/photo-1519238128362-e78fb2e718b9?w=500'
            },
            {
                product_name: 'Boys Chino Shorts',
                category: 'Kids',
                description: 'Smart casual chino shorts for boys.',
                price: 19.99,
                stock_quantity: 80,
                brand: 'LittleStyle',
                tags: 'kids, shorts, boys',
                image_url: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=500'
            },
            {
                product_name: 'Girls Floral Dress',
                category: 'Kids',
                description: 'Beautiful floral dress for girls.',
                price: 24.99,
                stock_quantity: 60,
                brand: 'LittleStyle',
                tags: 'kids, dress, girls, floral',
                image_url: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=500'
            },
            // Women Products
            {
                product_name: 'Womens Summer Dress',
                category: 'Women',
                description: 'Light and breezy summer dress.',
                price: 39.99,
                stock_quantity: 100,
                brand: 'ChicWear',
                tags: 'women, dress, summer',
                is_featured: true,
                image_url: 'https://images.unsplash.com/photo-1515347619252-7d2d27038e9c?w=500'
            },
            {
                product_name: 'Womens Leather Jacket',
                category: 'Women',
                description: 'Classic faux leather biker jacket.',
                price: 89.99,
                original_price: 110.00,
                discount_percentage: 18,
                stock_quantity: 40,
                brand: 'EdgeStyle',
                tags: 'women, jacket, leather',
                image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'
            },
            {
                product_name: 'Womens Classic Blouse',
                category: 'Women',
                description: 'Elegant white blouse for work or casual.',
                price: 34.99,
                stock_quantity: 75,
                brand: 'ChicWear',
                tags: 'women, blouse, white',
                image_url: 'https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=500'
            },
            {
                product_name: 'Womens High-Waist Jeans',
                category: 'Women',
                description: 'Flattering high-waist denim jeans.',
                price: 49.99,
                stock_quantity: 85,
                brand: 'DenimCo',
                tags: 'women, jeans, denim',
                image_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500'
            }
        ];

        for (const prod of products) {
            const category = createdCategories[prod.category];
            const slug = createSlug(prod.product_name);
            
            let existingProduct = await Product.findOne({ where: { url_slug: slug } });
            if (!existingProduct) {
                const product = await Product.create({
                    product_name: prod.product_name,
                    url_slug: slug,
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
                    is_new_arrival: prod.is_new_arrival || true,
                    image_url: prod.image_url,
                    average_rating: prod.average_rating || 0,
                    total_reviews: prod.total_reviews || 0,
                    status: 'active',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                console.log(`  ✓ Created product: ${prod.product_name}`);

                // Seed default variants (sizes S, M, L, XL, XXL)
                const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
                for (const size of sizes) {
                    await ProductVariant.create({
                        product_id: product.id,
                        variant_name: `Size - ${size}`,
                        variant_value: size,
                        size: size,
                        color: null,
                        price: product.price,
                        price_adjustment: 0,
                        stock_quantity: 50,
                        sku: `${slug.substring(0, 10).toUpperCase()}-${size}`,
                        status: 'active',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
                console.log(`    ✓ Created default variants for product: ${prod.product_name}`);
            } else {
                console.log(`  ✓ Product already exists: ${prod.product_name}`);
            }
        }

        console.log('\n✅ Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding:', error);
        process.exit(1);
    }
};

seedNewCategories();
