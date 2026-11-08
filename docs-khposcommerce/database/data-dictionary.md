# 🗄️ Database Data Dictionary

This document details the primary tables and columns within the **Enterprise POS & E-Commerce** database.

---

## 1. `products` (Product Master Catalog)

| Column Name | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | Primary Key |
| `name` | `VARCHAR(255)` | NO | — | Product name |
| `slug` | `VARCHAR(255)` | NO | — | URL-friendly unique slug |
| `sku` | `VARCHAR(100)` | NO | — | Unique Stock Keeping Unit |
| `barcode` | `VARCHAR(100)` | YES | NULL | EAN-13, UPC, or Code128 barcode |
| `category_id` | `BIGINT UNSIGNED` | YES | NULL | Foreign key to `categories.id` |
| `brand_id` | `BIGINT UNSIGNED` | YES | NULL | Foreign key to `brands.id` |
| `unit_id` | `BIGINT UNSIGNED` | YES | NULL | Foreign key to `units.id` |
| `cost_price` | `DECIMAL(12, 4)` | NO | `0.0000` | Unit purchase / manufacturing cost |
| `selling_price`| `DECIMAL(12, 4)` | NO | `0.0000` | Standard retail selling price |
| `reorder_point`| `INT` | NO | `5` | Low stock alert threshold |
| `status` | `ENUM('active', 'inactive')` | NO | `'active'` | Publishing status |
| `created_at` | `TIMESTAMP` | YES | NULL | Creation timestamp |
| `updated_at` | `TIMESTAMP` | YES | NULL | Last modification timestamp |
| `deleted_at` | `TIMESTAMP` | YES | NULL | Soft delete timestamp |

---

## 2. `stock_levels` (Multi-Warehouse Inventory Counts)

| Column Name | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | Primary Key |
| `warehouse_id` | `BIGINT UNSIGNED` | NO | — | Foreign key to `warehouses.id` |
| `product_id` | `BIGINT UNSIGNED` | NO | — | Foreign key to `products.id` |
| `variant_id` | `BIGINT UNSIGNED` | YES | NULL | Foreign key to `product_variants.id` |
| `quantity` | `DECIMAL(12, 2)` | NO | `0.00` | Physical stock count |
| `reserved_qty` | `DECIMAL(12, 2)` | NO | `0.00` | Quantity reserved for pending orders |
| `rack_location`| `VARCHAR(50)` | YES | NULL | Aisle/shelf/bin coordinate |

---

## 3. `stock_movements` (Immutable Audit Ledger)

| Column Name | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | Primary Key |
| `warehouse_id` | `BIGINT UNSIGNED` | NO | — | Warehouse location |
| `product_id` | `BIGINT UNSIGNED` | NO | — | Target product |
| `type` | `VARCHAR(50)` | NO | — | `sale`, `purchase`, `transfer_in`, `transfer_out`, `adjustment`, `opname` |
| `quantity` | `DECIMAL(12, 2)` | NO | — | Positive (addition) or negative (reduction) |
| `balance_after`| `DECIMAL(12, 2)` | NO | — | Resulting balance after transaction |
| `reference_no` | `VARCHAR(100)` | YES | NULL | Receipt / Invoice / PO / Transfer # |
| `user_id` | `BIGINT UNSIGNED` | YES | NULL | User who initiated transaction |
| `notes` | `TEXT` | YES | NULL | Reason description / comments |
| `created_at` | `TIMESTAMP` | YES | CURRENT_TIMESTAMP | Audit timestamp |

---

## 4. `pos_sales` (Point of Sale Orders)

| Column Name | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | Primary Key |
| `invoice_no` | `VARCHAR(100)` | NO | — | Unique receipt / invoice sequence |
| `warehouse_id` | `BIGINT UNSIGNED` | NO | — | Branch / Store location |
| `customer_id` | `BIGINT UNSIGNED` | YES | NULL | Customer reference (or Walk-in) |
| `cashier_id` | `BIGINT UNSIGNED` | NO | — | Cashier user ID |
| `subtotal` | `DECIMAL(12, 4)` | NO | `0.0000` | Gross item total |
| `tax_total` | `DECIMAL(12, 4)` | NO | `0.0000` | Total tax applied |
| `discount_total`| `DECIMAL(12, 4)`| NO | `0.0000` | Total discount granted |
| `grand_total` | `DECIMAL(12, 4)` | NO | `0.0000` | Final payable total |
| `payment_status`| `ENUM('paid', 'partial', 'unpaid', 'refunded')` | NO | `'paid'` | Payment state |
| `created_at` | `TIMESTAMP` | YES | CURRENT_TIMESTAMP | Sale completion time |
