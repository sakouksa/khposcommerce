<?php

namespace Tests\Feature\Api;

use App\Models\Company\Company;
use App\Models\Customer\Customer;
use App\Models\Customer\CustomerGroup;
use App\Models\User;
use App\Services\Auth\JwtTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected Company $company;
    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::create([
            'name' => 'Main Test Company',
            'code' => 'TEST_CO',
            'slug' => 'main-test-company',
            'email' => 'test@company.com',
        ]);

        $this->adminUser = User::create([
            'company_id' => $this->company->id,
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => bcrypt('password123'),
            'is_active' => true,
        ]);

        $jwtService = app(JwtTokenService::class);
        $tokenData = $jwtService->generateAccessToken($this->adminUser);
        $this->token = $tokenData['token'];
    }

    public function test_can_list_customers_with_filters(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/customers?per_page=10&sort_by=created_at&sort_order=desc');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data',
            'meta',
        ]);
    }

    public function test_can_get_customer_stats(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/customers/stats');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data',
        ]);
    }

    public function test_can_create_and_manage_customer_with_enterprise_crm_fields(): void
    {
        $group = CustomerGroup::first();
        if (!$group) {
            $group = CustomerGroup::create([
                'company_id' => $this->company->id,
                'name' => 'VIP Club',
                'code' => 'VIP_GRP',
                'discount_percent' => 10,
                'is_active' => true,
            ]);
        }

        $payload = [
            'company_id' => $this->company->id,
            'customer_group_id' => $group->id,
            'name' => 'Sok Chandara Test CRM',
            'email' => 'chandara.test@example.com',
            'phone' => '012999888',
            'gender' => 'male',
            'birth_date' => '1995-05-15',
            'payment_terms' => 'net_30',
            'credit_limit' => 5000,
            'is_credit_hold' => 0,
            'tax_number' => 'K00998877',
            'tax_branch_code' => '00001',
            'rfm_segment' => 'potential',
            'tags' => '#VIP,#Wholesale',
            'notes' => 'Contract signed for 2026',
            'is_active' => 1,
        ];

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/customers', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('customers', [
            'name' => 'Sok Chandara Test CRM',
            'email' => 'chandara.test@example.com',
            'tax_number' => 'K00998877',
        ]);

        $createdId = $response->json('data.id');

        // Show Customer
        $showResponse = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson("/api/v1/customers/{$createdId}");
        $showResponse->assertStatus(200);
        $showResponse->assertJsonPath('data.name', 'Sok Chandara Test CRM');

        // Update Customer
        $updatePayload = [
            'name' => 'Sok Chandara Updated',
            'payment_terms' => 'net_60',
            'credit_limit' => 8000,
            'rfm_segment' => 'champions',
        ];

        $updateResponse = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->putJson("/api/v1/customers/{$createdId}", $updatePayload);

        $updateResponse->assertStatus(200);
        $this->assertDatabaseHas('customers', [
            'id' => $createdId,
            'name' => 'Sok Chandara Updated',
            'credit_limit' => 8000,
            'rfm_segment' => 'champions',
        ]);

        // Cleanup
        $deleteResponse = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->deleteJson("/api/v1/customers/{$createdId}");
        $deleteResponse->assertStatus(200);
    }

    public function test_can_adjust_loyalty_points_and_wallet_and_toggle_credit_hold(): void
    {
        $customer = Customer::create([
            'company_id' => $this->company->id,
            'name' => 'Loyalty VIP Customer',
            'phone' => '0987654321',
            'credit_limit' => 1000,
            'outstanding_balance' => 500,
            'wallet_balance' => 100,
            'loyalty_points' => 50,
            'is_active' => true,
            'is_credit_hold' => false,
        ]);

        // 1. Adjust Loyalty Points
        $pointsResponse = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson("/api/v1/customers/{$customer->id}/loyalty-points", [
                'points' => 150,
                'type' => 'adjustment',
                'notes' => 'Bonus points for new tier promotion',
            ]);
        $pointsResponse->assertStatus(201);

        // 2. Add Wallet Transaction
        $walletResponse = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson("/api/v1/customers/{$customer->id}/wallet-transactions", [
                'amount' => 200,
                'type' => 'top_up',
                'payment_method' => 'cash',
                'notes' => 'Topup store credit',
            ]);
        $walletResponse->assertStatus(201);

        // 3. Toggle Credit Hold
        $holdResponse = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson("/api/v1/customers/{$customer->id}/toggle-credit-hold", [
                'is_credit_hold' => true,
            ]);
        $holdResponse->assertStatus(200);

        // 4. Settle Debt
        $debtResponse = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson("/api/v1/customers/{$customer->id}/settle-debt", [
                'amount' => 300,
                'payment_method' => 'cash',
                'notes' => 'Partial debt settlement',
            ]);
        $debtResponse->assertStatus(200);
    }

    public function test_can_perform_bulk_actions_on_customers(): void
    {
        $c1 = Customer::create([
            'company_id' => $this->company->id,
            'name' => 'Bulk Customer 1',
            'is_active' => true,
            'is_credit_hold' => false,
        ]);

        $c2 = Customer::create([
            'company_id' => $this->company->id,
            'name' => 'Bulk Customer 2',
            'is_active' => true,
            'is_credit_hold' => false,
        ]);

        // Bulk Deactivate
        $bulkDeactivate = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/customers/bulk-deactivate', [
                'ids' => [$c1->id, $c2->id],
            ]);
        $bulkDeactivate->assertStatus(200);

        // Bulk Toggle Credit Hold
        $bulkHold = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/customers/bulk-toggle-credit-hold', [
                'ids' => [$c1->id, $c2->id],
                'is_credit_hold' => true,
            ]);
        $bulkHold->assertStatus(200);

        // Bulk Activate
        $bulkActivate = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/customers/bulk-activate', [
                'ids' => [$c1->id, $c2->id],
            ]);
        $bulkActivate->assertStatus(200);
    }
}
