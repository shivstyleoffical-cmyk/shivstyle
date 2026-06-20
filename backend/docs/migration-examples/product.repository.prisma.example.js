/**
 * EXAMPLE: Product Repository with Prisma (FUTURE MIGRATION)
 * 
 * To migrate to Prisma, you ONLY rewrite this repository file.
 * Your ProductService.js, ProductController.js, and routes stay EXACTLY the same!
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class ProductRepositoryPrisma {
    async findById(id) {
        return await prisma.product.findUnique({
            where: { id }
        });
    }

    async listProducts({ page = 1, limit = 10, searchString, minPrice, maxPrice }) {
        const skip = (page - 1) * limit;
        const where = { status: 'active' };

        if (searchString) {
            where.OR = [
                { product_name: { contains: searchString, mode: 'insensitive' } }
            ];
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = minPrice;
            if (maxPrice) where.price.lte = maxPrice;
        }

        const [products, count] = await Promise.all([
            prisma.product.findMany({ where, skip, take: limit }),
            prisma.product.count({ where })
        ]);

        return { rows: products, count };
    }

    async create(data) {
        return await prisma.product.create({ data });
    }

    async update(product, data) {
        return await prisma.product.update({
            where: { id: product.id },
            data
        });
    }
}

export default new ProductRepositoryPrisma();
