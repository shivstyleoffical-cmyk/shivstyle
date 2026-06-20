import { DataTypes } from 'sequelize';
import sequelize from '../../database/connection.js';

const Wishlist = sequelize.define('wishlist', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    product_variant_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'product_variants',
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
    tableName: 'wishlists',
    underscored: true
});

export default Wishlist; 