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

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '4mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'rentix-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// En producción, el mismo servidor sirve el build de React (client/dist).
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
}

// Middleware de manejo de errores (captura rechazos de handlers async vía ah()).
app.use((err, _req, res, _next) => {
  console.error('❌ Error:', err?.message || err);
  res.status(500).json({ error: 'Error del servidor' });
});

const PORT = process.env.PORT || 4000;

async function start() {
  await initSchema();
  const { c } = await db.prepare('SELECT COUNT(*) AS c FROM users').get();
  if (c === 0) {
    console.log('🌱 Base vacía: sembrando datos de ejemplo...');
    await runSeed();
  }
  app.listen(PORT, () => {
    console.log(`🚀 Rentix API escuchando en http://localhost:${PORT}`);
  });
}

start().catch((e) => {
  console.error('No se pudo iniciar el servidor:', e);
  process.exit(1);
});
