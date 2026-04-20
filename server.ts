import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Rate limiter for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

async function startServer() {
  try {
    console.log('Starting server initialization...');
    app.set('trust proxy', 1);

    // Security Headers
    app.use(helmet({
      contentSecurityPolicy: false, // Disable CSP for development ease, or customize for production
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

    // Connect to MongoDB FIRST
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected, completing initialization...');
    
    // Seed data in background
    seedData().catch(err => console.error('Seeding failed:', err));

    // API Routes
    app.get('/api/health', (req, res) => res.json({ 
      status: 'ok', 
      db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' 
    }));

    // Apply rate limiting to auth routes
    app.use('/api/auth', apiLimiter, authRoutes);
    
    app.use('/api/products', productRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/settings', settingsRoutes);

    // Global Error Handler
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Unhandled Error:', err);
      res.status(500).json({ 
        message: 'Internal Server Error', 
        error: process.env.NODE_ENV === 'development' ? err.message : undefined 
      });
    });

    // Vite middleware for development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Initializing Vite middleware...');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('Vite middleware initialized.');
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    // Start listening LAST
    const PORT = Number(process.env.PORT) || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server successfully listening on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('CRITICAL STARTUP ERROR:', error);
  }
}

startServer();
