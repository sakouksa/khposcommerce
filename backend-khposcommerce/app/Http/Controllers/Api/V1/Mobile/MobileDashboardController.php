<?php

namespace App\Http\Controllers\Api\V1\Mobile;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Sales\Sale;
use App\Models\Sales\SaleItem;
use App\Models\Product\Product;
use App\Models\Inventory\Inventory;
use App\Models\POS\CashRegister;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class MobileDashboardController extends BaseApiController
{
    /**
     * GET /api/v1/mobile/dashboard/stats
     * Real-time mobile counter metrics scoped to cashier's assigned branch
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        $branchId = $user->branch_id ?? $request->integer('branch_id');
        $companyId = $user->company_id ?? 1;
        $today = Carbon::today();

        // 1. Today's sales query
        $salesQuery = Sale::where('company_id', $companyId)
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereDate('created_at', $today);

        $todaySalesCount = (clone $salesQuery)->count();
        $todayRevenue    = (float) (clone $salesQuery)->sum('grand_total');
        $todayCashTotal  = (float) (clone $salesQuery)->where('payment_method', 'cash')->sum('paid_amount');
        $todayQrTotal    = (float) (clone $salesQuery)->whereIn('payment_method', ['khqr', 'aba', 'bakong', 'qr'])->sum('paid_amount');
        $todayCardTotal  = (float) (clone $salesQuery)->where('payment_method', 'card')->sum('paid_amount');

        // 2. Active cash register session for this branch/cashier
        $activeRegister = CashRegister::where('company_id', $companyId)
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->where('status', 'open')
            ->latest('id')
            ->first();

        // 3. Low stock count for this branch
        $lowStockCount = Inventory::where('company_id', $companyId)
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->where('quantity', '<=', 5)
            ->count();

        return $this->successResponse([
            'date'             => $today->toDateString(),
            'branch_id'        => $branchId,
            'today_sales'      => $todaySalesCount,
            'today_revenue'    => round($todayRevenue, 2),
            'avg_ticket_size'  => $todaySalesCount > 0 ? round($todayRevenue / $todaySalesCount, 2) : 0.0,
            'payment_breakdown' => [
                'cash' => round($todayCashTotal, 2),
                'qr'   => round($todayQrTotal, 2),
                'card' => round($todayCardTotal, 2),
            ],
            'cash_register' => $activeRegister ? [
                'id'            => $activeRegister->id,
                'name'          => $activeRegister->title ?? 'Main Counter',
                'status'        => 'open',
                'opened_at'     => $activeRegister->created_at?->format('H:i:s'),
                'opening_float' => (float) ($activeRegister->opening_balance ?? 0),
            ] : null,
            'low_stock_alerts' => $lowStockCount,
        ], 'Mobile dashboard stats retrieved');
    }

    /**
     * GET /api/v1/mobile/dashboard/sales-chart
     * Hourly breakdown for today
     */
    public function salesChart(Request $request): JsonResponse
    {
        $user = $request->user();
        $branchId = $user->branch_id ?? $request->integer('branch_id');
        $companyId = $user->company_id ?? 1;
        $today = Carbon::today();

        $hourly = Sale::where('company_id', $companyId)
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereDate('created_at', $today)
            ->selectRaw('HOUR(created_at) as hour, SUM(grand_total) as total, COUNT(id) as count')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->keyBy('hour');

        $chartData = [];
        for ($h = 8; $h <= 22; $h++) {
            $timeLabel = sprintf('%02d:00', $h);
            $chartData[] = [
                'hour'  => $timeLabel,
                'total' => isset($hourly[$h]) ? (float) $hourly[$h]->total : 0.0,
                'count' => isset($hourly[$h]) ? (int) $hourly[$h]->count : 0,
            ];
        }

        return $this->successResponse($chartData);
    }

    /**
     * GET /api/v1/mobile/dashboard/top-products
     */
    public function topProducts(Request $request): JsonResponse
    {
        $user = $request->user();
        $branchId = $user->branch_id ?? $request->integer('branch_id');
        $companyId = $user->company_id ?? 1;

        $topItems = SaleItem::select('product_id', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(total) as total_sales'))
            ->whereHas('sale', function ($q) use ($companyId, $branchId) {
                $q->where('company_id', $companyId)
                  ->when($branchId, fn($sq) => $sq->where('branch_id', $branchId))
                  ->whereDate('created_at', Carbon::today());
            })
            ->with(['product:id,name,sku,barcode,selling_price'])
            ->groupBy('product_id')
            ->orderByDesc('total_qty')
            ->limit(10)
            ->get();

        $data = $topItems->map(fn($item) => [
            'product_id'    => $item->product_id,
            'name'          => $item->product?->name ?? 'Unknown',
            'sku'           => $item->product?->sku,
            'barcode'       => $item->product?->barcode,
            'price'         => (float) ($item->product?->selling_price ?? 0),
            'quantity_sold' => (float) $item->total_qty,
            'total_sales'   => (float) $item->total_sales,
        ]);

        return $this->successResponse($data);
    }

    /**
     * GET /api/v1/mobile/dashboard/recent-orders
     */
    public function recentOrders(Request $request): JsonResponse
    {
        $user = $request->user();
        $branchId = $user->branch_id ?? $request->integer('branch_id');
        $companyId = $user->company_id ?? 1;

        $recentSales = Sale::where('company_id', $companyId)
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->with(['customer:id,name,phone', 'cashier:id,name', 'items:id,sale_id,product_id,quantity,unit_price,total'])
            ->latest('id')
            ->limit(10)
            ->get();

        $data = $recentSales->map(fn($sale) => [
            'id'             => $sale->id,
            'invoice_number' => $sale->invoice_number,
            'grand_total'    => (float) $sale->grand_total,
            'paid_amount'    => (float) $sale->paid_amount,
            'payment_method' => $sale->payment_method,
            'customer_name'  => $sale->customer?->name ?? 'Walk-in Customer',
            'cashier_name'   => $sale->cashier?->name ?? 'Cashier',
            'item_count'     => $sale->items->count(),
            'created_at'     => $sale->created_at?->format('H:i d/m/Y'),
        ]);

        return $this->successResponse($data);
    }

    /**
     * GET /api/v1/mobile/dashboard/low-stock
     */
    public function lowStock(Request $request): JsonResponse
    {
        $user = $request->user();
        $branchId = $user->branch_id ?? $request->integer('branch_id');
        $companyId = $user->company_id ?? 1;

        $lowStock = Inventory::where('company_id', $companyId)
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->where('quantity', '<=', 5)
            ->with(['product:id,name,sku,barcode,selling_price'])
            ->limit(15)
            ->get();

        $data = $lowStock->map(fn($inv) => [
            'product_id' => $inv->product_id,
            'name'       => $inv->product?->name ?? 'Unknown',
            'sku'        => $inv->product?->sku,
            'barcode'    => $inv->product?->barcode,
            'quantity'   => (float) $inv->quantity,
            'unit_price' => (float) ($inv->product?->selling_price ?? 0),
        ]);

        return $this->successResponse($data);
    }
}
