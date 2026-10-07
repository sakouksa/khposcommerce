# API Architecture & Consumer Routing

## Route Namespaces & Consumers

| Consumer | Primary URL Prefix | Backward Compatibility Alias | Route File |
| :--- | :--- | :--- | :--- |
| **Admin Dashboard** | `/api/v1/admin/*` | `/api/v1/*` | `routes/api/v1/admin.php` |
| **Customer Website** | `/api/v1/customer/*` | `/api/v1/store/*` | `routes/api/v1/customer.php` |
| **Flutter Mobile** | `/api/v1/mobile/*` | `/api/v1/*` | `routes/api/v1/mobile.php` |
| **Public & System** | `/api/v1/public/*` | `/api/v1/health`, `/api/v1/storage/*` | `routes/api/v1/public.php` |
| **Authentication** | `/api/v1/auth/*` | `/api/v1/profile/*`, `/api/v1/devices/*` | `routes/api/v1/auth.php` |

## Standard Response Structure

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "meta": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "UNPROCESSABLE_ENTITY",
  "errors": {
    "field": ["The field is required."]
  }
}
```
