export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Resource not found' });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
};
