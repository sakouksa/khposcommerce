<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Models\Company\Warehouse;
use App\Models\Supplier\Supplier;
use App\Models\Product\Product;
use App\Models\Product\Unit;
use App\Models\Purchase\Purchase;
use App\Models\Purchase\PurchaseItem;
use App\Models\Purchase\PurchaseReturn;
use App\Models\Inventory\Inventory;
use App\Services\Auth\JwtTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Database\Seeders\RolesPermissionsSeeder;
use Spatie\Permission\Models\Permission;

class PurchaseReturnFlowTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected string $token;
    protected $company;
    protected $branch;
    protected $supplier;
    protected $warehouse;
    protected $unit;
    protected $product;
    protected $purchase;
    protected $purchaseItem;
    protected $inventory;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesPermissionsSeeder::class);

        $this->company = Company::create([
            'name' => 'Enterprise Showcase POS',
            'code' => 'ESP',
            'slug' => 'enterprise-showcase-pos',
            'email' => 'admin@showcase.com',
            'currency' => 'USD',
            'currency_symbol' => '$',
        ]);

        $this->user = User::factory()->create([
            'company_id' => $this->company->id,
            'is_active' => true,
        ]);

        $permissions = Permission::pluck('name')->toArray();
        $this->user->givePermissionTo($permissions);

        $jwtService = app(JwtTokenService::class);
        $jwtRes = $jwtService->generateAccessToken($this->user);
        $this->token = $jwtRes['token'];

        $this->branch = Branch::create([
            'company_id' => $this->company->id,
            'name'       => 'HQ Logistics Hub',
            'code'       => 'HQ01',
        ]);

        $this->supplier = Supplier::create([
            'company_id' => $this->company->id,
            'name' => 'Global Tech Supplier',
            'code' => 'SUP-001',
            'phone' => '+85512345678',
        ]);

        $this->warehouse = Warehouse::create([
            'company_id' => $this->company->id,
            'branch_id'  => $this->branch->id,
            'name' => 'Main Warehouse',
            'code' => 'WH-01',
        ]);

        $this->unit = Unit::create([
            'company_id' => $this->company->id,
            'name'       => 'Piece',
            'symbol'     => 'pcs',
        ]);

        $this->product = Product::create([
            'company_id' => $this->company->id,
            'unit_id'    => $this->unit->id,
            'name' => 'MacBook Pro M3 Max',
            'slug' => 'macbook-pro-m3-max',
            'sku' => 'MBP-M3-MAX',
            'selling_price' => 3200.00,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);

        // Create initial warehouse inventory of 10
        $this->inventory = Inventory::create([
            'company_id' => $this->company->id,
            'warehouse_id' => $this->warehouse->id,
            'product_id' => $this->product->id,
            'quantity' => 10,
            'reserved_quantity' => 0,
        ]);

        // Create parent purchase with unpaid due amount ($5,000)
        $this->purchase = Purchase::create([
            'company_id' => $this->company->id,
            'branch_id'  => $this->branch->id,
            'supplier_id' => $this->supplier->id,
            'warehouse_id' => $this->warehouse->id,
            'reference_number' => 'PO-2026-001',
            'date' => now()->toDateString(),
            'status' => 'received',
            'payment_status' => 'unpaid',
            'total_amount' => 5000.00,
            'paid_amount' => 0.00,
            'due_amount' => 5000.00,
            'exchange_rate' => 4100,
        ]);

        $this->purchaseItem = PurchaseItem::create([
            'purchase_id' => $this->purchase->id,
            'product_id' => $this->product->id,
            'quantity' => 2,
            'quantity_received' => 2,
            'quantity_returned' => 0,
            'unit_cost' => 2500.00,
            'subtotal' => 5000.00,
            'total' => 5000.00,
        ]);
    }

    protected function authHeaders(): array
    {
        return [
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ];
    }

    public function test_enterprise_purchase_return_complete_lifecycle()
    {
        // 1. Create Purchase Return (1 item returned = $2500)
        $createResponse = $this->postJson('/api/v1/admin/purchase-returns', [
            'purchase_id' => $this->purchase->id,
            'date' => now()->toDateString(),
            'rma_number' => 'RMA-TECH-99881',
            'reason' => 'Damaged screen during transport',
            'status' => 'draft',
            'items' => [
                [
                    'purchase_item_id' => $this->purchaseItem->id,
                    'product_id' => $this->product->id,
                    'batch_number' => 'BATCH-2026-A',
                    'serial_number' => 'SN-MBP-00192',
                    'quantity' => 1,
                    'unit_cost' => 2500.00,
                    'notes' => 'Cracked LCD panel',
                ]
            ]
        ], $this->authHeaders());

        $createResponse->assertStatus(201);
        $returnId = $createResponse->json('data.id');
        $this->assertDatabaseHas('purchase_returns', [
            'id' => $returnId,
            'rma_number' => 'RMA-TECH-99881',
            'status' => 'draft',
        ]);
        $this->assertDatabaseHas('purchase_return_items', [
            'purchase_return_id' => $returnId,
            'batch_number' => 'BATCH-2026-A',
            'serial_number' => 'SN-MBP-00192',
            'quantity' => 1,
        ]);

        // 2. Approve Return -> Deduct Stock & Offset Accounts Payable
        $approveResponse = $this->postJson("/api/v1/admin/purchase-returns/{$returnId}/approve", [], $this->authHeaders());
        $approveResponse->assertStatus(200);

        // Verify inventory is decremented from 10 to 9
        $this->inventory->refresh();
        $this->assertEquals(9, (int) $this->inventory->quantity);

        // Verify Purchase due amount reduced from 5000 to 2500
        $this->purchase->refresh();
        $this->assertEquals(2500.00, (float) $this->purchase->due_amount);

        // Verify return refund_status is 'offset'
        $this->assertDatabaseHas('purchase_returns', [
            'id' => $returnId,
            'status' => 'approved',
            'refund_status' => 'offset',
        ]);

        // 3. Mark As Shipped
        $shipResponse = $this->postJson("/api/v1/admin/purchase-returns/{$returnId}/ship", [
            'shipping_carrier' => 'DHL Global Forwarding',
            'tracking_number' => 'DHL-889920199',
        ], $this->authHeaders());
        $shipResponse->assertStatus(200);
        $this->assertDatabaseHas('purchase_returns', [
            'id' => $returnId,
            'status' => 'shipped',
            'shipping_carrier' => 'DHL Global Forwarding',
            'tracking_number' => 'DHL-889920199',
        ]);

        // 4. Settle Refund / Credit Note
        $settleResponse = $this->postJson("/api/v1/admin/purchase-returns/{$returnId}/settle", [
            'refund_status' => 'credited',
            'refund_method' => 'credit_note',
            'refund_amount' => 2500.00,
            'refund_date' => now()->toDateString(),
            'settlement_notes' => 'CN-99182 credited against next month PO batch',
        ], $this->authHeaders());
        $settleResponse->assertStatus(200);
        $this->assertDatabaseHas('purchase_returns', [
            'id' => $returnId,
            'status' => 'completed',
            'refund_status' => 'credited',
            'refund_method' => 'credit_note',
            'refund_amount' => 2500.00,
        ]);

        // 5. Cancel Return -> Verify inventory & financial rollback
        $cancelResponse = $this->postJson("/api/v1/admin/purchase-returns/{$returnId}/cancel", [], $this->authHeaders());
        $cancelResponse->assertStatus(200);

        // Stock restored back to 10
        $this->inventory->refresh();
        $this->assertEquals(10, (int) $this->inventory->quantity);

        // Due amount restored back to 5000
        $this->purchase->refresh();
        $this->assertEquals(5000.00, (float) $this->purchase->due_amount);
    }
}
