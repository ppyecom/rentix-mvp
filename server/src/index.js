import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import { db, initSchema } from './db.js';
import { runSeed } from './seed.js';
import authRoutes from './routes/auth.js';
import equipmentRoutes from './routes/equipment.js';
import bookingRoutes from './routes/bookings.js';
import messageRoutes from './routes/messages.js';
import userRoutes from './routes/users.js';
import reportRoutes from './routes/reports.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

initSchema();

// Auto-seed en el primer arranque (o tras reinicio en hosting gratuito con
// disco efímero) para que el marketplace siempre tenga datos de ejemplo.
const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
if (userCount === 0) {
  console.log('🌱 Base vacía: sembrando datos de ejemplo...');
  runSeed();
}

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'rentix-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// En producción, el mismo servidor sirve el build de React (client/dist).
// Así hay una sola URL y no hace falta configurar CORS.
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA fallback: cualquier ruta que no sea /api devuelve index.html
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Rentix API escuchando en http://localhost:${PORT}`);
});
