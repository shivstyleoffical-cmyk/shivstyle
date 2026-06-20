import { DataTypes } from 'sequelize';
import sequelize from '../../database/connection.js';

const role = sequelize.define('role', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },

    role_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at'
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at'
    },
}, {
    tableName: 'role',
    underscored: true,
    timestamps: true
});

export default role;