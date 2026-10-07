<?php

namespace Tests\Feature\Security;

use Tests\TestCase;
use App\Models\User;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Models\Company\Warehouse;
use App\Models\Sales\Sale;
use App\Models\Order\Order;
use App\Models\Expense\Expense;
use App\Models\Expense\ExpenseCategory;
use App\Services\Auth\JwtTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Database\Seeders\RolesPermissionsSeeder;
use Spatie\Permission\Models\Permission;

class MultiBranchDataIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected Company $company;
    protected Branch $branchA;
    protected Branch $branchB;
    protected Warehouse $warehouseA;
    protected Warehouse $warehouseB;
    protected User $userA;
    protected User $userB;
    protected string $tokenA;
    protected string $tokenB;
    protected Sale $saleA;
    protected Sale $saleB;
    protected Order $orderA;
    protected Order $orderB;
    protected Expense $expenseA;
    protected Expense $expenseB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesPermissionsSeeder::class);

        // 1. Create Company
        $this->company = Company::create([
            'name'      => 'Test Company Inc',
            'slug'      => 'test-company-inc',
            'is_active' => true,
        ]);

        // 2. Create Branches
        $this->branchA = Branch::create([
            'company_id' => $this->company->id,
            'name'       => 'Phnom Penh Branch',
            'code'       => 'BR-PP',
            'is_active'  => true,
        ]);

        $this->branchB = Branch::create([
            'company_id' => $this->company->id,
            'name'       => 'Siem Reap Branch',
            'code'       => 'BR-SR',
            'is_active'  => true,
        ]);

        // 3. Create Warehouses
        $this->warehouseA = Warehouse::create([
            'company_id' => $this->company->id,
            'branch_id'  => $this->branchA->id,
            'name'       => 'PP Warehouse',
            'code'       => 'WH-PP',
            'is_active'  => true,
        ]);

        $this->warehouseB = Warehouse::create([
            'company_id' => $this->company->id,
            'branch_id'  => $this->branchB->id,
            'name'       => 'SR Warehouse',
            'code'       => 'WH-SR',
            'is_active'  => true,
        ]);

        // 3.5 Create Stores
        $storeA = \App\Models\Company\Store::create([
            'company_id' => $this->company->id,
            'branch_id'  => $this->branchA->id,
            'name'       => 'PP Main Store',
            'slug'       => 'pp-main-store',
            'is_active'  => true,
        ]);

        $storeB = \App\Models\Company\Store::create([
            'company_id' => $this->company->id,
            'branch_id'  => $this->branchB->id,
            'name'       => 'SR Main Store',
            'slug'       => 'sr-main-store',
            'is_active'  => true,
        ]);

        // 4. Create User A (Branch A only)
        $this->userA = User::factory()->create([
            'company_id' => $this->company->id,
            'branch_id'  => $this->branchA->id,
            'is_active'  => true,
        ]);
        $this->userA->branches()->attach($this->branchA->id, ['is_active' => true]);

        // 5. Create User B (Branch B only)
        $this->userB = User::factory()->create([
            'company_id' => $this->company->id,
            'branch_id'  => $this->branchB->id,
            'is_active'  => true,
        ]);
        $this->userB->branches()->attach($this->branchB->id, ['is_active' => true]);

        // Assign all operational permissions to both users so we test SCOPE isolation, not just missing permission
        $permissions = Permission::pluck('name')->toArray();
        $this->userA->givePermissionTo($permissions);
        $this->userB->givePermissionTo($permissions);

        // Tokens
        $jwtService = app(JwtTokenService::class);
        $this->tokenA = $jwtService->generateAccessToken($this->userA)['token'];
        $this->tokenB = $jwtService->generateAccessToken($this->userB)['token'];

        // 6. Create Sales
        $this->saleA = Sale::create([
            'company_id'     => $this->company->id,
            'branch_id'      => $this->branchA->id,
            'warehouse_id'   => $this->warehouseA->id,
            'user_id'        => $this->userA->id,
            'invoice_number' => 'INV-PP-001',
            'date'           => now(),
            'status'         => 'completed',
            'subtotal'       => 100,
            'grand_total'    => 100,
            'paid_amount'    => 100,
            'currency_code'  => 'USD',
        ]);

        $this->saleB = Sale::create([
            'company_id'     => $this->company->id,
            'branch_id'      => $this->branchB->id,
            'warehouse_id'   => $this->warehouseB->id,
            'user_id'        => $this->userB->id,
            'invoice_number' => 'INV-SR-002',
            'date'           => now(),
            'status'         => 'completed',
            'subtotal'       => 200,
            'grand_total'    => 200,
            'paid_amount'    => 200,
            'currency_code'  => 'USD',
        ]);

        // 7. Create Orders
        $this->orderA = Order::create([
            'company_id'      => $this->company->id,
            'branch_id'       => $this->branchA->id,
            'store_id'        => $storeA->id,
            'order_number'    => 'ORD-PP-001',
            'status'          => 'pending',
            'payment_status'  => 'unpaid',
            'total_amount'    => 50,
            'subtotal'        => 50,
            'shipping_name'   => 'Customer PP',
            'shipping_phone'  => '012345678',
            'shipping_address'=> '123 PP St',
        ]);

        $this->orderB = Order::create([
            'company_id'      => $this->company->id,
            'branch_id'       => $this->branchB->id,
            'store_id'        => $storeB->id,
            'order_number'    => 'ORD-SR-002',
            'status'          => 'pending',
            'payment_status'  => 'unpaid',
            'total_amount'    => 75,
            'subtotal'        => 75,
            'shipping_name'   => 'Customer SR',
            'shipping_phone'  => '087654321',
            'shipping_address'=> '456 SR St',
        ]);

        // 8. Create Expenses
        $expenseCat = ExpenseCategory::create([
            'company_id' => $this->company->id,
            'name'       => 'Utilities',
            'code'       => 'UTIL',
            'is_active'  => true,
        ]);

        $this->expenseA = Expense::create([
            'company_id'          => $this->company->id,
            'branch_id'           => $this->branchA->id,
            'expense_category_id' => $expenseCat->id,
            'user_id'             => $this->userA->id,
            'reference_number'    => 'EXP-PP-001',
            'title'               => 'PP Office Electricity',
            'amount'              => 50,
            'date'                => now()->toDateString(),
            'status'              => 'approved',
        ]);

        $this->expenseB = Expense::create([
            'company_id'          => $this->company->id,
            'branch_id'           => $this->branchB->id,
            'expense_category_id' => $expenseCat->id,
            'user_id'             => $this->userB->id,
            'reference_number'    => 'EXP-SR-002',
            'title'               => 'SR Office Internet',
            'amount'              => 80,
            'date'                => now()->toDateString(),
            'status'              => 'approved',
        ]);

        // 9. Create Product
        $this->product = \App\Models\Product\Product::create([
            'company_id'    => $this->company->id,
            'name'          => 'Test Energy Drink',
            'slug'          => 'test-energy-drink',
            'sku'           => 'PRD-TEST-001',
            'cost_price'    => 1.0,
            'selling_price' => 2.0,
            'status'        => 'active',
        ]);

        // 10. Create Supplier and Purchase in Branch B
        $supplier = \App\Models\Supplier\Supplier::create([
            'company_id' => $this->company->id,
            'name'       => 'Test Supplier',
            'code'       => 'SUP-001',
            'is_active'  => true,
        ]);

        $this->purchaseB = \App\Models\Purchase\Purchase::create([
            'company_id'       => $this->company->id,
            'branch_id'        => $this->branchB->id,
            'warehouse_id'     => $this->warehouseB->id,
            'supplier_id'      => $supplier->id,
            'user_id'          => $this->userB->id,
            'reference_number' => 'PUR-SR-001',
            'date'             => now()->toDateString(),
            'status'           => 'received',
            'payment_status'   => 'paid',
            'grand_total'      => 300,
        ]);

        // 11. Create Inventory in Warehouse B
        $this->inventoryB = \App\Models\Inventory\Inventory::create([
            'company_id'   => $this->company->id,
            'warehouse_id' => $this->warehouseB->id,
            'product_id'   => $this->product->id,
            'quantity'     => 100,
        ]);

        // 12. Create Cash Register in Branch B
        $this->registerB = \App\Models\POS\CashRegister::create([
            'company_id'      => $this->company->id,
            'branch_id'       => $this->branchB->id,
            'user_id'         => $this->userB->id,
            'name'            => 'Register SR 1',
            'code'            => 'REG-SR-001',
            'status'          => 'open',
            'opening_balance' => 100,
            'opened_at'       => now(),
        ]);
    }

    protected function headersForUserA(): array
    {
        return [
            'Authorization' => 'Bearer ' . $this->tokenA,
            'Accept'        => 'application/json',
        ];
    }

    protected function headersForUserB(): array
    {
        return [
            'Authorization' => 'Bearer ' . $this->tokenB,
            'Accept'        => 'application/json',
        ];
    }

    protected function assertBlocked($response): void
    {
        $this->assertTrue(
            in_array($response->status(), [403, 404]),
            "Expected status 403 (Forbidden) or 404 (Not Found via BranchScope), got {$response->status()}"
        );
    }

    /**
     * Attack Scenario 1: IDOR / Horizontal privilege escalation on Sales detail.
     * User A (Branch A) attempts to access Branch B's sale record directly by ID.
     */
    public function test_user_in_branch_a_cannot_view_sale_belonging_to_branch_b(): void
    {
        $response = $this->withHeaders($this->headersForUserA())
            ->getJson('/api/v1/sales/' . $this->saleB->id);

        $this->assertTrue(in_array($response->status(), [403, 404]), "Expected 403 or 404, got {$response->status()}");
    }

    /**
     * Attack Scenario 2: Cross-branch Delete on Sales.
     */
    public function test_user_in_branch_a_cannot_delete_sale_belonging_to_branch_b(): void
    {
        $response = $this->withHeaders($this->headersForUserA())
            ->deleteJson('/api/v1/sales/' . $this->saleB->id);

        $this->assertTrue(in_array($response->status(), [403, 404]), "Expected 403 or 404, got {$response->status()}");
        $this->assertDatabaseHas('sales', ['id' => $this->saleB->id, 'deleted_at' => null]);
    }

    /**
     * Attack Scenario 3: Sales index query scoping.
     * User A should only see Branch A sales and never Branch B sales.
     */
    public function test_sales_index_is_strictly_scoped_to_user_authorized_branch(): void
    {
        $response = $this->withHeaders($this->headersForUserA())
            ->getJson('/api/v1/sales');

        $response->assertStatus(200);
        $response->assertSee('INV-PP-001');
        $response->assertDontSee('INV-SR-002');
    }

    /**
     * Attack Scenario 4: Query parameter tampering (?branch_id=B).
     * Submitting another branch_id in query parameters must not expand accessible scope.
     */
    public function test_query_filter_cannot_expand_sales_access_to_unauthorized_branch(): void
    {
        $response = $this->withHeaders($this->headersForUserA())
            ->getJson('/api/v1/sales?branch_id=' . $this->branchB->id);

        $response->assertStatus(403);
        $response->assertJson(['error' => 'BRANCH_SCOPE_DENIED']);
    }

    /**
     * Attack Scenario 5: Orders, Invoices, and Tracking cross-branch protection.
     */
    public function test_user_in_branch_a_cannot_view_order_invoice_or_tracking_of_branch_b(): void
    {
        // 1. Order Detail
        $resOrder = $this->withHeaders($this->headersForUserA())
            ->getJson('/api/v1/orders/' . $this->orderB->id);
        $resOrder->assertStatus(403);

        // 2. Order Invoice
        $resInvoice = $this->withHeaders($this->headersForUserA())
            ->getJson('/api/v1/orders/' . $this->orderB->id . '/invoice');
        $resInvoice->assertStatus(403);

        // 3. Order Tracking
        $resTracking = $this->withHeaders($this->headersForUserA())
            ->getJson('/api/v1/orders/' . $this->orderB->id . '/tracking');
        $resTracking->assertStatus(403);
    }

    /**
     * Attack Scenario 6: Cross-branch Expense view protection.
     */
    public function test_user_in_branch_a_cannot_view_expense_belonging_to_branch_b(): void
    {
        $response = $this->withHeaders($this->headersForUserA())
            ->getJson('/api/v1/expenses/' . $this->expenseB->id);

        $this->assertBlocked($response);
    }

    /**
     * Attack Scenario 7: Request body tampering on create (POST /expenses with branch_id = B).
     */
    public function test_user_cannot_create_expense_in_unauthorized_branch(): void
    {
        $response = $this->withHeaders($this->headersForUserA())
            ->postJson('/api/v1/expenses', [
                'branch_id'           => $this->branchB->id,
                'expense_category_id' => $this->expenseA->expense_category_id,
                'title'               => 'Malicious Cross-Branch Expense',
                'amount'              => 100,
                'date'                => now()->toDateString(),
            ]);

        $this->assertBlocked($response);
    }

    /**
     * Attack Scenario 8: Branch listing endpoint only returns authorized branches.
     */
    public function test_branches_endpoint_only_lists_branches_assigned_to_user(): void
    {
        $response = $this->withHeaders($this->headersForUserA())
            ->getJson('/api/v1/branches');

        $response->assertStatus(200);
        $response->assertSee('Phnom Penh Branch');
        $response->assertDontSee('Siem Reap Branch');
    }

    /**
     * Attack Scenario 9: Inventory transfers require authorization for BOTH source and destination warehouses.
     */
    public function test_stock_transfer_fails_when_destination_warehouse_is_unauthorized(): void
    {
        $response = $this->withHeaders($this->headersForUserA())
            ->postJson('/api/v1/stock-transfers', [
                'from_warehouse_id' => $this->warehouseA->id,
                'to_warehouse_id'   => $this->warehouseB->id,
                'items'             => [
                    [
                        'product_id' => $this->product->id,
                        'quantity'   => 5,
                    ]
                ],
                'notes'             => 'Unauthorized cross-warehouse transfer attempt',
            ]);

        $this->assertBlocked($response);
    }

    /**
     * Attack Scenario 10: Cross-branch Purchase protection.
     */
    public function test_user_in_branch_a_cannot_view_purchase_of_branch_b(): void
    {
        $response = $this->withHeaders($this->headersForUserA())
            ->getJson('/api/v1/purchases/' . $this->purchaseB->id);

        $this->assertBlocked($response);
    }

    /**
     * Attack Scenario 11: Cross-warehouse Inventory protection.
     */
    public function test_user_in_branch_a_cannot_view_inventory_of_warehouse_b(): void
    {
        $response = $this->withHeaders($this->headersForUserA())
            ->getJson('/api/v1/inventory/' . $this->inventoryB->id);

        $this->assertBlocked($response);
    }

    /**
     * Attack Scenario 12: Cash Register cross-branch manipulation.
     */
    public function test_user_in_branch_a_cannot_view_or_close_cash_register_of_branch_b(): void
    {
        // 1. View Detail
        $resView = $this->withHeaders($this->headersForUserA())
            ->getJson('/api/v1/pos/cash-registers/' . $this->registerB->id);
        $this->assertBlocked($resView);

        // 2. Attempt Close
        $resClose = $this->withHeaders($this->headersForUserA())
            ->postJson('/api/v1/pos/cash-registers/' . $this->registerB->id . '/close', [
                'closing_cash' => 150,
            ]);
        $this->assertBlocked($resClose);
    }

    /**
     * Attack Scenario 13: POS Sales detail & return isolation.
     */
    public function test_user_in_branch_a_cannot_view_or_return_pos_sale_of_branch_b(): void
    {
        // 1. POS view sale of Branch B
        $resView = $this->withHeaders($this->headersForUserA())
            ->getJson('/api/v1/pos/sales/' . $this->saleB->id);
        $this->assertTrue(in_array($resView->status(), [403, 404]), "Expected 403 or 404, got {$resView->status()}");

        // 2. POS process return for Branch B sale
        $resReturn = $this->withHeaders($this->headersForUserA())
            ->postJson('/api/v1/pos/sales/' . $this->saleB->id . '/return', [
                'items' => [
                    ['product_id' => $this->product->id, 'quantity' => 1, 'refund_amount' => 20]
                ],
                'reason' => 'Defective',
            ]);
        $this->assertBlocked($resReturn);
    }

    /**
     * Attack Scenario 14: POS Sales list is strictly scoped to authorized branch.
     */
    public function test_pos_sales_index_only_lists_branch_a_sales(): void
    {
        $response = $this->withHeaders($this->headersForUserA())
            ->getJson('/api/v1/pos/sales');

        $response->assertStatus(200);
        $response->assertSee('INV-PP-001');
        $response->assertDontSee('INV-SR-002');
    }

    /**
     * Attack Scenario 15: Sale Return access across branches is blocked.
     */
    public function test_user_in_branch_a_cannot_access_sale_returns_of_branch_b(): void
    {
        $returnB = \App\Models\Sales\SaleReturn::create([
            'company_id'       => $this->company->id,
            'sale_id'          => $this->saleB->id,
            'user_id'          => $this->userB->id,
            'reference_number' => 'RET-SR-001',
            'date'             => now(),
            'total_amount'     => 50,
            'status'           => 'draft',
        ]);

        // GET return detail
        $response = $this->withHeaders($this->headersForUserA())
            ->getJson('/api/v1/sale-returns/' . $returnB->id);
        $this->assertBlocked($response);

        // Attempt to create return against Branch B sale
        $resCreate = $this->withHeaders($this->headersForUserA())
            ->postJson('/api/v1/sale-returns', [
                'sale_id'          => $this->saleB->id,
                'reference_number' => 'RET-SR-ATTEMPT-01',
                'date'             => now()->toDateString(),
                'total_amount'     => 50,
            ]);
        $this->assertBlocked($resCreate);
    }

    /**
     * Attack Scenario 16: Purchase Return cross-branch access blocked.
     */
    public function test_user_in_branch_a_cannot_access_purchase_returns_of_branch_b(): void
    {
        $pReturnB = \App\Models\Purchase\PurchaseReturn::create([
            'company_id'       => $this->company->id,
            'purchase_id'      => $this->purchaseB->id,
            'supplier_id'      => $this->purchaseB->supplier_id,
            'user_id'          => $this->userB->id,
            'reference_number' => 'PRET-SR-001',
            'date'             => now()->toDateString(),
            'total_amount'     => 50,
            'status'           => 'pending',
        ]);

        $response = $this->withHeaders($this->headersForUserA())
            ->getJson('/api/v1/purchase-returns/' . $pReturnB->id);
        $this->assertBlocked($response);
    }

    /**
     * Attack Scenario 17: Cash Register transaction isolation.
     */
    public function test_user_in_branch_a_cannot_view_or_record_cash_register_transactions_of_branch_b(): void
    {
        // 1. View transactions of Branch B register via filter
        $resIndex = $this->withHeaders($this->headersForUserA())
            ->getJson('/api/v1/cash-register-transactions?cash_register_id=' . $this->registerB->id);
        $this->assertBlocked($resIndex);

        // 2. Add cash-in to Branch B register
        $resCashIn = $this->withHeaders($this->headersForUserA())
            ->postJson('/api/v1/cash-register-transactions', [
                'cash_register_id' => $this->registerB->id,
                'type'             => 'cash_in',
                'amount'           => 50,
                'notes'            => 'Malicious cash injection',
            ]);
        $this->assertBlocked($resCashIn);
    }

    /**
     * Attack Scenario 18: Shift isolation across branches.
     */
    public function test_user_in_branch_a_cannot_access_or_create_shifts_of_branch_b(): void
    {
        $shiftB = \App\Models\Employee\Shift::create([
            'company_id' => $this->company->id,
            'branch_id'  => $this->branchB->id,
            'name'       => 'Night Shift SR',
            'start_time' => '18:00:00',
            'end_time'   => '02:00:00',
            'is_active'  => true,
        ]);

        // View Shift B
        $resView = $this->withHeaders($this->headersForUserA())
            ->getJson('/api/v1/shifts/' . $shiftB->id);
        $this->assertBlocked($resView);

        // Create shift in Branch B
        $resCreate = $this->withHeaders($this->headersForUserA())
            ->postJson('/api/v1/shifts', [
                'branch_id'  => $this->branchB->id,
                'name'       => 'Unauthorized Shift',
                'start_time' => '08:00:00',
                'end_time'   => '17:00:00',
            ]);
        $this->assertBlocked($resCreate);
    }

    /**
     * Attack Scenario 19: Leave request isolation across branches.
     */
    public function test_user_in_branch_a_cannot_access_leave_requests_of_branch_b(): void
    {
        $deptB = \App\Models\Employee\Department::create([
            'company_id' => $this->company->id,
            'branch_id'  => $this->branchB->id,
            'name'       => 'SR Sales Dept',
            'code'       => 'SR-SALES',
        ]);
        $posB = \App\Models\Employee\Position::create([
            'company_id'    => $this->company->id,
            'department_id' => $deptB->id,
            'name'          => 'SR Sales Associate',
            'code'          => 'SR-SA',
        ]);
        $empB = \App\Models\Employee\Employee::create([
            'company_id'        => $this->company->id,
            'branch_id'         => $this->branchB->id,
            'department_id'     => $deptB->id,
            'position_id'       => $posB->id,
            'name'              => 'SR Staff Member',
            'employee_number'   => 'EMP-SR-001',
            'join_date'         => now()->toDateString(),
            'status'            => 'active',
        ]);
        $leaveB = \App\Models\Employee\LeaveRequest::create([
            'company_id'  => $this->company->id,
            'branch_id'   => $this->branchB->id,
            'employee_id' => $empB->id,
            'leave_type'  => 'annual',
            'start_date'  => now()->toDateString(),
            'end_date'    => now()->addDays(2)->toDateString(),
            'total_days'  => 2,
            'status'      => 'pending',
        ]);

        // View Leave B
        $resView = $this->withHeaders($this->headersForUserA())
            ->getJson('/api/v1/leave-requests/' . $leaveB->id);
        $this->assertBlocked($resView);

        // Approve Leave B
        $resApprove = $this->withHeaders($this->headersForUserA())
            ->postJson('/api/v1/leave-requests/' . $leaveB->id . '/approve');
        $this->assertBlocked($resApprove);
    }

    /**
     * Attack Scenario 20: User management isolation across branches.
     */
    public function test_user_in_branch_a_cannot_view_or_mutate_user_of_branch_b(): void
    {
        // 1. View User B
        $resView = $this->withHeaders($this->headersForUserA())
            ->getJson('/api/v1/users/' . $this->userB->id);
        $resView->assertStatus(403);

        // 2. Update User B
        $resUpdate = $this->withHeaders($this->headersForUserA())
            ->putJson('/api/v1/users/' . $this->userB->id, [
                'name' => 'Tampered User B',
            ]);
        $resUpdate->assertStatus(403);

        // 3. Delete User B
        $resDelete = $this->withHeaders($this->headersForUserA())
            ->deleteJson('/api/v1/users/' . $this->userB->id);
        $resDelete->assertStatus(403);

        // 4. Create user in Branch B
        $resCreate = $this->withHeaders($this->headersForUserA())
            ->postJson('/api/v1/users', [
                'name'      => 'Injected User B',
                'email'     => 'injected_b@test.com',
                'password'  => 'Secret123!',
                'role'      => 'cashier',
                'branch_id' => $this->branchB->id,
            ]);
        $resCreate->assertStatus(403);
    }
}
