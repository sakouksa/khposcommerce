# 🔧 Troubleshooting & Known Issues Guide

## 1. Common Issues & Solutions

### 1.1 Backend Database Connection / Migration Error
- **Symptom**: `SQLSTATE[HY000] [2002] Connection refused` or `Table doesn't exist`.
- **Fix**:
  1. Check if MySQL is running: `docker compose ps` or `brew services list`.
  2. Verify `.env` matches your database port and credentials (`DB_PORT=3306`, `DB_DATABASE=enterprise_pos`).
  3. Re-run migrations: `php artisan migrate:fresh --seed`.

### 1.2 CORS Error on Frontend / Mobile API Requests
- **Symptom**: `Access to XMLHttpRequest at 'http://localhost:8000/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy`.
- **Fix**:
  1. In `backend/config/cors.php`, ensure `'supports_credentials' => true` and `'paths' => ['api/*', 'sanctum/csrf-cookie']`.
  2. Clear config cache: `php artisan config:clear`.

### 1.3 Vite Module Resolution / TypeScript Build Failure
- **Symptom**: `npm run build` fails with `Cannot find module '@/...'`.
- **Fix**:
  1. Check `tsconfig.json` paths mapping: `"@/*": ["./src/*"]`.
  2. Delete `dist` and `node_modules` and re-run: `rm -rf node_modules && npm install && npm run build`.

### 1.4 POS Print Receipt Thermal Font Formatting
- **Symptom**: Thermal receipt renders unformatted text or garbled Khmer Unicode characters.
- **Fix**:
  1. Use Canvas / Bitmap rendering for thermal printers without native Khmer codepages.
  2. Standardize on ESC/POS graphic printing commands.
