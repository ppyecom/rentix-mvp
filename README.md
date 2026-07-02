# Rentix — MVP

**Marketplace de alquiler tecnológico.** Conecta a personas y negocios que poseen equipos
tecnológicos con usuarios que necesitan utilizarlos temporalmente. *La economía colaborativa
del hardware.*

> "Accede a tecnología sin comprarla."

Este repositorio es el **MVP full-stack** construido a partir del pitch deck y los diseños de
Figma: tema oscuro premium, precios en soles (S/), enfoque en el mercado peruano.

---

## Stack

| Capa      | Tecnología                                             |
| --------- | ------------------------------------------------------ |
| Frontend  | React 18 + Vite + TypeScript + Tailwind CSS + React Router |
| Backend   | Node.js + Express + JWT + bcrypt                       |
| Base de datos | SQLite (better-sqlite3)                            |

## Estructura

```
Rentix/
├── client/          # Frontend React (Vite)
│   ├── src/
│   │   ├── components/   # Navbar, Footer, EquipmentCard, Logo, ui...
│   │   ├── pages/        # Landing, Marketplace, EquipmentDetail, Checkout, etc.
│   │   ├── context/      # AuthContext (JWT)
│   │   └── lib/          # api client, tipos, formato de soles
│   └── public/          # favicon (logo Rentix)
└── server/          # Backend Express + SQLite
    └── src/
        ├── index.js     # servidor
        ├── db.js        # esquema SQLite
        ├── seed.js      # datos de ejemplo
        ├── auth.js      # JWT / middleware
        └── routes/      # auth, equipment, bookings, messages, users
```

## Puesta en marcha

Requiere **Node.js 18+**.

```bash
# 1. Instalar dependencias (raíz, servidor y cliente)
npm run install:all

# 2. Poblar la base de datos con datos de ejemplo
npm run seed

# 3. Arrancar backend + frontend a la vez
npm run dev
```

- Frontend: http://localhost:5173
- API:      http://localhost:4000/api

> También puedes correrlos por separado: `npm run dev:server` y `npm run dev:client`.

### Cuenta demo

```
email:    demo@rentix.pe
password: demo1234
```

Otros usuarios sembrados: `marcus@rentix.pe`, `sofia@rentix.pe`, `diego@rentix.pe`
(misma contraseña `demo1234`).

## Funcionalidades del MVP

Alineadas con los objetivos del pitch deck (validar mercado, refinar UX, testear seguridad):

- **Landing Page** — hero, estadísticas, categorías, equipos destacados, cómo funciona, testimonios.
- **Marketplace** — catálogo con filtros por categoría, búsqueda y ordenamiento.
- **Detalle de equipo** — galería, especificaciones, Rentix Shield (seguro), reputación del
  arrendador, reseñas y equipos similares.
- **Sistema de reservas** — selector de fechas con cálculo de subtotal + comisión (10%).
- **Checkout Seguro** — pasarela de pago simulada y depósito de garantía.
- **Publicar equipo** — formulario con vista previa en vivo.
- **Dashboard de usuario** — perfil con reputación, reservas y equipos publicados.
- **Centro de mensajes** — chat entre arrendador y arrendatario.
- **Autenticación** — registro/login con JWT y "verificación de identidad" simulada.

## Modelo de negocio implementado

- **Transaccional:** comisión del 10% por cada alquiler (ver `server/src/routes/bookings.js`).
- **Confianza:** perfiles verificados, reputación por estrellas, contratos/depósitos y Rentix Shield.

## Despliegue en servidor propio (Ubuntu VM)

El backend Express sirve también el frontend ya compilado, así que corre como **un
solo proceso Node** detrás de Nginx. En un servidor propio la base **SQLite persiste**
en disco. Archivos incluidos en `deploy/`.

### 1. Instalar Node.js en la VM (v20 LTS recomendado)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
# Herramientas de compilación (por si better-sqlite3 necesita compilar):
sudo apt-get install -y build-essential python3
```

### 2. Traer el código y compilar

```bash
sudo mkdir -p /opt/rentix && sudo chown $USER /opt/rentix
git clone https://github.com/<tu-usuario>/rentix-mvp.git /opt/rentix
cd /opt/rentix
bash deploy/setup.sh          # instala deps, compila el frontend y siembra la BD
```

Prueba rápida: `NODE_ENV=production node server/src/index.js` → abre `http://IP:4000`.

### 3. Ejecutar como servicio (systemd)

```bash
sudo cp deploy/rentix.service /etc/systemd/system/rentix.service
sudo nano /etc/systemd/system/rentix.service   # ajusta User, WorkingDirectory y JWT_SECRET
sudo systemctl daemon-reload
sudo systemctl enable --now rentix
sudo systemctl status rentix
```

> Genera un secreto: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 4. Reverse proxy con Nginx (puerto 80)

```bash
sudo apt-get install -y nginx
sudo cp deploy/nginx-rentix.conf /etc/nginx/sites-available/rentix
sudo ln -s /etc/nginx/sites-available/rentix /etc/nginx/sites-enabled/rentix
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 5. Firewall y HTTPS (opcional)

```bash
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable

# Con un dominio apuntando a la VM, HTTPS gratis con Let's Encrypt:
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com
```

### Actualizar tras cambios

```bash
cd /opt/rentix && git pull
npm install --prefix server && npm install --prefix client && npm run build --prefix client
sudo systemctl restart rentix
```

> **Backup de datos:** todo vive en `server/rentix.db`. Cópialo periódicamente
> (`cp server/rentix.db ~/backups/rentix-$(date +%F).db`).

## Base de datos persistente con Turso (gratis)

La app usa **libSQL** (`@libsql/client`), compatible con SQLite. En local guarda en un
archivo (`server/rentix.db`); en producción apunta a **Turso** (SQLite en la nube,
capa gratuita) para que los datos **persistan** aunque el hosting sea efímero.

### Crear la base en Turso

1. Crea una cuenta en https://turso.tech (gratis).
2. Instala la CLI y crea la base:
   ```bash
   # con la CLI de Turso
   turso db create rentix
   turso db show rentix --url          # -> TURSO_DATABASE_URL (libsql://...)
   turso db tokens create rentix       # -> TURSO_AUTH_TOKEN
   ```
   > También puedes crear la base y copiar la URL + token desde el panel web de Turso.
3. En **Render → tu servicio → Environment**, agrega:
   - `TURSO_DATABASE_URL` = `libsql://rentix-....turso.io`
   - `TURSO_AUTH_TOKEN` = el token generado
4. Redespliega. Al primer arranque, el servidor **siembra** los datos de ejemplo en
   Turso; de ahí en adelante **todo persiste**.

Sin esas variables, el servidor usa el archivo local (útil para desarrollo).

## Logo

El logo de marca está recreado como SVG en `client/src/components/Logo.tsx` y
`client/public/favicon.svg`. Si quieres usar el PNG original exacto, colócalo en
`client/public/logo.png`.

---

© 2026 Rentix Global — Diseñado para el futuro del hardware-as-a-service.
