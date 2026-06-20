import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://shivstyple_user:ZTQBcn13EJBMXdjdJBON2XenbdvoQSHr@dpg-d8r092m7r5hc73dnukeg-a.virginia-postgres.render.com/shivstyple?ssl=true';

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
