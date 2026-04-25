#!/bin/bash
set -e

echo "=== ZalogHub deploy started ==="

cd /var/www/ZalogHub

echo "1. Pull latest code"
git pull origin main

# ---------------- SERVER ----------------

echo "2. Install server deps"
cd /var/www/ZalogHub/server
npm install

echo "3. Run server migrations"
if [ -f "package.json" ] && npm run | grep -q "migrate"; then
npm run migrate
else
echo "No migrate script found, skipped"
fi

# ---------------- CLIENT APP ----------------

echo "4. Install client deps"
cd /var/www/ZalogHub/client
npm install

echo "5. Build client app"
rm -rf dist
npm run build

# ---------------- ASTRO SITE ----------------

echo "6. Install astro site deps"
cd /var/www/ZalogHub/site
npm install

echo "7. Build astro marketing site"
rm -rf dist
npm run build

# ---------------- RESTART ----------------

echo "8. Restart backend"
pm2 restart zaloghub-api || pm2 restart all

echo "9. Reload nginx"
sudo nginx -t
sudo systemctl reload nginx

echo "=== ZalogHub deploy finished successfully ==="
