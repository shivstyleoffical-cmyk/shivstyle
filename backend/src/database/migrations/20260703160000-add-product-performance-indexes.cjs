'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Index for general active queries and sorting by creation date
        await queryInterface.addIndex('products', ['status', 'created_at']);
        
        // Index for category joins and filter queries
        await queryInterface.addIndex('products', ['category_id']);

        // Indexes for home page filter flags
        await queryInterface.addIndex('products', ['is_featured']);
        await queryInterface.addIndex('products', ['is_trending']);
        await queryInterface.addIndex('products', ['is_new_arrival']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('products', ['status', 'created_at']);
        await queryInterface.removeIndex('products', ['category_id']);
        await queryInterface.removeIndex('products', ['is_featured']);
        await queryInterface.removeIndex('products', ['is_trending']);
        await queryInterface.removeIndex('products', ['is_new_arrival']);
    }
};
