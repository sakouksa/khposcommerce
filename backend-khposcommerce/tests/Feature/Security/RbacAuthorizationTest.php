<?php

namespace Tests\Feature\Security;

use Tests\TestCase;
use App\Models\User;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Services\Auth\JwtTokenService;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RbacAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected Company $company;
    protected Branch $branch;
    protected User $superAdmin;
    protected User $branchAdmin;
    protected User $manager;
    protected User $warehouseStaff;
    protected User $cashier;
    protected User $customer;
    protected JwtTokenService $jwt;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RolesPermissionsSeeder::class);
        $this->jwt = app(JwtTokenService::class);

        $this->company = Company::create([
            'name' => 'Test Corp',
            'slug' => 'test-corp',
            'is_active' => true,
        ]);

        $this->branch = Branch::create([
            'company_id' => $this->company->id,
            'name' => 'Main Branch',
            'code' => 'BR-01',
            'is_active' => true,
        ]);

        // 1. Super Admin
        $this->superAdmin = User::factory()->create([
            'company_id' => $this->company->id,
            'branch_id' => $this->branch->id,
            'is_active' => true,
        ]);
        $this->superAdmin->assignRole('super_admin');
        $this->superAdmin->branches()->attach($this->branch->id, ['is_active' => true]);

        // 2. Branch Admin
        $this->branchAdmin = User::factory()->create([
            'company_id' => $this->company->id,
            'branch_id' => $this->branch->id,
            'is_active' => true,
        ]);
        $this->branchAdmin->assignRole('admin');
        $this->branchAdmin->branches()->attach($this->branch->id, ['is_active' => true]);

        // 3. Manager
        $this->manager = User::factory()->create([
            'company_id' => $this->company->id,
            'branch_id' => $this->branch->id,
            'is_active' => true,
        ]);
        $this->manager->assignRole('manager');
        $this->manager->branches()->attach($this->branch->id, ['is_active' => true]);

        // 4. Warehouse Staff
        $this->warehouseStaff = User::factory()->create([
            'company_id' => $this->company->id,
            'branch_id' => $this->branch->id,
            'is_active' => true,
        ]);
        $this->warehouseStaff->assignRole('warehouse_staff');
        $this->warehouseStaff->branches()->attach($this->branch->id, ['is_active' => true]);

        // 5. Cashier
        $this->cashier = User::factory()->create([
            'company_id' => $this->company->id,
            'branch_id' => $this->branch->id,
            'is_active' => true,
        ]);
        $this->cashier->assignRole('cashier');
        $this->cashier->branches()->attach($this->branch->id, ['is_active' => true]);

        // 6. Customer
        $this->customer = User::factory()->create([
            'company_id' => $this->company->id,
            'is_active' => true,
        ]);
        $this->customer->assignRole('customer');
    }

    protected function headers(User $user): array
    {
        return [
            'Authorization' => 'Bearer ' . $this->jwt->generateAccessToken($user)['token'],
            'Accept' => 'application/json',
        ];
    }

    public function test_branch_admin_cannot_access_company_management(): void
    {
        $response = $this->withHeaders($this->headers($this->branchAdmin))
            ->getJson('/api/v1/admin/companies');

        $response->assertStatus(403);
    }

    public function test_branch_admin_cannot_access_global_settings(): void
    {
        $response = $this->withHeaders($this->headers($this->branchAdmin))
            ->getJson('/api/v1/admin/settings');

        $response->assertStatus(403);
    }

    public function test_branch_admin_cannot_access_roles_and_permissions(): void
    {
        $roleResponse = $this->withHeaders($this->headers($this->branchAdmin))
            ->getJson('/api/v1/admin/roles');
        $roleResponse->assertStatus(403);

        $permResponse = $this->withHeaders($this->headers($this->branchAdmin))
            ->getJson('/api/v1/admin/permissions');
        $permResponse->assertStatus(403);
    }

    public function test_super_admin_can_access_company_management(): void
    {
        $response = $this->withHeaders($this->headers($this->superAdmin))
            ->getJson('/api/v1/admin/companies');

        $response->assertStatus(200);
    }

    public function test_cashier_cannot_access_purchasing(): void
    {
        $response = $this->withHeaders($this->headers($this->cashier))
            ->getJson('/api/v1/admin/purchases');

        $response->assertStatus(403);
    }

    public function test_cashier_cannot_delete_products(): void
    {
        $response = $this->withHeaders($this->headers($this->cashier))
            ->deleteJson('/api/v1/admin/products/1');

        $response->assertStatus(403);
    }

    public function test_warehouse_staff_cannot_create_sales(): void
    {
        $response = $this->withHeaders($this->headers($this->warehouseStaff))
            ->postJson('/api/v1/admin/sales', [
                'branch_id' => $this->branch->id,
                'items' => [],
            ]);

        $response->assertStatus(403);
    }

    public function test_customer_cannot_access_admin_dashboard_or_sales(): void
    {
        $dashResponse = $this->withHeaders($this->headers($this->customer))
            ->getJson('/api/v1/admin/dashboard/stats');
        $dashResponse->assertStatus(403);

        $salesResponse = $this->withHeaders($this->headers($this->customer))
            ->getJson('/api/v1/admin/sales');
        $salesResponse->assertStatus(403);
    }

    public function test_branch_admin_can_access_allowed_operational_modules(): void
    {
        // Branch Admin has product.view, sale.view, branch.view
        $productResponse = $this->withHeaders($this->headers($this->branchAdmin))
            ->getJson('/api/v1/admin/products');
        $productResponse->assertStatus(200);

        $salesResponse = $this->withHeaders($this->headers($this->branchAdmin))
            ->getJson('/api/v1/admin/sales');
        $salesResponse->assertStatus(200);

        $branchResponse = $this->withHeaders($this->headers($this->branchAdmin))
            ->getJson('/api/v1/admin/branches');
        $branchResponse->assertStatus(200);
    }
}
