import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { ah } from './_wrap.js';

const router = Router();

function hydrate(e) {
  if (!e) return null;
  return {
    ...e,
    shield: !!e.shield,
    gallery: JSON.parse(e.gallery || '[]'),
    specs: JSON.parse(e.specs || '[]'),
  };
}

const OWNER_JOIN = `
  SELECT eq.*, u.name AS owner_name, u.avatar AS owner_avatar,
         u.rating AS owner_rating, u.verified AS owner_verified,
         u.reviews_count AS owner_reviews,
         u.yape_number AS owner_yape_number, u.yape_name AS owner_yape_name
  FROM equipment eq JOIN users u ON u.id = eq.owner_id
`;

// GET /api/equipment?category=&q=&city=&sort=
router.get('/', ah(async (req, res) => {
  const { category, q, city, sort } = req.query;
  const where = [];
  const params = {};
  if (category && category !== 'Todo') { where.push('eq.category = @category'); params.category = category; }
  if (city) { where.push('eq.city = @city'); params.city = city; }
  if (q) { where.push('(eq.title LIKE @q OR eq.description LIKE @q)'); params.q = `%${q}%`; }

  let sql = OWNER_JOIN;
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  if (sort === 'price_asc') sql += ' ORDER BY eq.price_per_day ASC';
  else if (sort === 'price_desc') sql += ' ORDER BY eq.price_per_day DESC';
  else if (sort === 'rating') sql += ' ORDER BY eq.rating DESC';
  else sql += ' ORDER BY eq.created_at DESC';

  const rows = (await db.prepare(sql).all(params)).map(hydrate);
  res.json({ equipment: rows });
}));

router.get('/categories', ah(async (_req, res) => {
  const rows = await db.prepare('SELECT category, COUNT(*) AS count FROM equipment GROUP BY category').all();
  res.json({ categories: rows });
}));

router.get('/:id', ah(async (req, res) => {
  const e = await db.prepare(OWNER_JOIN + ' WHERE eq.id = ?').get(req.params.id);
  if (!e) return res.status(404).json({ error: 'Equipo no encontrado' });
  const reviews = await db
    .prepare('SELECT * FROM reviews WHERE equipment_id = ? ORDER BY created_at DESC')
    .all(req.params.id);
  const similar = (await db
    .prepare(OWNER_JOIN + ' WHERE eq.category = ? AND eq.id != ? LIMIT 3')
    .all(e.category, e.id))
    .map(hydrate);
  res.json({ equipment: hydrate(e), reviews, similar });
}));

// POST /api/equipment  (publicar nuevo equipo)
router.post('/', requireAuth, ah(async (req, res) => {
  const { title, description, category, price_per_day, city, image, gallery, specs } = req.body || {};
  if (!title || !category || !price_per_day) {
    return res.status(400).json({ error: 'Título, categoría y precio son obligatorios' });
  }
  const info = await db
    .prepare(
      `INSERT INTO equipment (owner_id, title, description, category, price_per_day, city, image, gallery, specs, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'disponible')`
    )
    .run(
      req.user.id,
      title,
      description || '',
      category,
      Number(price_per_day),
      city || 'Lima, Perú',
      image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
      JSON.stringify(gallery || (image ? [image] : [])),
      JSON.stringify(specs || [])
    );
  const created = await db.prepare(OWNER_JOIN + ' WHERE eq.id = ?').get(info.lastInsertRowid);
  res.status(201).json({ equipment: hydrate(created) });
}));

// POST /api/equipment/:id/reviews  (dejar una reseña)
router.post('/:id/reviews', requireAuth, ah(async (req, res) => {
  const { rating, comment } = req.body || {};
  const r = Number(rating);
  if (!comment || !r || r < 1 || r > 5) {
    return res.status(400).json({ error: 'Calificación (1-5) y comentario son obligatorios' });
  }
  const eq = await db.prepare('SELECT id FROM equipment WHERE id = ?').get(req.params.id);
  if (!eq) return res.status(404).json({ error: 'Equipo no encontrado' });

  const user = await db.prepare('SELECT name, avatar FROM users WHERE id = ?').get(req.user.id);
  await db.prepare(
    `INSERT INTO reviews (equipment_id, author_id, author_name, author_avatar, rating, comment)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(req.params.id, req.user.id, user.name, user.avatar, r, comment);

  const agg = await db
    .prepare('SELECT AVG(rating) AS avg, COUNT(*) AS n FROM reviews WHERE equipment_id = ?')
    .get(req.params.id);
  const avg = Math.round(agg.avg * 10) / 10;
  await db.prepare('UPDATE equipment SET rating = ?, reviews_count = ? WHERE id = ?').run(avg, agg.n, req.params.id);

  const reviews = await db
    .prepare('SELECT * FROM reviews WHERE equipment_id = ? ORDER BY created_at DESC')
    .all(req.params.id);
  res.status(201).json({ reviews, rating: avg, reviews_count: agg.n });
}));

// GET /api/equipment/mine/list  (equipos del usuario autenticado)
router.get('/mine/list', requireAuth, ah(async (req, res) => {
  const rows = (await db.prepare(OWNER_JOIN + ' WHERE eq.owner_id = ? ORDER BY eq.created_at DESC').all(req.user.id)).map(hydrate);
  res.json({ equipment: rows });
}));

export default router;
