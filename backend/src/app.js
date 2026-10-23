import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import caseRoutes from './routes/caseRoutes.js';
import institutionRoutes from './routes/institutionRoutes.js';
import overlapRoutes from './routes/overlapRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import matchReviewRoutes from './routes/matchReviewRoutes.js';
import importSyncRoutes from './routes/importSyncRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import mockRoutes from './routes/mockRoutes.js';

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AICTE Integrated Complaint Monitoring Dashboard Backend',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.get('/api/me', (await import('./middleware/auth.js')).authenticate, (await import('./controllers/authController.js')).getMe);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/overlaps', overlapRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/match-review', matchReviewRoutes);
app.use('/api/import', importSyncRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Mock external sources
app.use('/mock', mockRoutes);

// Central error handler
app.use(errorHandler);

export default app;
