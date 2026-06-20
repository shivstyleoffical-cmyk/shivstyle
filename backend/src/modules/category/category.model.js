import { DataTypes } from 'sequelize';
import sequelize from '../../database/connection.js';

const Category = sequelize.define('category', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    category_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    url_slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    parent_cat_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'categories',
            key: 'id'
        }
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
    tableName: 'categories',
    underscored: true
});

export default Category; 