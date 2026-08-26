# - name: Build frontend image
#   run: docker build \
#     --build-arg REACT_APP_API_URL=${{ vars.PUBLIC_API_DOMAIN }} \
#     --build-arg REACT_APP_FEATURE_FLAG=${{ vars.REACT_APP_FEATURE_FLAG }} \
#     -t ghcr.io/${{ github.repository }}/frontend:${{ github.sha }} 

# ------------------------------------------------------------- #
# BUILD STATIC FILES
FROM node:20-alpine AS frontend-build


# ------------------------------------------------------------- #
# ENV
ARG REACT_APP_API_URL
ARG REACT_APP_FEATURE_FLAG
ARG REACT_APP_MAX_FILES_PER_UPLOAD

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_FEATURE_FLAG=$REACT_APP_FEATURE_FLAG
ENV REACT_APP_MAX_FILES_PER_UPLOAD=$REACT_APP_MAX_FILES_PER_UPLOAD


# ------------------------------------------------------------- #
# COPY AND BUILD

WORKDIR /app

COPY package*.json ./
COPY frontend/package*.json frontend/
COPY backend/package*.json backend/

RUN npm ci
COPY frontend frontend/
RUN NODE_ENV=production npm run build --workspace frontend


# ------------------------------------------------------------- #
# NGINX SERVICE
FROM nginx:alpine
COPY --from=frontend-build /app/frontend/build /usr/share/nginx/html
COPY infra/nginx/frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

