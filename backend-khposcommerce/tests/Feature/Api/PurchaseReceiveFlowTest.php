<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Models\Company\Warehouse;
use App\Models\Product\Product;
use App\Models\Product\Unit;
use App\Models\Inventory\Inventory;
use App\Models\Purchase\Purchase;
use App\Models\Purchase\PurchaseItem;
use App\Models\Supplier\Supplier;
use App\Services\Purchase\Actions\ReceivePurchaseAction;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PurchaseReceiveFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_receive_purchase_order_and_increment_stock(): void
    {
        $company = Company::create([
            'name'  => 'Enterprise Supply Corp',
            'code'  => 'ESC',
            'slug'  => 'enterprise-supply-corp',
            'email' => 'supply@enterprise.com',
        ]);

        $branch = Branch::create([
            'company_id' => $company->id,
            'name'       => 'Logistics Hub',
            'code'       => 'LH01',
        ]);

        $warehouse = Warehouse::create([
            'company_id' => $company->id,
            'branch_id'  => $branch->id,
            'name'       => 'Receiving Bay',
            'code'       => 'WH02',
        ]);

        $unit = Unit::create([
            'company_id' => $company->id,
            'name'       => 'Box',
            'symbol'     => 'box',
        ]);

        $product = Product::create([
            'company_id'     => $company->id,
            'unit_id'        => $unit->id,
            'name'           => 'Mechanical Keyboard Switch Set',
            'slug'           => 'mechanical-keyboard-switch-set',
            'sku'            => 'MKS-099',
            'selling_price'  => 30.00,
            'stock_quantity' => 20,
            'is_active'      => true,
        ]);

        $supplier = Supplier::create([
            'company_id' => $company->id,
            'name'       => 'Keychron Global Supplies',
            'code'       => 'KGS-01',
            'email'      => 'sales@keychron.com',
        ]);

        $purchase = Purchase::create([
            'company_id'       => $company->id,
            'branch_id'        => $branch->id,
            'warehouse_id'     => $warehouse->id,
            'supplier_id'      => $supplier->id,
            'reference_number' => 'PO-2026-0001',
            'date'             => now()->toDateString(),
            'status'           => 'ordered',
            'total_amount'     => 600.00,
        ]);

        $purchaseItem = PurchaseItem::create([
            'purchase_id' => $purchase->id,
            'product_id'  => $product->id,
            'quantity'    => 20,
            'unit_cost'   => 30.00,
            'subtotal'    => 600.00,
            'total'       => 600.00,
        ]);

        $inventory = Inventory::create([
            'company_id'         => $company->id,
            'warehouse_id'       => $warehouse->id,
            'product_id'         => $product->id,
            'product_variant_id' => null,
            'quantity'           => 20,
            'reserved_quantity'  => 0,
        ]);

        $action = app(ReceivePurchaseAction::class);
        $receivedPurchase = $action->execute($purchase, [
            [
                'item_id'           => $purchaseItem->id,
                'quantity_received' => 20,
            ],
        ]);

        $this->assertNotNull($receivedPurchase);
        $this->assertEquals('received', $receivedPurchase->status);

        // Check stock incremented from 20 to 40 in warehouse inventory
        $inventory->refresh();
        $this->assertEquals(40, (int) $inventory->quantity);

        // Verify inventory movement record exists
        $this->assertDatabaseHas('inventory_movements', [
            'product_id'   => $product->id,
            'warehouse_id' => $warehouse->id,
            'type'         => 'in',
            'quantity'     => 20,
        ]);
    }
}
