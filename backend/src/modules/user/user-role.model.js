import { DataTypes } from 'sequelize';
import sequelize from '../../database/connection.js';

const userRole = sequelize.define('userRole', {


    role_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,


    },
    user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,

    },
}, {

    tableName: 'user_role',
    underscored: true,

});


export default userRole;