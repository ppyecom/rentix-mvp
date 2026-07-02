import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

const SERVICE_FEE_RATE = 0.1; // 10% de comisión Rentix (ecosistema transaccional)

// POST /api/bookings  (checkout seguro - simulación de pago)
router.post('/', requireAuth, (req, res) => {
  const { equipment_id, start_date, end_date } = req.body || {};
  if (!equipment_id || !start_date || !end_date) {
    return res.status(400).json({ error: 'Faltan datos de la reserva' });
  }
  const eq = db.prepare('SELECT * FROM equipment WHERE id = ?').get(equipment_id);
  if (!eq) return res.status(404).json({ error: 'Equipo no encontrado' });

  const start = new Date(start_date);
  const end = new Date(end_date);
  const days = Math.max(1, Math.round((end - start) / 86400000));
  const subtotal = days * eq.price_per_day;
  const service_fee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100;
  const total = subtotal + service_fee;

  const info = db
    .prepare(
      `INSERT INTO bookings (equipment_id, renter_id, start_date, end_date, days, subtotal, service_fee, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmada')`
    )
    .run(equipment_id, req.user.id, start_date, end_date, days, subtotal, service_fee, total);

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ booking: { ...booking, equipment_title: eq.title } });
});

// GET /api/bookings/earnings  (ingresos por alquiler de MIS equipos publicados)
// El arrendador recibe el subtotal; la comisión (service_fee) se la queda Rentix.
router.get('/earnings', requireAuth, (req, res) => {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(b.subtotal), 0) AS earned, COUNT(*) AS rentals
       FROM bookings b JOIN equipment eq ON eq.id = b.equipment_id
       WHERE eq.owner_id = ?`
    )
    .get(req.user.id);
  res.json({ earned: row.earned, rentals: row.rentals });
});

// GET /api/bookings/mine  (reservas del usuario)
router.get('/mine', requireAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT b.*, eq.title AS equipment_title, eq.image AS equipment_image, eq.city AS equipment_city
       FROM bookings b JOIN equipment eq ON eq.id = b.equipment_id
       WHERE b.renter_id = ? ORDER BY b.created_at DESC`
    )
    .all(req.user.id);
  res.json({ bookings: rows });
});

export default router;
