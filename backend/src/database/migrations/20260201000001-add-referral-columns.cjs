'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('users');

        if (!tableInfo.referral_code) {
            await queryInterface.addColumn('users', 'referral_code', {
                type: Sequelize.STRING,
                allowNull: true,
                unique: true
            });
        }

        if (!tableInfo.referred_by) {
            await queryInterface.addColumn('users', 'referred_by', {
                type: Sequelize.UUID,
                allowNull: true
            });
        }

        if (!tableInfo.coins) {
            await queryInterface.addColumn('users', 'coins', {
                type: Sequelize.INTEGER,
                defaultValue: 0
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('users');

        if (tableInfo.coins) {
            await queryInterface.removeColumn('users', 'coins');
        }
        if (tableInfo.referral_code) {
            await queryInterface.removeColumn('users', 'referral_code');
        }
        if (tableInfo.referred_by) {
            await queryInterface.removeColumn('users', 'referred_by');
        }
    }
};
