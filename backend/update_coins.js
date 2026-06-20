import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('postgresql://neondb_owner:npg_6rQ0eRFAfagT@ep-bitter-glitter-a5043833-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require', {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: false
});

async function updateCoins() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Update ALL users to have 65 coins for testing purposes, or target specific one if needed
        const [results, metadata] = await sequelize.query(
            "UPDATE users SET coins = 65 WHERE phone = '+911234567898'"
        );

        console.log(`Updated coins for user. Metadata:`, metadata);

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

updateCoins();
