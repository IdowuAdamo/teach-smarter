#!/bin/bash
set -ex

# 1. System packages
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl wget git nginx jq python3 python3-pip python3-venv

# 2. Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 3. Install Astral UV
curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="/usr/local/bin" sh
chmod +x /usr/local/bin/uv

# 4. Download and extract codebase
mkdir -p /opt/teachsmarter
curl -sSL -o /tmp/deploy.tar.gz "https://teachsmarter-deploy-444134576202.s3.us-east-1.amazonaws.com/teachsmarter-deploy.tar.gz?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAWO2D32BFPQ6ISXNQ%2F20261104%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20261104T205338Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=bd0a96830d288c38a901eb72ac207669c5ac175945de3b5fb20e22c6698be809"
tar -xzf /tmp/deploy.tar.gz -C /opt/teachsmarter
cp /opt/teachsmarter/.env /opt/teachsmarter/backend/.env

# 5. Build backend
cd /opt/teachsmarter/backend
/usr/local/bin/uv sync

# 6. Build frontend
cd /opt/teachsmarter/frontend
npm install --legacy-peer-deps
npm run build

# 7. Configure Systemd Services
cat << 'EOF' > /etc/systemd/system/teachsmarter-backend.service
[Unit]
Description=TeachSmarter FastAPI Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/teachsmarter/backend
EnvironmentFile=/opt/teachsmarter/.env
ExecStart=/opt/teachsmarter/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

cat << 'EOF' > /etc/systemd/system/teachsmarter-frontend.service
[Unit]
Description=TeachSmarter Next.js Frontend
After=network.target teachsmarter-backend.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/teachsmarter/frontend
EnvironmentFile=/opt/teachsmarter/frontend/.env.local
Environment="PORT=3000"
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm run start -- -p 3000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# 8. Configure Nginx Reverse Proxy
cat << 'EOF' > /etc/nginx/sites-available/default
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    client_max_body_size 50M;

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_set_header Host $host;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8000/openapi.json;
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 9. Start Services
systemctl daemon-reload
systemctl enable teachsmarter-backend
systemctl enable teachsmarter-frontend
systemctl restart teachsmarter-backend
systemctl restart teachsmarter-frontend
nginx -t && systemctl restart nginx

# 10. Wait for backend and auto-seed demo classroom
sleep 10
curl -s -X POST http://127.0.0.1:8000/api/v1/demo/load || true

echo "TeachSmarter EC2 deployment complete!" > /var/log/teachsmarter-init-done.txt

