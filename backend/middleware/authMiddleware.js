import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

export const authenticate = (req, res, next) => {
  const auth = req.headers.authorization || '';
  if (!SECRET) {
    return res.status(500).json({ error: 'Authentication service not configured.' });
  }
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.slice(7);

  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export default authenticate;
