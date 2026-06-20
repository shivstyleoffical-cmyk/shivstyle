import pg from 'pg';
const { Client } = pg;

// Added ?ssl=true to the URL
const connectionString = 'postgresql://ecommerce_w6oi_user:tyVntRvSx7mDNz8OvY2Rrx0W5nEEUdQh@dpg-d5v1tol6ubrc73c4ifdg-a.oregon-postgres.render.com/ecommerce_w6oi?ssl=true';

const client = new Client({
    connectionString: connectionString,
});

async function test() {
    try {
        console.log('Connecting with SSL in URL...');
        await client.connect();
        console.log('Connected!');
        const res = await client.query('SELECT NOW()');
        console.log('Query result:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('Connection error:', err);
    }
}

test();
