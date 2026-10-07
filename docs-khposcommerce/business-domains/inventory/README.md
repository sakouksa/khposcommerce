# 🏭 Inventory & Multi-Warehouse Domain Manual

## 1. Overview
The **Inventory Domain** is the core operational engine of OptaPOS. It manages physical stock quantities, valuations, inter-warehouse transfers, stock adjustments, and immutable inventory movement ledgers.

---

## 2. Inventory Movement Architecture (The Immutable Ledger)

Every change in inventory MUST record a row in `inventory_movements`. Physical quantity in `inventories.quantity` is the cached balance of this ledger.

```mermaid
graph LR
    PO["Purchase Order Received"] -->|Stock Increase (+)| IN["inventories.quantity"]
    Sale["POS / Web Sale"] -->|Stock Decrease (-)| IN
    Transfer["Stock Transfer"] -->|Src (-) / Dst (+)| IN
    Adjustment["Audit Correction"] -->|Delta (+/-)| IN

    IN --> IM[("inventory_movements<br/>(Immutable Audit Ledger)")]
```

---

## 3. Key Workflows

### A. Purchase Receiving Flow
1. Staff verifies received goods against Purchase Order (`purchase_items`).
2. Backend executes `InventoryService::receiveStock()`.
3. Increases `inventories.quantity` for the destination warehouse.
4. Calculates new **Weighted Average Cost (WAC)** or FIFO cost layer:
   $$\text{New Unit Cost} = \frac{(\text{Current Qty} \times \text{Current Cost}) + (\text{Received Qty} \times \text{Purchase Price})}{\text{Total New Qty}}$$
5. Appends movement entry with `movement_type = 'purchase_receive'`.

### B. Inter-Warehouse Transfer Flow
1. **Initiate Transfer**: Status set to `in_transit`. Stock is immediately deducted from the source warehouse to prevent double-allocation.
2. **Receive at Destination**: Receiving warehouse confirms arrival. Stock is credited to the destination warehouse.
3. **Discrepancy Resolution**: If units were damaged or lost during transit, a `transfer_discrepancy` adjustment is logged.

---

## 4. Key Files in Codebase

| Layer | File Path | Purpose |
|---|---|---|
| **Inventory Model** | `backend/app/Models/Inventory/Inventory.php` | Warehouse stock balance table |
| **Movement Model** | `backend/app/Models/Inventory/InventoryMovement.php` | Immutable stock audit ledger |
| **Transfer Model** | `backend/app/Models/Inventory/StockTransfer.php` | Multi-warehouse transfer records |
| **Service Layer** | `backend/app/Services/Inventory/InventoryService.php` | Atomic stock operations & WAC calculations |
| **Admin Page** | `admin-dashboard/src/pages/inventory/InventoryListPage.tsx` | Real-time multi-warehouse stock table |
| **Mobile Screen** | `mobile_app/lib/features/inventory/presentation/pages/stock_check_page.dart` | Barcode stock inspector |

---
*Related Docs:*
- [Atomic Row Locking](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/pos/atomic-row-locking.md)
- [Purchasing Domain](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/business-domains/purchasing/README.md)
