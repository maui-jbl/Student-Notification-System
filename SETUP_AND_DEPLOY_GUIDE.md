# Complete Setup & Deployment Guide

## Architecture

```
┌───────────────────────────────────────────────┐
│              Web Browser (User)                │
│  Responsive Web Dashboard (React + Vite)      │
└──────────────────────┬────────────────────────┘
                       │
               HTTP :80/443
                       │
                ┌──────▼──────┐
                │   Nginx     │
                │  (Reverse   │
                │   Proxy)    │
                └──┬──────┬───┘
                   │      │
          /api  :5000     static files
                   │      │
            ┌──────▼──┐ ┌─▼───────────┐
            │ Express  │ │ Web Dashboard│
            │  API     │ │  (dist/)    │
            └──┬───────┘ └─────────────┘
               │
         ┌─────▼──────┐     ┌─────────────────┐
         │  Mosquitto  │     │  MySQL Database  │
         │  MQTT :1885 │     │  :3306           │
         │  WS :9001   │     │                  │
         └────────────┘     └─────────────────┘
```

---

## 1. Backend Deployment (VPS / Cloud Server)

### Option A: Manual Setup (Ubuntu/Debian)

```bash
# --- Connect to your VPS ---
ssh root@YOUR_SERVER_IP

# --- Install dependencies ---
apt update && apt upgrade -y
apt install -y nginx mysql-server mosquitto mosquitto-clients nodejs npm git

# --- Install Node.js 20+ ---
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# --- Clone project ---
git clone https://github.com/YOUR_USER/Student_Notification_System.git /var/www/studnet
cd /var/www/studnet

# --- Setup MySQL ---
mysql -u root < database.sql
mysql -u root student_notification_system < database.migration.sql

# --- Setup Backend ---
cd backend
cp .env.example .env
# Edit .env with your production values:
#   DB_HOST=localhost
#   DB_USER=root
#   DB_PASSWORD=your_mysql_password
#   MQTT_BROKER_URL=mqtt://localhost:1885
nano .env

npm install

# --- Install PM2 (process manager) ---
npm install -g pm2
pm2 start src/server.js --name studnet-backend
pm2 save
pm2 startup   # run the command it outputs to enable on boot

# --- Setup Mosquitto ---
cp ../mosquitto-custom.conf /etc/mosquitto/conf.d/studnet.conf
systemctl restart mosquitto
systemctl enable mosquitto
```

### Option B: Docker (Alternative)

```dockerfile
# Create docker-compose.yml in project root:
# (Example — adapt as needed)
```

---

## 2. Mosquitto MQTT Configuration

Ensure `/etc/mosquitto/conf.d/studnet.conf` contains:

```conf
listener 1885 0.0.0.0
protocol mqtt

listener 9001 0.0.0.0
protocol websockets

allow_anonymous true
```

Restart: `systemctl restart mosquitto`

---

## 3. Web Dashboard Deployment

```bash
cd /var/www/studnet/web-dashboard
npm install
npm run build    # produces dist/

# Configure Nginx:
cat > /etc/nginx/sites-available/studnet << 'EOF'
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/studnet/web-dashboard/dist;
    index index.html;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

ln -s /etc/nginx/sites-available/studnet /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Optional: SSL with Let's Encrypt
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

---

## 4. Firewall Rules

Open these ports on your VPS:

| Port | Purpose |
|------|---------|
| 80   | HTTP (web dashboard) |
| 443  | HTTPS (web dashboard) |
| 5000 | Backend API |
| 1885 | MQTT |
| 9001 | MQTT WebSocket |

```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5000/tcp
ufw allow 1885/tcp
ufw allow 9001/tcp
ufw enable
```

---

## 5. Environment Variables (backend/.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | `5000` |
| `JWT_SECRET` | JWT signing secret | Change this! |
| `DB_HOST` | MySQL host | `127.0.0.1` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | — |
| `DB_NAME` | Database name | `student_notification_system` |
| `MQTT_PORT` | MQTT broker port | `1885` |
| `MQTT_BROKER_URL` | Broker connection URL | `mqtt://127.0.0.1:1885` |
| `MQTT_HOST` | Broker bind address | `0.0.0.0` |

---

## 6. Quick Start Checklist

- [ ] `database.sql` imported into MySQL
- [ ] `.env` configured with production values
- [ ] Mosquitto running on ports 1885 + 9001
- [ ] Backend running via PM2 (`pm2 list`)
- [ ] Web dashboard built (`npm run build`)
- [ ] Nginx configured and serving dashboard
- [ ] Firewall allows required ports
- [ ] DNS pointing to server (if using domain)

---

## 7. Useful Commands

```bash
# Monitor backend
pm2 logs studnet-backend

# Restart backend
pm2 restart studnet-backend

# Monitor MQTT
journalctl -u mosquitto -f

# Update web dashboard
cd web-dashboard && git pull && npm install && npm run build
```
