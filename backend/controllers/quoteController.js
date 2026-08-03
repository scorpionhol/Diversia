const quotes = [];

export const createQuote = (req, res) => {
  const { name, email, projectType, budget } = req.body;
  if (!name || !email || !projectType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const record = { id: quotes.length + 1, name, email, projectType, budget: budget || null, createdAt: new Date() };
  quotes.push(record);
  res.status(201).json({ data: record });
};
