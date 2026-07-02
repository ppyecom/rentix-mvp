import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { ah } from './_wrap.js';

const router = Router();

// GET /api/messages/threads  (lista de conversaciones del usuario)
router.get('/threads', requireAuth, ah(async (req, res) => {
  const me = req.user.id;
  const rows = await db
    .prepare(
      `SELECT m.*,
              CASE WHEN m.from_id = ? THEN m.to_id ELSE m.from_id END AS other_id
       FROM messages m
       WHERE m.from_id = ? OR m.to_id = ?
       ORDER BY m.created_at DESC`
    )
    .all(me, me, me);

  const seen = new Set();
  const threads = [];
  for (const m of rows) {
    if (seen.has(m.other_id)) continue;
    seen.add(m.other_id);
    const other = await db.prepare('SELECT id, name, avatar, verified FROM users WHERE id = ?').get(m.other_id);
    const unreadRow = await db
      .prepare('SELECT COUNT(*) AS c FROM messages WHERE from_id = ? AND to_id = ? AND read = 0')
      .get(m.other_id, me);
    threads.push({
      other: { ...other, verified: !!other?.verified },
      last_message: m.body,
      last_at: m.created_at,
      unread: unreadRow.c,
    });
  }
  res.json({ threads });
}));

// GET /api/messages/with/:userId
router.get('/with/:userId', requireAuth, ah(async (req, res) => {
  const me = req.user.id;
  const other = Number(req.params.userId);
  await db.prepare('UPDATE messages SET read = 1 WHERE from_id = ? AND to_id = ?').run(other, me);
  const msgs = await db
    .prepare(
      `SELECT * FROM messages
       WHERE (from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?)
       ORDER BY created_at ASC`
    )
    .all(me, other, other, me);
  const user = await db.prepare('SELECT id, name, avatar, verified FROM users WHERE id = ?').get(other);
  res.json({ messages: msgs, user: { ...user, verified: !!user?.verified } });
}));

// POST /api/messages  { to_id, body, equipment_id? }
router.post('/', requireAuth, ah(async (req, res) => {
  const { to_id, body, equipment_id } = req.body || {};
  if (!to_id || !body) return res.status(400).json({ error: 'Destinatario y mensaje requeridos' });
  const info = await db
    .prepare('INSERT INTO messages (from_id, to_id, equipment_id, body) VALUES (?, ?, ?, ?)')
    .run(req.user.id, to_id, equipment_id || null, body);
  const msg = await db.prepare('SELECT * FROM messages WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ message: msg });
}));

export default router;
