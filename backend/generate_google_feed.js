import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const connectionString = 'postgresql://shivstyple_user:ZTQBcn13EJBMXdjdJBON2XenbdvoQSHr@dpg-d8r092m7r5hc73dnukeg-a.virginia-postgres.render.com/shivstyple?ssl=true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generate() {
    const client = new Client({ connectionString });
    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected successfully!');

        // Query active products
        console.log('Querying products...');
        const prodRes = await client.query("SELECT * FROM products WHERE status = 'active'");

        const baseUrl = 'https://www.shivstyles.in';
        
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n`;
        xml += `  <channel>\n`;
        xml += `    <title>ShivStyle Official</title>\n`;
        xml += `    <link>${baseUrl}</link>\n`;
        xml += `    <description>Premium Streetwear and Clothing Essentials. Crafted with pride in India.</description>\n`;

        prodRes.rows.forEach(prod => {
            const cleanDesc = prod.description 
                ? prod.description.replace(/<[^>]*>/g, '').replace(/&/g, '&amp;').substring(0, 1000) 
                : 'Premium apparel from ShivStyle.';
            
            const cleanName = prod.product_name ? prod.product_name.replace(/&/g, '&amp;') : '';
            const availability = prod.stock_quantity > 0 ? 'in stock' : 'out of stock';
            
            // Format price: e.g. "49.99 INR"
            const price = `${Number(prod.price).toFixed(2)} INR`;

            xml += `    <item>\n`;
            xml += `      <g:id>${prod.id}</g:id>\n`;
            xml += `      <g:title>${cleanName}</g:title>\n`;
            xml += `      <g:description>${cleanDesc}</g:description>\n`;
            xml += `      <g:link>${baseUrl}/product/${prod.url_slug}</g:link>\n`;
            xml += `      <g:image_link>${prod.image_url}</g:image_link>\n`;
            xml += `      <g:condition>new</g:condition>\n`;
            xml += `      <g:availability>${availability}</g:availability>\n`;
            xml += `      <g:price>${price}</g:price>\n`;
            xml += `      <g:brand>${prod.brand || 'ShivStyle'}</g:brand>\n`;
            xml += `      <g:google_product_category>Apparel &amp; Accessories &gt; Clothing</g:google_product_category>\n`;
            xml += `    </item>\n`;
        });

        xml += `  </channel>\n`;
        xml += `</rss>`;

        const feedPath = path.join(__dirname, '../client/public/google-feed.xml');
        fs.writeFileSync(feedPath, xml, 'utf8');
        console.log(`Successfully generated Google Product Feed with ${prodRes.rows.length} products! Saved to: ${feedPath}`);

    } catch (err) {
        console.error('Error generating Google Product Feed:', err);
    } finally {
        await client.end();
    }
}

generate();
