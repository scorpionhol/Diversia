import { readJsonStore, writeJsonStore } from '../utils/fileStore.js';

export const chatMessages = readJsonStore('chat', []);

export const addChatMessage = (msg) => {
  const record = {
    id: chatMessages.length + 1,
    sessionId: msg.sessionId || `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    author: msg.author || 'client',
    name: msg.name || null,
    email: msg.email || null,
    text: msg.text || '',
    status: msg.status || 'new',
    createdAt: msg.createdAt || new Date()
  };
  chatMessages.push(record);
  writeJsonStore('chat', chatMessages);
  return record;
};

export const getChatMessages = async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId && !req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const data = sessionId
    ? chatMessages.filter((message) => message.sessionId === sessionId)
    : chatMessages;
  res.json({ data });
};

export const getChatSessions = async (req, res) => {
  const sessions = {};
  chatMessages.forEach((message) => {
    if (!sessions[message.sessionId]) {
      sessions[message.sessionId] = {
        sessionId: message.sessionId,
        name: message.name || `Client ${message.sessionId.slice(-4)}`,
        email: message.email || null,
        lastText: message.text,
        lastAt: message.createdAt,
        unreadFromClient: 0
      };
    }
    const session = sessions[message.sessionId];
    if (new Date(message.createdAt) > new Date(session.lastAt)) {
      session.lastAt = message.createdAt;
      session.lastText = message.text;
    }
    if (message.author === 'client') {
      session.unreadFromClient += 1;
    }
  });

  const list = Object.values(sessions).sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));
  res.json({ data: list });
};

export const createChatMessage = async (req, res) => {
  const { sessionId, name, email, text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Missing text' });
  }

  const record = addChatMessage({ sessionId, author: 'client', name, email, text, createdAt: new Date() });
  res.status(201).json({ data: record });
};

export const createAdminChatMessage = async (req, res) => {
  const { sessionId, text } = req.body;
  if (!sessionId || !text) {
    return res.status(400).json({ error: 'Missing sessionId or text' });
  }

  const sessionInfo = chatMessages.find((msg) => msg.sessionId === sessionId && msg.email);
  const recipients = sessionInfo ? [sessionInfo.email] : [];
  const record = addChatMessage({ sessionId, author: 'admin', name: 'Diversia', email: null, text, createdAt: new Date(), status: 'answered' });

  if (recipients.length > 0) {
    try {
      const { sendAdminChatReplyEmail } = await import('../utils/email.js');
      const emailResult = await sendAdminChatReplyEmail({ name: sessionInfo.name, email: recipients[0], text });
      if (emailResult.error) {
        console.warn(`Admin chat reply email failed for session ${sessionId}:`, emailResult.error);
      }
    } catch (e) {
      console.warn('sendAdminChatReplyEmail failed', e.message);
    }
  }

  res.status(201).json({ data: record });
};
