import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getDb } from '../database/db';
import { config } from '../config/index';
import { RegisterSchema, LoginSchema, ThemeSchema } from '../schemas/auth.schema';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  static async register(req: Request, res: Response) {
    const validated = RegisterSchema.parse(req.body);
    const db = getDb();
    const email = validated.email.toLowerCase();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(validated.password, salt);
    const id = crypto.randomUUID();
    const role = email === config.adminEmail ? 'ADMIN' : 'USER';
    const fullName = validated.fullName || email.split('@')[0];

    db.prepare(
      'INSERT INTO users (id, email, password_hash, full_name, role, theme_preference) VALUES (?, ?, ?, ?, ?, "light")'
    ).run(id, email, passwordHash, fullName, role);

    const token = jwt.sign(
      { id, email, role, fullName, themePreference: 'light' },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.status(201).json({
      user: { id, email, fullName, role, themePreference: 'light' },
      token,
    });
  }

  static async login(req: Request, res: Response) {
    const validated = LoginSchema.parse(req.body);
    const db = getDb();
    const email = validated.email.toLowerCase();

    const user = db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(email) as any;
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = bcrypt.compareSync(validated.password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, fullName: user.full_name, themePreference: user.theme_preference },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        themePreference: user.theme_preference,
      },
      token,
      expiresIn: 604800,
    });
  }

  static async me(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const db = getDb();
    const user = db.prepare('SELECT id, email, full_name, role, theme_preference, created_at, last_login_at FROM users WHERE id = ?').get(req.user.id) as any;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      themePreference: user.theme_preference,
      createdAt: user.created_at,
    });
  }

  static async updateTheme(req: AuthRequest, res: Response) {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { themePreference } = ThemeSchema.parse(req.body);
    const db = getDb();

    db.prepare('UPDATE users SET theme_preference = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(themePreference, req.user.id);

    res.status(200).json({ themePreference });
  }
}
