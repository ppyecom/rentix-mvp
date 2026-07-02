import 'dotenv/config';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { db, initSchema } from './db.js';

export function runSeed() {
initSchema();

// Wipe existing data (idempotent seed)
db.exec(`
  DELETE FROM reviews;
  DELETE FROM messages;
  DELETE FROM bookings;
  DELETE FROM equipment;
  DELETE FROM users;
  DELETE FROM sqlite_sequence;
`);

const hash = (pw) => bcrypt.hashSync(pw, 10);

const users = [
  {
    name: 'Marcus V.', email: 'marcus@rentix.pe', password: 'demo1234',
    avatar: 'https://i.pravatar.cc/150?img=12', city: 'Arequipa, Perú',
    verified: 1, rating: 4.9, reviews_count: 128,
    bio: 'Arrendador destacado. Especialista en equipo cinematográfico profesional.',
    yape_number: '987654321', yape_name: 'Marcus Valverde',
  },
  {
    name: 'Sofía R.', email: 'sofia@rentix.pe', password: 'demo1234',
    avatar: 'https://i.pravatar.cc/150?img=45', city: 'Lima, Perú',
    verified: 1, rating: 4.8, reviews_count: 74,
    bio: 'Fotógrafa y creadora de contenido. Rento mi equipo cuando no lo uso.',
    yape_number: '912345678', yape_name: 'Sofía Ramírez',
  },
  {
    name: 'Diego M.', email: 'diego@rentix.pe', password: 'demo1234',
    avatar: 'https://i.pravatar.cc/150?img=68', city: 'Cusco, Perú',
    verified: 1, rating: 5.0, reviews_count: 39,
    bio: 'Gamer y streamer. Hardware de alto rendimiento disponible.',
    yape_number: '998877665', yape_name: 'Diego Mendoza',
  },
  {
    name: 'Demo User', email: 'demo@rentix.pe', password: 'demo1234',
    avatar: 'https://i.pravatar.cc/150?img=3', city: 'Lima, Perú',
    verified: 1, rating: 5.0, reviews_count: 0,
    bio: 'Cuenta de demostración de Rentix.',
    yape_number: '', yape_name: '',
  },
];

const insertUser = db.prepare(`
  INSERT INTO users (name, email, password_hash, avatar, city, verified, rating, reviews_count, bio, yape_number, yape_name)
  VALUES (@name, @email, @password_hash, @avatar, @city, @verified, @rating, @reviews_count, @bio, @yape_number, @yape_name)
`);

const userIds = {};
for (const u of users) {
  const info = insertUser.run({ ...u, password_hash: hash(u.password) });
  userIds[u.email] = info.lastInsertRowid;
}

const img = (id, q = 80, w = 1000) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;

const equipment = [
  {
    owner: 'marcus@rentix.pe',
    title: 'Kit de Cámara de Cine RED Komodo 6K',
    description:
      'La RED KOMODO 6K es la herramienta definitiva de cine compacto. Con un sensor de obturador global y la legendaria ciencia del color de RED, este kit incluye todo lo necesario para una producción profesional en un formato extraordinariamente pequeño.',
    category: 'Cine', price_per_day: 450, city: 'Arequipa, Perú',
    image: img('1519638399535-1b036603ac77'),
    gallery: [img('1519638399535-1b036603ac77'), img('1606986628253-05620e9b3f4d'), img('1502920917128-1aa500764cbd'), img('1533425962554-8a1f2f3b0f8e')],
    specs: [
      { label: 'Resolución', value: '6K' },
      { label: 'Sensor', value: 'S35' },
      { label: 'Montura', value: 'RF' },
      { label: 'FPS', value: '40+' },
    ],
    status: 'disponible', rating: 5.0, reviews_count: 14, shield: 1,
  },
  {
    owner: 'sofia@rentix.pe',
    title: 'Sony A7 III Mirrorless',
    description:
      'Cámara full-frame versátil, ideal para foto y video 4K. Incluye lente 28-70mm, dos baterías y tarjeta SD de 128GB.',
    category: 'Cine', price_per_day: 129, city: 'Lima, Perú',
    image: img('1516035069371-29a1b244cc32'),
    gallery: [img('1516035069371-29a1b244cc32'), img('1502920917128-1aa500764cbd')],
    specs: [
      { label: 'Sensor', value: 'Full-Frame' },
      { label: 'Video', value: '4K 30p' },
      { label: 'ISO', value: '51200' },
      { label: 'Megapíxeles', value: '24.2' },
    ],
    status: 'disponible', rating: 4.9, reviews_count: 32, shield: 1,
  },
  {
    owner: 'diego@rentix.pe',
    title: 'Zenith-9 Pro Workstation',
    description:
      'Estación de trabajo de alto rendimiento con RTX 4090 y 64GB de RAM. Perfecta para render 3D, edición 8K y gaming competitivo.',
    category: 'Computación', price_per_day: 129, city: 'Cusco, Perú',
    image: img('1587202372775-e229f172b9d7'),
    gallery: [img('1587202372775-e229f172b9d7'), img('1591488320449-011701bb6704')],
    specs: [
      { label: 'GPU', value: 'RTX 4090' },
      { label: 'CPU', value: 'i9-14900K' },
      { label: 'RAM', value: '64GB' },
      { label: 'SSD', value: '2TB NVMe' },
    ],
    status: 'disponible', rating: 4.9, reviews_count: 21, shield: 1,
  },
  {
    owner: 'sofia@rentix.pe',
    title: 'Aether Harmonic Over-Ear',
    description:
      'Audífonos de estudio de referencia con cancelación de ruido activa y sonido de alta fidelidad para producción musical.',
    category: 'Audio', price_per_day: 45, city: 'Cusco, Perú',
    image: img('1505740420928-5e560c06d30e'),
    gallery: [img('1505740420928-5e560c06d30e'), img('1618366712010-f4ae9c647dcb')],
    specs: [
      { label: 'Tipo', value: 'Over-Ear' },
      { label: 'ANC', value: 'Sí' },
      { label: 'Impedancia', value: '32Ω' },
      { label: 'Batería', value: '30h' },
    ],
    status: 'disponible', rating: 4.8, reviews_count: 18, shield: 1,
  },
  {
    owner: 'diego@rentix.pe',
    title: 'NeuralLink VR Goggles',
    description:
      'Visor de realidad virtual de última generación con pantallas 4K por ojo y seguimiento inside-out. Inmersión total.',
    category: 'Inmersivo', price_per_day: 85, city: 'Trujillo, Perú',
    image: img('1622979135225-d2ba269cf1ac'),
    gallery: [img('1622979135225-d2ba269cf1ac'), img('1593508512255-86ab42a8e620')],
    specs: [
      { label: 'Resolución', value: '4K/ojo' },
      { label: 'FOV', value: '110°' },
      { label: 'Refresco', value: '120Hz' },
      { label: 'Tracking', value: 'Inside-out' },
    ],
    status: 'disponible', rating: 4.7, reviews_count: 11, shield: 1,
  },
  {
    owner: 'diego@rentix.pe',
    title: 'Apex Mech Key Suite',
    description:
      'Teclado mecánico premium con switches ópticos, iluminación RGB y reposamuñecas. Para gaming y productividad.',
    category: 'Gaming', price_per_day: 15, city: 'Piura, Perú',
    image: img('1541140532154-b024d705b90a'),
    gallery: [img('1541140532154-b024d705b90a'), img('1618384887929-16ec33fab9ef')],
    specs: [
      { label: 'Switches', value: 'Ópticos' },
      { label: 'Layout', value: 'Full-size' },
      { label: 'RGB', value: 'Per-key' },
      { label: 'Conexión', value: 'USB-C' },
    ],
    status: 'disponible', rating: 4.9, reviews_count: 27, shield: 1,
  },
  {
    owner: 'sofia@rentix.pe',
    title: 'MacBook Pro 16" M3 Max',
    description:
      'Laptop profesional con chip M3 Max, pantalla Liquid Retina XDR y 36GB de memoria unificada. Ideal para edición y desarrollo.',
    category: 'Computación', price_per_day: 95, city: 'Lima, Perú',
    image: img('1517336714731-489689fd1ca8'),
    gallery: [img('1517336714731-489689fd1ca8'), img('1541807084-5c52b6b3adef')],
    specs: [
      { label: 'Chip', value: 'M3 Max' },
      { label: 'RAM', value: '36GB' },
      { label: 'Pantalla', value: '16" XDR' },
      { label: 'SSD', value: '1TB' },
    ],
    status: 'disponible', rating: 5.0, reviews_count: 44, shield: 1,
  },
  {
    owner: 'marcus@rentix.pe',
    title: 'DJI Mavic 3 Pro',
    description:
      'Drone profesional con cámara Hasselblad de 4/3 y triple sistema de lentes. Grabación 5.1K y 43 minutos de vuelo.',
    category: 'Cine', price_per_day: 180, city: 'Arequipa, Perú',
    image: img('1473968512647-3e447244af8f'),
    gallery: [img('1473968512647-3e447244af8f'), img('1508614589041-895b88991e3e')],
    specs: [
      { label: 'Cámara', value: 'Hasselblad' },
      { label: 'Video', value: '5.1K' },
      { label: 'Vuelo', value: '43 min' },
      { label: 'Rango', value: '15 km' },
    ],
    status: 'alquilado', rating: 4.9, reviews_count: 16, shield: 1,
  },
];

const insertEq = db.prepare(`
  INSERT INTO equipment (owner_id, title, description, category, price_per_day, city, image, gallery, specs, status, rating, reviews_count, shield)
  VALUES (@owner_id, @title, @description, @category, @price_per_day, @city, @image, @gallery, @specs, @status, @rating, @reviews_count, @shield)
`);

const eqIds = [];
for (const e of equipment) {
  const info = insertEq.run({
    owner_id: userIds[e.owner],
    title: e.title,
    description: e.description,
    category: e.category,
    price_per_day: e.price_per_day,
    city: e.city,
    image: e.image,
    gallery: JSON.stringify(e.gallery),
    specs: JSON.stringify(e.specs),
    status: e.status,
    rating: e.rating,
    reviews_count: e.reviews_count,
    shield: e.shield,
  });
  eqIds.push(info.lastInsertRowid);
}

// Reviews for the RED Komodo kit (id = eqIds[0])
const insertReview = db.prepare(`
  INSERT INTO reviews (equipment_id, author_id, author_name, author_avatar, rating, comment)
  VALUES (@equipment_id, @author_id, @author_name, @author_avatar, @rating, @comment)
`);

insertReview.run({
  equipment_id: eqIds[0], author_id: userIds['sofia@rentix.pe'],
  author_name: 'Sofía R.', author_avatar: 'https://i.pravatar.cc/150?img=45',
  rating: 5, comment: 'Equipo impecable, todo funcionó perfecto en el rodaje. Marcus muy profesional.',
});
insertReview.run({
  equipment_id: eqIds[0], author_id: userIds['diego@rentix.pe'],
  author_name: 'Diego M.', author_avatar: 'https://i.pravatar.cc/150?img=68',
  rating: 5, comment: 'La mejor cámara que he alquilado. Entrega puntual y el Rentix Shield me dio tranquilidad.',
});

// A sample conversation between Demo User and Marcus
const insertMsg = db.prepare(`
  INSERT INTO messages (from_id, to_id, equipment_id, body, read)
  VALUES (@from_id, @to_id, @equipment_id, @body, @read)
`);
insertMsg.run({ from_id: userIds['demo@rentix.pe'], to_id: userIds['marcus@rentix.pe'], equipment_id: eqIds[0], body: 'Hola Marcus, ¿la RED Komodo está disponible este fin de semana?', read: 1 });
insertMsg.run({ from_id: userIds['marcus@rentix.pe'], to_id: userIds['demo@rentix.pe'], equipment_id: eqIds[0], body: '¡Hola! Sí, disponible. ¿Para cuántos días la necesitas?', read: 1 });
insertMsg.run({ from_id: userIds['demo@rentix.pe'], to_id: userIds['marcus@rentix.pe'], equipment_id: eqIds[0], body: 'Serían 3 días. ¿Incluye las baterías extra?', read: 0 });

console.log('✅ Seed completado');
console.log(`   ${users.length} usuarios, ${equipment.length} equipos`);
console.log('   Cuenta demo: demo@rentix.pe / demo1234');
}

// Ejecuta el seed solo cuando se corre directamente (npm run seed),
// no cuando se importa desde el servidor.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSeed();
}
