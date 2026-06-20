import { DataTypes } from 'sequelize';
import sequelize from '../../database/connection.js';

const Order = sequelize.define('order', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    order_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    gross_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    shipping_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    net_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'),
        allowNull: false,
        defaultValue: 'placed'
    },
    payment_status: {
        type: DataTypes.ENUM('paid', 'not_paid', 'refunded'),
        allowNull: false,
        defaultValue: 'not_paid'
    },
    payment_type: {
        type: DataTypes.ENUM('netbanking', 'upi', 'cod'),
        allowNull: true
    },
    payment_transaction_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // Delivery Tracking Fields
    tracking_number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    delivery_partner: {
        type: DataTypes.STRING,
        allowNull: true
    },
    estimated_delivery_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    actual_delivery_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    delivery_notes: {
        type: DataTypes.TEXT,
        allowNull: true
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
    final_amount: {
        type: DataTypes.VIRTUAL,
        get() { return this.net_amount; }
    },
    payment_method: {
        type: DataTypes.VIRTUAL,
        get() { return this.payment_type; }
    },
    order_status: {
        type: DataTypes.VIRTUAL,
        get() { return this.status; }
    }
}, {
    timestamps: false,
    tableName: 'orders',
    underscored: true
});

export default Order; 