import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { config } from '../config/index';

let db: DatabaseSync;

export function getDb(): DatabaseSync {
  if (!db) {
    const dbPath = path.resolve(process.cwd(), config.dbFile);
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    db = new DatabaseSync(dbPath);
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA foreign_keys = ON;');

    // Safe column migrations for existing SQLite database files before index creation
    try {
      db.exec('ALTER TABLE courses ADD COLUMN track_id TEXT REFERENCES learning_tracks(id) ON DELETE SET NULL;');
    } catch {
      // Column might already exist
    }
    try {
      db.exec('ALTER TABLE courses ADD COLUMN thumbnail_url TEXT;');
    } catch {
      // Column might already exist
    }
    try {
      db.exec('ALTER TABLE lessons ADD COLUMN module_id TEXT REFERENCES modules(id) ON DELETE SET NULL;');
    } catch {
      // Column might already exist
    }

    const schemaPath = path.resolve(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      db.exec(schema);
    }
  }
  return db;
}

export function transaction<T>(fn: () => T): T {
  const d = getDb();
  d.exec('BEGIN');
  try {
    const res = fn();
    d.exec('COMMIT');
    return res;
  } catch (e) {
    d.exec('ROLLBACK');
    throw e;
  }
}

export function closeDb() {
  if (db) {
    db.close();
  }
}
