import { DataTypes } from 'sequelize';
import sequelize from '../../database/connection.js';

const Notification = sequelize.define('notification', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('all', 'specific'),
        defaultValue: 'all'
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: true // Null if type is 'all'
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
    tableName: 'notifications',
    underscored: true
});

export default Notification;
