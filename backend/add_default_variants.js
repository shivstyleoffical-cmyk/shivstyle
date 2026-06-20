import sequelize from './src/database/connection.js';
import Product from './src/modules/product/product.model.js';
import ProductVariant from './src/modules/product/product-variant.model.js';
import './src/database/associations.js';

const seedVariants = async () => {
    try {
        console.log('🔄 Checking database products for variants...');
        const products = await Product.findAll();
        
        let createdCount = 0;
        for (const product of products) {
            // Check if product already has variants
            const existingVariants = await ProductVariant.findAll({ where: { product_id: product.id } });
            if (existingVariants.length === 0) {
                console.log(`📦 Adding default variants (S, M, L, XL, XXL) for: ${product.product_name}`);
                
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
                        sku: `${product.url_slug.substring(0, 10).toUpperCase()}-${size}`,
                        status: 'active',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
                createdCount++;
            }
        }
        
        console.log(`✅ Success! Created variants for ${createdCount} products.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding variants:', error);
        process.exit(1);
    }
};

seedVariants();
