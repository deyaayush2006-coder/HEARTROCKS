# syntax=docker/dockerfile:1

# HEARTROCKS dashboard: React + Vite, built with Node and served as static files by nginx

# Stage 1: build the static bundle
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# The browser talks to the backend directly, so its URL is fixed at build time.
ARG VITE_BACKEND_URL=http://localhost:5000
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
RUN npm run build

# Stage 2: serve the bundle
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
