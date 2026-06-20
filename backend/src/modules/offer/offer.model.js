import { DataTypes } from 'sequelize';
import sequelize from '../../database/connection.js';

const Offer = sequelize.define('offer', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    discount_type: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        allowNull: false
    },
    discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    min_order_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    max_discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    usage_limit: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    used_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
    },
    product_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    category_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'categories',
            key: 'id'
        }
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
    }
}, {
    timestamps: false,
    tableName: 'offers',
    underscored: true
});

export default Offer;
