import fs from 'fs';
import path from 'path';
import { getPool } from '../config/mysql.js';

export const applications = [];

const UPLOADS_DIR = 'uploads/cv';

export const createApplication = async (req, res) => {
  const { name, email, phone, jobId, message, fileData, fileName } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Missing required fields (name, email)' });
  }

  let savedFilePath = null;
  let savedFileName = fileName || null;

  // Process fileData if present (base64 format)
  if (fileData && fileName) {
    try {
      const cleanBase64 = fileData.replace(/^data:application\/pdf;base64,/, "");
      const buffer = Buffer.from(cleanBase64, 'base64');
      const uniqueName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
      const relativePath = path.join(UPLOADS_DIR, uniqueName);
      const absolutePath = path.resolve(relativePath);

      // ensure directory exists
      const dirPath = path.dirname(absolutePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      await fs.promises.writeFile(absolutePath, buffer);
      savedFilePath = uniqueName;
      savedFileName = fileName;
      console.info(`Saved CV to disk: ${savedFilePath}`);
    } catch (e) {
      console.warn('Failed to save CV file to disk:', e.message);
    }
  }

  const record = {
    id: applications.length + 1,
    jobId: jobId ? Number(jobId) : null,
    name,
    email,
    phone: phone || null,
    message: message || null,
    filePath: savedFilePath,
    fileName: savedFileName,
    createdAt: new Date()
  };

  const pool = getPool();
  if (pool) {
    try {
      const sql = 'INSERT INTO applications (job_id, name, email, phone, message, file_path, file_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      const params = [
        record.jobId,
        record.name,
        record.email,
        record.phone,
        record.message,
        record.filePath,
        record.fileName,
        record.createdAt
      ];
      const [result] = await pool.execute(sql, params);
      if (result && result.insertId) {
        record.id = result.insertId;
      }
    } catch (err) {
      console.warn('Failed to persist application to DB:', err.message);
    }
  }

  applications.push(record);

  // Add audit operation
  try {
    const { addOperation } = await import('./operationsController.js');
    addOperation({
      action: 'create_application',
      user: 'public',
      module: 'careers',
      details: `Nouvelle candidature de ${name} pour le poste #${jobId || 'Spontanée'}`,
      timestamp: new Date()
    });
  } catch (e) {
    console.warn('addOperation failed', e.message);
  }

  // Add notification
  try {
    const { addNotification } = await import('./notificationsController.js');
    addNotification({
      type: 'job_application',
      message: `Nouvelle candidature reçue de ${name}`,
      referenceId: record.id
    });
  } catch (e) {
    console.warn('addNotification failed', e.message);
  }

  res.status(201).json({ data: record });
};

export const getApplications = async (req, res) => {
  const pool = getPool();
  if (pool) {
    try {
      const [rows] = await pool.query('SELECT id, job_id AS jobId, name, email, phone, message, file_path AS filePath, file_name AS fileName, created_at AS createdAt FROM applications ORDER BY created_at DESC');
      return res.json({ data: rows });
    } catch (err) {
      console.warn('DB error fetching applications:', err.message);
    }
  }

  res.json({ data: applications });
};

export const downloadApplicationCv = (req, res) => {
  const id = Number(req.params.id);
  
  let app = applications.find(x => x.id === id);
  
  // if not found in memory, try fetching from DB if available
  const pool = getPool();
  if (pool && !app) {
    // we can return error or look at the path from DB if needed,
    // but in normal flows memory array tracks it too. Let's write DB check:
    return pool.query('SELECT file_path AS filePath, file_name AS fileName FROM applications WHERE id = ?', [id])
      .then(([rows]) => {
        if (rows.length > 0 && rows[0].filePath) {
          const filePath = path.resolve(rows[0].filePath);
          if (fs.existsSync(filePath)) {
            return res.download(filePath, rows[0].fileName || 'cv.pdf');
          }
        }
        res.status(404).json({ error: 'CV file not found on server' });
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  }

  if (!app || !app.filePath) {
    return res.status(404).json({ error: 'Application or CV not found' });
  }

  const filePath = path.resolve(app.filePath);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'CV file not found on disk' });
  }

  res.download(filePath, app.fileName || 'cv.pdf');
};

export const deleteApplication = async (req, res) => {
  const id = Number(req.params.id);

  const pool = getPool();
  let found = false;
  
  // Try delete file
  let app = applications.find(x => x.id === id);
  if (app && app.filePath) {
    try {
      const absolutePath = path.resolve(app.filePath);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    } catch (e) {
      console.warn('Failed to delete CV file from disk:', e.message);
    }
  }

  if (pool) {
    try {
      const [result] = await pool.execute('DELETE FROM applications WHERE id = ?', [id]);
      if (result && result.affectedRows > 0) {
        found = true;
      }
    } catch (err) {
      console.warn('DB error deleting application:', err.message);
    }
  }

  const idx = applications.findIndex(x => x.id === id);
  if (idx !== -1) {
    applications.splice(idx, 1);
    found = true;
  }

  if (!found) {
    return res.status(404).json({ error: 'Application not found' });
  }

  res.json({ success: true, message: `Application ${id} deleted` });
};
