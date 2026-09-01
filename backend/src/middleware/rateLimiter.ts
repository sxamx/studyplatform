import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory rate limiting stores (IP based)
const authStore = new Map<string, RateLimitRecord>();
const apiStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of authStore.entries()) {
    if (now > record.resetTime) authStore.delete(ip);
  }
  for (const [ip, record] of apiStore.entries()) {
    if (now > record.resetTime) apiStore.delete(ip);
  }
}, 10 * 60 * 1000);

/**
 * Rate Limiter for Authentication routes (Login / Register)
 * Max 15 attempts per 15 minutes per IP to prevent brute-force attacks
 */
export const authRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 15;

  const record = authStore.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count++;
  }

  authStore.set(ip, record);

  res.setHeader('X-RateLimit-Limit', maxAttempts.toString());
  res.setHeader('X-RateLimit-Remaining', Math.max(0, maxAttempts - record.count).toString());
  res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000).toString());

  if (record.count > maxAttempts) {
    return res.status(429).json({
      error: 'Demasiados intentos de acceso desde esta IP. Por seguridad, espera 15 minutos antes de reintentar.',
      retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
    });
  }

  next();
};

/**
 * General API Rate Limiter
 * Max 200 requests per minute per IP to prevent DoS / resource starvation
 */
export const generalRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 200;

  const record = apiStore.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count++;
  }

  apiStore.set(ip, record);

  if (record.count > maxRequests) {
    return res.status(429).json({
      error: 'Límite de peticiones excedido. Por favor reduce la frecuencia de consultas.',
      retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
    });
  }

  next();
};
