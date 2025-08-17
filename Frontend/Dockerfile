# This Dockerfile assumes you'll later add a Vite React app (dist folder after build).
# Until then, we serve a tiny placeholder page with nginx.

# Build stage (used later when you add real frontend code)
FROM node:20 AS build
WORKDIR /app
# When you add code:
# COPY package.json package-lock.json ./
# RUN npm ci
# COPY . .
# ARG VITE_API_BASE
# ENV VITE_API_BASE=$VITE_API_BASE
# RUN npm run build

# Runtime: serve static files
FROM nginx:stable-alpine
# Placeholder index.html so the image works now
RUN mkdir -p /usr/share/nginx/html
RUN printf '<!doctype html><html><head><meta charset="utf-8"><title>Frontend Placeholder</title></head><body><h1>Frontend container is up.</h1><p>Add your React app to replace this page.</p></body></html>' > /usr/share/nginx/html/index.html
EXPOSE 80
