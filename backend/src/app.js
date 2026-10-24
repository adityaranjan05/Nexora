import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticate, requirePortal } from './middleware/auth.js';
import { getMe } from './controllers/authController.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import officerRoutes from './routes/officerRoutes.js';
import bureauRoutes from './routes/bureauRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import mockRoutes from './routes/mockRoutes.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));

// Rate limiters (skip during automated tests)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

app.use('/api', generalLimiter);

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AICTE Integrated Complaint Monitoring Dashboard Backend',
  });
});

// Authentication & Self endpoints
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.get('/api/me', authenticate, getMe);

// Dedicated Portal API route groups with portal enforcement
app.use('/api/officer', authenticate, requirePortal('officer'), officerRoutes);
app.use('/api/bureau', authenticate, requirePortal('bureau'), bureauRoutes);
app.use('/api/student', authenticate, requirePortal('student'), studentRoutes);

// Mock external sources (Gated behind non-production)
if (process.env.NODE_ENV !== 'production') {
  app.use('/mock', mockRoutes);
}

// Central error handler
app.use(errorHandler);

export default app;
