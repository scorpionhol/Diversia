import { readJsonStore, writeJsonStore } from '../utils/fileStore.js';

export const messages = readJsonStore('messages', []);

export const addMessage = (msg) => {
  const record = {
    id: messages.length + 1,
    name: msg.name || null,
    email: msg.email || null,
    phone: msg.phone || null,
    company: msg.company || null,
    sector: msg.sector || null,
    services: msg.services || [],
    message: msg.message || msg.text || null,
    status: msg.status || 'inbound',
    createdAt: msg.createdAt || new Date()
  };
  messages.unshift(record);
  writeJsonStore('messages', messages);
  return record;
};

export const getMessages = async (req, res) => {
  res.json({ data: messages });
};

export default getMessages;
