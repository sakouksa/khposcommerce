# 🌐 Nginx API Gateway & Reverse Proxy

This configuration consolidates all KHPosCommerce micro-frontends and Laravel backend services under a single unified domain or port.

## Port Mapping

- **Port 8001**: Laravel 12 API (`/api/*`)
- **Port 5174**: React 19 Admin & Web POS (`/admin/*`)
- **Port 5173**: React 19 Customer Storefront (`/*`)

## Usage with Docker or Host Nginx

To run locally with Docker:
```bash
docker run --name khpos-gateway -p 80:80 -v $(pwd)/infrastructure/nginx/nginx.conf:/etc/nginx/nginx.conf:ro -d nginx:alpine
```
