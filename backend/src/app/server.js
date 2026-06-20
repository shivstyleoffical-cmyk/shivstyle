// Role cleanup applied
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url'
import config from '../config/config.js';

import userRoutes from '../modules/user/user.routes.js';
import categoryRoutes from '../modules/category/category.routes.js';
import productRoutes from '../modules/product/product.routes.js';
import orderRoutes from '../modules/order/order.routes.js';
import wishlistRoutes from '../modules/wishlist/wishlist.routes.js';
import offerRoutes from '../modules/offer/offer.routes.js';
import notificationRoutes from '../modules/notification/notification.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import locationRoutes from '../modules/location/location.routes.js';
import checkoutRoutes from '../modules/checkout/checkout.routes.js';
import Product from '../modules/product/product.model.js';
import Category from '../modules/category/category.model.js';
import { errorHandler } from '../middleware/errorHandler.js';
import '../database/associations.js'; // Import associations
import { connectDB } from '../database/connection.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const PORT = config.port || 6006;
console.log(config.env)


// *** Add this line to serve images ***
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// routes
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/checkout', checkoutRoutes);

// Dynamic XML Sitemap for Search Engine Crawlers (SEO)
app.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await Product.findAll({ where: { status: 'active' } });
    const categories = await Category.findAll({ where: { status: 'active' } });

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
    categories.forEach(cat => {
      xml += `  <url><loc>${baseUrl}/category/${cat.url_slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    });

    // 3. Add products
    products.forEach(prod => {
      xml += `  <url><loc>${baseUrl}/product/${prod.url_slug}</loc><changefreq>daily</changefreq><priority>0.7</priority></url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Dynamic Google Merchant Center Feed (SEO)
app.get('/google-feed.xml', async (req, res) => {
  try {
    const products = await Product.findAll({ where: { status: 'active' } });
    const baseUrl = 'https://www.shivstyles.in';
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n`;
    xml += `  <channel>\n`;
    xml += `    <title>ShivStyle Official</title>\n`;
    xml += `    <link>${baseUrl}</link>\n`;
    xml += `    <description>Premium Streetwear and Clothing Essentials. Crafted with pride in India.</description>\n`;

    products.forEach(prod => {
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

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating Google feed:', error);
    res.status(500).send('Error generating Google feed');
  }
});

// middleware for error handling
app.use(errorHandler);


// listen on port
const startServer = async () => {
  await connectDB(); // ✅ DB connected first

  // ⛔ IMPORT AFTER DB is connected to avoid circular import
  const { createRole } = await import('../scripts/seedRoles.js');
  await createRole();
  console.log('✅ Roles seeded.');

  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();
// Reload triggered by key update