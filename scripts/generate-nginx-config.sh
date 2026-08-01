#!/bin/bash
# generate-nginx-config.sh
set -euo pipefail
echo "Generating NGINX config for ${REPO_NAME}..."

cat > "${NGINX_CONFIG_SRC}" <<EOF
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
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_request_buffering off;
        proxy_read_timeout 300;
    }

    location /media/ {
        alias ${STATIC_MEDIA_PATH}/uploads/;
        autoindex off;
    }
}
EOF
