<?php

namespace Tests\Unit\Domain;

use Tests\TestCase;
use App\Services\Inventory\InventoryService;
use App\Models\Inventory\Inventory;
use App\Models\Inventory\InventoryMovement;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Models\Company\Warehouse;
use App\Models\Product\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;

class InventoryServiceTest extends TestCase
{
    use RefreshDatabase;

    private InventoryService $inventoryService;
    private int $companyId;
    private int $warehouseId;
    private int $productId;

    protected function setUp(): void
    {
        parent::setUp();
        $this->inventoryService = new InventoryService();

        // Create base dummy models for test
        $company = Company::create([
            'name'          => 'Test Corp',
            'slug'          => 'test-corp',
            'code'          => 'TC-01',
            'email'         => 'test@test.com',
            'currency_code' => 'USD',
        ]);
        $this->companyId = $company->id;

        $branch = Branch::create([
            'company_id' => $company->id,
            'name'       => 'Main Branch',
            'code'       => 'BR-01',
            'is_active'  => true,
        ]);

        $warehouse = Warehouse::create([
            'company_id' => $company->id,
            'branch_id'  => $branch->id,
            'name'       => 'Main Warehouse',
            'code'       => 'WH-01',
            'is_active'  => true,
        ]);
        $this->warehouseId = $warehouse->id;

        $product = Product::create([
            'company_id' => $company->id,
            'name'       => 'Test Product',
            'slug'       => 'test-product',
            'sku'        => 'SKU-TEST-001',
            'price'      => 100.0,
            'cost_price' => 60.0,
            'type'       => 'standard',
            'is_active'  => true,
        ]);
        $this->productId = $product->id;
    }

    public function test_can_adjust_stock_and_record_movement(): void
    {
        // 1. Initial Stock In
        $inv = $this->inventoryService->adjustStock(
            companyId: $this->companyId,
            warehouseId: $this->warehouseId,
            productId: $this->productId,
            variantId: null,
            qtyChange: 50.0,
            movementType: 'in',
            unitCost: 60.0,
            notes: 'Initial Stock In'
        );

        $this->assertEquals(50.0, (float) $inv->quantity);
        $this->assertDatabaseHas('inventory_movements', [
            'warehouse_id'    => $this->warehouseId,
            'product_id'      => $this->productId,
            'type'            => 'in',
            'quantity'        => 50.0,
            'quantity_before' => 0.0,
            'quantity_after'  => 50.0,
        ]);

        // 2. Stock Out (POS Sale)
        $invAfterSale = $this->inventoryService->adjustStock(
            companyId: $this->companyId,
            warehouseId: $this->warehouseId,
            productId: $this->productId,
            variantId: null,
            qtyChange: -5.0,
            movementType: 'out',
            unitCost: 60.0,
            notes: 'POS Sale #001'
        );

        $this->assertEquals(45.0, (float) $invAfterSale->quantity);
        $this->assertDatabaseHas('inventory_movements', [
            'warehouse_id'    => $this->warehouseId,
            'product_id'      => $this->productId,
            'type'            => 'out',
            'quantity'        => 5.0,
            'quantity_before' => 50.0,
            'quantity_after'  => 45.0,
        ]);
    }

    public function test_can_reserve_and_release_stock(): void
    {
        // Add 20 units
        $this->inventoryService->adjustStock(
            companyId: $this->companyId,
            warehouseId: $this->warehouseId,
            productId: $this->productId,
            variantId: null,
            qtyChange: 20.0,
            movementType: 'adjustment'
        );

        $available = $this->inventoryService->getAvailableStock($this->warehouseId, $this->productId);
        $this->assertEquals(20.0, $available);

        // Reserve 5 units for an order
        $reserved = $this->inventoryService->reserveStock($this->warehouseId, $this->productId, null, 5.0);
        $this->assertTrue($reserved);

        $availableAfterReserve = $this->inventoryService->getAvailableStock($this->warehouseId, $this->productId);
        $this->assertEquals(15.0, $availableAfterReserve);

        // Release 5 reserved units
        $this->inventoryService->releaseReservedStock($this->warehouseId, $this->productId, null, 5.0);
        $availableAfterRelease = $this->inventoryService->getAvailableStock($this->warehouseId, $this->productId);
        $this->assertEquals(20.0, $availableAfterRelease);
    }
}
