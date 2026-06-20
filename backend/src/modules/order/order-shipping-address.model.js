import { DataTypes } from 'sequelize';
import sequelize from '../../database/connection.js';

const OrderShippingAddress = sequelize.define('orderShippingAddress', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    address_line1: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address_line2: {
        type: DataTypes.STRING,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    },
    postal_code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
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
    tableName: 'order_shipping_addresses',
    underscored: true
});

export default OrderShippingAddress; 