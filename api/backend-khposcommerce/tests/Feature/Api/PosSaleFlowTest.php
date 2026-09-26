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
use App\Models\Customer\Customer;
use App\Services\Sales\Actions\CreateSaleAction;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PosSaleFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_execute_sale_action_and_reduce_inventory(): void
    {
        $company = Company::create([
            'name'  => 'Enterprise POS Corp',
            'code'  => 'EPC',
            'slug'  => 'enterprise-pos-corp',
            'email' => 'pos@enterprise.com',
        ]);

        $branch = Branch::create([
            'company_id' => $company->id,
            'name'       => 'Main Branch',
            'code'       => 'MB01',
        ]);

        $warehouse = Warehouse::create([
            'company_id' => $company->id,
            'branch_id'  => $branch->id,
            'name'       => 'Central Warehouse',
            'code'       => 'WH01',
        ]);

        $unit = Unit::create([
            'company_id' => $company->id,
            'name'       => 'Piece',
            'symbol'     => 'pcs',
        ]);

        $product = Product::create([
            'company_id'     => $company->id,
            'unit_id'        => $unit->id,
            'name'           => 'Wireless Gaming Mouse',
            'slug'           => 'wireless-gaming-mouse',
            'sku'            => 'WGM-001',
            'selling_price'  => 50.00,
            'stock_quantity' => 100,
            'is_active'      => true,
        ]);

        $user = User::create([
            'name'       => 'Cashier User',
            'email'      => 'cashier@enterprise.com',
            'password'   => bcrypt('password'),
            'company_id' => $company->id,
            'branch_id'  => $branch->id,
        ]);

        $customer = Customer::create([
            'company_id' => $company->id,
            'name'       => 'Retail Walk-in',
            'email'      => 'walkin@customer.com',
            'is_active'  => true,
        ]);

        $inventory = Inventory::create([
            'company_id'         => $company->id,
            'warehouse_id'       => $warehouse->id,
            'product_id'         => $product->id,
            'product_variant_id' => null,
            'quantity'           => 100,
            'reserved_quantity'  => 0,
        ]);

        $action = app(CreateSaleAction::class);
        $sale = $action->execute([
            'company_id'   => $company->id,
            'branch_id'    => $branch->id,
            'warehouse_id' => $warehouse->id,
            'customer_id'  => $customer->id,
            'user_id'      => $user->id,
            'cashier_id'   => $user->id,
            'items'        => [
                [
                    'product_id' => $product->id,
                    'quantity'   => 5,
                    'unit_price' => 50.00,
                    'discount'   => 0,
                    'tax'        => 0,
                ],
            ],
            'payment_status' => 'paid',
            'payments'     => [
                [
                    'payment_method' => 'cash',
                    'amount'         => 250.00,
                ],
            ],
        ]);

        $this->assertNotNull($sale);
        $this->assertEquals(250.00, (float) $sale->grand_total);
        $this->assertEquals('completed', $sale->status);

        // Check stock reduced in warehouse inventory
        $inventory->refresh();
        $this->assertEquals(95, (int) $inventory->quantity);

        // Verify inventory movement record exists
        $this->assertDatabaseHas('inventory_movements', [
            'product_id'   => $product->id,
            'warehouse_id' => $warehouse->id,
            'type'         => 'out',
            'quantity'     => 5,
        ]);
    }

    public function test_can_process_pos_sale_with_different_payment_methods(): void
    {
        $company = Company::create([
            'name'  => 'Enterprise POS Corp',
            'code'  => 'EPC2',
            'slug'  => 'enterprise-pos-corp-2',
            'email' => 'pos2@enterprise.com',
        ]);

        $branch = Branch::create([
            'company_id' => $company->id,
            'name'       => 'Main Branch',
            'code'       => 'MB02',
        ]);

        $warehouse = Warehouse::create([
            'company_id' => $company->id,
            'branch_id'  => $branch->id,
            'name'       => 'Central Warehouse',
            'code'       => 'WH02',
        ]);

        $unit = Unit::create([
            'company_id' => $company->id,
            'name'       => 'Piece',
            'symbol'     => 'pcs',
        ]);

        $product = Product::create([
            'company_id'     => $company->id,
            'unit_id'        => $unit->id,
            'name'           => 'Logitech Shoe 9',
            'slug'           => 'logitech-shoe-9',
            'sku'            => 'SKU-LOG-0009',
            'selling_price'  => 212.80,
            'track_inventory'=> true,
            'sold_count'     => 0,
            'status'         => 'active',
        ]);

        $inventory = Inventory::create([
            'company_id'         => $company->id,
            'warehouse_id'       => $warehouse->id,
            'product_id'         => $product->id,
            'product_variant_id' => null,
            'quantity'           => 50,
            'reserved_quantity'  => 0,
        ]);

        $user = User::create([
            'name'       => 'Cashier User',
            'email'      => 'cashier2@enterprise.com',
            'password'   => bcrypt('password'),
            'company_id' => $company->id,
            'branch_id'  => $branch->id,
        ]);

        $saleService = app(\App\Services\Sales\SaleService::class);

        // 1. Test KHQR payment
        $saleKHQR = $saleService->processSale([
            'company_id'      => $company->id,
            'branch_id'       => $branch->id,
            'warehouse_id'    => $warehouse->id,
            'subtotal'        => 212.80,
            'discount_amount' => 0,
            'tax_amount'      => 21.28,
            'grand_total'     => 234.08,
            'paid_amount'     => 234.08,
            'change_amount'   => 0,
            'payment_method'  => 'khqr',
            'items'           => [
                [
                    'product_id' => $product->id,
                    'quantity'   => 1,
                    'unit_price' => 212.80,
                    'tax_percent'=> 10,
                    'tax_amount' => 21.28,
                ]
            ]
        ], $user);

        $this->assertEquals('completed', $saleKHQR->status);
        $this->assertEquals('khqr', $saleKHQR->payment_method);
        $product->refresh();
        $this->assertEquals(1, $product->sold_count);
        $inventory->refresh();
        $this->assertEquals(49, (int) $inventory->quantity);

        // 2. Test Card payment
        $saleCard = $saleService->processSale([
            'company_id'      => $company->id,
            'branch_id'       => $branch->id,
            'warehouse_id'    => $warehouse->id,
            'subtotal'        => 212.80,
            'discount_amount' => 0,
            'tax_amount'      => 21.28,
            'grand_total'     => 234.08,
            'paid_amount'     => 234.08,
            'change_amount'   => 0,
            'payment_method'  => 'card',
            'payment_details' => [
                'card_type'     => 'Visa',
                'bank_name'     => 'ABA Bank',
                'approval_code' => 'APP-889900',
            ],
            'items'           => [
                [
                    'product_id' => $product->id,
                    'quantity'   => 1,
                    'unit_price' => 212.80,
                ]
            ]
        ], $user);

        $this->assertEquals('completed', $saleCard->status);
        $this->assertEquals('card', $saleCard->payment_method);
        $this->assertStringContainsString('Card Payment', $saleCard->notes);

        // 3. Test Transfer payment
        $saleTransfer = $saleService->processSale([
            'company_id'      => $company->id,
            'branch_id'       => $branch->id,
            'warehouse_id'    => $warehouse->id,
            'subtotal'        => 212.80,
            'discount_amount' => 0,
            'tax_amount'      => 21.28,
            'grand_total'     => 234.08,
            'paid_amount'     => 234.08,
            'change_amount'   => 0,
            'payment_method'  => 'transfer',
            'payment_details' => [
                'bank_name'      => 'ACLEDA Bank',
                'account_number' => '0123456789',
                'txn_reference'  => 'TXN-998877',
            ],
            'items'           => [
                [
                    'product_id' => $product->id,
                    'quantity'   => 1,
                    'unit_price' => 212.80,
                ]
            ]
        ], $user);

        $this->assertEquals('completed', $saleTransfer->status);
        $this->assertEquals('transfer', $saleTransfer->payment_method);
        $this->assertStringContainsString('Bank Transfer', $saleTransfer->notes);

        // 4. Test Cash payment with change
        $saleCash = $saleService->processSale([
            'company_id'      => $company->id,
            'branch_id'       => $branch->id,
            'warehouse_id'    => $warehouse->id,
            'subtotal'        => 212.80,
            'discount_amount' => 0,
            'tax_amount'      => 21.28,
            'grand_total'     => 234.08,
            'paid_amount'     => 250.00,
            'change_amount'   => 15.92,
            'payment_method'  => 'cash',
            'items'           => [
                [
                    'product_id' => $product->id,
                    'quantity'   => 1,
                    'unit_price' => 212.80,
                ]
            ]
        ], $user);

        $this->assertEquals('completed', $saleCash->status);
        $this->assertEquals('cash', $saleCash->payment_method);
        $this->assertEquals(250.00, (float) $saleCash->paid_amount);
        $product->refresh();
        $this->assertEquals(4, $product->sold_count);
        $inventory->refresh();
        $this->assertEquals(46, (int) $inventory->quantity);
    }

    public function test_can_process_sale_via_pos_api_endpoint(): void
    {
        $company = Company::create([
            'name'  => 'Enterprise POS Corp',
            'code'  => 'EPC3',
            'slug'  => 'enterprise-pos-corp-3',
            'email' => 'pos3@enterprise.com',
        ]);

        $branch = Branch::create([
            'company_id' => $company->id,
            'name'       => 'Main Branch',
            'code'       => 'MB03',
        ]);

        $warehouse = Warehouse::create([
            'company_id' => $company->id,
            'branch_id'  => $branch->id,
            'name'       => 'Central Warehouse',
            'code'       => 'WH03',
        ]);

        $unit = Unit::create([
            'company_id' => $company->id,
            'name'       => 'Piece',
            'symbol'     => 'pcs',
        ]);

        $product = Product::create([
            'company_id'     => $company->id,
            'unit_id'        => $unit->id,
            'name'           => 'Logitech Shoe 9',
            'slug'           => 'logitech-shoe-9-pos',
            'sku'            => 'SKU-LOG-0009-POS',
            'selling_price'  => 212.80,
            'track_inventory'=> true,
            'sold_count'     => 0,
            'status'         => 'active',
        ]);

        Inventory::create([
            'company_id'         => $company->id,
            'warehouse_id'       => $warehouse->id,
            'product_id'         => $product->id,
            'product_variant_id' => null,
            'quantity'           => 10,
            'reserved_quantity'  => 0,
        ]);

        $user = User::create([
            'name'       => 'Cashier User',
            'email'      => 'cashier3@enterprise.com',
            'password'   => bcrypt('password'),
            'company_id' => $company->id,
            'branch_id'  => $branch->id,
        ]);

        $jwtService = app(\App\Services\Auth\JwtTokenService::class);
        $jwtRes = $jwtService->generateAccessToken($user);
        $token = $jwtRes['token'];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept'        => 'application/json',
        ])->postJson('/api/v1/pos/sales', [
            'company_id'      => $company->id,
            'branch_id'       => $branch->id,
            'warehouse_id'    => $warehouse->id,
            'subtotal'        => 212.80,
            'discount_amount' => 0,
            'tax_amount'      => 21.28,
            'grand_total'     => 234.08,
            'paid_amount'     => 234.08,
            'change_amount'   => 0,
            'payment_method'  => 'khqr',
            'items'           => [
                [
                    'product_id' => $product->id,
                    'quantity'   => 1,
                    'unit_price' => 212.80,
                    'tax_percent'=> 10,
                    'tax_amount' => 21.28,
                ]
            ]
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);

        // Verify AuditLog was recorded with company_id
        $this->assertDatabaseHas('audit_logs', [
            'company_id'     => $company->id,
            'user_id'        => $user->id,
            'event'          => 'POS_SALE_CREATED',
            'auditable_type' => 'Sale',
        ]);
    }
}

