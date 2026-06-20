import { DataTypes } from 'sequelize';
import sequelize from '../../database/connection.js';

const Product = sequelize.define('product', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    product_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    url_slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'categories',
            key: 'id'
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    stock_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tags: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Comma-separated tags for search and filtering'
    },
    is_featured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    is_trending: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    is_new_arrival: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    discount_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0
    },
    original_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    average_rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        defaultValue: 0
    },
    total_reviews: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'created_at'
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'updated_at'
    },
    is_active: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.status === 'active';
        }
    }
}, {
    timestamps: false,
    tableName: 'products',
    underscored: true
});

export default Product; 