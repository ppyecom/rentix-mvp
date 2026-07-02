import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

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
