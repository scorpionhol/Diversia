import nodemailer from 'nodemailer';
import { getPool } from '../config/mysql.js';
export const sentEmails = [];

export const getSentEmails = (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer')) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ data: sentEmails });
};

export const sendEmail = async (req, res) => {
  const { to, subject, html, text } = req.body;
  if (!to || (!html && !text)) return res.status(400).json({ error: 'Missing email fields' });

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromAddress = process.env.FROM_EMAIL || process.env.COMPANY_EMAIL || (smtpUser ? smtpUser : `diversiahermm@gmail.com`);

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    console.warn('SMTP not configured, using Ethereal test account for preview');
    try {
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });

      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject: subject || 'Réponse de Diversia',
        text: text || undefined,
        html: html || undefined
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) || null;
      sentEmails.unshift({ id: sentEmails.length + 1, to, subject, text, html, sent: false, previewUrl, createdAt: new Date() });
      return res.json({ data: { sent: false, preview: true, previewUrl } });
    } catch (e) {
      console.warn('Ethereal preview failed, falling back to console log', e.message);
      console.log('--- Email draft ---');
      console.log('From:', fromAddress);
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Text:', text);
      console.log('HTML:', html);
      console.log('--- End draft ---');
      sentEmails.unshift({ id: sentEmails.length + 1, to, subject, text, html, sent: false, createdAt: new Date() });
      return res.json({ data: { sent: false, preview: true } });
    }
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465, // true for 465, false for others
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: subject || 'Réponse de Diversia',
      text: text || undefined,
      html: html || undefined
    });

    // store sent email record
    sentEmails.unshift({ id: sentEmails.length + 1, to, subject, text, html, sent: true, messageId: info.messageId, createdAt: new Date() });

    // nothing else here

    // add an operation record
    try {
      const { addOperation } = await import('./operationsController.js');
      addOperation({ action: 'send_email', user: req.user?.email || 'admin', module: 'mail', details: `Email sent to ${to}`, timestamp: new Date() });
    } catch (e) {
      console.warn('addOperation failed after sending email', e.message);
    }

    res.json({ data: { sent: true, messageId: info.messageId } });
  } catch (err) {
    console.error('Failed to send email:', err.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
};

export default sendEmail;
