/**
 * EXAMPLE: Product Repository with MongoDB/Mongoose (FUTURE MIGRATION)
 * 
 * Migrating to MongoDB? Just rewrite the repository!
 * Business logic in ProductService remains untouched.
 */

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    product_name: String,
    price: Number,
    status: { type: String, default: 'active' },
    category_id: String,
    stock_quantity: Number,
    created_At: Date,
    updated_At: Date
});

const Product = mongoose.model('Product', productSchema);

class ProductRepositoryMongo {
    async findById(id) {
        return await Product.findById(id);
    }

    async listProducts({ page = 1, limit = 10, searchString, minPrice, maxPrice }) {
        const skip = (page - 1) * limit;
        const query = { status: 'active' };

        if (searchString) {
            query.$or = [
                { product_name: { $regex: searchString, $options: 'i' } }
            ];
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = minPrice;
            if (maxPrice) query.price.$lte = maxPrice;
        }

        const [products, count] = await Promise.all([
            Product.find(query).skip(skip).limit(limit),
            Product.countDocuments(query)
        ]);

        return { rows: products, count };
    }

    async create(data) {
        const product = new Product(data);
        return await product.save();
    }

    async update(product, data) {
        Object.assign(product, data);
        return await product.save();
    }
}

export default new ProductRepositoryMongo();
