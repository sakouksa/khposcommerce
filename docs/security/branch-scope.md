# 🏢 KHPosCommerce — Multi-Branch & Multi-Tenant Data Isolation

## 1. Security Formula & Core Philosophy
Permission determines **WHAT** an action is; Scope determines **WHERE** that action is permitted.

```
USER REQUEST
  ├── Authenticated User Context (JWT)
  ├── User Assigned Branches: User::accessibleBranchIds()
  └── User Assigned Warehouses: User::accessibleWarehouseIds()
        ↓
    SCOPE ENFORCEMENT ENGINE (AccessScopeService / Eloquent Query Scope)
        ↓
    DATABASE QUERY CONSTRAINED AUTOMATICALLY:
    WHERE branch_id IN (authorized_branch_ids)
```

> **CRITICAL SECURITY RULE:**  
> The backend **NEVER** trusts query parameters (`?branch_id=...`) or JSON payloads (`"branch_id": ...`) sent from the client as authorization. If a user in Branch A passes `branch_id=2` (Branch B), the backend immediately rejects the request with HTTP `403 Forbidden` or ignores the parameter and confines the query to Branch A.

---

## 2. Resource Scope Classification

### A. Global / Corporate Master Data (Company-Wide)
- **Products Catalog:** Products, Categories, Brands, Units, Taxes, Attributes.
- **Corporate Entities:** Company Profiles (Legal entity, central settings, currencies, languages).
- *Access Rule:* All branches share the common master catalog; only authorized admins/managers can edit master definitions.

### B. Branch-Scoped Resources (Assigned Branch Only)
- **Sales & Orders:** `sales`, `sale_items`, `orders`, `order_items`, `sale_returns`.
- **POS Operations:** `cash_registers`, `cash_register_transactions`.
- **Purchases:** `purchases`, `purchase_items`, `purchase_returns`, `purchase_return_items`.
- **Finance:** `expenses`, `transactions`.
- **Human Resources:** `employees`, `attendance`, `shifts`, `leave_requests`, `payrolls`.
- **Local Infrastructure:** `stores`, `branches`.
- *Access Rule:* A user can ONLY view, create, edit, export, or refund records belonging to their assigned branch ID (`user_branches` pivot table).

### C. Warehouse-Scoped Resources (Assigned Warehouse Only)
- **Inventory Stock:** `inventories`, `inventory_movements`.
- **Stock Adjustments:** `stock_adjustments`, `stock_adjustment_items`.
- **Stock Opnames:** `stock_opnames`, `stock_opname_items`.
- **Stock Transfers:** `stock_transfers`, `stock_transfer_items`.
- *Access Rule:* A user can only execute stock counts, write-offs, or view balance sheets for warehouses mapped to their assigned branch.
- *Dual-Warehouse Rule (Transfers):* For transfers between branches, the initiator must have access to `from_warehouse_id`, and receiving staff must have access to `to_warehouse_id`. Cross-warehouse unauthorized injection is rejected server-side.

### D. User-Owned Storefront Data (Personal Ownership Scope)
- **Storefront E-Commerce:** `carts`, `wishlists`, `customer_addresses`, `product_reviews`.
- *Access Rule:* Strictly constrained by `user_id === auth()->id()`. Even with valid permissions, Customer A cannot view or alter Customer B's addresses or carts.
