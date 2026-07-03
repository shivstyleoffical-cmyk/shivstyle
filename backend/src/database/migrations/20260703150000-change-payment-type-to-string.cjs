'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('orders', 'payment_type', {
            type: Sequelize.STRING,
            allowNull: true
        });
    },

    async down(queryInterface, Sequelize) {
        // Fallback: note that restoring ENUM requires casting or type creation
        await queryInterface.changeColumn('orders', 'payment_type', {
            type: Sequelize.ENUM('netbanking', 'upi', 'cod'),
            allowNull: true
        });
    }
};
