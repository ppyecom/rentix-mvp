import { createClient } from '@libsql/client';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// En producción se usa Turso (nube). En local, un archivo libSQL.
// Configura en el servidor:  TURSO_DATABASE_URL y TURSO_AUTH_TOKEN
const url = process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, '..', 'rentix.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient(authToken ? { url, authToken } : { url });

// Extrae de un SQL los nombres de parámetros (@x, :x, $x) para pasar solo
// las claves relevantes (tolerante a objetos con claves extra, como better-sqlite3).
function pickNamed(sql, obj) {
  const names = new Set();
  const re = /[@:$]([a-zA-Z_][a-zA-Z0-9_]*)/g;
  let m;
  while ((m = re.exec(sql))) names.add(m[1]);
  const out = {};
  for (const k of names) if (k in obj) out[k] = normalize(obj[k]);
  return out;
}

// libSQL no acepta booleanos ni undefined: normaliza a int/null.
function normalize(v) {
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v === undefined) return null;
  return v;
}

function toArgs(sql, args) {
  if (args.length === 1 && args[0] && typeof args[0] === 'object' && !Array.isArray(args[0])) {
    return pickNamed(sql, args[0]); // parámetros con nombre
  }
  if (args.length === 1 && Array.isArray(args[0])) return args[0].map(normalize);
  return args.map(normalize); // posicionales
}

function rowObj(row, columns) {
  const o = {};
  for (const c of columns) o[c] = row[c];
  return o;
}

// Wrapper con la misma forma que better-sqlite3, pero asíncrono.
export const db = {
  prepare(sql) {
    return {
      async get(...args) {
        const r = await client.execute({ sql, args: toArgs(sql, args) });
        return r.rows[0] ? rowObj(r.rows[0], r.columns) : undefined;
      },
      async all(...args) {
        const r = await client.execute({ sql, args: toArgs(sql, args) });
        return r.rows.map((row) => rowObj(row, r.columns));
      },
      async run(...args) {
        const r = await client.execute({ sql, args: toArgs(sql, args) });
        return {
          changes: r.rowsAffected,
          lastInsertRowid: r.lastInsertRowid != null ? Number(r.lastInsertRowid) : undefined,
        };
      },
    };
  },
  async exec(sql) {
    await client.executeMultiple(sql);
  },
};

export async function initSchema() {
  await db.exec(`
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
      created_at    TEXT DEFAULT (datetime('now'))
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
      created_at    TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      from_id       INTEGER NOT NULL,
      to_id         INTEGER NOT NULL,
      equipment_id  INTEGER,
      body          TEXT NOT NULL,
      read          INTEGER DEFAULT 0,
      created_at    TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      equipment_id  INTEGER NOT NULL,
      author_id     INTEGER NOT NULL,
      author_name   TEXT NOT NULL,
      author_avatar TEXT,
      rating        REAL NOT NULL,
      comment       TEXT NOT NULL,
      created_at    TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reports (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id    INTEGER NOT NULL,
      reporter_id   INTEGER NOT NULL,
      against_id    INTEGER NOT NULL,
      reporter_role TEXT NOT NULL,
      reason        TEXT NOT NULL,
      description   TEXT DEFAULT '',
      status        TEXT DEFAULT 'abierto',
      created_at    TEXT DEFAULT (datetime('now'))
    );
  `);
}
