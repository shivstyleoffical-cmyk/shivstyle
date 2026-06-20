import { DataTypes } from 'sequelize';
import sequelize from '../../database/connection.js';

const Location = sequelize.define('location', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    },
    city_name: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'city'
    },
    pincode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    delivery_charge: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 50.00
    },
    min_order_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_available'
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
    tableName: 'locations',
    underscored: true
});

export default Location;
