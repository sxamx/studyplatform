import express from 'express';
import cors from 'cors';
import { config } from './config/index';
import { errorHandler } from './middleware/errorHandler';

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

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(config.uploadDir));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/modules', moduleRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/preferences', preferenceRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(errorHandler);

export default app;
