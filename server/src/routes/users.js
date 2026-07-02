import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

function publicUser(u) {
  if (!u) return null;
  const { password_hash, ...rest } = u;
  rest.verified = !!rest.verified;
  return rest;
}

// PUT /api/users/me  (editar mi perfil)
router.put('/me', requireAuth, (req, res) => {
  const { name, city, bio, avatar } = req.body || {};
  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!current) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (name !== undefined && !String(name).trim()) {
    return res.status(400).json({ error: 'El nombre no puede estar vacío' });
  }

  db.prepare('UPDATE users SET name = ?, city = ?, bio = ?, avatar = ? WHERE id = ?').run(
    name?.trim() || current.name,
    city ?? current.city,
    bio ?? current.bio,
    avatar || current.avatar,
    req.user.id
  );
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json({ user: publicUser(updated) });
});

// GET /api/users/:id  (perfil público + reputación)
router.get('/:id', (req, res) => {
  const u = db
    .prepare('SELECT id, name, avatar, city, verified, rating, reviews_count, bio, created_at FROM users WHERE id = ?')
    .get(req.params.id);
  if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });
  u.verified = !!u.verified;

  const listings = db
    .prepare('SELECT id, title, image, price_per_day, city, rating, status FROM equipment WHERE owner_id = ?')
    .all(req.params.id);
  res.json({ user: u, listings });
});

export default router;
