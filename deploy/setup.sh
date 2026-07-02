#!/usr/bin/env bash
# Script de instalación de Rentix en la VM Ubuntu.
# Ejecutar desde la raíz del repo:  bash deploy/setup.sh
set -euo pipefail

echo "==> Instalando dependencias y compilando el frontend..."
npm install --prefix server
npm install --prefix client
npm run build --prefix client

# Siembra la base solo si aún no existe (para no borrar datos en re-despliegues)
if [ ! -f server/rentix.db ]; then
  echo "==> Sembrando base de datos con datos de ejemplo..."
  npm run seed --prefix server
else
  echo "==> server/rentix.db ya existe: se conservan los datos."
fi

echo ""
echo "✅ Listo. Prueba local:  NODE_ENV=production node server/src/index.js"
echo "   Luego configura systemd y Nginx (ver deploy/rentix.service y deploy/nginx-rentix.conf)."
