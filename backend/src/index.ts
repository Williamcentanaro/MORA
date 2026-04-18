import 'dotenv/config';
console.log('DATABASE_URL:', process.env.DATABASE_URL);

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import restaurantRoutes from "./routes/restaurantRoutes";
import adminRoutes from "./routes/adminRoutes";
import ownerRequestRoutes from "./routes/ownerRequestRoutes";
import ownerRoutes from "./routes/ownerRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

// Security and Logging Middlewares
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});
app.use(helmet({
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// CORS Hardening
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174', 'http://localhost:3000'];
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));

// Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 300, 
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use("/api/restaurants", defaultLimiter, restaurantRoutes);
app.use("/api/admin", defaultLimiter, adminRoutes);
app.use("/api/owner-requests", authLimiter, ownerRequestRoutes);
app.use("/api/owner", defaultLimiter, ownerRoutes);
app.use("/api/notifications", notificationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Sentry Error Handler (Commented out temporarily if causing issues)
// Sentry.setupExpressErrorHandler(app);

// Global Error Handler must be the last middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
