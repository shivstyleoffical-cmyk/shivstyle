'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('products');

        if (!tableInfo.material) {
            await queryInterface.addColumn('products', 'material', {
                type: Sequelize.STRING,
                allowNull: true
            });
        }

        if (!tableInfo.care_instructions) {
            await queryInterface.addColumn('products', 'care_instructions', {
                type: Sequelize.STRING,
                allowNull: true
            });
        }

        if (!tableInfo.fit) {
            await queryInterface.addColumn('products', 'fit', {
                type: Sequelize.STRING,
                allowNull: true
            });
        }

        if (!tableInfo.country_of_origin) {
            await queryInterface.addColumn('products', 'country_of_origin', {
                type: Sequelize.STRING,
                allowNull: true
            });
        }

        if (!tableInfo.is_on_sale) {
            await queryInterface.addColumn('products', 'is_on_sale', {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('products');

        if (tableInfo.material) {
            await queryInterface.removeColumn('products', 'material');
        }
        if (tableInfo.care_instructions) {
            await queryInterface.removeColumn('products', 'care_instructions');
        }
        if (tableInfo.fit) {
            await queryInterface.removeColumn('products', 'fit');
        }
        if (tableInfo.country_of_origin) {
            await queryInterface.removeColumn('products', 'country_of_origin');
        }
        if (tableInfo.is_on_sale) {
            await queryInterface.removeColumn('products', 'is_on_sale');
        }
    }
};
