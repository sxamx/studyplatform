const fs = require('fs');
const path = require('path');

function write(p, content) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, content, 'utf8');
  console.log([OK] );
}

// 1. BACKEND FILES
write('backend/package.json', JSON.stringify({
  name: studyplatform-backend,
  version: 1.0.0,
  type: commonjs,
  scripts: {
    dev: tsx watch src/server.ts,
    build: tsc,
    start: node dist/server.js,
    seed: tsx src/database/seed.ts
  },
  dependencies: {
    better-sqlite3: ^11.8.1,
    bcryptjs: ^3.0.2,
    cors: ^2.8.5,
    dotenv: ^16.4.7,
    express: ^4.21.2,
    jsonwebtoken: ^9.0.2,
    multer: ^1.4.5-lts.1,
    zod: ^3.24.2
  },
  devDependencies: {
    @types/better-sqlite3: ^7.6.12,
    @types/bcryptjs: ^2.4.6,
    @types/cors: ^2.8.17,
    @types/express: ^4.17.21,
    @types/jsonwebtoken: ^9.0.9,
    @types/multer: ^1.4.12,
    @types/node: ^22.13.5,
    tsx: ^4.19.3,
    typescript: ^5.7.3
  }
}, null, 2));

write('backend/tsconfig.json', JSON.stringify({
  compilerOptions: {
    target: ES2022,
    module: commonjs,
    moduleResolution: node,
    lib: [ES2022],
    outDir: ./dist,
    rootDir: ./src,
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    resolveJsonModule: true
  },
  include: [src/**/*]
}, null, 2));

write('backend/.env', NODE_ENV=development
PORT=3000
DATABASE_FILE=./studyplatform.db
JWT_SECRET=super-secret-studyplatform-jwt-key-2026
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@studyplatform.com
ADMIN_DEFAULT_PASSWORD=Admin123456!
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
);

write('backend/.env.example', NODE_ENV=development
PORT=3000
DATABASE_FILE=./studyplatform.db
JWT_SECRET=super-secret-studyplatform-jwt-key-2026
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@studyplatform.com
ADMIN_DEFAULT_PASSWORD=Admin123456!
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
);

write('backend/wrangler.toml', 
ame = studyplatform-api
main = src/server.ts
compatibility_date = 2024-08-30
compatibility_flags = [nodejs_compat]

[vars]
NODE_ENV = production
ADMIN_EMAIL = admin@studyplatform.com
JWT_EXPIRES_IN = 7d

[[d1_databases]]
binding = DB
database_name = studyplatform_d1
database_id = your-d1-database-uuid
);

write('backend/src/config/index.ts', import dotenv from 'dotenv';
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
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads'),
};
);

write('backend/src/database/schema.sql', -- StudyPlatform Database Schema (SQLite / Cloudflare D1 / PostgreSQL Compatible)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
  theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'system')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_published INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  estimated_minutes INTEGER DEFAULT 15,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lesson_content (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL UNIQUE REFERENCES lessons(id) ON DELETE CASCADE,
  content TEXT NOT NULL, -- JSON formatted blocks
  version INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  url TEXT NOT NULL,
  uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_public INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS user_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed INTEGER DEFAULT 0,
  completed_at DATETIME,
  answers TEXT, -- JSON formatted answers
  score INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  action TEXT,
  resource_type TEXT,
  resource_id TEXT,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_course ON user_progress(course_id);
);

write('backend/src/database/db.ts', import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from '../config/index';

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.resolve(process.cwd(), config.dbFile);
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Run schema migrations
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      db.exec(schema);
    }
  }
  return db;
}

export function closeDb() {
  if (db) {
    db.close();
  }
}
);

console.log('Backend base created!');
