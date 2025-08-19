# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Install deps first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
# Pass your API base at build time if you use import.meta.env.VITE_API_BASE
# docker build --build-arg VITE_API_BASE=http://localhost:8080 -t frontend .
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:stable-alpine
# Copy a minimal nginx config with SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
