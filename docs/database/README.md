# 🗄️ PostgreSQL 18 Database Architecture & 99 Tables Index

## 1. Overview
The database layer for OptaPOS is hosted on **PostgreSQL 18 Alpine**, comprising **99 normalized tables** managed via 36 Eloquent migration files. It enforces relational integrity, cascading rules, multi-column indexes, and pessimistic row locking for financial and inventory safety.

---

## 2. Table Domain Clusters

```
PostgreSQL 18 (99 Tables)
├── 🏢 Company & Organization (6 tables): companies, branches, warehouses, departments, positions, stores
├── 🔐 Users & RBAC (8 tables): users, roles, permissions, model_has_roles, role_has_permissions, password_resets, user_tokens, audit_logs
├── 📦 Products & Catalog (16 tables): products, product_variants, product_attributes, product_attribute_values, product_variant_values, categories, brands, units, taxes, product_images, price_tiers
├── 🏭 Inventory & Logistics (12 tables): inventories, inventory_movements, stock_transfers, stock_transfer_items, stock_adjustments, stock_adjustment_items, stock_opnames, low_stock_alerts
├── 🛒 Sales & POS (18 tables): sales, sale_items, pos_registers, pos_shifts, payments, payment_methods, coupons, discounts, sale_returns, sale_return_items, customer_points, invoices
├── 🚚 Purchases & Suppliers (10 tables): suppliers, supplier_contacts, purchases, purchase_items, purchase_receives, purchase_returns, purchase_payments, vendor_bills
├── 👥 Customers & CRM (7 tables): customers, customer_groups, customer_addresses, customer_reviews, wishlists, customer_activity_logs
├── 💼 Human Resources (10 tables): employees, attendances, leaves, leave_types, payrolls, salary_structures, bonus_penalties, employee_documents
└── 💰 Finance & System (12 tables): accounts, journal_entries, expenses, expense_categories, currency_rates, settings, notifications, media_files
```

---

## 3. Core Database Standards

1. **Primary Keys**: Every table uses auto-incrementing `id BIGSERIAL PRIMARY KEY` or `UUID` where external distribution is required.
2. **Foreign Keys**: Always indexed with strict `ON DELETE RESTRICT` for transactional records (e.g. Sales, Purchases, Inventory Movements) to prevent accidental loss of financial audit trails.
3. **Audit Timestamps**: All entities carry `created_at`, `updated_at`, and `deleted_at` (SoftDeletes).
4. **Money Fields**: All monetary amounts are stored as `DECIMAL(15, 4)` to eliminate floating-point rounding inaccuracies.

---
*Related Docs:*
- [Database Performance & Indexing Guide (100k - 1M+ Records)](file:///Users/macbook/Workspace/projects/showcase/khposcommerce/docs/database/database-performance-and-indexing.md)
- [🎓 Database Indexing Masterclass (Learning Guide)](file:///Users/macbook/Workspace/projects/showcase/khposcommerce/docs/tutorials/02-database-indexing-masterclass.md)
- [Schema Overview](file:///Users/macbook/Workspace/projects/showcase/khposcommerce/docs/database/schema-overview.md)
- [Data Dictionary](file:///Users/macbook/Workspace/projects/showcase/khposcommerce/docs/database/data-dictionary.md)
- [Atomic Row Locking](file:///Users/macbook/Workspace/projects/showcase/khposcommerce/docs/pos-flow.md)
