# syntax=docker/dockerfile:1

# HEARTROCKS backend: Express REST API + Socket.IO + Firebase Admin sync worker
FROM node:24-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# The Firebase Admin key is never baked into the image. Mount it at runtime:
#   -v "$PWD/serviceAccountKey.json:/app/serviceAccountKey.json:ro"
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/ > /dev/null || exit 1

CMD ["node", "server.js"]
