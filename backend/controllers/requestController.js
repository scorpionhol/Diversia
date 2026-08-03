import { contacts } from './contactController.js';
import { getPool } from '../config/mysql.js';
import { writeJsonStore } from '../utils/fileStore.js';

export const getRequests = async (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer')) return res.status(401).json({ error: 'Unauthorized' });

  const pool = getPool();
  if (pool) {
    try {
      const [rows] = await pool.query('SELECT id, name, email, phone, company, sector, urgency, services, message, status, admin_notes, created_at FROM contacts ORDER BY created_at DESC');
      const data = rows.map((r) => {
        let parsedServices = [];
        try {
          parsedServices = typeof r.services === 'string' ? JSON.parse(r.services) : (r.services || []);
        } catch (e) {
          parsedServices = r.services ? [r.services] : [];
        }
        return {
          id: r.id,
          title: r.company || (r.message ? String(r.message).slice(0, 60) : 'Demande'),
          name: r.name,
          email: r.email,
          phone: r.phone || null,
          company: r.company || null,
          sector: r.sector || null,
          urgency: r.urgency || null,
          services: parsedServices,
          message: r.message,
          status: r.status || 'new',
          adminNotes: r.admin_notes || null,
          createdAt: r.created_at
        };
      });
      return res.json({ data });
    } catch (err) {
      console.warn('DB error fetching requests:', err.message);
    }
  }

  const data = contacts.map((c) => ({
    id: c.id,
    title: c.company || (c.message ? String(c.message).slice(0, 60) : 'Demande'),
    name: c.name,
    email: c.email,
    phone: c.phone || null,
    company: c.company || null,
    sector: c.sector || null,
    urgency: c.urgency || null,
    services: c.services || [],
    message: c.message,
    status: c.status || 'new',
    adminNotes: c.adminNotes || null,
    createdAt: c.createdAt
  }));

  res.json({ data });
};

export const updateRequestStatus = async (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer')) return res.status(401).json({ error: 'Unauthorized' });

  const id = Number(req.params.id);
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Missing status' });

  const pool = getPool();
  const recordUpdate = async (record) => {
    if (!record) return null;
    record.status = status;
    const { addOperation } = await import('./operationsController.js');
    addOperation({ action: 'update_request_status', user: 'admin', module: 'contact', details: `Request ${id} -> ${status}`, timestamp: new Date() });

    try {
      const { addNotification } = await import('./notificationsController.js');
      if (status === 'in_progress') {
        addNotification({ type: 'info', message: `Demande ${id} prise en charge`, referenceId: id });
      } else if (status === 'resolved') {
        addNotification({ type: 'success', message: `Demande ${id} clôturée`, referenceId: id });
      }
    } catch (e) {
      console.warn('addNotification failed', e.message);
    }

    if (status === 'in_progress' && record.email) {
      try {
        const { sendRequestInProgressEmail } = await import('../utils/email.js');
        const emailResult = await sendRequestInProgressEmail(record);
        if (emailResult.error) {
          console.warn(`Request in_progress email failed for request ${id}:`, emailResult.error);
        }
      } catch (e) {
        console.warn('sendRequestInProgressEmail failed', e.message);
      }
    }

    if (status === 'resolved' && record.email) {
      try {
        const { sendRequestResolvedEmail } = await import('../utils/email.js');
        const emailResult = await sendRequestResolvedEmail(record);
        if (emailResult.error) {
          console.warn(`Request resolved email failed for request ${id}:`, emailResult.error);
        }
      } catch (e) {
        console.warn('sendRequestResolvedEmail failed', e.message);
      }
    }

    return record;
  };

  if (pool) {
    try {
      await pool.execute('UPDATE contacts SET status = ? WHERE id = ?', [status, id]);
      const [rows] = await pool.query('SELECT id, name, email, phone, company, sector, urgency, services, message, status, admin_notes, created_at FROM contacts WHERE id = ?', [id]);
      const updated = rows[0] || null;
      await recordUpdate(updated);
      return res.json({ data: { id, status } });
    } catch (err) {
      console.warn('DB error updating request status:', err.message);
    }
  }

  const c = contacts.find(x => x.id === id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  await recordUpdate(c);
  writeJsonStore('contacts', contacts);
  res.json({ data: { id, status } });
};

export const updateRequestAdminNotes = async (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer')) return res.status(401).json({ error: 'Unauthorized' });

  const id = Number(req.params.id);
  const { notes } = req.body;

  const pool = getPool();
  if (pool) {
    try {
      await pool.execute('UPDATE contacts SET admin_notes = ? WHERE id = ?', [notes || null, id]);
      const { addOperation } = await import('./operationsController.js');
      addOperation({ action: 'update_request_notes', user: 'admin', module: 'contact', details: `Notes de la demande ${id} modifiées`, timestamp: new Date() });
      return res.json({ data: { id, adminNotes: notes } });
    } catch (err) {
      console.warn('DB error updating request notes:', err.message);
    }
  }

  const c = contacts.find(x => x.id === id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  c.adminNotes = notes || null;
  writeJsonStore('contacts', contacts);
  const { addOperation } = await import('./operationsController.js');
  addOperation({ action: 'update_request_notes', user: 'admin', module: 'contact', details: `Notes de la demande ${id} modifiées`, timestamp: new Date() });
  res.json({ data: { id, adminNotes: notes } });
};

export const deleteRequest = async (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer')) return res.status(401).json({ error: 'Unauthorized' });

  const id = Number(req.params.id);

  const pool = getPool();
  if (pool) {
    try {
      await pool.execute('DELETE FROM contacts WHERE id = ?', [id]);
      const { addOperation } = await import('./operationsController.js');
      addOperation({ action: 'delete_request', user: 'admin', module: 'contact', details: `Demande ${id} supprimée`, timestamp: new Date() });
      return res.json({ success: true, message: `Request ${id} deleted` });
    } catch (err) {
      console.warn('DB error deleting request:', err.message);
    }
  }

  const index = contacts.findIndex(x => x.id === id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  contacts.splice(index, 1);
  writeJsonStore('contacts', contacts);
  const { addOperation } = await import('./operationsController.js');
  addOperation({ action: 'delete_request', user: 'admin', module: 'contact', details: `Demande ${id} supprimée`, timestamp: new Date() });
  res.json({ success: true, message: `Request ${id} deleted` });
};
