import { DataTypes } from 'sequelize';
import sequelize from '../../database/connection.js';

const ProductVariant = sequelize.define('productVariant', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    variant_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    variant_value: {
        type: DataTypes.STRING,
        allowNull: true
    },
    price_adjustment: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
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
    tableName: 'product_variants',
    underscored: true
});

export default ProductVariant; 