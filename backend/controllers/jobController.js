import { getPool } from '../config/mysql.js';

export let jobs = [
  {
    id: 1,
    title: 'Ingénieur Électricien Industriel Sénior',
    title_en: 'Senior Industrial Electrical Engineer',
    description: 'Sous la direction du directeur technique, vous piloterez le dimensionnement des installations MT/BT, la validation des schémas unifilaires et la mise en service sur les sites miniers du Katanga.',
    description_en: 'Under the direction of the technical director, you will drive the design of MV/LV installations, validate single-line diagrams, and handle commissioning on mine sites in Katanga.',
    location: 'Lubumbashi',
    type: 'CDI',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: 2,
    title: 'Technicien Maintenance Groupes Électrogènes',
    title_en: 'Generator Maintenance Technician',
    description: 'Assurer la maintenance préventive et corrective de notre parc de groupes électrogènes (Caterpillar, Cummins). Astreintes régulières.',
    description_en: 'Ensure preventive and corrective maintenance of our generator fleet (Caterpillar, Cummins). Regular on-call shifts.',
    location: 'Kolwezi',
    type: 'CDI',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 3,
    title: 'Automaticien de Procédés SCADA',
    title_en: 'SCADA Process Automation Specialist',
    description: 'Programmation d\'automates Siemens S7-1500 / Schneider Electric et développement d\'interfaces IHM/WinCC pour nos clients industriels.',
    description_en: 'Programming of Siemens S7-1500 / Schneider Electric PLCs and development of HMI/WinCC interfaces for our industrial clients.',
    location: 'Lubumbashi',
    type: 'CDI',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
];

export const getJobs = async (req, res) => {
  const pool = getPool();
  if (pool) {
    try {
      const [rows] = await pool.query('SELECT id, title, title_en, description, description_en, location, type, created_at FROM jobs ORDER BY created_at DESC');
      const data = rows.map(r => ({
        id: r.id,
        title: r.title,
        title_en: r.title_en || r.title,
        description: r.description,
        description_en: r.description_en || r.description,
        location: r.location,
        type: r.type,
        createdAt: r.created_at
      }));
      return res.json({ data });
    } catch (err) {
      console.warn('DB error fetching jobs:', err.message);
    }
  }

  // fallback
  const data = jobs.map(r => ({
    id: r.id,
    title: r.title,
    title_en: r.title_en || r.title,
    description: r.description,
    description_en: r.description_en || r.description,
    location: r.location,
    type: r.type,
    createdAt: r.created_at
  }));
  res.json({ data });
};

export const createJob = async (req, res) => {
  const { title, title_en, description, description_en, location, type } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Missing required fields (title, description)' });
  }

  const record = {
    id: jobs.length > 0 ? Math.max(...jobs.map(j => j.id)) + 1 : 1,
    title,
    title_en: title_en || title,
    description,
    description_en: description_en || description,
    location: location || 'Lubumbashi',
    type: type || 'CDI',
    created_at: new Date()
  };

  const pool = getPool();
  if (pool) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO jobs (title, title_en, description, description_en, location, type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [record.title, record.title_en, record.description, record.description_en, record.location, record.type, record.created_at]
      );
      if (result && result.insertId) {
        record.id = result.insertId;
      }
    } catch (err) {
      console.warn('DB error creating job:', err.message);
    }
  }

  jobs.push(record);

  // Add audit operation
  try {
    const { addOperation } = await import('./operationsController.js');
    addOperation({
      action: 'create_job',
      user: req.user?.email || 'admin',
      module: 'jobs',
      details: `Nouvelle offre d'emploi créée : "${title}"`,
      timestamp: new Date()
    });
  } catch (e) {
    console.warn('addOperation failed', e.message);
  }

  res.status(201).json({ data: record });
};

export const updateJob = async (req, res) => {
  const id = Number(req.params.id);
  const { title, title_en, description, description_en, location, type } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const pool = getPool();
  if (pool) {
    try {
      await pool.execute(
        'UPDATE jobs SET title = ?, title_en = ?, description = ?, description_en = ?, location = ?, type = ? WHERE id = ?',
        [title, title_en || null, description, description_en || null, location || 'Lubumbashi', type || 'CDI', id]
      );
    } catch (err) {
      console.warn('DB error updating job:', err.message);
    }
  }

  const job = jobs.find(j => j.id === id);
  if (job) {
    job.title = title;
    job.title_en = title_en || title;
    job.description = description;
    job.description_en = description_en || description;
    job.location = location || 'Lubumbashi';
    job.type = type || 'CDI';
  } else if (!pool) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Add audit operation
  try {
    const { addOperation } = await import('./operationsController.js');
    addOperation({
      action: 'update_job',
      user: req.user?.email || 'admin',
      module: 'jobs',
      details: `Offre d'emploi "${title}" modifiée (ID: ${id})`,
      timestamp: new Date()
    });
  } catch (e) {
    console.warn('addOperation failed', e.message);
  }

  res.json({ data: { id, title, title_en, description, description_en, location, type } });
};

export const deleteJob = async (req, res) => {
  const id = Number(req.params.id);

  const pool = getPool();
  let found = false;
  if (pool) {
    try {
      const [result] = await pool.execute('DELETE FROM jobs WHERE id = ?', [id]);
      if (result && result.affectedRows > 0) {
        found = true;
      }
    } catch (err) {
      console.warn('DB error deleting job:', err.message);
    }
  }

  const idx = jobs.findIndex(j => j.id === id);
  if (idx !== -1) {
    jobs.splice(idx, 1);
    found = true;
  }

  if (!found) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Add audit operation
  try {
    const { addOperation } = await import('./operationsController.js');
    addOperation({
      action: 'delete_job',
      user: req.user?.email || 'admin',
      module: 'jobs',
      details: `Offre d'emploi supprimée (ID: ${id})`,
      timestamp: new Date()
    });
  } catch (e) {
    console.warn('addOperation failed', e.message);
  }

  res.json({ success: true, message: `Job ${id} deleted` });
};
