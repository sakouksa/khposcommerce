# 🔌 API Endpoints Catalog

This document lists the primary RESTful API endpoints exposed by the Laravel backend.

---

## 1. Authentication & User Profile
- `POST /api/v1/auth/login`: Authenticate with email/username and password.
- `POST /api/v1/auth/logout`: Revoke active Sanctum token.
- `GET /api/v1/auth/me`: Get authenticated user profile, roles, and permissions.
- `POST /api/v1/auth/refresh`: Refresh token.

---

## 2. Product & Catalog Management
- `GET /api/v1/products`: List products with pagination, search, status filter, and eager loading.
- `POST /api/v1/products`: Create a new product with variants and initial stock.
- `GET /api/v1/products/{id}`: Fetch product details, variants, images, and tax rules.
- `PUT /api/v1/products/{id}`: Update product information.
- `DELETE /api/v1/products/{id}`: Soft delete product.
- `GET /api/v1/categories`: List hierarchical category tree.
- `POST /api/v1/categories`: Create category.
- `PUT /api/v1/categories/{id}`: Update category.
- `DELETE /api/v1/categories/{id}`: Delete category.
- `GET /api/v1/brands`: List brands.
- `GET /api/v1/units`: List measurement units (kg, pcs, box, liter).
- `GET /api/v1/attributes`: List variant attributes (Size, Color, Material).
- `GET /api/v1/taxes`: List tax rates and rules.

---

## 3. Inventory & Multi-Warehouse Management
- `GET /api/v1/inventory/levels`: Paginated stock levels across warehouses.
- `GET /api/v1/inventory/movements`: Real-time stock movement ledger (in, out, transfer, adjustment, opname).
- `POST /api/v1/inventory/adjustments`: Create stock adjustment with reason notes.
- `POST /api/v1/inventory/transfers`: Create inter-warehouse transfer request.
- `PUT /api/v1/inventory/transfers/{id}/receive`: Confirm receipt of transfer.
- `POST /api/v1/inventory/opnames`: Initialize stock audit (cycle count).
- `PUT /api/v1/inventory/opnames/{id}/reconcile`: Reconcile discrepancy.

---

## 4. Point of Sale (POS) & Checkout
- `GET /api/v1/pos/products`: High-speed cached product index with prices, barcodes, and stock levels.
- `POST /api/v1/pos/checkout`: Process POS sale transaction:
  - Generates receipt number
  - Decrements warehouse stock atomically
  - Supports split payment (Cash, ABA PayWay, KHQR, Credit Card)
  - Accumulates customer loyalty points.
- `POST /api/v1/pos/sales/{id}/void`: Void sale and restore inventory.
- `GET /api/v1/pos/registers/current`: Fetch open cash register status.
- `POST /api/v1/pos/registers/open`: Open cash register shift.
- `POST /api/v1/pos/registers/close`: Close cash register shift and record cash discrepancy.

---

## 5. Orders & Omnichannel Sales
- `GET /api/v1/orders`: List customer e-commerce and offline orders.
- `GET /api/v1/orders/{id}`: Order details, items, invoice, delivery timeline.
- `PUT /api/v1/orders/{id}/status`: Update order fulfillment status (`pending`, `processing`, `shipped`, `delivered`, `cancelled`).
- `POST /api/v1/orders/{id}/refund`: Process order refund.

---

## 6. Customers & Loyalty (CRM)
- `GET /api/v1/customers`: List customers with loyalty tier, spend total, points balance.
- `POST /api/v1/customers`: Register new customer.
- `GET /api/v1/customers/{id}`: Detailed customer profile and purchase history.
- `PUT /api/v1/customers/{id}`: Update customer profile.

---

## 7. Reports & Analytics
- `GET /api/v1/reports/sales-overview`: Revenue, profit margins, average order value, top-selling items.
- `GET /api/v1/reports/inventory-valuation`: Total inventory value by cost vs retail price.
- `GET /api/v1/reports/cashier-shifts`: Shift performance and cash reconciliations.
