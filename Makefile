.PHONY: help dev dev-all dev-api dev-admin dev-superadmin dev-platform dev-storefront dev-mobile api admin superadmin platform storefront mobile setup install db-migrate db-seed docker-up docker-down docker-logs

help:
	@echo "Available shortcut commands:"
	@echo "  make dev             - Run API & Admin concurrently"
	@echo "  make dev-all         - Run API, SuperAdmin, Admin, & Storefront"
	@echo "  make dev-api         - Run Laravel API (port 8001)"
	@echo "  make dev-admin       - Run Admin Web / POS"
	@echo "  make dev-superadmin  - Run SuperAdmin Web Client (port 3002)"
	@echo "  make dev-platform    - Alias for dev-superadmin"
	@echo "  make dev-storefront  - Run Customer Storefront Web"
	@echo "  make dev-mobile      - Run Flutter Mobile POS"
	@echo "  make setup           - Setup dependencies & API environment"
	@echo "  make db-migrate      - Run Database Migrations"
	@echo "  make db-seed         - Seed Database"
	@echo "  make docker-up       - Start Docker Containers"
	@echo "  make docker-down     - Stop Docker Containers"

dev:
	npm run dev

dev-all:
	npm run dev:all

dev-api:
	npm run dev:api

api:
	npm run dev:api

dev-admin:
	npm run dev:admin

admin:
	npm run dev:admin

dev-superadmin:
	npm run dev:superadmin

superadmin:
	npm run dev:superadmin

dev-platform:
	npm run dev:superadmin

platform:
	npm run dev:superadmin

dev-storefront:
	npm run dev:storefront

storefront:
	npm run dev:storefront

dev-mobile:
	npm run dev:mobile

mobile:
	npm run dev:mobile

setup:
	npm run setup

install:
	npm install

db-migrate:
	npm run db:migrate

db-seed:
	npm run db:seed

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f
