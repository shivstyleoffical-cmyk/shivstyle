import { Sequelize, Op } from 'sequelize';
import config from '../config/config.js';

/**
 * Database Configuration
 * Manages the connection pool to the database.
 */

const connectionOptions = {
    dialect: 'postgres',
    logging: false,
    dialectOptions: config.db.ssl ? {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    } : {},
    pool: {
        max: 10,
        min: 2,
        acquire: 60000,
        idle: 10000
    }
};

const sequelize = config.db.url
    ? new Sequelize(config.db.url, connectionOptions)
    : new Sequelize(
        config.db.database,
        config.db.username,
        config.db.password,
        {
            host: config.db.host,
            port: config.db.port,
            ...connectionOptions
        }
    );

/**
 * Test database connection
 */
export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');

        if (config.env === 'development') {
            await sequelize.sync({ force: false });
            console.log(`ℹ️  DB Synced successfully for ${config.env} mode.`);
        }
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        // Don't exit process in dev if DB is down, but in prod we should
        if (config.env === 'production') process.exit(1);
    }
};

export default sequelize;
export { Op };
