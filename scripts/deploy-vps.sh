#!/usr/bin/env bash
# Ayshe Aksesuar — Ubuntu 24.04 tek seferlik kurulum
# Kullanım:  DOMAIN=aysheaksesuar.com bash deploy-ayshe.sh
#   DOMAIN verilmezse IP (http://166.1.91.18) üzerinden yayına alınır, SSL atlanır.
#   Tekrar çalıştırılabilir (idempotent): ikinci çalıştırmada git pull + build + restart yapar.
set -euo pipefail

DOMAIN="${DOMAIN:-}"
REPO="https://github.com/onwr/aysheaksesuar-eticaret.git"
APP_DIR="/var/www/aysheaksesuar"
APP_NAME="ayshe"
PORT=3010
DB_NAME="aysheaksesuar"
DB_USER="ayshe"
SECRETS="/root/.ayshe-secrets"
SERVER_IP="$(curl -s -4 ifconfig.me || hostname -I | awk '{print $1}')"

log(){ echo -e "\n\033[1;32m==> $*\033[0m"; }
export DEBIAN_FRONTEND=noninteractive

# ── 1. Paketler ──────────────────────────────────────────────────────────────
log "Paketler kuruluyor"
apt-get update -y
apt-get install -y curl git ca-certificates gnupg nginx mariadb-server redis-server ufw certbot python3-certbot-nginx build-essential

if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 22 ]; then
  log "Node.js 22 kuruluyor"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
command -v pm2 >/dev/null || npm i -g pm2

systemctl enable --now mariadb redis-server nginx
# Redis sadece localhost
sed -i 's/^bind .*/bind 127.0.0.1 ::1/' /etc/redis/redis.conf && systemctl restart redis-server

# ── 2. Swap (build sırasında RAM yetmezse) ──────────────────────────────────
if [ "$(swapon --show | wc -l)" -eq 0 ] || [ "$(free -m | awk '/Swap/{print $2}')" -lt 1500 ]; then
  if [ ! -f /swapfile2 ]; then
    log "2G swap ekleniyor"
    fallocate -l 2G /swapfile2 && chmod 600 /swapfile2 && mkswap /swapfile2 && swapon /swapfile2
    echo '/swapfile2 none swap sw 0 0' >> /etc/fstab
  fi
fi

# ── 3. Secret'lar (ilk çalıştırmada üretilir, sonra korunur) ────────────────
if [ ! -f "$SECRETS" ]; then
  log "Secret'lar üretiliyor -> $SECRETS"
  {
    echo "DB_PASS=$(openssl rand -hex 20)"
    echo "JWT_SECRET=$(openssl rand -hex 48)"
    echo "CRON_SECRET=$(openssl rand -hex 32)"
  } > "$SECRETS"
  chmod 600 "$SECRETS"
fi
# shellcheck disable=SC1090
source "$SECRETS"

# ── 4. Veritabanı ───────────────────────────────────────────────────────────
log "MariaDB veritabanı hazırlanıyor"
mysql -uroot <<SQL
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
CREATE USER IF NOT EXISTS '$DB_USER'@'127.0.0.1' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'127.0.0.1';
FLUSH PRIVILEGES;
SQL

# ── 5. Kod ──────────────────────────────────────────────────────────────────
log "Repo çekiliyor"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch --all && git -C "$APP_DIR" reset --hard origin/HEAD
else
  mkdir -p "$(dirname "$APP_DIR")"
  git clone "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"

# ── 6. .env ─────────────────────────────────────────────────────────────────
if [ -n "$DOMAIN" ]; then SITE_URL="https://$DOMAIN"; else SITE_URL="http://$SERVER_IP"; fi
if [ ! -f .env ]; then
  log ".env oluşturuluyor"
  cat > .env <<ENV
NODE_ENV=production
DATABASE_URL="mysql://$DB_USER:$DB_PASS@127.0.0.1:3306/$DB_NAME"
NEXT_PUBLIC_SITE_URL="$SITE_URL"
JWT_SECRET="$JWT_SECRET"
TRUST_PROXY=1
REDIS_URL=redis://127.0.0.1:6379
CRON_SECRET="$CRON_SECRET"
ALLOW_INDEXING=true
LOG_LEVEL=info

# ── Doldurulacaklar ──
CDN_BASE_URL=""
CDN_UPLOAD_URL=""
CDN_UPLOAD_TOKEN=""
PAYTR_MERCHANT_ID=""
PAYTR_MERCHANT_KEY=""
PAYTR_MERCHANT_SALT=""
PAYTR_TEST_MODE=1
# NEXT_PUBLIC_BRAND_NAME=Ayshe Aksesuar
ENV
  chmod 600 .env
else
  # domain sonradan eklendiyse SITE_URL güncelle
  sed -i "s#^NEXT_PUBLIC_SITE_URL=.*#NEXT_PUBLIC_SITE_URL=\"$SITE_URL\"#" .env
fi

# ── 7. Build ────────────────────────────────────────────────────────────────
log "npm ci + prisma + build"
npm ci --include=dev
npx prisma generate
npx prisma migrate deploy
NODE_OPTIONS="--max-old-space-size=3072" npm run build

# ── 8. PM2 ──────────────────────────────────────────────────────────────────
log "PM2 başlatılıyor (port $PORT)"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$APP_NAME" --update-env
else
  PORT=$PORT pm2 start npm --name "$APP_NAME" -- start -- -p $PORT
fi
pm2 save
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

# ── 9. Nginx ────────────────────────────────────────────────────────────────
log "Nginx ayarlanıyor"
SERVER_NAMES="${DOMAIN:+$DOMAIN www.$DOMAIN}"
SERVER_NAMES="${SERVER_NAMES:-$SERVER_IP _}"
cat > /etc/nginx/sites-available/aysheaksesuar <<NGINX
server {
    listen 80;
    server_name $SERVER_NAMES;
    client_max_body_size 20M;

    location /_next/static/ {
        proxy_pass http://127.0.0.1:$PORT;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/aysheaksesuar /etc/nginx/sites-enabled/aysheaksesuar
# Domain yoksa default site IP'yi ezmesin
[ -z "$DOMAIN" ] && rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ── 10. Firewall ────────────────────────────────────────────────────────────
ufw allow OpenSSH >/dev/null; ufw allow 'Nginx Full' >/dev/null; ufw --force enable >/dev/null

# ── 11. SSL ─────────────────────────────────────────────────────────────────
if [ -n "$DOMAIN" ]; then
  DNS_IP="$(getent ahostsv4 "$DOMAIN" | awk 'NR==1{print $1}')"
  if [ "$DNS_IP" = "$SERVER_IP" ]; then
    log "Let's Encrypt SSL alınıyor"
    WWW=""; [ "$(getent ahostsv4 "www.$DOMAIN" | awk 'NR==1{print $1}')" = "$SERVER_IP" ] && WWW="-d www.$DOMAIN"
    certbot --nginx -d "$DOMAIN" $WWW --non-interactive --agree-tos -m "admin@$DOMAIN" --redirect || echo "!! SSL alınamadı, sonra tekrar deneyin"
  else
    echo "!! $DOMAIN DNS'i $SERVER_IP'ye bakmıyor (şu an: ${DNS_IP:-yok}). A kaydını düzeltip scripti tekrar çalıştırın."
  fi
fi

# ── 12. Cron (email outbox + bakım) ─────────────────────────────────────────
CRON_FILE=/etc/cron.d/aysheaksesuar
cat > $CRON_FILE <<CRON
*/2 * * * * root curl -fsS -X POST -H "x-cron-secret: $CRON_SECRET" http://127.0.0.1:$PORT/api/cron/email-outbox >/dev/null 2>&1
15 3 * * * root curl -fsS -X POST -H "x-cron-secret: $CRON_SECRET" http://127.0.0.1:$PORT/api/cron/maintenance >/dev/null 2>&1
CRON
chmod 644 $CRON_FILE

# ── 13. Smoke test ──────────────────────────────────────────────────────────
sleep 5
log "Smoke test"
curl -s -o /dev/null -w "ana sayfa: %{http_code}\n" http://127.0.0.1:$PORT/ || true
curl -s -w "\nhealth: %{http_code}\n" http://127.0.0.1:$PORT/api/health || true

log "BİTTİ → $SITE_URL"
echo "Admin oluşturmak için:"
echo "  cd $APP_DIR && npx tsx scripts/create-admin.ts --email ornek@mail.com --password 'GucluSifre123!' --name Admin"
echo "CDN / PayTR değerleri: nano $APP_DIR/.env  →  pm2 restart $APP_NAME"
