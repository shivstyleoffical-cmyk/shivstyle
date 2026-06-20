import sequelize from './src/database/connection.js';
import Category from './src/modules/category/category.model.js';
import Product from './src/modules/product/product.model.js';
import './src/database/associations.js';

const reorganizeCategories = async () => {
    try {
        console.log('🔄 Reorganizing categories: Nesting T-Shirts and Jeans under Men...');

        // 1. Create or Find "Men" top-level category
        let menCategory = await Category.findOne({ where: { url_slug: 'men' } });
        if (!menCategory) {
            menCategory = await Category.create({
                category_name: 'Men',
                url_slug: 'men',
                description: 'Premium collection for Men',
                image_url: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400',
                status: 'active',
                parent_cat_id: null,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log('  ✓ Created "Men" parent category.');
        } else {
            console.log('  ✓ "Men" category already exists.');
        }

        // 2. Find T-Shirts category and update its parent to Men
        const tshirts = await Category.findOne({ where: { url_slug: 't-shirts' } });
        if (tshirts) {
            tshirts.parent_cat_id = menCategory.id;
            await tshirts.save();
            console.log('  ✓ Set parent of "T-Shirts" to "Men".');
        } else {
            console.log('  ⚠ "T-Shirts" category not found.');
        }

        // 3. Find Jeans category and update its parent to Men
        const jeans = await Category.findOne({ where: { url_slug: 'jeans' } });
        if (jeans) {
            jeans.parent_cat_id = menCategory.id;
            await jeans.save();
            console.log('  ✓ Set parent of "Jeans" to "Men".');
        } else {
            console.log('  ⚠ "Jeans" category not found.');
        }

        // 4. Double check other categories (Women, Kids) are parent categories
        const women = await Category.findOne({ where: { url_slug: 'women' } });
        if (women) {
            women.parent_cat_id = null;
            await women.save();
            console.log('  ✓ Ensured "Women" is a top-level parent category.');
        }

        const kids = await Category.findOne({ where: { url_slug: 'kids' } });
        if (kids) {
            kids.parent_cat_id = null;
            await kids.save();
            console.log('  ✓ Ensured "Kids" is a top-level parent category.');
        }

        console.log('✅ Category reorganization completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error reorganizing categories:', error);
        process.exit(1);
    }
};

reorganizeCategories();
