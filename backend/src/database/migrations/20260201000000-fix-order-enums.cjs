'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. First, check if ENUM already exists and update it if possible
        // PostgreSQL ENUMs are tricky to update. The safest way is to add new values.

        const enumName = 'enum_orders_status';
        const valuesToAdd = ['confirmed', 'out_for_delivery', 'cancelled', 'returned'];

        for (const value of valuesToAdd) {
            try {
                await queryInterface.sequelize.query(`ALTER TYPE "${enumName}" ADD VALUE IF NOT EXISTS '${value}'`);
            } catch (err) {
                console.log(`Note: Could not add ${value} to ${enumName}, it might already exist or the type name differs.`);
            }
        }

        // Also handle payment_status enum
        try {
            await queryInterface.sequelize.query(`ALTER TYPE "enum_orders_payment_status" ADD VALUE IF NOT EXISTS 'refunded'`);
        } catch (err) {
            console.log(`Note: Could not add refunded to enum_orders_payment_status.`);
        }
    },

    async down(queryInterface, Sequelize) {
        // Note: Removing values from an ENUM is not supported in PostgreSQL via simple ALTER TYPE.
        // Usually, this migration remains one-way or requires a full type replacement.
    }
};
