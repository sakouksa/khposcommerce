# 🔒 Atomic Row Locking & Concurrency Protection

## 1. Overview
In a multi-terminal retail store and active e-commerce storefront, simultaneous transactions on the last unit of stock can lead to **phantom inventory reads and overselling**. OptaPOS implements **PostgreSQL 18 `lockForUpdate()` pessimistic locking** inside strict database transactions.

---

## 2. The Problem: Race Condition Without Row Locking

```
Terminal A (Cashier at Counter)          Terminal B (Online Web Customer)
           │                                           │
  1. Read Stock = 1                           1. Read Stock = 1
  2. Validate: 1 >= 1 (OK)                    2. Validate: 1 >= 1 (OK)
  3. Write Stock = 1 - 1 = 0                  3. Write Stock = 1 - 1 = 0
           │                                           │
  Result: 2 Units Sold! Real Inventory = -1 (INVENTORY CORRUPTION 💥)
```

---

## 3. The Solution: Pessimistic Row Lock (`lockForUpdate()`)

```
Terminal A (Cashier at Counter)          Terminal B (Online Web Customer)
           │                                           │
  1. BEGIN TRANSACTION                                1. BEGIN TRANSACTION
  2. SELECT * FROM inventories                        2. SELECT * FROM inventories
     WHERE variant_id = 42                               WHERE variant_id = 42
     FOR UPDATE (Lock Acquired 🔒)                       FOR UPDATE (BLOCKED ⏳)
  3. Stock = 1 ➜ Deduct 1                                │ (Waiting for Terminal A)
  4. COMMIT (Lock Released 🔓)                           │
           │                                           │ (Lock Acquired 🔒)
                                                      3. Stock = 0 ➜ Deduct 1 fails!
                                                      4. ROLLBACK & Return HTTP 422:
                                                         "Product is out of stock"
```

---

## 4. Backend Implementation in `POSService.php`

```php
namespace App\Services\Sales;

use App\Models\Inventory\Inventory;
use App\Models\Inventory\InventoryMovement;
use App\Models\Sales\Sale;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class POSService
{
    public function checkout(array $data, int $userId, int $branchId): Sale
    {
        return DB::transaction(function () use ($data, $userId, $branchId) {
            $warehouseId = $data['warehouse_id'];

            foreach ($data['items'] as $item) {
                // 1. Acquire exclusive row-level lock on inventory row
                $inventory = Inventory::where('warehouse_id', $warehouseId)
                    ->where('product_variant_id', $item['product_variant_id'])
                    ->lockForUpdate()
                    ->first();

                if (!$inventory || $inventory->quantity < $item['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => "Insufficient stock for item: {$item['name']}. Available: " . ($inventory ? $inventory->quantity : 0)
                    ]);
                }

                // 2. Safely deduct inventory
                $previousQty = $inventory->quantity;
                $inventory->quantity -= $item['quantity'];
                $inventory->save();

                // 3. Record immutable inventory movement ledger entry
                InventoryMovement::create([
                    'warehouse_id'        => $warehouseId,
                    'product_variant_id'  => $item['product_variant_id'],
                    'movement_type'       => 'sale',
                    'quantity_change'     => -$item['quantity'],
                    'quantity_after'      => $inventory->quantity,
                    'reference_type'      => 'sale',
                    'created_by'          => $userId,
                ]);
            }

            // 4. Create Sale and Payments...
            return $sale;
        }, 5); // Retry 5 times on deadlock
    }
}
```

---
*Related Docs:*
- [POS Overview](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/pos/README.md)
- [Database Performance & Indexing](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/database/03-indexing-and-performance.md)
