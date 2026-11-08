# 📦 Inventory & Multi-Warehouse Management Flow

## 1. Inventory Architecture & Core Concepts

The inventory subsystem provides real-time visibility and absolute auditability across multiple warehouses and store locations.

```mermaid
flowchart TD
    subgraph Operations[" Inventory Operations "]
        PO[Goods Receiving from PO]
        POS[Point of Sale Sale]
        EC[E-Commerce Order Delivery]
        ADJ[Stock Adjustment]
        TRF[Inter-Warehouse Transfer]
        OPN[Stock Cycle Count / Opname]
    end

    subgraph Ledger[" Single Source of Truth "]
        Movement[("📋 Immutable inventory_movements\n(Audit Trail: in, out, transfer, adjustment, opname)")]
        Stock[("🏬 inventories Table\n(warehouse_id + product_id + quantity)")]
    end

    PO -->|type: 'purchase' (+)| Movement
    POS -->|type: 'out' (-)| Movement
    EC -->|type: 'out' (-)| Movement
    ADJ -->|type: 'adjustment' (+/-)| Movement
    TRF -->|type: 'transfer_out' / 'transfer_in'| Movement
    OPN -->|type: 'opname' (reconcile)| Movement

    Movement -->|Atomic Sync| Stock
```

---

## 2. Inventory Operation Lifecycles

### 2.1 Inter-Warehouse Stock Transfers (`stock_transfers`)
1. **Initiate Transfer**: Source warehouse creates transfer draft with items and quantities (`status = 'pending'`).
2. **Ship Transfer**: Source warehouse approves and marks as shipped (`status = 'in_transit'`). Stock is immediately deducted from Source Warehouse.
3. **Receive Transfer**: Destination warehouse inspects physical goods and clicks "Receive" (`status = 'completed'`). Stock is added to Destination Warehouse.

### 2.2 Stock Adjustments (`stock_adjustments`)
Used for damaged goods, expired products, inventory corrections, or write-offs:
- Requires Reason Category (e.g., `damaged`, `expired`, `stolen`, `correction`, `bonus`).
- Manager approval workflow (`POST /api/v1/stock-adjustments/{id}/approve`).
- Immediately adjusts `inventories.quantity` and writes an audit ledger entry.

### 2.3 Stock Audits & Cycle Counts (`stock_opnames`)
1. **Freeze / Snapshot**: Manager selects warehouse and generates physical count sheet.
2. **Counting**: Staff counts physical items and enters counted quantities.
3. **Variance Report**: System automatically compares `system_quantity` vs `counted_quantity` and calculates financial variance ($).
4. **Reconcile**: Manager reviews and approves count (`POST /api/v1/stock-opnames/{id}/complete`), automatically posting adjustment movements for all discrepancies.
