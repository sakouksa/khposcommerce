<?php

namespace App\Http\Controllers\Api\V1\Admin\Report;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Sales\Sale;
use App\Models\Purchase\Purchase;
use App\Models\Expense\Expense;
use App\Models\Inventory\Inventory;

class ReportController extends BaseApiController
{
    /**
     * GET /api/v1/reports/sales
     */
    /**
     * GET /api/v1/reports/sales
     */
    public function sales(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);
        $branchIds = $user?->accessibleBranchIds() ?? [];
        if ($request->filled('branch_id')) {
            $bId = (int) $request->branch_id;
            if ($user && !$user->canAccessBranch($bId)) abort(403, 'Unauthorized branch');
            $branchIds = [$bId];
        }

        $startDate = $request->start_date ?? $request->date_from;
        $endDate   = $request->end_date   ?? $request->date_to;

        $sales = Sale::completed()
            ->where('company_id', $companyId)
            ->when(!empty($branchIds), fn($q) => $q->whereIn('branch_id', $branchIds))
            ->when($startDate, fn($q, $sd) => $q->where('date', '>=', $sd))
            ->when($endDate, fn($q, $ed) => $q->where('date', '<=', $ed))
            ->get();

        return $this->successResponse([
            'total_sales'      => (float) $sales->sum('grand_total'),
            'total_tax'        => (float) $sales->sum('tax_amount'),
            'total_discount'   => (float) $sales->sum('discount_amount'),
            'sales_count'      => $sales->count(),
            'average_ticket'   => $sales->count() > 0 ? (float) $sales->sum('grand_total') / $sales->count() : 0,
        ]);
    }

    /**
     * GET /api/v1/reports/purchases
     */
    public function purchases(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);
        $warehouseIds = $user?->accessibleWarehouseIds() ?? [];
        if ($request->filled('warehouse_id')) {
            $wId = (int) $request->warehouse_id;
            if ($user && !$user->canAccessWarehouse($wId)) abort(403, 'Unauthorized warehouse');
            $warehouseIds = [$wId];
        }

        $startDate = $request->start_date ?? $request->date_from;
        $endDate   = $request->end_date   ?? $request->date_to;

        $purchases = Purchase::received()
            ->where('company_id', $companyId)
            ->when(!empty($warehouseIds), fn($q) => $q->whereIn('warehouse_id', $warehouseIds))
            ->when($startDate, fn($q, $sd) => $q->where('date', '>=', $sd))
            ->when($endDate, fn($q, $ed) => $q->where('date', '<=', $ed))
            ->get();

        return $this->successResponse([
            'total_purchases' => (float) $purchases->sum('grand_total'),
            'purchases_count' => $purchases->count(),
        ]);
    }

    /**
     * GET /api/v1/reports/inventory
     */
    public function inventory(Request $request): JsonResponse
    {
        $user = $request->user();
        $warehouseIds = $user?->accessibleWarehouseIds() ?? [];
        if ($request->filled('warehouse_id')) {
            $wId = (int) $request->warehouse_id;
            if ($user && !$user->canAccessWarehouse($wId)) abort(403, 'Unauthorized warehouse');
            $warehouseIds = [$wId];
        }

        $invQuery = Inventory::query()
            ->when(!empty($warehouseIds), fn($q) => $q->whereIn('warehouse_id', $warehouseIds));

        $totalItems = (float) (clone $invQuery)->sum('quantity');
        $lowStockItems = (clone $invQuery)->lowStock()->count();

        return $this->successResponse([
            'total_items'     => $totalItems,
            'low_stock_items' => $lowStockItems,
        ]);
    }

    /**
     * GET /api/v1/reports/products
     */
    public function products(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);

        $prodQuery = \App\Models\Product\Product::where('company_id', $companyId);
        $totalProducts = (clone $prodQuery)->count();
        $activeProducts = (clone $prodQuery)->where('status', 'active')->count();
        $featuredProducts = (clone $prodQuery)->where('is_featured', true)->count();
        $withVariants = (clone $prodQuery)->where('has_variants', true)->count();

        return $this->successResponse([
            'total_products'    => $totalProducts,
            'active_products'   => $activeProducts,
            'featured_products' => $featuredProducts,
            'variant_products'  => $withVariants,
        ]);
    }

    /**
     * GET /api/v1/reports/customers
     */
    public function customers(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);

        $custQuery = \App\Models\Customer\Customer::where('company_id', $companyId);
        $totalCustomers = (clone $custQuery)->count();
        $activeCustomers = (clone $custQuery)->where('is_active', true)->count();
        $groupsCount = \App\Models\Customer\CustomerGroup::count();

        return $this->successResponse([
            'total_customers'  => $totalCustomers,
            'active_customers' => $activeCustomers,
            'groups_count'     => $groupsCount,
        ]);
    }

    /**
     * GET /api/v1/reports/expenses
     */
    public function expenses(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);
        $branchIds = $user?->accessibleBranchIds() ?? [];
        if ($request->filled('branch_id')) {
            $bId = (int) $request->branch_id;
            if ($user && !$user->canAccessBranch($bId)) abort(403, 'Unauthorized branch');
            $branchIds = [$bId];
        }

        $startDate = $request->start_date ?? $request->date_from;
        $endDate   = $request->end_date   ?? $request->date_to;

        $expenses = Expense::where('company_id', $companyId)
            ->when(!empty($branchIds), fn($q) => $q->whereIn('branch_id', $branchIds))
            ->when($startDate, fn($q, $sd) => $q->where('expense_date', '>=', $sd))
            ->when($endDate, fn($q, $ed) => $q->where('expense_date', '<=', $ed))
            ->get();

        return $this->successResponse([
            'total_expenses' => (float) $expenses->sum('amount'),
            'expenses_count' => $expenses->count(),
        ]);
    }

    /**
     * GET /api/v1/reports/profit-loss
     */
    public function profitLoss(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);
        $branchIds = $user?->accessibleBranchIds() ?? [];
        $warehouseIds = $user?->accessibleWarehouseIds() ?? [];

        if ($request->filled('branch_id')) {
            $bId = (int) $request->branch_id;
            if ($user && !$user->canAccessBranch($bId)) abort(403, 'Unauthorized branch');
            $branchIds = [$bId];
        }

        $startDate = $request->start_date ?? $request->date_from;
        $endDate   = $request->end_date   ?? $request->date_to;

        $sales = Sale::completed()
            ->where('company_id', $companyId)
            ->when(!empty($branchIds), fn($q) => $q->whereIn('branch_id', $branchIds))
            ->when($startDate, fn($q, $sd) => $q->where('date', '>=', $sd))
            ->when($endDate, fn($q, $ed) => $q->where('date', '<=', $ed))
            ->sum('grand_total');

        $purchases = Purchase::received()
            ->where('company_id', $companyId)
            ->when(!empty($warehouseIds), fn($q) => $q->whereIn('warehouse_id', $warehouseIds))
            ->when($startDate, fn($q, $sd) => $q->where('date', '>=', $sd))
            ->when($endDate, fn($q, $ed) => $q->where('date', '<=', $ed))
            ->sum('grand_total');

        $expenses = Expense::where('company_id', $companyId)
            ->when(!empty($branchIds), fn($q) => $q->whereIn('branch_id', $branchIds))
            ->when($startDate, fn($q, $sd) => $q->where('expense_date', '>=', $sd))
            ->when($endDate, fn($q, $ed) => $q->where('expense_date', '<=', $ed))
            ->sum('amount');

        $grossProfit = $sales - $purchases;
        $netProfit   = $grossProfit - $expenses;

        return $this->successResponse([
            'total_sales'     => (float) $sales,
            'total_purchases' => (float) $purchases,
            'total_expenses'  => (float) $expenses,
            'gross_profit'    => (float) $grossProfit,
            'net_profit'      => (float) $netProfit,
        ]);
    }

    /**
     * GET /api/v1/reports/export-inventory
     */
    public function exportInventory(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);
        $warehouseIds = $user?->accessibleWarehouseIds() ?? [];

        $headers = [
            'Content-type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename=inventory_export_' . now()->format('Y-m-d') . '.csv',
            'Pragma'              => 'no-cache',
            'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0',
            'Expires'             => '0'
        ];

        $callback = function () use ($companyId, $warehouseIds) {
            $file = fopen('php://output', 'w');

            // UTF-8 BOM
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($file, [
                'ID',
                'Product Name',
                'SKU',
                'Barcode',
                'Category',
                'Brand',
                'Selling Price',
                'Cost Price',
                'Stock Quantity',
                'Status'
            ]);

            $products = \App\Models\Product\Product::where('company_id', $companyId)
                ->with(['category', 'brand', 'inventories' => function ($q) use ($warehouseIds) {
                    if (!empty($warehouseIds)) $q->whereIn('warehouse_id', $warehouseIds);
                }])
                ->get();

            foreach ($products as $product) {
                fputcsv($file, [
                    $product->id,
                    $product->name,
                    $product->sku,
                    $product->barcode ?? '',
                    $product->category?->name ?? '',
                    $product->brand?->name ?? '',
                    $product->selling_price,
                    $product->cost_price ?? 0,
                    $product->inventories->sum('quantity'),
                    $product->status
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * GET /api/v1/reports/export-sales
     */
    public function exportSales(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);
        $branchIds = $user?->accessibleBranchIds() ?? [];
        if ($request->filled('branch_id')) {
            $bId = (int) $request->branch_id;
            if ($user && !$user->canAccessBranch($bId)) abort(403, 'Unauthorized branch');
            $branchIds = [$bId];
        }

        $headers = [
            'Content-type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename=sales_export_' . now()->format('Y-m-d') . '.csv',
            'Pragma'              => 'no-cache',
            'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0',
            'Expires'             => '0'
        ];

        $callback = function () use ($request, $companyId, $branchIds) {
            $file = fopen('php://output', 'w');

            // UTF-8 BOM
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($file, [
                'ID',
                'Sale Date',
                'Invoice No',
                'Customer Name',
                'Sub Total',
                'Tax Amount',
                'Discount Amount',
                'Grand Total',
                'Payment Status',
                'Payment Method'
            ]);

            $startDate = $request->start_date ?? $request->date_from;
            $endDate   = $request->end_date   ?? $request->date_to;

            $sales = Sale::with(['customer', 'paymentMethod'])
                ->where('company_id', $companyId)
                ->when(!empty($branchIds), fn($q) => $q->whereIn('branch_id', $branchIds))
                ->when($startDate, fn($q, $sd) => $q->where('date', '>=', $sd))
                ->when($endDate, fn($q, $ed) => $q->where('date', '<=', $ed))
                ->get();

            foreach ($sales as $sale) {
                fputcsv($file, [
                    $sale->id,
                    $sale->date,
                    $sale->invoice_no,
                    $sale->customer?->name ?? 'Walk-in Customer',
                    $sale->sub_total,
                    $sale->tax_amount,
                    $sale->discount_amount,
                    $sale->grand_total,
                    $sale->payment_status,
                    $sale->paymentMethod?->name ?? 'Cash'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
