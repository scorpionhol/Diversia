import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL,
  ADMIN_EMAIL
} = process.env;

let transporter = null;
let isTestAccount = false;
let testAccount = null;

async function ensureTransporter() {
  if (transporter) return;
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
    try {
      await transporter.verify();
      return;
    } catch (e) {
      console.warn('SMTP transport verification failed — falling back to Ethereal preview or console logging.', e.message);
      transporter = null;
      isTestAccount = false;
      testAccount = null;
    }
  }

  try {
    testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    isTestAccount = true;
    console.info('Using Ethereal test account for email preview.');
  } catch (e) {
    console.warn('SMTP not configured and Ethereal account creation failed — emails will be logged to console.', e.message);
    transporter = null;
  }
}

function buildClientMessage(record) {
  const codeLineText = record.code ? `Code de confirmation: ${record.code}\n\n` : '';
  const codeLineHtml = record.code ? `<p><strong>Code de confirmation:</strong> ${record.code}</p>` : '';
  return {
    subject: `Confirmation de réception — Diversia: ${record.subject || 'Nouvelle demande'}`,
    text: `Bonjour ${record.name},\n\n${codeLineText}Merci pour votre message. Nous avons bien reçu votre demande:\n\nSujet: ${record.subject || '—'}\nMessage: ${record.message}\n\nNous reviendrons vers vous rapidement.\n\nCordialement,\nL'équipe Diversia`,
    html: `<p>Bonjour ${record.name},</p>
<p>Merci pour votre message. Nous avons bien reçu votre demande :</p>
${codeLineHtml}
<ul>
  <li><strong>Sujet:</strong> ${record.subject || '—'}</li>
  <li><strong>Message:</strong> ${record.message}</li>
  <li><strong>Urgence:</strong> ${record.urgency || 'normale'}</li>
</ul>
<p>Nous reviendrons vers vous rapidement.</p>
<p>Cordialement,<br/>L'équipe Diversia</p>`
  };
}


function buildAdminMessage(record) {
  const codeLineText = record.code ? `Code de confirmation: ${record.code}\n` : '';
  const codeLineHtml = record.code ? `<li><strong>Code:</strong> ${record.code}</li>` : '';
  return {
    subject: `Nouvelle demande sur le site — ${record.name}`,
    text: `Nouvelle demande reçue:\n\nNom: ${record.name}\nEmail: ${record.email}\n${codeLineText}Sujet: ${record.subject || '—'}\nMessage: ${record.message}\nUrgence: ${record.urgency || 'normale'}\nID: ${record.id}\n`,
    html: `<p>Nouvelle demande reçue</p>
<ul>
  <li><strong>Nom:</strong> ${record.name}</li>
  <li><strong>Email:</strong> ${record.email}</li>
  ${codeLineHtml}
  <li><strong>Sujet:</strong> ${record.subject || '—'}</li>
  <li><strong>Message:</strong> ${record.message}</li>
  <li><strong>Urgence:</strong> ${record.urgency || 'normale'}</li>
  <li><strong>ID:</strong> ${record.id}</li>
</ul>`
  };
}

function buildInProgressMessage(record) {
  const codeLineText = record.code ? `Code de confirmation: ${record.code}\n\n` : '';
  const codeLineHtml = record.code ? `<p><strong>Code de confirmation:</strong> ${record.code}</p>` : '';
  return {
    subject: `Votre demande #${record.id} est en cours de traitement — Diversia`,
    text: `Bonjour ${record.name || ''},\n\nVotre demande est maintenant prise en charge par notre service technique.\n\n${codeLineText}${record.message ? `Demande: ${record.message}\n\n` : ''}Nous vous tiendrons informé dès qu'elle sera résolue.\n\nCordialement,\nL'équipe Diversia`,
    html: `<p>Bonjour ${record.name || ''},</p>
<p>Votre demande est maintenant prise en charge par notre service technique.</p>
${codeLineHtml}
${record.message ? `<p><strong>Demande :</strong> ${record.message}</p>` : ''}
<p>Nous vous tiendrons informé dès qu'elle sera résolue.</p>
<p>Cordialement,<br/>L'équipe Diversia</p>`
  };
}

function buildResolvedMessage(record) {
  const codeLineText = record.code ? `Code de confirmation: ${record.code}\n\n` : '';
  const codeLineHtml = record.code ? `<p><strong>Code de confirmation:</strong> ${record.code}</p>` : '';
  const requestSummaryHtml = record.message ? `<p><strong>Demande :</strong> ${record.message}</p>` : '';

  return {
    subject: `Votre demande #${record.id} est résolue — Diversia`,
    text: `Bonjour ${record.name || ''},\n\nVotre demande a été résolue par notre service.\n\n${codeLineText}${record.message ? `Demande: ${record.message}\n\n` : ''}Si vous avez besoin de précisions ou d'un suivi supplémentaire, répondez simplement à cet email.\n\nCordialement,\nL'équipe Diversia`,
    html: `<p>Bonjour ${record.name || ''},</p>
<p>Votre demande a été résolue par notre service.</p>
${codeLineHtml}
${requestSummaryHtml}
<p>Si vous avez besoin de précisions ou d'un suivi supplémentaire, répondez simplement à cet email.</p>
<p>Cordialement,<br/>L'équipe Diversia</p>`
  };
}

function buildAdminChatReplyMessage(record) {
  return {
    subject: `Nouvelle réponse de Diversia à votre conversation`,
    text: `Bonjour ${record.name || ''},\n\nNotre équipe vous a répondu dans le chat :\n\n${record.text}\n\nVous pouvez revenir sur le chat pour poursuivre la conversation.\n\nCordialement,\nL'équipe Diversia`,
    html: `<p>Bonjour ${record.name || ''},</p>
<p>Notre équipe vous a répondu dans le chat :</p>
<blockquote style="padding:12px;background:#f3f4f6;border-left:4px solid #10b981;">${record.text}</blockquote>
<p>Vous pouvez revenir sur le chat pour poursuivre la conversation.</p>
<p>Cordialement,<br/>L'équipe Diversia</p>`
  };
}

export async function sendRequestInProgressEmail(record) {
  const from = process.env.FROM_EMAIL || process.env.COMPANY_EMAIL || (SMTP_USER ? SMTP_USER : 'diversiahermm@gmail.com');
  const message = buildInProgressMessage(record);
  await ensureTransporter();
  if (!transporter) {
    console.log('--- EMAIL (request in_progress) ---');
    console.log({ to: record.email, from, ...message });
    return { error: 'No transporter configured' };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to: record.email,
      subject: message.subject,
      text: message.text,
      html: message.html
    });
    const result = { sent: true, messageId: info.messageId };
    if (isTestAccount) {
      result.previewUrl = nodemailer.getTestMessageUrl(info) || null;
    }
    return result;
  } catch (e) {
    console.warn('Failed to send in_progress request email', e.message);
    return { error: e.message };
  }
}

export async function sendRequestResolvedEmail(record) {
  const from = process.env.FROM_EMAIL || process.env.COMPANY_EMAIL || (SMTP_USER ? SMTP_USER : 'diversiahermm@gmail.com');
  const message = buildResolvedMessage(record);
  await ensureTransporter();
  if (!transporter) {
    console.log('--- EMAIL (request resolved) ---');
    console.log({ to: record.email, from, ...message });
    return { error: 'No transporter configured' };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to: record.email,
      subject: message.subject,
      text: message.text,
      html: message.html
    });

    const result = { sent: true, messageId: info.messageId };
    if (isTestAccount) {
      result.previewUrl = nodemailer.getTestMessageUrl(info) || null;
    }
    return result;
  } catch (e) {
    console.warn('Failed to send resolved request email', e.message);
    return { error: e.message };
  }
}

export async function sendAdminChatReplyEmail(record) {
  const from = process.env.FROM_EMAIL || process.env.COMPANY_EMAIL || (SMTP_USER ? SMTP_USER : 'diversiahermm@gmail.com');
  const message = buildAdminChatReplyMessage(record);
  await ensureTransporter();
  if (!transporter) {
    console.log('--- EMAIL (admin chat reply) ---');
    console.log({ to: record.email, from, ...message });
    return { error: 'No transporter configured' };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to: record.email,
      subject: message.subject,
      text: message.text,
      html: message.html
    });
    const result = { sent: true, messageId: info.messageId };
    if (isTestAccount) {
      result.previewUrl = nodemailer.getTestMessageUrl(info) || null;
    }
    return result;
  } catch (e) {
    console.warn('Failed to send admin chat reply email', e.message);
    return { error: e.message };
  }
}

export async function sendContactEmails(record) {
  const from = process.env.FROM_EMAIL || process.env.COMPANY_EMAIL || (SMTP_USER ? SMTP_USER : 'diversiahermm@gmail.com');

  const clientMsg = buildClientMessage(record);
  const adminMsg = buildAdminMessage(record);

  const results = { client: null, admin: null };

  await ensureTransporter();
  if (!transporter) {
    // Log the emails so developer can inspect them locally
    console.log('--- EMAIL (client) ---');
    console.log({ to: record.email, from, ...clientMsg });
    console.log('--- EMAIL (admin) ---');
    console.log({ to: ADMIN_EMAIL || from, from, ...adminMsg });
    return results;
  }

  try {
    results.client = await transporter.sendMail({
      from,
      to: record.email,
      subject: clientMsg.subject,
      text: clientMsg.text,
      html: clientMsg.html
    });
    if (isTestAccount && results.client) {
      results.client.previewUrl = nodemailer.getTestMessageUrl(results.client) || null;
    }
  } catch (e) {
    console.warn('Failed to send client email', e.message);
    results.client = { error: e.message };
  }

  try {
    results.admin = await transporter.sendMail({
      from,
      to: ADMIN_EMAIL || from,
      subject: adminMsg.subject,
      text: adminMsg.text,
      html: adminMsg.html
    });
    if (isTestAccount && results.admin) {
      results.admin.previewUrl = nodemailer.getTestMessageUrl(results.admin) || null;
    }
  } catch (e) {
    console.warn('Failed to send admin email', e.message);
    results.admin = { error: e.message };
  }

  return results;
}

export function getEmailPreview(record) {
  const client = buildClientMessage(record);
  const admin = buildAdminMessage(record);
  return { client, admin };
}
