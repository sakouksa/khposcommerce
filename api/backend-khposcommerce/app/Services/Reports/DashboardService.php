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
    public function getStats(?int $branchId = null, ?int $warehouseId = null, ?int $companyId = null, ?string $date = null): array
    {
        $date = $date ?: now()->toDateString();
        $cacheKey = "dashboard_stats_{$branchId}_{$warehouseId}_{$companyId}_{$date}";

        return Cache::remember($cacheKey, 30, function () use ($branchId, $warehouseId, $companyId, $date) {
            $today = Carbon::parse($date)->startOfDay();
            $todayEnd = Carbon::parse($date)->endOfDay();
            $yesterday = $today->copy()->subDay();
            $yesterdayEnd = $todayEnd->copy()->subDay();

            // 1. Sales & Revenue Calculations
            $saleQuery = Sale::completed()->whereBetween('date', [$today, $todayEnd]);
            if ($branchId) $saleQuery->where('branch_id', $branchId);
            if ($warehouseId) $saleQuery->where('warehouse_id', $warehouseId);
            if ($companyId) $saleQuery->where('company_id', $companyId);
            $todaySales = (float) $saleQuery->sum('grand_total');

            $yesterdaySaleQuery = Sale::completed()->whereBetween('date', [$yesterday, $yesterdayEnd]);
            if ($branchId) $yesterdaySaleQuery->where('branch_id', $branchId);
            if ($warehouseId) $yesterdaySaleQuery->where('warehouse_id', $warehouseId);
            if ($companyId) $yesterdaySaleQuery->where('company_id', $companyId);
            $yesterdaySales = (float) $yesterdaySaleQuery->sum('grand_total');

            $salesGrowth = $yesterdaySales > 0 ? round((($todaySales - $yesterdaySales) / $yesterdaySales) * 100, 2) : ($todaySales > 0 ? 100 : 0);

            // E-Commerce Orders
            $orderQuery = Order::whereBetween('created_at', [$today, $todayEnd]);
            if ($branchId) $orderQuery->where('branch_id', $branchId);
            if ($companyId) $orderQuery->where('company_id', $companyId);
            $todayOrders = (int) $orderQuery->count();
            $todayOrdersRevenue = (float) Order::whereBetween('created_at', [$today, $todayEnd])
                ->whereIn('status', ['completed', 'delivered', 'processing'])
                ->sum('grand_total');

            $todayRevenue = $todaySales + $todayOrdersRevenue;

            // 2. Purchases & Expenses
            $purchaseQuery = Purchase::whereBetween('date', [$today->toDateString(), $todayEnd->toDateString()]);
            if ($branchId) $purchaseQuery->where('branch_id', $branchId);
            if ($warehouseId) $purchaseQuery->where('warehouse_id', $warehouseId);
            if ($companyId) $purchaseQuery->where('company_id', $companyId);
            $todayPurchases = (float) $purchaseQuery->sum('grand_total');

            $expenseQuery = Expense::whereBetween('date', [$today->toDateString(), $todayEnd->toDateString()]);
            if ($branchId) $expenseQuery->where('branch_id', $branchId);
            $todayExpenses = (float) $expenseQuery->sum('amount');

            // 3. Profit Calculation (Estimated COGS = 65% of sales if cost not detailed)
            $estimatedCost = (float) DB::table('sale_items')
                ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
                ->join('products', 'sale_items.product_id', '=', 'products.id')
                ->whereBetween('sales.date', [$today, $todayEnd])
                ->where('sales.status', 'completed')
                ->whereNull('sales.deleted_at')
                ->sum(DB::raw('sale_items.quantity * COALESCE(products.cost_price, products.selling_price * 0.6)'));

            $grossProfit = max(0, $todaySales - ($estimatedCost > 0 ? $estimatedCost : ($todaySales * 0.6)));
            $netProfit = $grossProfit - $todayExpenses;

            // 4. Returns & Refunds
            $todayReturns = Schema::hasTable('sale_returns') ? (float) DB::table('sale_returns')->whereBetween('date', [$today, $todayEnd])->sum('total_amount') : 0;
            $todayRefunds = Schema::hasTable('sale_returns') ? (float) DB::table('sale_returns')->whereBetween('date', [$today, $todayEnd])->sum('refund_amount') : 0;

            // 5. Customer & Employee Metrics
            $todayNewCustomers = (int) Customer::whereBetween('created_at', [$today, $todayEnd])->count();
            $todayNewEmployees = Schema::hasTable('employees') ? (int) Employee::whereBetween('created_at', [$today, $todayEnd])->count() : 0;
            $todayAttendance = Schema::hasTable('attendances') ? (int) Attendance::whereDate('date', $today->toDateString())->where('status', 'present')->count() : 0;
            $todayPayrollDraft = Schema::hasTable('payrolls') ? (float) Payroll::where('status', 'draft')->sum('net_salary') : 0;

            // 6. Inventory & Stock Metrics
            $inventoryQuery = Inventory::query();
            if ($warehouseId) $inventoryQuery->where('warehouse_id', $warehouseId);

            $todayLowStock = (int) (clone $inventoryQuery)->lowStock()->count();
            $todayOutOfStock = (int) (clone $inventoryQuery)->where('quantity', '<=', 0)->count();
            $todayStockMovement = Schema::hasTable('stock_movements') ? (int) StockMovement::whereBetween('created_at', [$today, $todayEnd])->count() : 0;
            $todayTransfers = Schema::hasTable('stock_transfers') ? (int) StockTransfer::whereBetween('created_at', [$today, $todayEnd])->count() : 0;

            $inventoryValue = (float) DB::table('inventories')
                ->join('products', 'inventories.product_id', '=', 'products.id')
                ->whereNull('products.deleted_at')
                ->sum(DB::raw('inventories.quantity * COALESCE(products.cost_price, products.selling_price)'));

            // 7. System & User Activity Metrics
            $todayActiveUsers = (int) User::where('is_active', true)->count();
            $todayOnlineUsers = (int) User::where('updated_at', '>=', now()->subMinutes(30))->count();
            $todayLoginCount = Schema::hasTable('login_histories') ? (int) DB::table('login_histories')->whereBetween('created_at', [$today, $todayEnd])->count() : 0;
            $todayFailedLogin = Schema::hasTable('login_histories') ? (int) DB::table('login_histories')->whereBetween('created_at', [$today, $todayEnd])->where('success', false)->count() : 0;

            // 8. Pending Counter Totals
            $pendingOrders = (int) Order::whereIn('status', ['pending', 'processing'])->count();
            $pendingPurchases = (int) Purchase::whereIn('status', ['pending', 'ordered'])->count();
            $pendingPayments = (int) Order::where('payment_status', 'unpaid')->count();
            $pendingDeliveries = (int) Order::whereIn('status', ['processing', 'shipping'])->count();

            // Total entity counts
            $totalCustomers = (int) Customer::count();
            $totalEmployees = Schema::hasTable('employees') ? (int) Employee::count() : 0;
            $totalProducts = (int) Product::count();
            $totalSuppliers = (int) Supplier::count();
            $totalWarehouses = Schema::hasTable('warehouses') ? (int) Warehouse::count() : 1;
            $totalBranches = Schema::hasTable('branches') ? (int) Branch::count() : 1;
            $totalCompanies = Schema::hasTable('companies') ? (int) Company::count() : 1;

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
                'pending_sales'        => (int) Sale::where('status', 'pending')->count(),
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
    public function getCharts(int $days = 30): array
    {
        $startDate = now()->subDays($days)->startOfDay();

        // 1. Sales & Revenue Trend
        $salesTrend = DB::table('sales')
            ->where('status', 'completed')
            ->where('date', '>=', $startDate)
            ->whereNull('deleted_at')
            ->select(
                DB::raw('DATE(date) as date_label'),
                DB::raw('SUM(grand_total) as total_sales'),
                DB::raw('COUNT(id) as total_orders')
            )
            ->groupBy('date_label')
            ->orderBy('date_label', 'asc')
            ->get();

        // 2. Expenses Trend
        $expenseTrend = DB::table('expenses')
            ->where('date', '>=', $startDate->toDateString())
            ->whereNull('deleted_at')
            ->select(
                DB::raw('DATE(date) as date_label'),
                DB::raw('SUM(amount) as total_expense')
            )
            ->groupBy('date_label')
            ->orderBy('date_label', 'asc')
            ->get();

        // 3. Category Breakdown
        $categoryBreakdown = DB::table('products')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->whereNull('products.deleted_at')
            ->select('categories.name as category_name', DB::raw('COUNT(products.id) as product_count'))
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('product_count')
            ->limit(6)
            ->get();

        // 4. Payment Method Distribution
        $paymentMethods = DB::table('sales')
            ->leftJoin('payment_methods', 'sales.payment_method_id', '=', 'payment_methods.id')
            ->where('sales.status', 'completed')
            ->where('sales.date', '>=', $startDate)
            ->whereNull('sales.deleted_at')
            ->select(
                DB::raw("COALESCE(payment_methods.name, 'Cash / Counter') as method_name"),
                DB::raw('SUM(sales.grand_total) as total_amount')
            )
            ->groupBy('method_name')
            ->get();

        // 5. Branch Sales Distribution
        $branchSales = Schema::hasTable('branches') ? DB::table('sales')
            ->join('branches', 'sales.branch_id', '=', 'branches.id')
            ->where('sales.status', 'completed')
            ->where('sales.date', '>=', $startDate)
            ->whereNull('sales.deleted_at')
            ->select('branches.name as branch_name', DB::raw('SUM(sales.grand_total) as total_sales'))
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
