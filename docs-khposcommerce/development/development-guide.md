# 💻 Local Development Guide & Coding Standards

## 1. Environment Setup

### Prerequisites
- PHP 8.2 or 8.3 + Composer
- Node.js 20+ & npm
- Flutter 3.x & Android Studio / Xcode
- MySQL 8.0 & Redis 7.0 (or Docker)

---

## 2. Setting Up the Monorepo

```bash
# 1. Backend Setup
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000

# 2. Admin Dashboard & POS Setup
cd ../admin-dashboard
npm install
npm run dev

# 3. Customer Web Storefront Setup
cd ../customer-website
npm install
npm run dev

# 4. Mobile App Setup
cd ../mobile_app
flutter pub get
flutter run
```

---

## 3. Database Seeding & Mock Data Rules
- Always use `php artisan db:seed` to generate comprehensive enterprise demonstration data with realistic Cambodian/regional currency and realistic SKU structures.
- Never write hardcoded mock arrays inside React or Flutter view components. Connect via Axios / Dio to the local REST API.
