import { Response } from 'express';
import crypto from 'crypto';
import { getDb, transaction } from '../database/db';
import { AuthRequest } from '../middleware/auth';

export class MarketplaceController {
  static async getAll(req: AuthRequest, res: Response) {
    const { search, maxPrice } = req.query;
    const db = getDb();

    let query = `
      SELECT mc.*, c.slug as course_slug, (SELECT COUNT(*) FROM lessons WHERE course_id = mc.course_id) as total_lessons, u.full_name as creator_name
      FROM marketplace_courses mc
      JOIN courses c ON c.id = mc.course_id
      LEFT JOIN users u ON u.id = mc.creator_id
      WHERE mc.is_active = 1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (mc.title LIKE ? OR mc.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      query += ` AND mc.price <= ?`;
      params.push(Number(maxPrice));
    }

    query += ` ORDER BY mc.published_at DESC`;

    const listings = db.prepare(query).all(...params) as any[];

    res.status(200).json({
      courses: listings.map((l) => ({
        id: l.id,
        courseId: l.course_id,
        title: l.title,
        description: l.description,
        thumbnailUrl: l.thumbnail_url,
        price: Number(l.price),
        currency: l.currency,
        purchaseCount: Number(l.purchase_count || 0),
        averageRating: Number(l.average_rating || 5.0),
        totalLessons: Number(l.total_lessons || 0),
        creatorName: l.creator_name || 'Profesor Destacado',
        publishedAt: l.published_at,
      })),
    });
  }

  static async getById(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const userId = req.user?.id;
    const db = getDb();

    const listing = db.prepare(`
      SELECT mc.*, c.slug as course_slug, (SELECT COUNT(*) FROM lessons WHERE course_id = mc.course_id) as total_lessons, u.full_name as creator_name
      FROM marketplace_courses mc
      JOIN courses c ON c.id = mc.course_id
      LEFT JOIN users u ON u.id = mc.creator_id
      WHERE mc.id = ?
    `).get(id) as any;

    if (!listing) {
      return res.status(404).json({ error: 'Curso no encontrado en el Marketplace' });
    }

    // Check if user already purchased
    let isPurchased = false;
    if (userId) {
      const purchase = db.prepare('SELECT id FROM marketplace_purchases WHERE user_id = ? AND marketplace_course_id = ?').get(userId, id);
      isPurchased = Boolean(purchase);
    }

    // Get reviews
    const reviews = db.prepare(`
      SELECT mr.*, u.full_name as user_name
      FROM marketplace_reviews mr
      JOIN users u ON u.id = mr.user_id
      WHERE mr.marketplace_course_id = ?
      ORDER BY mr.created_at DESC
      LIMIT 20
    `).all(id) as any[];

    res.status(200).json({
      id: listing.id,
      courseId: listing.course_id,
      title: listing.title,
      description: listing.description,
      thumbnailUrl: listing.thumbnail_url,
      price: Number(listing.price),
      currency: listing.currency,
      purchaseCount: Number(listing.purchase_count || 0),
      averageRating: Number(listing.average_rating || 5.0),
      totalLessons: Number(listing.total_lessons || 0),
      creatorName: listing.creator_name || 'Profesor Destacado',
      publishedAt: listing.published_at,
      isPurchased,
      reviews: reviews.map((r) => ({
        id: r.id,
        userId: r.user_id,
        userName: r.user_name || 'Estudiante',
        rating: r.rating,
        reviewText: r.review_text,
        createdAt: r.created_at,
      })),
    });
  }

  static async createListing(req: AuthRequest, res: Response) {
    const { courseId, title, description, price, currency, thumbnailUrl } = req.body;
    if (!courseId || !title) {
      return res.status(400).json({ error: 'courseId y title son obligatorios' });
    }

    const db = getDb();
    const id = crypto.randomUUID();
    const creatorId = req.user?.id || null;

    db.prepare(`
      INSERT INTO marketplace_courses (id, course_id, creator_id, title, description, thumbnail_url, price, currency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      courseId,
      creatorId,
      title,
      description || '',
      thumbnailUrl || '',
      price !== undefined ? Number(price) : 0.0,
      currency || 'USD'
    );

    res.status(201).json({ id, courseId, title, price: price || 0, currency: currency || 'USD' });
  }

  static async buyCourse(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'No autorizado' });

    const db = getDb();
    const listing = db.prepare('SELECT * FROM marketplace_courses WHERE id = ?').get(id) as any;
    if (!listing) return res.status(404).json({ error: 'Curso no encontrado' });

    const alreadyBought = db.prepare('SELECT id FROM marketplace_purchases WHERE user_id = ? AND marketplace_course_id = ?').get(userId, id);
    if (alreadyBought) {
      return res.status(400).json({ error: 'Ya tienes acceso a este curso' });
    }

    transaction(() => {
      const purchaseId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO marketplace_purchases (id, user_id, marketplace_course_id, price_paid, currency)
        VALUES (?, ?, ?, ?, ?)
      `).run(purchaseId, userId, id, listing.price, listing.currency);

      db.prepare('UPDATE marketplace_courses SET purchase_count = purchase_count + 1 WHERE id = ?').run(id);

      // Add to user course preferences as in_progress
      const prefId = crypto.randomUUID();
      db.prepare(`
        INSERT OR REPLACE INTO user_course_preferences (id, user_id, course_id, status)
        VALUES (?, ?, ?, 'in_progress')
      `).run(prefId, userId, listing.course_id);
    });

    res.status(200).json({ message: 'Inscripción realizada con éxito', courseId: listing.course_id });
  }

  static async addReview(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { rating, reviewText } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'No autorizado' });

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'La calificación debe ser entre 1 y 5 estrellas' });
    }

    const db = getDb();
    const reviewId = crypto.randomUUID();

    transaction(() => {
      db.prepare(`
        INSERT OR REPLACE INTO marketplace_reviews (id, marketplace_course_id, user_id, rating, review_text)
        VALUES (?, ?, ?, ?, ?)
      `).run(reviewId, id, userId, Number(rating), reviewText || '');

      // Recalculate average rating
      const avg = db.prepare('SELECT AVG(rating) as avg_r FROM marketplace_reviews WHERE marketplace_course_id = ?').get(id) as any;
      const newAvg = avg?.avg_r ? Number(avg.avg_r).toFixed(2) : rating;
      db.prepare('UPDATE marketplace_courses SET average_rating = ? WHERE id = ?').run(Number(newAvg), id);
    });

    res.status(201).json({ message: 'Reseña publicada con éxito' });
  }

  static async getMyPurchases(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'No autorizado' });

    const db = getDb();
    const purchases = db.prepare(`
      SELECT mp.*, mc.title as course_title, mc.description as course_description, mc.thumbnail_url, mc.course_id
      FROM marketplace_purchases mp
      JOIN marketplace_courses mc ON mc.id = mp.marketplace_course_id
      WHERE mp.user_id = ?
      ORDER BY mp.purchased_at DESC
    `).all(userId) as any[];

    res.status(200).json({ purchases });
  }
}
