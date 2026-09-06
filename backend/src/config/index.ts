import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const productionSecret = process.env.JWT_SECRET;
if (nodeEnv === 'production' && !productionSecret) {
  throw new Error('JWT_SECRET is required when NODE_ENV=production');
}
if (nodeEnv === 'production' && !process.env.ADMIN_DEFAULT_PASSWORD) {
  throw new Error('ADMIN_DEFAULT_PASSWORD is required when NODE_ENV=production');
}

export const config = {
  env: nodeEnv,
  port: parseInt(process.env.PORT || '3000', 10),
  dbFile: process.env.DATABASE_FILE || './studyplatform.db',
  jwtSecret: productionSecret || 'development-only-jwt-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminEmail: (process.env.ADMIN_EMAIL || 'admin@studyplatform.com').toLowerCase(),
  adminDefaultPassword: process.env.ADMIN_DEFAULT_PASSWORD || 'development-only-admin-password',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads'),
};
