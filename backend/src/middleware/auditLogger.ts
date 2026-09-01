import { Request, Response, NextFunction } from 'express';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  ip: string;
  userAgent?: string;
  error?: string;
}

// In-memory circular buffer of the last 300 logs
const MAX_LOGS = 300;
const logBuffer: AuditLogEntry[] = [];

export const getAuditLogs = (): AuditLogEntry[] => {
  return [...logBuffer];
};

export const clearAuditLogs = (): void => {
  logBuffer.length = 0;
};

export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const reqId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';

  // Hook into response finish event
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const entry: AuditLogEntry = {
      id: reqId,
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs,
      ip,
      userAgent: req.get('user-agent')?.substring(0, 120),
    };

    // Keep within buffer limit
    if (logBuffer.length >= MAX_LOGS) {
      logBuffer.shift();
    }
    logBuffer.push(entry);
  });

  next();
};
