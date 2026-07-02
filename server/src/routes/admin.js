import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../auth.js';

const router = Router();

// Todas las rutas requieren admin
router.use(requireAdmin);

// GET /api/admin/stats  (métricas globales de la plataforma)
router.get('/stats', (_req, res) => {
  const one = (sql) => db.prepare(sql).get().n;
  res.json({
    users: one('SELECT COUNT(*) AS n FROM users'),
    equipment: one('SELECT COUNT(*) AS n FROM equipment'),
    bookings: one('SELECT COUNT(*) AS n FROM bookings'),
    revenue: db.prepare("SELECT COALESCE(SUM(service_fee),0) AS n FROM bookings WHERE payment_status='confirmado'").get().n,
    reports_open: one("SELECT COUNT(*) AS n FROM reports WHERE status='abierto'"),
    reports_total: one('SELECT COUNT(*) AS n FROM reports'),
  });
});

// GET /api/admin/reports  (todos los reportes con contexto)
router.get('/reports', (req, res) => {
  const { status } = req.query;
  let sql = `
    SELECT r.*, eq.title AS equipment_title,
           reporter.name AS reporter_name, reporter.email AS reporter_email,
           target.name AS against_name, target.email AS against_email,
           b.total AS booking_total
    FROM reports r
    JOIN bookings b ON b.id = r.booking_id
    JOIN equipment eq ON eq.id = b.equipment_id
    JOIN users reporter ON reporter.id = r.reporter_id
    JOIN users target ON target.id = r.against_id
  `;
  const params = [];
  if (status) { sql += ' WHERE r.status = ?'; params.push(status); }
  sql += ' ORDER BY CASE r.status WHEN \'abierto\' THEN 0 WHEN \'en_revision\' THEN 1 ELSE 2 END, r.created_at DESC';
  res.json({ reports: db.prepare(sql).all(...params) });
});

// PUT /api/admin/reports/:id  { status }
router.put('/reports/:id', (req, res) => {
  const { status } = req.body || {};
  const valid = ['abierto', 'en_revision', 'resuelto'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Estado inválido' });
  const r = db.prepare('SELECT id FROM reports WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Reporte no encontrado' });
  db.prepare('UPDATE reports SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ report: db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id) });
});

export default router;
