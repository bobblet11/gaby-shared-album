#!/bin/bash
# generate-nginx-config.sh
set -euo pipefail
echo "Generating NGINX config for ${REPO_NAME} at ${NGINX_CONFIG_SRC}..."

sudo mkdir -p "$(dirname "$NGINX_CONFIG_SRC")"
sudo touch "$NGINX_CONFIG_SRC"
sudo chown -R $USER:$USER "$(dirname "$NGINX_CONFIG_SRC")"


sudo cat > "${NGINX_CONFIG_SRC}" <<EOF
server {
    listen 80;
    listen [::]:80;
    client_max_body_size 50M;

    server_name _;

    location / {
        root ${FRONTEND_BUILD_DST};
        index index.html;
        try_files \$uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:${API_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_request_buffering off;
        proxy_read_timeout 300;
    }

    location /media/ {
        alias ${STATIC_MEDIA_PATH}/;
        autoindex off;
    }
}
EOF

echo "Generated NGINX config"
