export const notifications = [];

export const addNotification = (notif) => {
  const n = {
    id: notifications.length + 1,
    type: notif.type || 'info',
    message: notif.message || '',
    referenceId: notif.referenceId || null,
    read: false,
    createdAt: new Date()
  };
  notifications.unshift(n);
  return n;
};

export const getNotifications = (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer')) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ data: notifications });
};

export const ackNotification = (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer')) return res.status(401).json({ error: 'Unauthorized' });
  const id = Number(req.params.id);
  const n = notifications.find(x => x.id === id);
  if (!n) return res.status(404).json({ error: 'Not found' });
  n.read = true;
  res.json({ data: n });
};
