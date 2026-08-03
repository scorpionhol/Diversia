import { getPool } from '../config/mysql.js';
import { readJsonStore, writeJsonStore } from '../utils/fileStore.js';
import { addNotification } from './notificationsController.js';
import { addMessage } from './messagesController.js';
import { addOperation } from './operationsController.js';
import { sendContactEmails, getEmailPreview } from '../utils/email.js';

export let contacts = readJsonStore('contacts', []);

export const createContact = async (req, res) => {
  const { name, email, phone, company, sector, urgency, services, message, code } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const isUrgent = (urgency && String(urgency).toLowerCase() === 'urgent') || (urgency && String(urgency).toLowerCase() === 'haute') || /\burgent\b/i.test(message);
  const status = isUrgent ? 'urgent' : 'new';

  const record = {
    id: contacts.length + 1,
    name,
    email,
    phone: phone || null,
    company: company || null,
    sector: sector || null,
    code: code || null,
    urgency: urgency || null,
    services: services || [],
    message,
    status,
    adminNotes: null,
    createdAt: new Date()
  };

  // Try persist to DB if available
  const pool = getPool();
  if (pool) {
    try {
      const sql = 'INSERT INTO contacts (name, email, phone, company, sector, urgency, services, message, status, admin_notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      const params = [
        name,
        email,
        phone || null,
        company || null,
        sector || null,
        urgency || null,
        JSON.stringify(services || []),
        message,
        status,
        null,
        new Date()
      ];
      const [result] = await pool.execute(sql, params);
      if (result && result.insertId) {
        record.id = result.insertId;
      }
    } catch (err) {
      console.warn('Failed to persist contact to DB:', err.message);
    }
  }
  contacts.push(record);
  writeJsonStore('contacts', contacts);
  try {
    addMessage(record);
  } catch (e) {
    console.warn('addMessage failed', e.message);
  }

  // Create an audit operation
  try {
    addOperation({
      action: 'create_request',
      user: 'public',
      module: 'contact',
      details: record.company ? `Demande de ${record.name} (${record.company})` : `Demande de ${record.name}`,
      timestamp: new Date()
    });
  } catch (e) {
    console.warn('addOperation failed', e.message);
  }

  // Create a notification for admins if urgent
  if (record.status === 'urgent') {
    try {
      addNotification({ type: 'urgent_request', message: `Nouvelle demande urgente de ${record.name}`, referenceId: record.id });
    } catch (e) {
      console.warn('addNotification failed', e.message);
    }
  }
  // Attempt to send confirmation email to client and notification to admin
  let emailResult = null;
  try {
    emailResult = await sendContactEmails(record);
  } catch (e) {
    console.warn('sendContactEmails failed', e.message);
    emailResult = { error: e.message };
  }

  // Include a preview of the emails in the response for debugging
  const emailPreview = getEmailPreview(record);

  res.status(201).json({ data: record, emailResult, emailPreview });
};
