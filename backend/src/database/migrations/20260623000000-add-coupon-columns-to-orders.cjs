'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('orders');

        if (!tableInfo.coupon_code) {
            await queryInterface.addColumn('orders', 'coupon_code', {
                type: Sequelize.STRING,
                allowNull: true
            });
        }

        if (!tableInfo.coupon_used_incremented) {
            await queryInterface.addColumn('orders', 'coupon_used_incremented', {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('orders');

        if (tableInfo.coupon_code) {
            await queryInterface.removeColumn('orders', 'coupon_code');
        }

        if (tableInfo.coupon_used_incremented) {
            await queryInterface.removeColumn('orders', 'coupon_used_incremented');
        }
    }
};
