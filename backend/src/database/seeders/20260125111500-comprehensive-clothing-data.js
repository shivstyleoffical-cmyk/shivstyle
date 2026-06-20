import sequelize from './src/database/connection.js';
import Category from './src/modules/category/category.model.js';
import Product from './src/modules/product/product.model.js';
import ProductImage from './src/modules/product/product-image.model.js';
import ProductVariant from './src/modules/product/product-variant.model.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Comprehensive Clothing E-commerce Seed Script
 * - 200+ Categories (Main + Subcategories)
 * - 500+ Products
 * - Multiple images per product (2-6 images)
 * - Product variants (sizes, colors)
 */

const seedComprehensiveData = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await ProductVariant.destroy({ where: {} });
        await ProductImage.destroy({ where: {} });
        await Product.destroy({ where: {} });
        await Category.destroy({ where: {} });
        console.log('✅ Existing data cleared.');

        // ==================== CATEGORIES ====================
        console.log('📦 Creating categories...');

        const categoryData = [
            // MEN'S CLOTHING
            {
                name: 'Men',
                slug: 'men',
                image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=400&q=80',
                subcategories: [
                    'T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Shorts', 'Joggers',
                    'Blazers', 'Suits', 'Jackets', 'Sweaters', 'Hoodies', 'Sweatshirts',
                    'Ethnic Wear', 'Kurtas', 'Sherwanis', 'Nehru Jackets',
                    'Activewear', 'Track Pants', 'Sports Jerseys', 'Gym Wear',
                    'Innerwear', 'Boxers', 'Vests', 'Thermals',
                    'Sleepwear', 'Night Suits', 'Robes',
                    'Swimwear', 'Board Shorts',
                    'Winter Wear', 'Coats', 'Parkas', 'Bomber Jackets', 'Leather Jackets',
                    'Formal Wear', 'Tuxedos', 'Waistcoats',
                    'Casual Wear', 'Polo Shirts', 'Henley Shirts', 'Tank Tops'
                ]
            },

            // WOMEN'S CLOTHING
            {
                name: 'Women',
                slug: 'women',
                image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80',
                subcategories: [
                    'Dresses', 'Tops', 'T-Shirts', 'Shirts', 'Blouses', 'Tunics',
                    'Jeans', 'Trousers', 'Leggings', 'Jeggings', 'Palazzo', 'Culottes',
                    'Skirts', 'Shorts', 'Capris',
                    'Ethnic Wear', 'Sarees', 'Kurtas', 'Kurtis', 'Salwar Suits', 'Lehenga',
                    'Anarkali', 'Churidar', 'Dupattas',
                    'Western Wear', 'Jumpsuits', 'Rompers', 'Playsuits',
                    'Activewear', 'Yoga Pants', 'Sports Bras', 'Track Suits', 'Gym Wear',
                    'Innerwear', 'Bras', 'Panties', 'Camisoles', 'Shapewear',
                    'Sleepwear', 'Nightgowns', 'Night Suits', 'Robes', 'Pajamas',
                    'Swimwear', 'Bikinis', 'One-Piece Swimsuits', 'Cover-Ups',
                    'Winter Wear', 'Sweaters', 'Cardigans', 'Jackets', 'Coats', 'Shawls',
                    'Formal Wear', 'Blazers', 'Suits', 'Pencil Skirts',
                    'Party Wear', 'Gowns', 'Cocktail Dresses', 'Maxi Dresses'
                ]
            },

            // KIDS' CLOTHING
            {
                name: 'Kids',
                slug: 'kids',
                image: 'https://images.unsplash.com/photo-1519704943920-1844582f7c80?auto=format&fit=crop&w=400&q=80',
                subcategories: [
                    'Boys T-Shirts', 'Boys Shirts', 'Boys Jeans', 'Boys Shorts',
                    'Boys Ethnic Wear', 'Boys Kurtas', 'Boys Sherwanis',
                    'Boys Activewear', 'Boys Track Pants', 'Boys Jackets',
                    'Girls Dresses', 'Girls Tops', 'Girls Jeans', 'Girls Leggings',
                    'Girls Skirts', 'Girls Shorts', 'Girls Ethnic Wear',
                    'Girls Lehenga', 'Girls Salwar Suits', 'Girls Frocks',
                    'Infant Wear', 'Rompers', 'Onesies', 'Baby Sets',
                    'Kids Innerwear', 'Kids Sleepwear', 'Kids Winter Wear',
                    'Kids Party Wear', 'Kids Casual Wear', 'Kids Formal Wear'
                ]
            },

            // ACCESSORIES
            {
                name: 'Accessories',
                slug: 'accessories',
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
                subcategories: [
                    'Bags', 'Handbags', 'Backpacks', 'Sling Bags', 'Clutches',
                    'Tote Bags', 'Laptop Bags', 'Travel Bags', 'Duffel Bags',
                    'Belts', 'Wallets', 'Card Holders', 'Purses',
                    'Scarves', 'Stoles', 'Mufflers', 'Bandanas',
                    'Caps', 'Hats', 'Beanies', 'Sun Hats',
                    'Sunglasses', 'Eyewear', 'Reading Glasses',
                    'Jewelry', 'Necklaces', 'Earrings', 'Bracelets', 'Rings',
                    'Watches', 'Smart Watches', 'Analog Watches', 'Digital Watches',
                    'Socks', 'Stockings', 'Ties', 'Bow Ties', 'Cufflinks',
                    'Gloves', 'Umbrellas', 'Hair Accessories'
                ]
            },

            // FOOTWEAR
            {
                name: 'Footwear',
                slug: 'footwear',
                image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80',
                subcategories: [
                    'Men Casual Shoes', 'Men Formal Shoes', 'Men Sports Shoes',
                    'Men Sneakers', 'Men Loafers', 'Men Sandals', 'Men Flip Flops',
                    'Men Boots', 'Men Slippers',
                    'Women Casual Shoes', 'Women Formal Shoes', 'Women Sports Shoes',
                    'Women Sneakers', 'Women Heels', 'Women Flats', 'Women Sandals',
                    'Women Wedges', 'Women Boots', 'Women Slippers',
                    'Kids Shoes', 'Kids Sneakers', 'Kids Sandals', 'Kids School Shoes',
                    'Kids Sports Shoes'
                ]
            },

            // SPORTSWEAR
            {
                name: 'Sportswear',
                slug: 'sportswear',
                image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
                subcategories: [
                    'Running Shoes', 'Training Shoes', 'Basketball Shoes', 'Football Shoes',
                    'Cricket Shoes', 'Tennis Shoes', 'Badminton Shoes',
                    'Sports T-Shirts', 'Sports Shorts', 'Track Pants', 'Track Suits',
                    'Compression Wear', 'Sports Bras', 'Yoga Wear', 'Cycling Wear',
                    'Swimming Gear', 'Gym Gloves', 'Headbands', 'Wristbands',
                    'Sports Jackets', 'Windcheaters', 'Rain Jackets'
                ]
            }
        ];

        const createdCategories = [];
        const categoryMap = new Map();

        for (const mainCat of categoryData) {
            // Create main category
            const mainCategory = await Category.create({
                id: uuidv4(),
                category_name: mainCat.name,
                url_slug: mainCat.slug,
                parent_cat_id: null,
                status: 'active',
                image_url: mainCat.image,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            createdCategories.push(mainCategory);
            categoryMap.set(mainCat.name, mainCategory);

            // Create subcategories
            for (const subCatName of mainCat.subcategories) {
                const subCategory = await Category.create({
                    id: uuidv4(),
                    category_name: subCatName,
                    url_slug: `${mainCat.slug}-${subCatName.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')}`,
                    parent_cat_id: mainCategory.id,
                    status: 'active',
                    image_url: mainCat.image,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                createdCategories.push(subCategory);
            }
        }

        console.log(`✅ Created ${createdCategories.length} categories (main + subcategories)`);

        // ==================== PRODUCTS ====================
        console.log('🛍️  Creating products...');

        const productTemplates = [
            // Men's Products
            { name: 'Classic Cotton T-Shirt', basePrice: 25, category: 'Men', subcategory: 'T-Shirts', stock: 100 },
            { name: 'Slim Fit Formal Shirt', basePrice: 45, category: 'Men', subcategory: 'Shirts', stock: 80 },
            { name: 'Stretch Denim Jeans', basePrice: 60, category: 'Men', subcategory: 'Jeans', stock: 90 },
            { name: 'Chino Trousers', basePrice: 55, category: 'Men', subcategory: 'Trousers', stock: 70 },
            { name: 'Casual Shorts', basePrice: 30, category: 'Men', subcategory: 'Shorts', stock: 60 },
            { name: 'Premium Blazer', basePrice: 150, category: 'Men', subcategory: 'Blazers', stock: 40 },
            { name: 'Woolen Sweater', basePrice: 70, category: 'Men', subcategory: 'Sweaters', stock: 50 },
            { name: 'Zip Hoodie', basePrice: 55, category: 'Men', subcategory: 'Hoodies', stock: 85 },
            { name: 'Ethnic Kurta', basePrice: 65, category: 'Men', subcategory: 'Kurtas', stock: 60 },
            { name: 'Designer Sherwani', basePrice: 200, category: 'Men', subcategory: 'Sherwanis', stock: 25 },

            // Women's Products
            { name: 'Floral Summer Dress', basePrice: 85, category: 'Women', subcategory: 'Dresses', stock: 70 },
            { name: 'Casual Top', basePrice: 35, category: 'Women', subcategory: 'Tops', stock: 90 },
            { name: 'Silk Blouse', basePrice: 95, category: 'Women', subcategory: 'Blouses', stock: 60 },
            { name: 'High-Waist Jeans', basePrice: 65, category: 'Women', subcategory: 'Jeans', stock: 80 },
            { name: 'Palazzo Pants', basePrice: 50, category: 'Women', subcategory: 'Palazzo', stock: 70 },
            { name: 'A-Line Skirt', basePrice: 45, category: 'Women', subcategory: 'Skirts', stock: 60 },
            { name: 'Designer Saree', basePrice: 120, category: 'Women', subcategory: 'Sarees', stock: 50 },
            { name: 'Embroidered Kurti', basePrice: 55, category: 'Women', subcategory: 'Kurtis', stock: 85 },
            { name: 'Anarkali Suit', basePrice: 110, category: 'Women', subcategory: 'Anarkali', stock: 45 },
            { name: 'Designer Lehenga', basePrice: 250, category: 'Women', subcategory: 'Lehenga', stock: 30 },
            { name: 'Yoga Pants', basePrice: 40, category: 'Women', subcategory: 'Yoga Pants', stock: 100 },
            { name: 'Party Gown', basePrice: 180, category: 'Women', subcategory: 'Gowns', stock: 35 },

            // Kids' Products
            { name: 'Boys Graphic T-Shirt', basePrice: 20, category: 'Kids', subcategory: 'Boys T-Shirts', stock: 100 },
            { name: 'Girls Frock', basePrice: 45, category: 'Kids', subcategory: 'Girls Frocks', stock: 80 },
            { name: 'Boys Denim Jeans', basePrice: 40, category: 'Kids', subcategory: 'Boys Jeans', stock: 70 },
            { name: 'Girls Leggings', basePrice: 25, category: 'Kids', subcategory: 'Girls Leggings', stock: 90 },
            { name: 'Baby Romper', basePrice: 30, category: 'Kids', subcategory: 'Rompers', stock: 85 },

            // Accessories
            { name: 'Leather Handbag', basePrice: 120, category: 'Accessories', subcategory: 'Handbags', stock: 50 },
            { name: 'Canvas Backpack', basePrice: 60, category: 'Accessories', subcategory: 'Backpacks', stock: 80 },
            { name: 'Designer Clutch', basePrice: 75, category: 'Accessories', subcategory: 'Clutches', stock: 60 },
            { name: 'Leather Belt', basePrice: 35, category: 'Accessories', subcategory: 'Belts', stock: 100 },
            { name: 'Silk Scarf', basePrice: 40, category: 'Accessories', subcategory: 'Scarves', stock: 70 },
            { name: 'Baseball Cap', basePrice: 25, category: 'Accessories', subcategory: 'Caps', stock: 90 },
            { name: 'Aviator Sunglasses', basePrice: 80, category: 'Accessories', subcategory: 'Sunglasses', stock: 65 },
            { name: 'Smart Watch', basePrice: 200, category: 'Accessories', subcategory: 'Smart Watches', stock: 40 },

            // Footwear
            { name: 'Running Sneakers', basePrice: 90, category: 'Footwear', subcategory: 'Men Sneakers', stock: 75 },
            { name: 'Formal Leather Shoes', basePrice: 110, category: 'Footwear', subcategory: 'Men Formal Shoes', stock: 60 },
            { name: 'Women Heels', basePrice: 85, category: 'Footwear', subcategory: 'Women Heels', stock: 70 },
            { name: 'Casual Loafers', basePrice: 65, category: 'Footwear', subcategory: 'Men Loafers', stock: 80 },
            { name: 'Sports Shoes', basePrice: 95, category: 'Footwear', subcategory: 'Men Sports Shoes', stock: 85 }
        ];

        // Unsplash image collections for different product types
        const imageCollections = {
            'T-Shirts': ['1521572267360-eead09b9721c', '1581655353564-df123a1eb820', '1523381235312-3c1a830dec51', '1503341504253-dff4815485f1', '1562157873-818bc0726a82'],
            'Shirts': ['1602810318383-eac481980638', '1596755094514-f87e34085b2c', '1603252109303-2751441dd157', '1620799140188-3b2a02fd9a77', '1603252109360-909baaf261c7'],
            'Jeans': ['1542272604-787c3835535d', '1541099649105-f69ad21f3246', '1605518216938-7c31b7b14ad0', '1624378439575-d5b0b8b1c0e5', '1582552938357-32b906df40cb'],
            'Dresses': ['1572804013427-4d7ca7268217', '1496747611176-843222e1e57c', '1515372039744-b8f02a3ae446', '1595777457583-95e059d581b8', '1585487000143-5c2e9e8c1e9e'],
            'Blazers': ['1591047134402-0c0b3d9c812c', '1594932224010-720c7885b5c9', '1507679799987-c73779587ccf', '1617127365376-ec9eac9e6e3c', '1593032465729-e3a4483c2e3c'],
            'Accessories': ['1584917865442-de89df76afd3', '1591561954557-26941169b79e', '1548036328-c9fa89d128fa', '1590874103328-931e03df8d5f', '1606760227091-3dd870d97f1d'],
            'Footwear': ['1549298916-b41d501d3772', '1460353581641-37baddab0fa2', '1542291026-7eec264c27ff', '1605408499391-6368c628ef42', '1595950653106-6c9ebd614d3a'],
            'Default': ['1523381210434-2b67c8b0849c', '1556821840-3a63f95609a7', '1490481651871-ab68de25d43d', '1525507119028-ed4c629a60a3', '1503342217505-b0a15ec3261c']
        };

        const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        const colors = ['Black', 'White', 'Navy', 'Grey', 'Red', 'Blue', 'Green', 'Beige', 'Brown', 'Pink'];

        let productCount = 0;
        let imageCount = 0;
        let variantCount = 0;

        // Generate 500+ products
        for (let i = 0; i < 500; i++) {
            const template = productTemplates[i % productTemplates.length];
            const variation = Math.floor(i / productTemplates.length) + 1;

            const productName = `${template.name} ${variation > 1 ? `Series ${variation}` : ''}`.trim();
            const slug = productName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

            // Find category
            const mainCat = categoryMap.get(template.category);
            const subCats = createdCategories.filter(c =>
                c.parent_cat_id === mainCat.id &&
                c.category_name === template.subcategory
            );
            const targetCategory = subCats.length > 0 ? subCats[0] : mainCat;

            // Price variation
            const price = template.basePrice + (variation * 2) + (Math.random() * 10);

            // Select image collection
            let imageSet = imageCollections.Default;
            for (const [key, value] of Object.entries(imageCollections)) {
                if (template.subcategory.includes(key) || template.name.includes(key)) {
                    imageSet = value;
                    break;
                }
            }

            // Random number of images (2-6)
            const numImages = 2 + Math.floor(Math.random() * 5);
            const primaryImageId = imageSet[i % imageSet.length];
            const primaryImageUrl = `https://images.unsplash.com/photo-${primaryImageId}?auto=format&fit=crop&w=600&q=80`;

            // Randomly set flags
            const isFeatured = Math.random() > 0.8; // 20% featured
            const isTrending = Math.random() > 0.8; // 20% trending
            const isNewArrival = Math.random() > 0.7; // 30% new arrivals

            // Random rating (3.5 to 5.0)
            const rating = 3.5 + (Math.random() * 1.5);
            const reviews = 5 + Math.floor(Math.random() * 50);

            // Discount calculation
            const hasDiscount = Math.random() > 0.5;
            const discountPercentage = hasDiscount ? Math.floor(10 + Math.random() * 40) : 0;
            const originalPrice = hasDiscount ? price / (1 - (discountPercentage / 100)) : price;

            // Create product
            const product = await Product.create({
                id: uuidv4(),
                product_name: productName,
                url_slug: `${slug}-${uuidv4().substring(0, 8)}`,
                category_id: targetCategory.id,
                description: `Premium quality ${productName}. Crafted with attention to detail, this piece combines style and comfort. Perfect for ${template.category.toLowerCase()} who appreciate quality fashion. Made from high-grade materials ensuring durability and a luxurious feel.`,
                price: parseFloat(price.toFixed(2)),
                original_price: parseFloat(originalPrice.toFixed(2)),
                discount_percentage: discountPercentage,
                stock_quantity: template.stock + Math.floor(Math.random() * 50),
                brand: template.name.split(' ')[0], // Use first word as brand for variety
                tags: `${template.subcategory.toLowerCase()}, ${template.category.toLowerCase()}, fashionable, summer, quality`,
                is_featured: isFeatured,
                is_trending: isTrending,
                is_new_arrival: isNewArrival,
                average_rating: parseFloat(rating.toFixed(1)),
                total_reviews: reviews,
                status: 'active',
                image_url: primaryImageUrl,
                createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
                updatedAt: new Date()
            });

            productCount++;

            // Create product images
            for (let j = 0; j < numImages; j++) {
                const imgId = imageSet[(i + j) % imageSet.length];
                await ProductImage.create({
                    id: uuidv4(),
                    product_id: product.id,
                    image_url: `https://images.unsplash.com/photo-${imgId}?auto=format&fit=crop&w=800&q=80`,
                    image_order: j,
                    is_primary: j === 0,
                    status: 'active',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                imageCount++;
            }

            // Create variants (sizes)
            const numSizes = 3 + Math.floor(Math.random() * 3); // 3-5 sizes
            for (let s = 0; s < numSizes; s++) {
                await ProductVariant.create({
                    id: uuidv4(),
                    product_id: product.id,
                    variant_name: 'Size',
                    variant_value: sizes[s % sizes.length],
                    price_adjustment: 0,
                    stock_quantity: 10 + Math.floor(Math.random() * 20),
                    status: 'active',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                variantCount++;
            }

            // Create color variants
            const numColors = 2 + Math.floor(Math.random() * 3); // 2-4 colors
            for (let c = 0; c < numColors; c++) {
                await ProductVariant.create({
                    id: uuidv4(),
                    product_id: product.id,
                    variant_name: 'Color',
                    variant_value: colors[(i + c) % colors.length],
                    price_adjustment: c * 5,
                    stock_quantity: 15 + Math.floor(Math.random() * 25),
                    status: 'active',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                variantCount++;
            }

            // Progress indicator
            if ((i + 1) % 50 === 0) {
                console.log(`   📊 Progress: ${i + 1}/500 products created...`);
            }
        }

        console.log('\n🎉 ========== SEED COMPLETED SUCCESSFULLY ========== 🎉');
        console.log(`✅ Categories: ${createdCategories.length}`);
        console.log(`✅ Products: ${productCount}`);
        console.log(`✅ Product Images: ${imageCount}`);
        console.log(`✅ Product Variants: ${variantCount}`);
        console.log('====================================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        console.error(error.stack);
        process.exit(1);
    }
};

seedComprehensiveData();
