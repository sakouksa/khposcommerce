<?php

namespace Tests\Feature\Security;

use Tests\TestCase;
use App\Models\User;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Models\Company\Store;
use App\Models\Company\Warehouse;
use App\Models\Product\Product;
use App\Models\Product\Category;
use App\Models\Product\Brand;
use App\Models\Customer\Customer;
use App\Models\Supplier\Supplier;
use App\Models\Sales\Sale;
use App\Models\Purchase\Purchase;
use App\Models\Order\Order;
use App\Services\Auth\JwtTokenService;
use Database\Seeders\RolesPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;

/**
 * Enterprise Multi-Tenant Isolation Security Test Suite
 *
 * Verifies that:
 * 1. Company = Tenant (The absolute data boundary)
 * 2. Branch = Child of Tenant
 * 3. Warehouse = Child of Branch
 * 4. Company A user with 406/406 permissions CAN NEVER access Company B data.
 * 5. Cross-tenant GET, POST, PUT, DELETE, and Header/Query spoofing are strictly blocked.
 */
class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected Company $companyA;
    protected Company $companyB;

    protected Branch $branchA;
    protected Branch $branchB;

    protected Warehouse $warehouseA;
    protected Warehouse $warehouseB;

    protected Store $storeA;
    protected Store $storeB;

    protected User $ownerA;
    protected User $ownerB;
    protected User $adminA;
    protected User $adminB;
    protected User $superAdmin;

    protected string $tokenOwnerA;
    protected string $tokenOwnerB;
    protected string $tokenAdminA;
    protected string $tokenSuperAdmin;

    protected Product $productA;
    protected Product $productB;

    protected Customer $customerA;
    protected Customer $customerB;

    protected Supplier $supplierA;
    protected Supplier $supplierB;

    protected Sale $saleA;
    protected Sale $saleB;

    protected Purchase $purchaseA;
    protected Purchase $purchaseB;

    protected Order $orderA;
    protected Order $orderB;

    protected function setUp(): void
    {
        parent::setUp();
        \App\Services\Support\TenantContext::reset();

        $this->seed(RolesPermissionsSeeder::class);
        $allPermissions = Permission::pluck('name')->toArray();

        // 1. Create Tenant A (Company A) and Tenant B (Company B)
        $this->companyA = Company::create([
            'name'      => 'Company A (Tenant A)',
            'slug'      => 'company-a',
            'is_active' => true,
        ]);

        $this->companyB = Company::create([
            'name'      => 'Company B (Tenant B)',
            'slug'      => 'company-b',
            'is_active' => true,
        ]);

        // 2. Create Branches
        $this->branchA = Branch::create([
            'company_id' => $this->companyA->id,
            'name'       => 'Phnom Penh Branch A1',
            'code'       => 'BR-A1',
            'is_active'  => true,
        ]);

        $this->branchB = Branch::create([
            'company_id' => $this->companyB->id,
            'name'       => 'Siem Reap Branch B1',
            'code'       => 'BR-B1',
            'is_active'  => true,
        ]);

        // 3. Create Warehouses
        $this->warehouseA = Warehouse::create([
            'company_id' => $this->companyA->id,
            'branch_id'  => $this->branchA->id,
            'name'       => 'Warehouse A1',
            'code'       => 'WH-A1',
            'is_active'  => true,
        ]);

        $this->warehouseB = Warehouse::create([
            'company_id' => $this->companyB->id,
            'branch_id'  => $this->branchB->id,
            'name'       => 'Warehouse B1',
            'code'       => 'WH-B1',
            'is_active'  => true,
        ]);

        // 4. Create Stores
        $this->storeA = Store::create([
            'company_id' => $this->companyA->id,
            'branch_id'  => $this->branchA->id,
            'name'       => 'Store A1',
            'slug'       => 'store-a1',
            'is_active'  => true,
        ]);

        $this->storeB = Store::create([
            'company_id' => $this->companyB->id,
            'branch_id'  => $this->branchB->id,
            'name'       => 'Store B1',
            'slug'       => 'store-b1',
            'is_active'  => true,
        ]);

        // 5. Create Users
        $this->ownerA = User::factory()->create([
            'company_id' => $this->companyA->id,
            'branch_id'  => $this->branchA->id,
            'is_active'  => true,
        ]);
        $this->ownerA->assignRole('owner');
        $this->ownerA->givePermissionTo($allPermissions);

        $this->ownerB = User::factory()->create([
            'company_id' => $this->companyB->id,
            'branch_id'  => $this->branchB->id,
            'is_active'  => true,
        ]);
        $this->ownerB->assignRole('owner');
        $this->ownerB->givePermissionTo($allPermissions);

        $this->adminA = User::factory()->create([
            'company_id' => $this->companyA->id,
            'branch_id'  => $this->branchA->id,
            'is_active'  => true,
        ]);
        $this->adminA->assignRole('admin');
        $this->adminA->branches()->attach($this->branchA->id, ['is_active' => true]);
        $this->adminA->givePermissionTo($allPermissions);

        $this->adminB = User::factory()->create([
            'company_id' => $this->companyB->id,
            'branch_id'  => $this->branchB->id,
            'is_active'  => true,
        ]);
        $this->adminB->assignRole('admin');
        $this->adminB->branches()->attach($this->branchB->id, ['is_active' => true]);
        $this->adminB->givePermissionTo($allPermissions);

        $this->superAdmin = User::factory()->create([
            'company_id' => $this->companyA->id,
            'branch_id'  => $this->branchA->id,
            'is_active'  => true,
        ]);
        $this->superAdmin->assignRole('super_admin');

        // Tokens
        $jwt = app(JwtTokenService::class);
        $this->tokenOwnerA = $jwt->generateAccessToken($this->ownerA)['token'];
        $this->tokenOwnerB = $jwt->generateAccessToken($this->ownerB)['token'];
        $this->tokenAdminA = $jwt->generateAccessToken($this->adminA)['token'];
        $this->tokenSuperAdmin = $jwt->generateAccessToken($this->superAdmin)['token'];

        // 6. Create Catalog & Entities
        $catA = Category::create(['company_id' => $this->companyA->id, 'name' => 'Cat A', 'slug' => 'cat-a', 'is_active' => true]);
        $catB = Category::create(['company_id' => $this->companyB->id, 'name' => 'Cat B', 'slug' => 'cat-b', 'is_active' => true]);

        $this->productA = Product::create([
            'company_id'  => $this->companyA->id,
            'category_id' => $catA->id,
            'name'        => 'Product Tenant A',
            'slug'        => 'product-tenant-a',
            'sku'         => 'SKU-A-001',
            'cost_price'  => 10,
            'sell_price'  => 20,
            'is_active'   => true,
        ]);

        $this->productB = Product::create([
            'company_id'  => $this->companyB->id,
            'category_id' => $catB->id,
            'name'        => 'Product Tenant B',
            'slug'        => 'product-tenant-b',
            'sku'         => 'SKU-B-001',
            'cost_price'  => 15,
            'sell_price'  => 30,
            'is_active'   => true,
        ]);

        $this->customerA = Customer::create([
            'company_id' => $this->companyA->id,
            'name'       => 'Customer A',
            'phone'      => '012111111',
            'email'      => 'customerA@test.com',
            'is_active'  => true,
        ]);

        $this->customerB = Customer::create([
            'company_id' => $this->companyB->id,
            'name'       => 'Customer B',
            'phone'      => '012222222',
            'email'      => 'customerB@test.com',
            'is_active'  => true,
        ]);

        $this->supplierA = Supplier::create([
            'company_id'   => $this->companyA->id,
            'name'         => 'Supplier A',
            'code'         => 'SUP-A-001',
            'contact_name' => 'Rep A',
            'phone'        => '011111111',
            'is_active'    => true,
        ]);

        $this->supplierB = Supplier::create([
            'company_id'   => $this->companyB->id,
            'name'         => 'Supplier B',
            'code'         => 'SUP-B-001',
            'contact_name' => 'Rep B',
            'phone'        => '022222222',
            'is_active'    => true,
        ]);

        $this->saleA = Sale::create([
            'company_id'     => $this->companyA->id,
            'branch_id'      => $this->branchA->id,
            'warehouse_id'   => $this->warehouseA->id,
            'customer_id'    => $this->customerA->id,
            'user_id'        => $this->ownerA->id,
            'invoice_number' => 'INV-TENANT-A-001',
            'date'           => now(),
            'status'         => 'completed',
            'subtotal'       => 100,
            'grand_total'    => 100,
            'paid_amount'    => 100,
            'currency_code'  => 'USD',
        ]);

        $this->saleB = Sale::create([
            'company_id'     => $this->companyB->id,
            'branch_id'      => $this->branchB->id,
            'warehouse_id'   => $this->warehouseB->id,
            'customer_id'    => $this->customerB->id,
            'user_id'        => $this->ownerB->id,
            'invoice_number' => 'INV-TENANT-B-001',
            'date'           => now(),
            'status'         => 'completed',
            'subtotal'       => 200,
            'grand_total'    => 200,
            'paid_amount'    => 200,
            'currency_code'  => 'USD',
        ]);

        $this->purchaseA = Purchase::create([
            'company_id'       => $this->companyA->id,
            'branch_id'        => $this->branchA->id,
            'warehouse_id'     => $this->warehouseA->id,
            'supplier_id'      => $this->supplierA->id,
            'user_id'          => $this->ownerA->id,
            'reference_number' => 'PO-TENANT-A-001',
            'date'             => now(),
            'status'           => 'received',
            'subtotal'         => 500,
            'grand_total'      => 500,
            'paid_amount'      => 500,
        ]);

        $this->purchaseB = Purchase::create([
            'company_id'       => $this->companyB->id,
            'branch_id'        => $this->branchB->id,
            'warehouse_id'     => $this->warehouseB->id,
            'supplier_id'      => $this->supplierB->id,
            'user_id'          => $this->ownerB->id,
            'reference_number' => 'PO-TENANT-B-001',
            'date'             => now(),
            'status'           => 'received',
            'subtotal'         => 800,
            'grand_total'      => 800,
            'paid_amount'      => 800,
        ]);

        $this->orderA = Order::create([
            'company_id'     => $this->companyA->id,
            'store_id'       => $this->storeA->id,
            'customer_id'    => $this->customerA->id,
            'order_number'   => 'ORD-TENANT-A-001',
            'status'         => 'pending',
            'payment_status' => 'unpaid',
            'grand_total'    => 50,
            'subtotal'       => 50,
        ]);

        $this->orderB = Order::create([
            'company_id'     => $this->companyB->id,
            'store_id'       => $this->storeB->id,
            'customer_id'    => $this->customerB->id,
            'order_number'   => 'ORD-TENANT-B-001',
            'status'         => 'pending',
            'payment_status' => 'unpaid',
            'grand_total'    => 90,
            'subtotal'       => 90,
        ]);
    }

    protected function tearDown(): void
    {
        \App\Services\Support\TenantContext::reset();
        parent::tearDown();
    }

    protected function headers(string $token): array
    {
        return [
            'Authorization' => 'Bearer ' . $token,
            'Accept'        => 'application/json',
        ];
    }

    // ─── 1. Cross-Tenant GET / IDOR Protection ──────────────────────────────────

    public function test_tenant_a_cannot_view_tenant_b_product_via_get(): void
    {
        $response = $this->withHeaders($this->headers($this->tokenOwnerA))
            ->getJson('/api/v1/products/' . $this->productB->id);

        $response->assertStatus(404);
    }

    public function test_tenant_a_cannot_view_tenant_b_sale_via_get(): void
    {
        $response = $this->withHeaders($this->headers($this->tokenOwnerA))
            ->getJson('/api/v1/sales/' . $this->saleB->id);

        $response->assertStatus(404);
    }

    public function test_tenant_a_cannot_view_tenant_b_customer_via_get(): void
    {
        $response = $this->withHeaders($this->headers($this->tokenOwnerA))
            ->getJson('/api/v1/customers/' . $this->customerB->id);

        $response->assertStatus(404);
    }

    public function test_tenant_a_cannot_view_tenant_b_purchase_via_get(): void
    {
        $response = $this->withHeaders($this->headers($this->tokenOwnerA))
            ->getJson('/api/v1/purchases/' . $this->purchaseB->id);

        $response->assertStatus(404);
    }

    public function test_tenant_a_cannot_view_tenant_b_order_via_get(): void
    {
        $response = $this->withHeaders($this->headers($this->tokenOwnerA))
            ->getJson('/api/v1/orders/' . $this->orderB->id);

        $response->assertStatus(404);
    }

    // ─── 2. Cross-Tenant PUT / PATCH / DELETE Protection ────────────────────────

    public function test_tenant_a_cannot_update_tenant_b_product_via_put(): void
    {
        $response = $this->withHeaders($this->headers($this->tokenOwnerA))
            ->putJson('/api/v1/products/' . $this->productB->id, [
                'name' => 'Hacked Product Name',
            ]);

        $response->assertStatus(404);
        $this->assertDatabaseHas('products', [
            'id'   => $this->productB->id,
            'name' => 'Product Tenant B',
        ]);
    }

    public function test_tenant_a_cannot_delete_tenant_b_product_via_delete(): void
    {
        $response = $this->withHeaders($this->headers($this->tokenOwnerA))
            ->deleteJson('/api/v1/products/' . $this->productB->id);

        $response->assertStatus(404);
        $this->assertDatabaseHas('products', [
            'id'         => $this->productB->id,
            'deleted_at' => null,
        ]);
    }

    public function test_tenant_a_cannot_delete_tenant_b_sale_via_delete(): void
    {
        $response = $this->withHeaders($this->headers($this->tokenOwnerA))
            ->deleteJson('/api/v1/sales/' . $this->saleB->id);

        $response->assertStatus(404);
        $this->assertDatabaseHas('sales', [
            'id'         => $this->saleB->id,
            'deleted_at' => null,
        ]);
    }

    // ─── 3. Header & Query Parameter Spoofing Attacks ──────────────────────────

    public function test_cross_tenant_header_spoofing_is_blocked_with_403(): void
    {
        $headers = array_merge($this->headers($this->tokenOwnerA), [
            'X-Company-Id' => (string) $this->companyB->id,
        ]);

        $response = $this->withHeaders($headers)
            ->getJson('/api/v1/sales');

        $response->assertStatus(403);
        $response->assertJson(['error' => 'COMPANY_SCOPE_DENIED']);
    }

    public function test_cross_tenant_query_param_spoofing_is_blocked_with_403(): void
    {
        $response = $this->withHeaders($this->headers($this->tokenOwnerA))
            ->getJson('/api/v1/sales?company_id=' . $this->companyB->id);

        $response->assertStatus(403);
        $response->assertJson(['error' => 'COMPANY_SCOPE_DENIED']);
    }

    public function test_cross_tenant_branch_tampering_is_blocked_with_403(): void
    {
        $headers = array_merge($this->headers($this->tokenOwnerA), [
            'X-Branch-Id' => (string) $this->branchB->id,
        ]);

        $response = $this->withHeaders($headers)
            ->getJson('/api/v1/sales');

        $response->assertStatus(403);
        $response->assertJson(['error' => 'BRANCH_SCOPE_DENIED']);
    }

    public function test_cross_tenant_warehouse_tampering_is_blocked_with_403(): void
    {
        $headers = array_merge($this->headers($this->tokenOwnerA), [
            'X-Warehouse-Id' => (string) $this->warehouseB->id,
        ]);

        $response = $this->withHeaders($headers)
            ->getJson('/api/v1/sales');

        $response->assertStatus(403);
        $response->assertJson(['error' => 'WAREHOUSE_SCOPE_DENIED']);
    }

    // ─── 4. Cross-Tenant Inventory / Stock Transfer Protection ──────────────────

    public function test_cross_tenant_stock_transfer_is_strictly_blocked(): void
    {
        $response = $this->withHeaders($this->headers($this->tokenOwnerA))
            ->postJson('/api/v1/stock-transfers', [
                'from_warehouse_id' => $this->warehouseA->id,
                'to_warehouse_id'   => $this->warehouseB->id, // Belongs to Tenant B!
                'items'             => [
                    [
                        'product_id' => $this->productA->id,
                        'quantity'   => 5,
                    ],
                ],
            ]);

        // Must reject cross-tenant destination warehouse
        $this->assertContains($response->status(), [403, 404, 422]);
    }

    // ─── 5. Write-Stamping Protection (Server Overrides Client Payload) ─────────

    public function test_server_side_write_stamping_prevents_injecting_into_tenant_b(): void
    {
        // 1. Explicitly tampered company_id in payload is blocked by middleware with 403
        $blockedResponse = $this->withHeaders($this->headers($this->tokenOwnerA))
            ->postJson('/api/v1/customers', [
                'company_id' => $this->companyB->id, // Tampered company_id!
                'name'       => 'Injected Customer Test',
                'phone'      => '099999999',
                'email'      => 'injected@test.com',
                'is_active'  => true,
            ]);

        $blockedResponse->assertStatus(403);
        $blockedResponse->assertJson(['error' => 'COMPANY_SCOPE_DENIED']);

        // 2. Normal customer creation without company_id auto-stamps Tenant A company_id
        $validResponse = $this->withHeaders($this->headers($this->tokenOwnerA))
            ->postJson('/api/v1/customers', [
                'name'      => 'Stamped Customer Test',
                'phone'     => '099888888',
                'email'     => 'stamped@test.com',
                'is_active' => true,
            ]);

        $validResponse->assertStatus(201);
        $this->assertDatabaseHas('customers', [
            'name'       => 'Stamped Customer Test',
            'company_id' => $this->companyA->id,
        ]);
        $this->assertDatabaseMissing('customers', [
            'name'       => 'Stamped Customer Test',
            'company_id' => $this->companyB->id,
        ]);
    }

    // ─── 6. Indexes & Query Isolation (Never Leak Across Tenants) ───────────────

    public function test_indexes_strictly_isolated_to_current_tenant(): void
    {
        // 1. Tenant A fetches products
        $prodResponse = $this->withHeaders($this->headers($this->tokenOwnerA))
            ->getJson('/api/v1/products');

        $prodResponse->assertStatus(200);
        $prodResponse->assertSee('Product Tenant A');
        $prodResponse->assertDontSee('Product Tenant B');

        // 2. Tenant A fetches sales
        $salesResponse = $this->withHeaders($this->headers($this->tokenOwnerA))
            ->getJson('/api/v1/sales');

        $salesResponse->assertStatus(200);
        $salesResponse->assertSee('INV-TENANT-A-001');
        $salesResponse->assertDontSee('INV-TENANT-B-001');

        // 3. Tenant B fetches sales
        $salesResponseB = $this->withHeaders($this->headers($this->tokenOwnerB))
            ->getJson('/api/v1/sales');

        $salesResponseB->assertStatus(200);
        $salesResponseB->assertSee('INV-TENANT-B-001');
        $salesResponseB->assertDontSee('INV-TENANT-A-001');
    }

    // ─── 7. Cross-Tenant User Management Protection ─────────────────────────────

    public function test_tenant_a_cannot_view_or_manage_tenant_b_users(): void
    {
        $response = $this->withHeaders($this->headers($this->tokenOwnerA))
            ->getJson('/api/v1/users/' . $this->ownerB->id);

        $response->assertStatus(404);

        $deleteResponse = $this->withHeaders($this->headers($this->tokenOwnerA))
            ->deleteJson('/api/v1/users/' . $this->ownerB->id);

        $deleteResponse->assertStatus(404);
        $this->assertDatabaseHas('users', ['id' => $this->ownerB->id]);
    }

    // ─── 8. Super Admin Platform Operations ─────────────────────────────────────

    public function test_super_admin_can_access_companies_across_platform(): void
    {
        $response = $this->withHeaders($this->headers($this->tokenSuperAdmin))
            ->getJson('/api/v1/admin/companies');

        $response->assertStatus(200);
        $response->assertSee('Company A (Tenant A)');
        $response->assertSee('Company B (Tenant B)');
    }
}
