import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './server/db';
import { seedData } from './server/seed';
import authRoutes from './server/routes/authRoutes';
import productRoutes from './server/routes/productRoutes';
import orderRoutes from './server/routes/orderRoutes';
import notificationRoutes from './server/routes/notificationRoutes';
import reviewRoutes from './server/routes/reviewRoutes';
import settingsRoutes from './server/routes/settingsRoutes';

import { Product } from './server/models/Product';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Set up security and performance middlewares first
app.set('trust proxy', 1);

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Performance
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use(cookieParser());

// Rate limiter for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    env: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL
  });
});

// Sitemap.xml dynamic generator
app.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await Product.find({}, '_id updatedAt').lean();
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const baseUrl = `${protocol}://${req.headers.host}`;
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  ${products.map(p => `
  <url>
    <loc>${baseUrl}/product/${p._id}</loc>
    <lastmod>${(p as any).updatedAt?.toISOString() || new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    res.status(500).end();
  }
});

// Google Verification Route
app.get('/google692bae69f5b9af32.html', (req, res) => {
  res.header('Content-Type', 'text/html');
  res.send('google-site-verification: google692bae69f5b9af32.html');
});

app.use('/api/auth', apiLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', settingsRoutes);

// Database connection logic
const initDB = async () => {
  try {
    await connectDB();
    seedData().catch(err => console.error('Seeding failed:', err));
  } catch (err) {
    console.error('Database initialization failed:', err);
  }
};

// Start initialization
initDB();

// Vite / Static files
if (process.env.NODE_ENV !== 'production' && process.env.DISABLE_VITE !== 'true') {
  const startVite = async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  };
  startVite();
} else if (!process.env.VERCEL) {
  // Only serve static files via Express if NOT on Vercel
  // Vercel handles static serving via rewrites in vercel.json
  const distPath = path.resolve(process.cwd(), 'dist');
  const alternateDistPath = '/dist';
  const finalDistPath = fs.existsSync(alternateDistPath) ? alternateDistPath : distPath;
  
  console.log(`[Production] Serving static files from: ${finalDistPath}`);
  
  app.use(express.static(path.join(process.cwd(), 'public')));
  app.use(express.static(finalDistPath));
  
  app.get('*', (req, res) => {
    const indexPath = path.join(finalDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.error(`[Error] 404: static file not found at ${indexPath}`);
      res.status(404).send('Site content is currently being updated. Please refresh in a few moments.');
    }
  });
}

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start listening ONLY if not on Vercel
if (!process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server successfully listening on http://0.0.0.0:${PORT}`);
  });
}
