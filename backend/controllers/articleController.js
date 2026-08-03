import { getPool } from '../config/mysql.js';

export let articles = [
  {
    id: 1,
    title: 'Transition vers l\'énergie solaire pour les PME en RDC',
    category: 'conseils',
    excerpt: 'Découvrez les étapes clés et les avantages économiques d\'une transition solaire pour les entreprises en Afrique Centrale.',
    content: 'L\'énergie solaire photovoltaïque représente une opportunité majeure pour les PME en République Démocratique du Congo. Avec les baisses de coûts constantes sur le matériel (batteries lithium, onduleurs hybrides et panneaux) et le taux d\'ensoleillement exceptionnel de la région du Katanga, s\'équiper d\'une centrale solaire permet de stabiliser sa fourniture d\'électricité et de réduire considérablement la facture énergétique globale.\n\nDans cet article, nous passons en revue les critères de dimensionnement à respecter, les types de stockages conseillés (LiFePO4) et le retour sur investissement estimé qui se situe en général entre 4 et 6 ans.',
    image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200&auto=format&fit=crop',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  },
  {
    id: 2,
    title: 'Modernisation d\'armoires électriques (Retrofit) : Pourquoi et comment ?',
    category: 'innovations',
    excerpt: 'Évitez l\'obsolescence de vos installations industrielles en modernisant vos TGBT et automates sans remplacer toute l\'infrastructure.',
    content: 'La modernisation technique (ou Retrofit) consiste à remplacer les éléments de protection et de contrôle commande vieillissants par du matériel de dernière génération au sein d\'armoires électriques existantes.\n\nCette démarche offre de nombreux avantages :\n1. Économies majeures par rapport au remplacement complet de la cabine.\n2. Intégration de la communication réseau (SCADA, Modbus, Profinet).\n3. Amélioration instantanée de la sécurité des opérateurs.\n\nNos équipes chez Diversia interviennent sur site pour réaliser des audits et moderniser vos équipements dans un temps record afin de limiter la durée d\'arrêt technique de votre chaîne de production.',
    image_url: 'https://images.unsplash.com/photo-1555963966-b7ae5404b6ed?q=80&w=1200&auto=format&fit=crop',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  },
  {
    id: 3,
    title: 'Retour sur la réhabilitation du système SCADA de la cimenterie de Likasi',
    category: 'realisations',
    excerpt: 'Découvrez comment nous avons restructuré l\'ensemble du contrôle-commande et automatisé les broyeurs principaux de notre client.',
    content: 'Diversia a mené à bien la rénovation complète de la supervision industrielle de la cimenterie locale. Ce projet a consisté à remplacer un système SCADA obsolète par une architecture distribuée moderne basée sur des automates Siemens S7-1500 et une interface de contrôle WinCC.\n\nLe résultat : une réactivité accrue sur les diagnostics de pannes, un enregistrement continu des courbes de production et une baisse de 15% des temps d\'arrêt imprévus du processus de cuisson.',
    image_url: 'https://images.unsplash.com/photo-1581092921461-eab10380d70b?q=80&w=1200&auto=format&fit=crop',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }
];

export const getArticles = async (req, res) => {
  const pool = getPool();
  if (pool) {
    try {
      const [rows] = await pool.query('SELECT id, title, category, excerpt, content, image_url AS image, created_at AS createdAt FROM articles ORDER BY created_at DESC');
      const data = rows.map(r => ({
        id: r.id,
        title: r.title,
        category: r.category,
        excerpt: r.excerpt,
        content: r.content,
        image: r.image || 'https://images.unsplash.com/photo-1581092921461-eab10380d70b',
        createdAt: r.createdAt
      }));
      return res.json({ data });
    } catch (err) {
      console.warn('DB error fetching articles:', err.message);
    }
  }

  // memory fallback
  const data = [...articles]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(r => ({
      id: r.id,
      title: r.title,
      category: r.category,
      excerpt: r.excerpt,
      content: r.content,
      image: r.image_url || 'https://images.unsplash.com/photo-1581092921461-eab10380d70b',
      createdAt: r.created_at
    }));
  res.json({ data });
};

export const createArticle = async (req, res) => {
  const { title, category, excerpt, content, image } = req.body;
  if (!title || !category || !content) {
    return res.status(400).json({ error: 'Missing required fields (title, category, content)' });
  }

  const record = {
    id: articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1,
    title,
    category,
    excerpt: excerpt || null,
    content,
    image_url: image || null,
    created_at: new Date()
  };

  const pool = getPool();
  if (pool) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO articles (title, category, excerpt, content, image_url, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [title, category, excerpt || null, content, image || null, record.created_at]
      );
      if (result && result.insertId) {
        record.id = result.insertId;
      }
    } catch (err) {
      console.warn('DB error creating article:', err.message);
    }
  }

  articles.push(record);

  // Add audit operation
  try {
    const { addOperation } = await import('./operationsController.js');
    addOperation({
      action: 'create_article',
      user: req.user?.email || 'admin',
      module: 'blog',
      details: `Nouvel article créé : "${title}"`,
      timestamp: new Date()
    });
  } catch (e) {
    console.warn('addOperation failed', e.message);
  }

  res.status(201).json({ data: {
    id: record.id,
    title: record.title,
    category: record.category,
    excerpt: record.excerpt,
    content: record.content,
    image: record.image_url,
    createdAt: record.created_at
  }});
};

export const updateArticle = async (req, res) => {
  const id = Number(req.params.id);
  const { title, category, excerpt, content, image } = req.body;
  if (!title || !category || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const pool = getPool();
  if (pool) {
    try {
      await pool.execute(
        'UPDATE articles SET title = ?, category = ?, excerpt = ?, content = ?, image_url = ? WHERE id = ?',
        [title, category, excerpt || null, content, image || null, id]
      );
    } catch (err) {
      console.warn('DB error updating article:', err.message);
    }
  }

  const art = articles.find(a => a.id === id);
  if (art) {
    art.title = title;
    art.category = category;
    art.excerpt = excerpt || null;
    art.content = content;
    art.image_url = image || null;
  } else if (!pool) {
    return res.status(404).json({ error: 'Article not found' });
  }

  // Add audit operation
  try {
    const { addOperation } = await import('./operationsController.js');
    addOperation({
      action: 'update_article',
      user: req.user?.email || 'admin',
      module: 'blog',
      details: `Article "${title}" modifié (ID: ${id})`,
      timestamp: new Date()
    });
  } catch (e) {
    console.warn('addOperation failed', e.message);
  }

  res.json({ data: { id, title, category, excerpt, content, image } });
};

export const deleteArticle = async (req, res) => {
  const id = Number(req.params.id);

  const pool = getPool();
  let found = false;
  if (pool) {
    try {
      const [result] = await pool.execute('DELETE FROM articles WHERE id = ?', [id]);
      if (result && result.affectedRows > 0) {
        found = true;
      }
    } catch (err) {
      console.warn('DB error deleting article:', err.message);
    }
  }

  const idx = articles.findIndex(a => a.id === id);
  if (idx !== -1) {
    articles.splice(idx, 1);
    found = true;
  }

  if (!found) {
    return res.status(404).json({ error: 'Article not found' });
  }

  // Add audit operation
  try {
    const { addOperation } = await import('./operationsController.js');
    addOperation({
      action: 'delete_article',
      user: req.user?.email || 'admin',
      module: 'blog',
      details: `Article supprimé (ID: ${id})`,
      timestamp: new Date()
    });
  } catch (e) {
    console.warn('addOperation failed', e.message);
  }

  res.json({ success: true, message: `Article ${id} deleted` });
};
