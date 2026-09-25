# ─── Stage 1: Build Customer Website SPA ─────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build-time Storefront API URL
ARG VITE_STORE_API_URL=https://api.example.com/api/v1/store
ARG VITE_API_URL=https://api.example.com/api/v1
ENV VITE_STORE_API_URL=$VITE_STORE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# ─── Stage 2: Production Nginx Server ─────────────────────────────────────────
FROM nginx:1.25-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
