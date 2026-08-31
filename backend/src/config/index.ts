import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  dbFile: process.env.DATABASE_FILE || './studyplatform.db',
  jwtSecret: process.env.JWT_SECRET || 'super-secret-studyplatform-jwt-key-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminEmail: (process.env.ADMIN_EMAIL || 'admin@studyplatform.com').toLowerCase(),
  adminDefaultPassword: process.env.ADMIN_DEFAULT_PASSWORD || 'Admin123456!',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads'),
};
