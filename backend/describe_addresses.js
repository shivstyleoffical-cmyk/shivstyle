import Sequelize from 'sequelize';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false
    }
);

async function describeTable() {
    try {
        const [results] = await sequelize.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'addresses' ORDER BY column_name");
        console.log('Columns in addresses table:', results);
    } catch (err) {
        console.error('Error describing table:', err);
    } finally {
        await sequelize.close();
    }
}

describeTable();
