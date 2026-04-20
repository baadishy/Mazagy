import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Import our routes and models
import { connectDB } from '../backend/db.js';
import { seedData } from '../backend/seed.js';
import authRoutes from '../backend/routes/authRoutes.js';
import productRoutes from '../backend/routes/productRoutes.js';
import orderRoutes from '../backend/routes/orderRoutes.js';
import notificationRoutes from '../backend/routes/notificationRoutes.js';
import reviewRoutes from '../backend/routes/reviewRoutes.js';
import settingsRoutes from '../backend/routes/settingsRoutes.js';
import { Product } from '../backend/models/Product.js';

dotenv.config();

export const app = express();

// Basic security and performance
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', vercel: true }));

// Dynamic Sitemap
app.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await Product.find({}, '_id updatedAt').lean();
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const baseUrl = `${protocol}://${req.headers.host}`;
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${baseUrl}/products</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  ${products.map(p => `<url><loc>${baseUrl}/product/${p._id}</loc><lastmod>${(p as any).updatedAt?.toISOString() || new Date().toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`).join('')}
</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    res.status(500).end();
  }
});

app.use('/api/auth', apiLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', settingsRoutes);

// Init DB
connectDB().then(() => {
  seedData().catch(err => console.error('Seeding error:', err));
}).catch(err => console.error('DB error:', err));

if (!process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server successfully listening on http://0.0.0.0:${PORT}`);
  });
}

export default app;
