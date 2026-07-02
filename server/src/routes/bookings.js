import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { ah } from './_wrap.js';

const router = Router();

const SERVICE_FEE_RATE = 0.1; // 10% de comisión Rentix (ecosistema transaccional)

// POST /api/bookings  (crear reserva — queda PENDIENTE DE PAGO por Yape)
router.post('/', requireAuth, ah(async (req, res) => {
  const { equipment_id, start_date, end_date } = req.body || {};
  if (!equipment_id || !start_date || !end_date) {
    return res.status(400).json({ error: 'Faltan datos de la reserva' });
  }
  const eq = await db.prepare('SELECT * FROM equipment WHERE id = ?').get(equipment_id);
  if (!eq) return res.status(404).json({ error: 'Equipo no encontrado' });
  if (eq.owner_id === req.user.id) {
    return res.status(400).json({ error: 'No puedes alquilar tu propio equipo' });
  }

  const start = new Date(start_date);
  const end = new Date(end_date);
  const days = Math.max(1, Math.round((end - start) / 86400000));
  const subtotal = days * eq.price_per_day;
  const service_fee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100;
  const total = subtotal + service_fee;

  const info = await db
    .prepare(
      `INSERT INTO bookings (equipment_id, renter_id, start_date, end_date, days, subtotal, service_fee, total, status, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'activa', 'pendiente_pago')`
    )
    .run(equipment_id, req.user.id, start_date, end_date, days, subtotal, service_fee, total);

  const owner = await db.prepare('SELECT name, yape_number, yape_name FROM users WHERE id = ?').get(eq.owner_id);
  const booking = await db.prepare('SELECT * FROM bookings WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({
    booking: {
      ...booking,
      equipment_title: eq.title,
      owner_name: owner.name,
      owner_yape_number: owner.yape_number,
      owner_yape_name: owner.yape_name,
    },
  });
}));

// POST /api/bookings/:id/pay  (el arrendatario reporta que ya pagó por Yape)
router.post('/:id/pay', requireAuth, ah(async (req, res) => {
  const { yape_operation } = req.body || {};
  const b = await db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!b) return res.status(404).json({ error: 'Reserva no encontrada' });
  if (b.renter_id !== req.user.id) return res.status(403).json({ error: 'No autorizado' });

  await db.prepare('UPDATE bookings SET payment_status = ?, yape_operation = ? WHERE id = ?').run(
    'pago_reportado',
    yape_operation || '',
    req.params.id
  );
  res.json({ booking: await db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id) });
}));

// POST /api/bookings/:id/confirm  (el arrendador confirma que recibió el pago)
router.post('/:id/confirm', requireAuth, ah(async (req, res) => {
  const b = await db
    .prepare(
      `SELECT b.*, eq.owner_id FROM bookings b JOIN equipment eq ON eq.id = b.equipment_id WHERE b.id = ?`
    )
    .get(req.params.id);
  if (!b) return res.status(404).json({ error: 'Reserva no encontrada' });
  if (b.owner_id !== req.user.id) {
    return res.status(403).json({ error: 'Solo el dueño del equipo puede confirmar el pago' });
  }
  await db.prepare("UPDATE bookings SET payment_status = 'confirmado', status = 'confirmada' WHERE id = ?").run(
    req.params.id
  );
  res.json({ booking: await db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id) });
}));

// GET /api/bookings/earnings  (ingresos CONFIRMADOS por alquiler de mis equipos)
router.get('/earnings', requireAuth, ah(async (req, res) => {
  const row = await db
    .prepare(
      `SELECT COALESCE(SUM(b.subtotal), 0) AS earned, COUNT(*) AS rentals
       FROM bookings b JOIN equipment eq ON eq.id = b.equipment_id
       WHERE eq.owner_id = ? AND b.payment_status = 'confirmado'`
    )
    .get(req.user.id);
  const pendingRow = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM bookings b JOIN equipment eq ON eq.id = b.equipment_id
       WHERE eq.owner_id = ? AND b.payment_status = 'pago_reportado'`
    )
    .get(req.user.id);
  res.json({ earned: row.earned, rentals: row.rentals, pending_confirmations: pendingRow.n });
}));

// GET /api/bookings/mine  (reservas que YO hice como arrendatario)
router.get('/mine', requireAuth, ah(async (req, res) => {
  const rows = await db
    .prepare(
      `SELECT b.*, eq.title AS equipment_title, eq.image AS equipment_image, eq.city AS equipment_city,
              u.name AS owner_name, u.id AS owner_id, u.yape_number AS owner_yape_number, u.yape_name AS owner_yape_name
       FROM bookings b
       JOIN equipment eq ON eq.id = b.equipment_id
       JOIN users u ON u.id = eq.owner_id
       WHERE b.renter_id = ? ORDER BY b.created_at DESC`
    )
    .all(req.user.id);
  res.json({ bookings: rows });
}));

// GET /api/bookings/received  (reservas sobre MIS equipos — vista del arrendador)
router.get('/received', requireAuth, ah(async (req, res) => {
  const rows = await db
    .prepare(
      `SELECT b.*, eq.title AS equipment_title, eq.image AS equipment_image,
              u.name AS renter_name, u.id AS renter_id, u.avatar AS renter_avatar
       FROM bookings b
       JOIN equipment eq ON eq.id = b.equipment_id
       JOIN users u ON u.id = b.renter_id
       WHERE eq.owner_id = ? ORDER BY b.created_at DESC`
    )
    .all(req.user.id);
  res.json({ bookings: rows });
}));

export default router;
