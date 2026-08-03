import { getPool } from '../config/mysql.js';
import { readJsonStore, writeJsonStore } from '../utils/fileStore.js';

const defaultOps = [
  { id: 1, action: 'update_config', user: 'system', module: 'auth', timestamp: Date.now() - 1000 * 60 * 60, details: 'Mise à jour de la configuration de session' },
  { id: 2, action: 'deploy_release', user: 'deploy_bot', module: 'deployment', timestamp: Date.now() - 1000 * 60 * 30, details: 'Déploiement v1.2.0' }
];

const operations = readJsonStore('operations', defaultOps);

export const getOperations = async (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer')) return res.status(401).json({ error: 'Unauthorized' });

  const pool = getPool();
  if (pool) {
    try {
      const [rows] = await pool.query('SELECT id, action, user, module, details, timestamp FROM operations ORDER BY timestamp DESC LIMIT 200');
      const data = rows.map((r) => ({
        id: r.id,
        action: r.action,
        user: r.user,
        module: r.module,
        details: r.details,
        timestamp: r.timestamp
      }));
      return res.json({ data });
    } catch (err) {
      console.warn('DB error fetching operations:', err.message);
      // fallback to in-memory
    }
  }

  res.json({ data: operations });
};

export const addOperation = async (op) => {
  const pool = getPool();
  const record = {
    id: operations.length + 1,
    action: op.action,
    user: op.user || 'system',
    module: op.module || null,
    details: op.details || null,
    timestamp: op.timestamp || new Date()
  };

  if (pool) {
    try {
      const sql = 'INSERT INTO operations (action, user, module, details, timestamp) VALUES (?, ?, ?, ?, ?)';
      await pool.execute(sql, [record.action, record.user, record.module, record.details, record.timestamp]);
      return;
    } catch (err) {
      console.warn('Failed to persist operation to DB:', err.message);
    }
  }
  operations.unshift(record);
  writeJsonStore('operations', operations);
};
