FROM node:20-alpine 

# Set working directory
WORKDIR /usr/src/app

# Copy backend dependencies
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install backend dependencies
RUN npm run ci:backend

# Copy backend source
COPY backend ./backend


EXPOSE 5000
CMD ["node", "backend/src/app.js"]
