const projects = [
  { id: 1, name: 'Landing page redesign', status: 'published' },
  { id: 2, name: 'CRM integration', status: 'in progress' }
];

export const getProjects = (req, res) => {
  res.json({ data: projects });
};
