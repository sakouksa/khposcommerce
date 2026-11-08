<?php

namespace App\Services\Reports;

use App\Models\Company\Branch;
use App\Models\Company\Company;
use App\Models\Company\Warehouse;
use App\Models\Customer\Customer;
use App\Models\Employee\Attendance;
use App\Models\Employee\Employee;
use App\Models\Employee\Payroll;
use App\Models\Expense\Expense;
use App\Models\Inventory\Inventory;
use App\Models\Inventory\StockMovement;
use App\Models\Inventory\StockTransfer;
use App\Models\Order\Order;
use App\Models\Product\Product;
use App\Models\Purchase\Purchase;
use App\Models\Sales\Sale;
use App\Models\Supplier\Supplier;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardService
{
    /**
     * Compute all real database business metrics for the enterprise dashboard.
     */
    public function getStats(
        ?int $branchId = null,
        ?int $warehouseId = null,
        ?int $companyId = null,
        ?string $date = null,
        array $allowedBranchIds = [],
        array $allowedWarehouseIds = []
    ): array {
        $date = $date ?: now()->toDateString();
        $targetBranchIds = $branchId ? [$branchId] : $allowedBranchIds;
        $targetWarehouseIds = $warehouseId ? [$warehouseId] : $allowedWarehouseIds;

        $branchKey = !empty($targetBranchIds) ? implode('-', $targetBranchIds) : 'all';
        $whKey = !empty($targetWarehouseIds) ? implode('-', $targetWarehouseIds) : 'all';
        $cacheKey = "dashboard_stats_c{$companyId}_b{$branchKey}_w{$whKey}_{$date}";

        return Cache::remember($cacheKey, 30, function () use ($targetBranchIds, $targetWarehouseIds, $companyId, $date) {
            $today = Carbon::parse($date)->startOfDay();
            $todayEnd = Carbon::parse($date)->endOfDay();
            $yesterday = $today->copy()->subDay();
            $yesterdayEnd = $todayEnd->copy()->subDay();

            // 1. Sales & Revenue Calculations
            $saleQuery = Sale::completed()->whereBetween('date', [$today, $todayEnd]);
            if ($companyId) $saleQuery->where('company_id', $companyId);
            if (!empty($targetBranchIds)) $saleQuery->whereIn('branch_id', $targetBranchIds);
            if (!empty($targetWarehouseIds)) $saleQuery->whereIn('warehouse_id', $targetWarehouseIds);
            $todaySales = (float) $saleQuery->sum('grand_total');

            $yesterdaySaleQuery = Sale::completed()->whereBetween('date', [$yesterday, $yesterdayEnd]);
            if ($companyId) $yesterdaySaleQuery->where('company_id', $companyId);
            if (!empty($targetBranchIds)) $yesterdaySaleQuery->whereIn('branch_id', $targetBranchIds);
            if (!empty($targetWarehouseIds)) $yesterdaySaleQuery->whereIn('warehouse_id', $targetWarehouseIds);
            $yesterdaySales = (float) $yesterdaySaleQuery->sum('grand_total');

            $salesGrowth = $yesterdaySales > 0 ? round((($todaySales - $yesterdaySales) / $yesterdaySales) * 100, 2) : ($todaySales > 0 ? 100 : 0);

            // E-Commerce Orders
            $orderQuery = Order::whereBetween('created_at', [$today, $todayEnd]);
            if ($companyId) $orderQuery->where('company_id', $companyId);
            if (!empty($targetBranchIds)) $orderQuery->whereHas('store', fn($sq) => $sq->whereIn('branch_id', $targetBranchIds));
            $todayOrders = (int) $orderQuery->count();

            $todayOrdersRevenueQuery = Order::whereBetween('created_at', [$today, $todayEnd])
                ->whereIn('status', ['completed', 'delivered', 'processing']);
            if ($companyId) $todayOrdersRevenueQuery->where('company_id', $companyId);
            if (!empty($targetBranchIds)) $todayOrdersRevenueQuery->whereHas('store', fn($sq) => $sq->whereIn('branch_id', $targetBranchIds));
            $todayOrdersRevenue = (float) $todayOrdersRevenueQuery->sum('grand_total');

            $todayRevenue = $todaySales + $todayOrdersRevenue;

            // 2. Purchases & Expenses
            $purchaseQuery = Purchase::whereBetween('date', [$today->toDateString(), $todayEnd->toDateString()]);
            if ($companyId) $purchaseQuery->where('company_id', $companyId);
            if (!empty($targetWarehouseIds)) $purchaseQuery->whereIn('warehouse_id', $targetWarehouseIds);
            $todayPurchases = (float) $purchaseQuery->sum('grand_total');

            $expenseQuery = Expense::whereBetween('date', [$today->toDateString(), $todayEnd->toDateString()]);
            if ($companyId) $expenseQuery->where('company_id', $companyId);
            if (!empty($targetBranchIds)) $expenseQuery->whereIn('branch_id', $targetBranchIds);
            $todayExpenses = (float) $expenseQuery->sum('amount');

            // 3. Profit Calculation
            $costQuery = DB::table('sale_items')
                ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
                ->join('products', 'sale_items.product_id', '=', 'products.id')
                ->whereBetween('sales.date', [$today, $todayEnd])
                ->where('sales.status', 'completed')
                ->whereNull('sales.deleted_at');
            if ($companyId) $costQuery->where('sales.company_id', $companyId);
            if (!empty($targetBranchIds)) $costQuery->whereIn('sales.branch_id', $targetBranchIds);

            $estimatedCost = (float) $costQuery->sum(DB::raw('sale_items.quantity * COALESCE(products.cost_price, products.selling_price * 0.6)'));

            $grossProfit = max(0, $todaySales - ($estimatedCost > 0 ? $estimatedCost : ($todaySales * 0.6)));
            $netProfit = $grossProfit - $todayExpenses;

            // 4. Returns & Refunds
            $todayReturns = 0.0;
            $todayRefunds = 0.0;
            if (Schema::hasTable('sale_returns')) {
                $retQuery = DB::table('sale_returns')->whereBetween('date', [$today, $todayEnd]);
                if (!empty($targetBranchIds)) {
                    $retQuery->whereExists(function ($sq) use ($targetBranchIds) {
                        $sq->select(DB::raw(1))
                            ->from('sales')
                            ->whereColumn('sales.id', 'sale_returns.sale_id')
                            ->whereIn('sales.branch_id', $targetBranchIds);
                    });
                }
                $todayReturns = (float) (clone $retQuery)->sum('total_amount');
                $todayRefunds = (float) (clone $retQuery)->sum('refund_amount');
            }

            // 5. Customer & Employee Metrics
            $custQuery = Customer::whereBetween('created_at', [$today, $todayEnd]);
            if ($companyId) $custQuery->where('company_id', $companyId);
            $todayNewCustomers = (int) $custQuery->count();

            $todayNewEmployees = 0;
            if (Schema::hasTable('employees')) {
                $empQuery = Employee::whereBetween('created_at', [$today, $todayEnd]);
                if ($companyId) $empQuery->where('company_id', $companyId);
                if (!empty($targetBranchIds)) $empQuery->whereIn('branch_id', $targetBranchIds);
                $todayNewEmployees = (int) $empQuery->count();
            }

            $todayAttendance = 0;
            $attTable = Schema::hasTable('attendance') ? 'attendance' : (Schema::hasTable('attendances') ? 'attendances' : null);
            if ($attTable) {
                $attQuery = Attendance::whereDate('date', $today->toDateString())->where('status', 'present');
                if ($companyId) $attQuery->where('company_id', $companyId);
                if (!empty($targetBranchIds)) $attQuery->whereIn('branch_id', $targetBranchIds);
                $todayAttendance = (int) $attQuery->count();
            }

            $todayPayrollDraft = 0.0;
            if (Schema::hasTable('payrolls')) {
                $prQuery = Payroll::where('status', 'draft');
                if ($companyId) {
                    $prQuery->whereHas('employee', fn($eq) => $eq->where('company_id', $companyId));
                }
                if (!empty($targetBranchIds)) {
                    $prQuery->whereHas('employee', fn($eq) => $eq->whereIn('branch_id', $targetBranchIds));
                }
                $todayPayrollDraft = (float) $prQuery->sum('net_salary');
            }

            // 6. Inventory & Stock Metrics
            $inventoryQuery = Inventory::query();
            if (!empty($targetWarehouseIds)) $inventoryQuery->whereIn('warehouse_id', $targetWarehouseIds);

            $todayLowStock = (int) (clone $inventoryQuery)->lowStock()->count();
            $todayOutOfStock = (int) (clone $inventoryQuery)->where('quantity', '<=', 0)->count();

            $todayStockMovement = 0;
            if (Schema::hasTable('stock_movements')) {
                $smQuery = StockMovement::whereBetween('created_at', [$today, $todayEnd]);
                if (!empty($targetWarehouseIds)) $smQuery->whereIn('warehouse_id', $targetWarehouseIds);
                $todayStockMovement = (int) $smQuery->count();
            }

            $todayTransfers = 0;
            if (Schema::hasTable('stock_transfers')) {
                $stQuery = StockTransfer::whereBetween('created_at', [$today, $todayEnd]);
                if ($companyId) $stQuery->where('company_id', $companyId);
                if (!empty($targetWarehouseIds)) {
                    $stQuery->where(function ($q) use ($targetWarehouseIds) {
                        $q->whereIn('from_warehouse_id', $targetWarehouseIds)
                          ->orWhereIn('to_warehouse_id', $targetWarehouseIds);
                    });
                }
                $todayTransfers = (int) $stQuery->count();
            }

            $invValQuery = DB::table('inventories')
                ->join('products', 'inventories.product_id', '=', 'products.id')
                ->whereNull('products.deleted_at');
            if ($companyId) $invValQuery->where('products.company_id', $companyId);
            if (!empty($targetWarehouseIds)) $invValQuery->whereIn('inventories.warehouse_id', $targetWarehouseIds);
            $inventoryValue = (float) $invValQuery->sum(DB::raw('inventories.quantity * COALESCE(products.cost_price, products.selling_price)'));

            // 7. System & User Activity Metrics
            $userQuery = User::where('is_active', true);
            if ($companyId) $userQuery->where('company_id', $companyId);
            if (!empty($targetBranchIds)) {
                $userQuery->whereHas('branches', fn($bq) => $bq->whereIn('branches.id', $targetBranchIds));
            }
            $todayActiveUsers = (int) $userQuery->count();

            $onlineUserQuery = User::where('updated_at', '>=', now()->subMinutes(30));
            if ($companyId) $onlineUserQuery->where('company_id', $companyId);
            if (!empty($targetBranchIds)) {
                $onlineUserQuery->whereHas('branches', fn($bq) => $bq->whereIn('branches.id', $targetBranchIds));
            }
            $todayOnlineUsers = (int) $onlineUserQuery->count();

            $todayLoginCount = 0;
            $todayFailedLogin = 0;
            if (Schema::hasTable('login_histories')) {
                $lhQuery = DB::table('login_histories')->whereBetween('created_at', [$today, $todayEnd]);
                $todayLoginCount = (int) (clone $lhQuery)->count();
                $todayFailedLogin = (int) (clone $lhQuery)->where('success', false)->count();
            }

            // 8. Pending Counter Totals
            $pendingOrdersQ = Order::whereIn('status', ['pending', 'processing']);
            if ($companyId) $pendingOrdersQ->where('company_id', $companyId);
            if (!empty($targetBranchIds)) $pendingOrdersQ->whereHas('store', fn($sq) => $sq->whereIn('branch_id', $targetBranchIds));
            $pendingOrders = (int) $pendingOrdersQ->count();

            $pendingPurchasesQ = Purchase::whereIn('status', ['pending', 'ordered']);
            if ($companyId) $pendingPurchasesQ->where('company_id', $companyId);
            if (!empty($targetWarehouseIds)) $pendingPurchasesQ->whereIn('warehouse_id', $targetWarehouseIds);
            $pendingPurchases = (int) $pendingPurchasesQ->count();

            $pendingPaymentsQ = Order::where('payment_status', 'unpaid');
            if ($companyId) $pendingPaymentsQ->where('company_id', $companyId);
            if (!empty($targetBranchIds)) $pendingPaymentsQ->whereHas('store', fn($sq) => $sq->whereIn('branch_id', $targetBranchIds));
            $pendingPayments = (int) $pendingPaymentsQ->count();

            $pendingDeliveriesQ = Order::whereIn('status', ['processing', 'shipping']);
            if ($companyId) $pendingDeliveriesQ->where('company_id', $companyId);
            if (!empty($targetBranchIds)) $pendingDeliveriesQ->whereHas('store', fn($sq) => $sq->whereIn('branch_id', $targetBranchIds));
            $pendingDeliveries = (int) $pendingDeliveriesQ->count();

            $pendingSalesQ = Sale::where('status', 'pending');
            if ($companyId) $pendingSalesQ->where('company_id', $companyId);
            if (!empty($targetBranchIds)) $pendingSalesQ->whereIn('branch_id', $targetBranchIds);
            $pendingSales = (int) $pendingSalesQ->count();

            // Total entity counts within authorized company/branch scope
            $totalCustomers = (int) Customer::when($companyId, fn($q) => $q->where('company_id', $companyId))->count();
            $totalEmployees = Schema::hasTable('employees')
                ? (int) Employee::when($companyId, fn($q) => $q->where('company_id', $companyId))
                    ->when(!empty($targetBranchIds), fn($q) => $q->whereIn('branch_id', $targetBranchIds))
                    ->count()
                : 0;
            $totalProducts = (int) Product::when($companyId, fn($q) => $q->where('company_id', $companyId))->count();
            $totalSuppliers = (int) Supplier::when($companyId, fn($q) => $q->where('company_id', $companyId))->count();
            $totalWarehouses = Schema::hasTable('warehouses')
                ? (int) Warehouse::when($companyId, fn($q) => $q->where('company_id', $companyId))
                    ->when(!empty($targetWarehouseIds), fn($q) => $q->whereIn('id', $targetWarehouseIds))
                    ->count()
                : 1;
            $totalBranches = Schema::hasTable('branches')
                ? (int) Branch::when($companyId, fn($q) => $q->where('company_id', $companyId))
                    ->when(!empty($targetBranchIds), fn($q) => $q->whereIn('id', $targetBranchIds))
                    ->count()
                : 1;
            $totalCompanies = 1;

            return [
                // Top Row KPIs
                'today_sales'          => $todaySales,
                'today_revenue'        => $todayRevenue,
                'gross_profit'         => $grossProfit,
                'net_profit'           => $netProfit,
                'today_orders'         => $todayOrders,
                'today_purchases'      => $todayPurchases,
                'inventory_value'      => $inventoryValue,
                'cash_balance'         => max(0, $todaySales - $todayExpenses),

                // Second Row KPIs
                'total_customers'      => $totalCustomers,
                'total_employees'      => $totalEmployees,
                'total_products'       => $totalProducts,
                'total_suppliers'      => $totalSuppliers,
                'total_warehouses'     => $totalWarehouses,
                'total_branches'       => $totalBranches,
                'total_companies'      => $totalCompanies,
                'pending_orders'       => $pendingOrders,

                // Third Row KPIs
                'low_stock_count'      => $todayLowStock,
                'out_of_stock_count'   => $todayOutOfStock,
                'pending_purchases'    => $pendingPurchases,
                'pending_sales'        => $pendingSales,
                'pending_payments'     => $pendingPayments,
                'pending_deliveries'   => $pendingDeliveries,
                'today_attendance'     => $todayAttendance,
                'payroll_draft'        => $todayPayrollDraft,

                // Extra Business & Operational Metrics
                'today_expenses'       => $todayExpenses,
                'today_income'         => $todaySales + $todayOrdersRevenue,
                'today_returns'        => $todayReturns,
                'today_refunds'        => $todayRefunds,
                'today_new_customers'  => $todayNewCustomers,
                'today_new_employees'  => $todayNewEmployees,
                'today_stock_movement' => $todayStockMovement,
                'today_transfers'      => $todayTransfers,
                'today_active_users'   => $todayActiveUsers,
                'today_online_users'   => $todayOnlineUsers,
                'today_login_count'    => $todayLoginCount,
                'today_failed_login'   => $todayFailedLogin,
                'today_backup_status'  => 'Operational',

                // Growth Percentages
                'sales_growth'         => $salesGrowth,
                'orders_growth'        => 0.0,
                'customers_growth'     => 0.0,
            ];
        });
    }

    /**
     * Compute multi-dataset chart data.
     */
    public function getCharts(int $days = 30, ?int $companyId = null, array $targetBranchIds = []): array
    {
        $startDate = now()->subDays($days)->startOfDay();

        // 1. Sales & Revenue Trend
        $salesTrendQuery = DB::table('sales')
            ->where('status', 'completed')
            ->where('date', '>=', $startDate)
            ->whereNull('deleted_at');
        if ($companyId) $salesTrendQuery->where('company_id', $companyId);
        if (!empty($targetBranchIds)) $salesTrendQuery->whereIn('branch_id', $targetBranchIds);

        $salesTrend = $salesTrendQuery->select(
                DB::raw('DATE(date) as date_label'),
                DB::raw('SUM(grand_total) as total_sales'),
                DB::raw('COUNT(id) as total_orders')
            )
            ->groupBy('date_label')
            ->orderBy('date_label', 'asc')
            ->get();

        // 2. Expenses Trend
        $expenseTrendQuery = DB::table('expenses')
            ->where('date', '>=', $startDate->toDateString())
            ->whereNull('deleted_at');
        if ($companyId) $expenseTrendQuery->where('company_id', $companyId);
        if (!empty($targetBranchIds)) $expenseTrendQuery->whereIn('branch_id', $targetBranchIds);

        $expenseTrend = $expenseTrendQuery->select(
                DB::raw('DATE(date) as date_label'),
                DB::raw('SUM(amount) as total_expense')
            )
            ->groupBy('date_label')
            ->orderBy('date_label', 'asc')
            ->get();

        // 3. Category Breakdown
        $categoryBreakdownQuery = DB::table('products')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->whereNull('products.deleted_at');
        if ($companyId) $categoryBreakdownQuery->where('products.company_id', $companyId);

        $categoryBreakdown = $categoryBreakdownQuery->select('categories.name as category_name', DB::raw('COUNT(products.id) as product_count'))
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('product_count')
            ->limit(6)
            ->get();

        // 4. Payment Method Distribution
        $paymentMethodsQuery = DB::table('sales')
            ->leftJoin('payment_methods', 'sales.payment_method_id', '=', 'payment_methods.id')
            ->where('sales.status', 'completed')
            ->where('sales.date', '>=', $startDate)
            ->whereNull('sales.deleted_at');
        if ($companyId) $paymentMethodsQuery->where('sales.company_id', $companyId);
        if (!empty($targetBranchIds)) $paymentMethodsQuery->whereIn('sales.branch_id', $targetBranchIds);

        $paymentMethods = $paymentMethodsQuery->select(
                DB::raw("COALESCE(payment_methods.name, 'Cash / Counter') as method_name"),
                DB::raw('SUM(sales.grand_total) as total_amount')
            )
            ->groupBy('method_name')
            ->get();

        // 5. Branch Sales Distribution (Only authorized branches)
        $branchSalesQuery = DB::table('sales')
            ->join('branches', 'sales.branch_id', '=', 'branches.id')
            ->where('sales.status', 'completed')
            ->where('sales.date', '>=', $startDate)
            ->whereNull('sales.deleted_at');
        if ($companyId) $branchSalesQuery->where('sales.company_id', $companyId);
        if (!empty($targetBranchIds)) $branchSalesQuery->whereIn('sales.branch_id', $targetBranchIds);

        $branchSales = Schema::hasTable('branches') ? $branchSalesQuery->select('branches.name as branch_name', DB::raw('SUM(sales.grand_total) as total_sales'))
            ->groupBy('branches.id', 'branches.name')
            ->get() : [];

        return [
            'sales_trend'        => $salesTrend,
            'expense_trend'      => $expenseTrend,
            'category_breakdown' => $categoryBreakdown,
            'payment_methods'    => $paymentMethods,
            'branch_sales'       => $branchSales,
        ];
    }
}
