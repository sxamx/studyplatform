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
