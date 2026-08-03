import { getPool } from '../config/mysql.js';

export const homeTexts = {
  hero_title_accent: {
    fr: 'Maintenance Industrielle',
    en: 'Industrial Maintenance'
  },
  hero_desc: {
    fr: 'DIVERSIA SARL accompagne la croissance des industries, mines, complexes hôteliers et tertiaires en RDC avec des systèmes électriques de pointe, des automatismes agiles et des installations solaires durables.',
    en: 'DIVERSIA SARL supports the growth of industries, mines, hotel and service sectors in the DRC with state-of-the-art electrical systems, agile automation, and sustainable solar installations.'
  },
  about_intro: {
    fr: 'DIVERSIA SARL est une société de droit congolais constituée de professionnels passionnés par le génie électrique et l\'assistance technique. Nous offrons des solutions clé en main qui combinent innovation technologique, exigences environnementales et efficacité économique.',
    en: 'DIVERSIA SARL is a Congolese law company consisting of professionals passionate about electrical engineering and technical assistance. We offer turn-key solutions combining technological innovation, environmental requirements, and economic efficiency.'
  }
};

export const getTexts = async (req, res) => {
  const pool = getPool();
  if (pool) {
    try {
      const [rows] = await pool.query('SELECT key_name, content_fr, content_en FROM texts');
      const data = {};
      rows.forEach(r => {
        data[r.key_name] = {
          fr: r.content_fr,
          en: r.content_en || r.content_fr
        };
      });
      // Merge with default keys if missing
      Object.keys(homeTexts).forEach(k => {
        if (!data[k]) {
          data[k] = homeTexts[k];
        }
      });
      return res.json({ data });
    } catch (err) {
      console.warn('DB error fetching texts:', err.message);
    }
  }

  res.json({ data: homeTexts });
};

export const updateText = async (req, res) => {
  const { key_name, content_fr, content_en } = req.body;
  if (!key_name || !content_fr) {
    return res.status(400).json({ error: 'Missing required fields (key_name, content_fr)' });
  }

  const pool = getPool();
  if (pool) {
    try {
      await pool.execute(
        'INSERT INTO texts (key_name, content_fr, content_en) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE content_fr = ?, content_en = ?',
        [key_name, content_fr, content_en || null, content_fr, content_en || null]
      );
    } catch (err) {
      console.warn('DB error updating text:', err.message);
    }
  }

  if (homeTexts[key_name]) {
    homeTexts[key_name].fr = content_fr;
    homeTexts[key_name].en = content_en || content_fr;
  } else {
    homeTexts[key_name] = {
      fr: content_fr,
      en: content_en || content_fr
    };
  }

  // Add audit operation
  try {
    const { addOperation } = await import('./operationsController.js');
    addOperation({
      action: 'update_text',
      user: req.user?.email || 'admin',
      module: 'config',
      details: `Texte d'accueil modifié pour la clé : "${key_name}"`,
      timestamp: new Date()
    });
  } catch (e) {
    console.warn('addOperation failed', e.message);
  }

  res.json({ data: { key_name, content_fr, content_en } });
};
