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

        // Query active categories
        console.log('Querying categories...');
        const catRes = await client.query("SELECT url_slug FROM categories WHERE status = 'active' OR status IS NULL");
        
        // Query active products
        console.log('Querying products...');
        const prodRes = await client.query("SELECT url_slug FROM products WHERE status = 'active'");

        const baseUrl = 'https://www.shivstyles.in';
        
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        // 1. Add static pages
        xml += `  <url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
        xml += `  <url><loc>${baseUrl}/products</loc><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
        xml += `  <url><loc>${baseUrl}/sale</loc><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
        xml += `  <url><loc>${baseUrl}/support/contact</loc><changefreq>weekly</changefreq><priority>0.5</priority></url>\n`;
        xml += `  <url><loc>${baseUrl}/support/faq</loc><changefreq>weekly</changefreq><priority>0.5</priority></url>\n`;
        xml += `  <url><loc>${baseUrl}/support/shipping</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>\n`;
        xml += `  <url><loc>${baseUrl}/support/returns</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>\n`;
        xml += `  <url><loc>${baseUrl}/support/privacy</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>\n`;
        xml += `  <url><loc>${baseUrl}/support/terms</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>\n`;

        // 2. Add categories
        catRes.rows.forEach(cat => {
            if (cat.url_slug) {
                xml += `  <url><loc>${baseUrl}/category/${cat.url_slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
            }
        });

        // 3. Add products
        prodRes.rows.forEach(prod => {
            if (prod.url_slug) {
                xml += `  <url><loc>${baseUrl}/product/${prod.url_slug}</loc><changefreq>daily</changefreq><priority>0.7</priority></url>\n`;
            }
        });

        xml += `</urlset>`;

        const sitemapPath = path.join(__dirname, '../client/public/sitemap.xml');
        fs.writeFileSync(sitemapPath, xml, 'utf8');
        console.log(`Successfully generated static sitemap with ${catRes.rows.length} categories and ${prodRes.rows.length} products! Saved to: ${sitemapPath}`);

    } catch (err) {
        console.error('Error generating sitemap:', err);
    } finally {
        await client.end();
    }
}

generate();
