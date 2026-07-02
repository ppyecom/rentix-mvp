import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { ah } from './_wrap.js';

const router = Router();

// POST /api/reports  { booking_id, reason, description }
router.post('/', requireAuth, ah(async (req, res) => {
  const { booking_id, reason, description } = req.body || {};
  if (!booking_id || !reason) {
    return res.status(400).json({ error: 'Reserva y motivo son obligatorios' });
  }
  const b = await db
    .prepare(
      `SELECT b.*, eq.owner_id FROM bookings b JOIN equipment eq ON eq.id = b.equipment_id WHERE b.id = ?`
    )
    .get(booking_id);
  if (!b) return res.status(404).json({ error: 'Reserva no encontrada' });

  const me = req.user.id;
  const isRenter = b.renter_id === me;
  const isOwner = b.owner_id === me;
  if (!isRenter && !isOwner) {
    return res.status(403).json({ error: 'No participas en esta reserva' });
  }
  const reporter_role = isRenter ? 'arrendatario' : 'arrendador';
  const against_id = isRenter ? b.owner_id : b.renter_id;

  const info = await db
    .prepare(
      `INSERT INTO reports (booking_id, reporter_id, against_id, reporter_role, reason, description)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(booking_id, me, against_id, reporter_role, reason, description || '');

  res.status(201).json({ report: await db.prepare('SELECT * FROM reports WHERE id = ?').get(info.lastInsertRowid) });
}));

// GET /api/reports/mine  (reportes que hice o que hicieron contra mí)
router.get('/mine', requireAuth, ah(async (req, res) => {
  const me = req.user.id;
  const rows = await db
    .prepare(
      `SELECT r.*, eq.title AS equipment_title,
              reporter.name AS reporter_name,
              target.name AS against_name
       FROM reports r
       JOIN bookings b ON b.id = r.booking_id
       JOIN equipment eq ON eq.id = b.equipment_id
       JOIN users reporter ON reporter.id = r.reporter_id
       JOIN users target ON target.id = r.against_id
       WHERE r.reporter_id = ? OR r.against_id = ?
       ORDER BY r.created_at DESC`
    )
    .all(me, me);
  const enriched = rows.map((r) => ({ ...r, direction: r.reporter_id === me ? 'enviado' : 'recibido' }));
  res.json({ reports: enriched });
}));

export default router;
