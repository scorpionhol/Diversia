import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getPool } from '../config/mysql.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const remoteIp = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const storedAttempt = loginAttempts.get(remoteIp) || { count: 0, firstAttemptAt: now };
  const attempt = now - storedAttempt.firstAttemptAt > LOGIN_WINDOW_MS ? { count: 0, firstAttemptAt: now } : storedAttempt;

  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    return res.status(429).json({ error: 'Too many login attempts. Please try again later.' });
  }

  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'Authentication service not configured.' });
  }

  const pool = getPool();
  if (pool) {
    try {
      const [rows] = await pool.execute('SELECT id, email, password_hash, role FROM admins WHERE email = ?', [email]);
      if (rows.length !== 1) {
        attempt.count += 1;
        loginAttempts.set(remoteIp, attempt);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const admin = rows[0];
      const passwordMatch = await bcrypt.compare(password, admin.password_hash);
      if (!passwordMatch) {
        attempt.count += 1;
        loginAttempts.set(remoteIp, attempt);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      loginAttempts.delete(remoteIp);
      const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role || 'admin' }, JWT_SECRET, { expiresIn: '8h' });
      return res.json({ data: { id: admin.id, email: admin.email, token } });
    } catch (err) {
      console.error('Admin login DB error:', err.message);
      return res.status(500).json({ error: 'Unable to process login request.' });
    }
  }
  // DB pool not available — require DB-based admin accounts
  return res.status(500).json({ error: 'Authentication requires a configured database. Please configure MySQL.' });
};
