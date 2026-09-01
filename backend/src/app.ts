import express from 'express';
import cors from 'cors';
import { config } from './config/index';
import { errorHandler } from './middleware/errorHandler';
import { securityHeaders } from './middleware/securityHeaders';
import { generalRateLimiter, authRateLimiter } from './middleware/rateLimiter';
import { auditLogger } from './middleware/auditLogger';

import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import moduleRoutes from './routes/module.routes';
import lessonRoutes from './routes/lesson.routes';
import progressRoutes from './routes/progress.routes';
import preferenceRoutes from './routes/preference.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import uploadRoutes from './routes/upload.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// 1. Security Headers (Anti-Clickjacking, Anti-XSS, Anti-MIME sniffing)
app.use(securityHeaders);

// 2. CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 3. Request parsing with safe limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Audit & Event Logging
app.use(auditLogger);

// 5. Global API Rate Limiter
app.use(generalRateLimiter);

// 6. Static uploads
app.use('/uploads', express.static(config.uploadDir));

// Healthcheck endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// API Routes with specialized protections
app.use('/api/v1/auth', authRateLimiter, authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/modules', moduleRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/preferences', preferenceRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/admin', adminRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
