import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import os from 'os';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middlewares/error.middleware.js';

// Feature Route Handlers
import authRoutes from './features/auth/auth.routes.js';
import productRoutes from './features/products/product.routes.js';
import orderRoutes from './features/orders/order.routes.js';
import studioRoutes from './features/custom-studio/studio.routes.js';
import adminRoutes from './features/admin/admin.routes.js';
import notificationRoutes from './features/notifications/notification.routes.js';
import inquiryRoutes from './features/inquiries/inquiry.routes.js';
import couponRoutes from './features/coupons/coupon.routes.js';
import categoryRoutes from './features/categories/category.routes.js';
import settingRoutes from './features/settings/setting.routes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security Hardening: Disable banner leakage and configure Helmet
app.disable('x-powered-by');
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow serving uploads & images to frontend
  })
);

// Rate Limiting: General API limiter (development friendly, strict in production)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 300 : 50000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.',
  },
});
app.use('/api', generalLimiter);

// Strict Rate Limiting: Authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Excessive authentication attempts detected. Security cooldown active for 15 minutes.',
  },
});

// Request parsers & cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration for React frontend
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'https://aurachothing.vercel.app',
  'https://atelier-1xag-gilt.vercel.app',
].filter(Boolean).map((u) => u.replace(/\/+$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/+$/, '');
      if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    },
    credentials: true,
  })
);

// Serve static uploads directory for reference sketches & garment images
const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  (process.env.NODE_ENV === 'production' && process.cwd().startsWith('/var/task'))
);
const uploadPath = isServerless
  ? path.join(os.tmpdir(), 'uploads')
  : path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');

try {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
} catch {
  // Ignored in read-only serverless filesystems
}
app.use('/uploads', express.static(uploadPath));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Atelier AI Fashion Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Feature API Mounts
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/custom-studio', studioRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/settings', settingRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Atelier AI Server]: Listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  console.log(`[API Base]: http://localhost:${PORT}/api/v1`);
});
