# 🔌 API Overview & Standards

## 1. Base URL & Protocol

All API requests are served over HTTPS and prefixed with the version identifier:
```text
https://api.yourdomain.com/api/v1
```
Local development URL:
```text
http://localhost:8000/api/v1 (or http://localhost:8001/api/v1)
```

---

## 2. Authentication (Bearer Token / Sanctum)

Authentication uses Laravel Sanctum bearer tokens. Protected endpoints require the `Authorization` header:

```http
Authorization: Bearer <your_jwt_or_sanctum_token>
Accept: application/json
Content-Type: application/json
```

---

## 3. Standard JSON Envelope Format

### 3.1 Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "message": "Resource fetched successfully",
  "data": {
    "id": 101,
    "name": "Organic Arabica Coffee Beans",
    "sku": "COF-ARA-500G",
    "price": 14.50,
    "status": "active"
  }
}
```

### 3.2 Paginated List Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Espresso Roast", "price": 12.00 }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 15,
    "per_page": 20,
    "total": 300,
    "from": 1,
    "to": 20
  },
  "links": {
    "first": "https://api.yourdomain.com/api/v1/products?page=1",
    "last": "https://api.yourdomain.com/api/v1/products?page=15",
    "prev": null,
    "next": "https://api.yourdomain.com/api/v1/products?page=2"
  }
}
```

### 3.3 Error Response (`422 Unprocessable Entity`, `400`, `401`, `403`, `500`)
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "sku": [
      "The SKU has already been taken."
    ],
    "price": [
      "The price field is required."
    ]
  }
}
```

---

## 4. Query Parameters & Standards

| Parameter | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `page` | `integer` | Page number for pagination | `?page=2` |
| `per_page` | `integer` | Number of items per page (default: 15, max: 100) | `?per_page=25` |
| `search` | `string` | Search query across names, SKUs, barcodes, phones | `?search=Arabica` |
| `status` | `string` | Filter status (`active`, `inactive`, `all`) | `?status=active` |
| `sort_by` | `string` | Field to sort by | `?sort_by=created_at` |
| `sort_dir` | `string` | Sort direction (`asc`, `desc`) | `?sort_dir=desc` |
| `warehouse_id` | `integer` | Scope results to specific warehouse | `?warehouse_id=1` |
