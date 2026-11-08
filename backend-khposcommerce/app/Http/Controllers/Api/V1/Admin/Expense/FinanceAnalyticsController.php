<?php

namespace App\Http\Controllers\Api\V1\Admin\Expense;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Expense\Expense;
use App\Models\Expense\ExpenseCategory;
use App\Models\POS\CashRegister;
use App\Models\Sales\Sale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class FinanceAnalyticsController extends BaseApiController
{
    public function analytics(Request $request): JsonResponse
    {
        $today = Carbon::today('Asia/Phnom_Penh');
        $startOfMonth = Carbon::now('Asia/Phnom_Penh')->startOfMonth();
        $endOfMonth = Carbon::now('Asia/Phnom_Penh')->endOfMonth();

        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);
        $accessibleBranchIds = $user?->accessibleBranchIds() ?? [];

        $branchIds = $accessibleBranchIds;
        if ($request->filled('branch_id')) {
            $requestedBranchId = (int) $request->branch_id;
            if ($user && !$user->canAccessBranch($requestedBranchId)) {
                return $this->errorResponse('Unauthorized branch access', 403);
            }
            $branchIds = [$requestedBranchId];
        }

        // 1. All-time Base Queries
        $allSalesQuery = Sale::completed()
            ->where('company_id', $companyId)
            ->whereIn('branch_id', $branchIds);
        $allExpensesQuery = Expense::where('company_id', $companyId)
            ->whereIn('branch_id', $branchIds)
            ->where('status', '!=', 'rejected');
        $allRegistersQuery = CashRegister::where('company_id', $companyId)
            ->whereIn('branch_id', $branchIds);

        $totalGrossSales = (float) (clone $allSalesQuery)->sum('grand_total');
        $totalSalesCount = (clone $allSalesQuery)->count();
        $avgOrderValue = $totalSalesCount > 0 ? $totalGrossSales / $totalSalesCount : 0.0;

        $totalExpenses = (float) (clone $allExpensesQuery)->sum('amount');
        $totalExpensesCount = (clone $allExpensesQuery)->count();
        $avgExpenseValue = $totalExpensesCount > 0 ? $totalExpenses / $totalExpensesCount : 0.0;

        $netProfits = max(0, $totalGrossSales - $totalExpenses);
        $profitMargin = $totalGrossSales > 0 ? ($netProfits / $totalGrossSales) * 100 : 0.0;
        $opexRatio = $totalGrossSales > 0 ? ($totalExpenses / $totalGrossSales) * 100 : 0.0;
        $revenueMultiple = $totalExpenses > 0 ? round($totalGrossSales / $totalExpenses, 1) : ($totalGrossSales > 0 ? 100.0 : 0.0);

        $totalCashReserves = (float) (clone $allRegistersQuery)->get()->sum(function ($r) {
            return (float) ($r->closing_balance > 0 ? $r->closing_balance : ($r->opening_balance > 0 ? $r->opening_balance : 150.00));
        });
        $totalRegistersCount = (clone $allRegistersQuery)->count();
        $openRegistersCount = (clone $allRegistersQuery)->where('status', 'open')->count();
        $avgTillFloat = $totalRegistersCount > 0 ? $totalCashReserves / $totalRegistersCount : 0.0;

        // 2. Month Analytics
        $monthSales = (float) Sale::completed()
            ->where('company_id', $companyId)
            ->whereIn('branch_id', $branchIds)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->sum('grand_total');
        $monthSalesCount = Sale::completed()
            ->where('company_id', $companyId)
            ->whereIn('branch_id', $branchIds)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->count();
        $monthExpenses = (float) Expense::where('company_id', $companyId)
            ->whereIn('branch_id', $branchIds)
            ->where('status', '!=', 'rejected')
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->sum('amount');
        $monthExpensesCount = Expense::where('company_id', $companyId)
            ->whereIn('branch_id', $branchIds)
            ->where('status', '!=', 'rejected')
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->count();
        $monthNetProfit = max(0, $monthSales - $monthExpenses);

        // 3. Today Analytics
        $todaySales = (float) Sale::completed()
            ->where('company_id', $companyId)
            ->whereIn('branch_id', $branchIds)
            ->whereDate('date', $today)
            ->sum('grand_total');
        $todaySalesCount = Sale::completed()
            ->where('company_id', $companyId)
            ->whereIn('branch_id', $branchIds)
            ->whereDate('date', $today)
            ->count();
        $todayExpenses = (float) Expense::where('company_id', $companyId)
            ->whereIn('branch_id', $branchIds)
            ->where('status', '!=', 'rejected')
            ->whereDate('date', $today)
            ->sum('amount');
        $todayExpensesCount = Expense::where('company_id', $companyId)
            ->whereIn('branch_id', $branchIds)
            ->where('status', '!=', 'rejected')
            ->whereDate('date', $today)
            ->count();
        $todayNetProfit = max(0, $todaySales - $todayExpenses);

        // 4. Top Category and Category Breakdown
        $categoriesBreakdown = ExpenseCategory::where('company_id', $companyId)
            ->withSum(['expenses' => function ($q) use ($companyId, $branchIds) {
                $q->whereNull('deleted_at')
                  ->where('company_id', $companyId)
                  ->whereIn('branch_id', $branchIds)
                  ->where('status', '!=', 'rejected');
            }], 'amount')
        ->get()
        ->map(function ($cat) use ($totalExpenses) {
            $amount = (float) ($cat->expenses_sum_amount ?? 0);
            return [
                'id' => $cat->id,
                'name' => $cat->name,
                'amount' => $amount,
                'percentage' => $totalExpenses > 0 ? round(($amount / $totalExpenses) * 100, 1) : 0,
            ];
        })
        ->sortByDesc('amount')
        ->values();

        $topCategoryName = $categoriesBreakdown->first()['name'] ?? 'Operational';

        // 5. Daily run-rate
        $dailyRunRate = $totalGrossSales > 0 ? round($totalGrossSales / 30, 2) : 0.0;

        return $this->successResponse([
            'summary' => [
                'gross_sales' => $totalGrossSales,
                'sales_count' => $totalSalesCount,
                'avg_order_value' => $avgOrderValue,
                'total_expenses' => $totalExpenses,
                'expenses_count' => $totalExpensesCount,
                'avg_expense_value' => $avgExpenseValue,
                'net_profits' => $netProfits,
                'profit_margin' => round($profitMargin, 1),
                'opex_ratio' => round($opexRatio, 1),
                'revenue_multiple' => $revenueMultiple,
                'cash_reserves' => $totalCashReserves,
                'total_registers' => $totalRegistersCount,
                'open_registers' => $openRegistersCount,
                'avg_till_float' => $avgTillFloat,
                'daily_run_rate' => $dailyRunRate,
                'top_category' => $topCategoryName,
            ],
            'timeframes' => [
                'all' => [
                    'gross_sales' => $totalGrossSales,
                    'sales_count' => $totalSalesCount,
                    'expenses' => $totalExpenses,
                    'expenses_count' => $totalExpensesCount,
                    'net_profit' => $netProfits,
                    'margin' => round($profitMargin, 1),
                ],
                'month' => [
                    'gross_sales' => $monthSales,
                    'sales_count' => $monthSalesCount,
                    'expenses' => $monthExpenses,
                    'expenses_count' => $monthExpensesCount,
                    'net_profit' => $monthNetProfit,
                    'margin' => $monthSales > 0 ? round(($monthNetProfit / $monthSales) * 100, 1) : 0.0,
                ],
                'today' => [
                    'gross_sales' => $todaySales,
                    'sales_count' => $todaySalesCount,
                    'expenses' => $todayExpenses,
                    'expenses_count' => $todayExpensesCount,
                    'net_profit' => $todayNetProfit,
                    'margin' => $todaySales > 0 ? round(($todayNetProfit / $todaySales) * 100, 1) : 0.0,
                ],
            ],
            'categories_breakdown' => $categoriesBreakdown,
        ], 'Financial analytics generated successfully');
    }
}
