import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'rentix.db');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      avatar        TEXT,
      city          TEXT DEFAULT 'Lima, Perú',
      verified      INTEGER DEFAULT 0,
      rating        REAL DEFAULT 5.0,
      reviews_count INTEGER DEFAULT 0,
      bio           TEXT DEFAULT '',
      yape_number   TEXT DEFAULT '',
      yape_name     TEXT DEFAULT '',
      is_admin      INTEGER DEFAULT 0,
      created_at    TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS equipment (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id      INTEGER NOT NULL,
      title         TEXT NOT NULL,
      description   TEXT DEFAULT '',
      category      TEXT NOT NULL,
      price_per_day REAL NOT NULL,
      city          TEXT NOT NULL,
      image         TEXT,
      gallery       TEXT DEFAULT '[]',
      specs         TEXT DEFAULT '[]',
      status        TEXT DEFAULT 'disponible',
      rating        REAL DEFAULT 5.0,
      reviews_count INTEGER DEFAULT 0,
      shield        INTEGER DEFAULT 1,
      created_at    TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (owner_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      equipment_id  INTEGER NOT NULL,
      renter_id     INTEGER NOT NULL,
      start_date    TEXT NOT NULL,
      end_date      TEXT NOT NULL,
      days          INTEGER NOT NULL,
      subtotal      REAL NOT NULL,
      service_fee   REAL NOT NULL,
      total         REAL NOT NULL,
      status        TEXT DEFAULT 'activa',
      payment_method TEXT DEFAULT 'yape',
      payment_status TEXT DEFAULT 'pendiente_pago',
      yape_operation TEXT DEFAULT '',
      created_at    TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (equipment_id) REFERENCES equipment(id),
      FOREIGN KEY (renter_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      from_id       INTEGER NOT NULL,
      to_id         INTEGER NOT NULL,
      equipment_id  INTEGER,
      body          TEXT NOT NULL,
      read          INTEGER DEFAULT 0,
      created_at    TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (from_id) REFERENCES users(id),
      FOREIGN KEY (to_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      equipment_id  INTEGER NOT NULL,
      author_id     INTEGER NOT NULL,
      author_name   TEXT NOT NULL,
      author_avatar TEXT,
      rating        REAL NOT NULL,
      comment       TEXT NOT NULL,
      created_at    TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (equipment_id) REFERENCES equipment(id)
    );

    CREATE TABLE IF NOT EXISTS reports (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id    INTEGER NOT NULL,
      reporter_id   INTEGER NOT NULL,
      against_id    INTEGER NOT NULL,
      reporter_role TEXT NOT NULL,          -- 'arrendador' | 'arrendatario'
      reason        TEXT NOT NULL,
      description   TEXT DEFAULT '',
      status        TEXT DEFAULT 'abierto', -- 'abierto' | 'en_revision' | 'resuelto'
      created_at    TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (booking_id) REFERENCES bookings(id),
      FOREIGN KEY (reporter_id) REFERENCES users(id),
      FOREIGN KEY (against_id) REFERENCES users(id)
    );
  `);

  migrate();
}

// Añade columnas nuevas a bases de datos ya creadas (idempotente).
function migrate() {
  const add = (table, col, def) => {
    try {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
    } catch {
      /* la columna ya existe */
    }
  };
  add('users', 'yape_number', "TEXT DEFAULT ''");
  add('users', 'yape_name', "TEXT DEFAULT ''");
  add('bookings', 'payment_method', "TEXT DEFAULT 'yape'");
  add('bookings', 'payment_status', "TEXT DEFAULT 'pendiente_pago'");
  add('bookings', 'yape_operation', "TEXT DEFAULT ''");
  add('users', 'is_admin', 'INTEGER DEFAULT 0');
}
