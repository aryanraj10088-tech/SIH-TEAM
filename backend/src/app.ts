import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from 'passport';

// Initialize Google OAuth passport strategy
import './config/passport';

import authRoutes from './routes/auth.routes';
import healthRoutes from './routes/health.routes';
import { notFound, errorHandler } from './middlewares/error.middleware';

const app = express();
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowed = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : 'http://localhost:5173';
    if (!origin || origin === allowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased to 1000 to prevent Dashboard N+1 API calls from rate limiting users
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Passport middleware (stateless — no session needed for JWT)
app.use(passport.initialize());

// Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

import projectRoutes from './routes/project.routes';
import sourceRoutes from './routes/source.routes';
import outputRoutes from './routes/output.routes';
import userRoutes from './routes/user.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';
import reviewerRoutes from './routes/reviewer.routes';
// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:id/sources', sourceRoutes);
app.use('/api/outputs', outputRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviewer', reviewerRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
// Trigger restart
