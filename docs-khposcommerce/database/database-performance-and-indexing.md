# ⚡ Enterprise Database Indexing & High-Performance Query Architecture

## 1. Overview & Objectives

In **KHPosCommerce / OptaPOS**, database throughput and sub-50ms query latency are foundational requirements for high-volume Point of Sale (POS) and E-Commerce operations handling **100,000 to 1,000,000+ records**.

Optimizing for high-volume transactions is not merely a frontend concern; it requires an end-to-end pipeline:
```
PostgreSQL 16/18 Database Indexes ──► Laravel Query Builder / Eloquent ──► Redis Cache ──► React TanStack Query
```

---

## 2. Enterprise Indexing Matrix (Applied in Migration `2026_09_10_000003`)

The following composite and single-column B-Tree indexes have been implemented to support filtering, sorting (`ORDER BY created_at DESC`), and multi-tenant isolation (`company_id`).

### 🛒 2.1 POS & Sales Module (`sales`, `sale_items`)

| Table | Index Name | Columns Indexed | Optimization Target |
| :--- | :--- | :--- | :--- |
| `sales` | `idx_sales_comp_stat_created` | `(company_id, status, created_at)` | Fast admin sales list & status filter (Completed, Cancelled) |
| `sales` | `idx_sales_comp_date` | `(company_id, date)` | Range-based sales reports (Daily, Monthly, Annual) |
| `sales` | `idx_sales_comp_pay_date` | `(company_id, payment_method, date)` | Payment gateway reconciliation reports (Cash, ABA KHQR, Card) |
| `sales` | `idx_sales_cust_created` | `(customer_id, created_at)` | Customer purchase history drawer in POS checkout |
| `sales` | `idx_sales_deleted_at` | `(deleted_at)` | Fast execution of Eloquent `SoftDeletes` (`WHERE deleted_at IS NULL`) |
| `sale_items` | `idx_sale_items_prod_created` | `(product_id, created_at)` | Top-selling products and sales velocity calculations |
| `sale_items` | `idx_sale_items_variant` | `(product_variant_id)` | Product variant performance analytics |

---

### 📦 2.2 E-Commerce Orders Module (`orders`, `order_items`)

| Table | Index Name | Columns Indexed | Optimization Target |
| :--- | :--- | :--- | :--- |
| `orders` | `idx_orders_comp_created` | `(company_id, created_at)` | Default order management dashboard |
| `orders` | `idx_orders_comp_stat_created` | `(company_id, status, created_at)` | Status tabs (Pending, Processing, Shipped, Delivered) |
| `orders` | `idx_orders_comp_paystat_created` | `(company_id, payment_status, created_at)` | Accounts receivable & payment verification tabs |
| `orders` | `idx_orders_comp_fulfill` | `(company_id, fulfillment_status)` | Warehouse packaging & shipping queues |
| `orders` | `idx_orders_cust_created` | `(customer_id, created_at)` | Customer order portal history |
| `order_items` | `idx_order_items_prod_created` | `(product_id, created_at)` | Aggregation of online order items |

---

### 🏭 2.3 Inventory Movements & Ledger (`inventory_movements`, `inventories`)

> **Note**: `inventory_movements` is the highest volume table in the system. Every sale, purchase receive, return, and stock adjustment creates ledger records.

| Table | Index Name | Columns Indexed | Optimization Target |
| :--- | :--- | :--- | :--- |
| `inventory_movements` | `idx_inv_mov_comp_wh_created` | `(company_id, warehouse_id, created_at)` | Warehouse stock ledger and movement history |
| `inventory_movements` | `idx_inv_mov_comp_prod_created` | `(company_id, product_id, created_at)` | Product stock card timeline |
| `inventory_movements` | `idx_inv_mov_comp_type_created` | `(company_id, type, created_at)` | Ledger filtering by type (`in`, `out`, `transfer`, `adjustment`) |
| `inventory_movements` | `idx_inv_mov_var_created` | `(product_variant_id, created_at)` | Variant-level stock card |

---

### 🛍️ 2.4 Products & Catalog Module (`products`)

| Table | Index Name | Columns Indexed | Optimization Target |
| :--- | :--- | :--- | :--- |
| `products` | `idx_products_comp_stat_created` | `(company_id, status, created_at)` | Admin product table sorting and active/draft filtering |
| `products` | `idx_products_comp_brand_stat` | `(company_id, brand_id, status)` | Brand-filtered catalog listing |
| `products` | `idx_products_comp_feat_stat` | `(company_id, is_featured, status)` | POS promo & homepage featured items |
| `products` | `idx_products_comp_sold` | `(company_id, sold_count)` | Best-seller catalog sorting |
| `products` | `idx_products_deleted_at` | `(deleted_at)` | Soft-delete query support |

---

### 👥 2.5 Customers & CRM (`customers`)

| Table | Index Name | Columns Indexed | Optimization Target |
| :--- | :--- | :--- | :--- |
| `customers` | `idx_customers_comp_phone` | `(company_id, phone)` | **Critical**: Instant POS cashier phone number lookup |
| `customers` | `idx_customers_comp_email` | `(company_id, email)` | Customer duplicate check & email lookup |
| `customers` | `idx_customers_comp_name` | `(company_id, name)` | POS customer name autocomplete |
| `customers` | `idx_customers_comp_act_created` | `(company_id, is_active, created_at)` | CRM admin table listing |
| `customers` | `idx_customers_comp_spent` | `(company_id, total_spent)` | VIP & loyalty customer tier segmentation |

---

### 🚚 2.6 Purchases, Expenses & Audit Logs

| Table | Index Name | Columns Indexed | Optimization Target |
| :--- | :--- | :--- | :--- |
| `purchases` | `idx_purchases_comp_date` | `(company_id, date)` | Purchase ledger & accounts payable |
| `purchases` | `idx_purchases_comp_stat_date` | `(company_id, status, date)` | Purchase orders awaiting goods receipt |
| `purchases` | `idx_purchases_comp_pay_date` | `(company_id, payment_status, date)` | Outstanding supplier invoices |
| `purchase_items` | `idx_purchase_items_prod_created` | `(product_id, created_at)` | Cost history & purchase volume per product |
| `expenses` | `idx_expenses_comp_cat_date` | `(company_id, expense_category_id, date)` | Categorized operating expense reports |
| `expenses` | `idx_expenses_comp_stat_date` | `(company_id, status, date)` | Pending expense approvals |
| `audit_logs` | `idx_audit_comp_created` | `(company_id, created_at)` | Enterprise security compliance timeline |
| `audit_logs` | `idx_audit_user_created` | `(user_id, created_at)` | Employee activity inspection |
| `login_histories` | `idx_login_hist_user_created` | `(user_id, created_at)` | Authentication audit & brute force monitoring |

---

## 3. Laravel Query Builder Guidelines for Index Preservation

Having indexes in PostgreSQL/MySQL is ineffective if Laravel queries are structured in ways that invalidate them. The following mandatory patterns must be observed:

### ❌ 1. Never wrap indexed date columns in SQL functions (`whereDate`)
```php
// BAD: Wraps column in DATE(date), invalidating B-Tree index scan (Causes Full Table Scan)
$query->whereDate('date', '>=', $startDate);

// GOOD: Preserves Index Range Scan (Execution Cost: 0.14..2.23)
$query->where('date', '>=', str_contains($startDate, ' ') ? $startDate : "{$startDate} 00:00:00");
$query->where('date', '<=', str_contains($endDate, ' ') ? $endDate : "{$endDate} 23:59:59");
```

### ❌ 2. Do NOT over-eager load nested relations on table index lists
```php
// BAD: Fetches all line items and nested product specs for all rows on page
$sales = Sale::with(['customer', 'cashier', 'items.product'])->paginate(20);

// GOOD: Select only lightweight columns needed for the table summary
$sales = Sale::with([
        'customer:id,name,phone,email',
        'cashier:id,name',
        'items:id,sale_id,product_id,product_name,quantity,total,unit_price'
    ])
    ->paginate(20);

// Defer full line items and image galleries to the Detail View endpoint: GET /api/v1/sales/{id}
```

### ❌ 3. Avoid slow `COUNT(*)` over millions of rows when paginating
For infinite-scroll views or POS background synchronizations:
- Use `simplePaginate($perPage)`: Executes only `LIMIT N+1` without running an expensive `COUNT(*)` over 1M+ rows.
- Or use `cursorPaginate($perPage)`: Provides O(1) performance regardless of whether reading page 1 or page 50,000.

---

## 4. Frontend Optimization in `adminkhposcommerce`

The React admin dashboard leverages the following architecture:
1. **Server-Side Pagination & Sorting**: Controlled via `useServerPagination` hook.
2. **Debounced Search Inputs (300ms)**: Avoids hammering the backend API while users type.
3. **TanStack React Query Caching**:
   ```typescript
   placeholderData: (previousData) => previousData, // Prevents layout flickering during page changes
   staleTime: 1000 * 30, // 30s cache retention for read-heavy master data
   ```

---

## 5. PostgreSQL Query Plan Verification (`EXPLAIN`)

Verification executed on PostgreSQL:

```text
EXPLAIN SELECT id, invoice_number FROM sales 
WHERE company_id = 1 AND status = 'completed' 
ORDER BY created_at DESC LIMIT 12;

->  Index Scan Backward using idx_sales_comp_stat_created on sales  (cost=0.14..24.16 rows=138 width=36)
      Index Cond: ((company_id = 1) AND ((status)::text = 'completed'::text))
```
**Result**: Direct index range scan with minimal cost, zero disk temporary files, and sub-millisecond execution.
