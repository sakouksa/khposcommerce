<?php

namespace App\Repositories\Reports;

use App\Models\Purchase\Purchase;
use App\Models\Purchase\PurchaseItem;
use App\Models\Purchase\PurchaseReturn;
use App\Models\Product\Product;
use App\Models\Supplier\Supplier;
use Illuminate\Support\Facades\DB;

class PurchaseReportRepository
{
    /**
     * Build base query with standard enterprise filters.
     */
    protected function buildFilteredQuery(array $filters)
    {
        $query = Purchase::query()->whereNull('purchases.deleted_at');

        if (!empty($filters['company_id'])) {
            $query->where('purchases.company_id', $filters['company_id']);
        }
        if (!empty($filters['branch_id'])) {
            $query->where('purchases.branch_id', $filters['branch_id']);
        }
        if (!empty($filters['warehouse_id'])) {
            $query->where('purchases.warehouse_id', $filters['warehouse_id']);
        }
        if (!empty($filters['supplier_id'])) {
            $query->where('purchases.supplier_id', $filters['supplier_id']);
        }
        if (!empty($filters['status'])) {
            $query->where('purchases.status', $filters['status']);
        }
        if (!empty($filters['payment_status'])) {
            $query->where('purchases.payment_status', $filters['payment_status']);
        }
        if (!empty($filters['user_id'])) {
            $query->where('purchases.user_id', $filters['user_id']);
        }
        if (!empty($filters['date_from'])) {
            $query->where('purchases.date', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->where('purchases.date', '<=', $filters['date_to']);
        }

        return $query;
    }

    /**
     * Dashboard Summary KPIs
     */
    public function getDashboardSummary(array $filters): array
    {
        $baseQuery = $this->buildFilteredQuery($filters)->where('status', '!=', 'cancelled');

        $currentCost        = (float) (clone $baseQuery)->selectRaw('COALESCE(SUM(grand_total_base), 0) as total')->value('total');
        $currentOrders      = (int)   (clone $baseQuery)->count();
        $currentSuppliers   = (int)   (clone $baseQuery)->distinct('supplier_id')->count('supplier_id');
        $currentPaid        = (float) (clone $baseQuery)->selectRaw('COALESCE(SUM(paid_amount_base), 0) as total')->value('total');
        $currentDue         = (float) (clone $baseQuery)->selectRaw('COALESCE(SUM(due_amount_base), 0) as total')->value('total');
        
        // Safety fallback if due_amount_base was unpopulated on legacy records
        if ($currentDue == 0.0 && $currentCost > $currentPaid) {
            $currentDue = round(max(0, $currentCost - $currentPaid), 2);
        }

        $avgPurchase        = $currentOrders > 0 ? round($currentCost / $currentOrders, 2) : 0.0;

        $receivedOrders     = (int) (clone $baseQuery)->whereIn('status', ['received', 'completed'])->count();
        $pendingOrders      = (int) (clone $baseQuery)->whereIn('status', ['ordered', 'partial', 'draft'])->count();
        $receivedRate       = $currentOrders > 0 ? round(($receivedOrders / $currentOrders) * 100) : 100;

        // Total Items Purchased
        $purchaseIds = (clone $baseQuery)->pluck('id');
        $totalItems  = (float) PurchaseItem::whereIn('purchase_id', $purchaseIds)->sum('quantity');

        // Total Purchase Returns Amount
        $returnQuery = PurchaseReturn::query()
            ->whereNull('deleted_at')
            ->whereIn('status', ['approved', 'shipped', 'completed']);
        if (!empty($filters['company_id'])) {
            $returnQuery->where('company_id', $filters['company_id']);
        }
        if (!empty($filters['supplier_id'])) {
            $returnQuery->where('supplier_id', $filters['supplier_id']);
        }
        if (!empty($filters['date_from'])) {
            $returnQuery->where('date', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $returnQuery->where('date', '<=', $filters['date_to']);
        }
        $totalReturns = (float) $returnQuery->sum('total_amount_base');

        // Inventory Cost = SUM(cost_price * quantity) from products and inventories
        $inventoryCostQuery = Product::query()
            ->join('inventories', 'products.id', '=', 'inventories.product_id')
            ->whereNull('products.deleted_at');
        if (!empty($filters['company_id'])) {
            $inventoryCostQuery->where('products.company_id', $filters['company_id']);
        }
        $inventoryCost = (float) $inventoryCostQuery->select(DB::raw('COALESCE(SUM(products.cost_price * inventories.quantity), 0) as total'))->value('total');

        // Previous Period Percentage Calculations
        $dateFrom = $filters['date_from'] ?? null;
        $dateTo   = $filters['date_to']   ?? null;
        $costChangePct = 0.0;
        $ordersChangePct = 0.0;

        if ($dateFrom && $dateTo) {
            $start = \Carbon\Carbon::parse($dateFrom);
            $end   = \Carbon\Carbon::parse($dateTo);
            $days  = $start->diffInDays($end) + 1;

            $prevFrom = $start->copy()->subDays($days)->toDateString();
            $prevTo   = $start->copy()->subDay()->toDateString();

            $prevFilters = array_merge($filters, ['date_from' => $prevFrom, 'date_to' => $prevTo]);
            $prevQuery   = $this->buildFilteredQuery($prevFilters)->where('status', '!=', 'cancelled');

            $prevCost   = (float) (clone $prevQuery)->sum('grand_total_base');
            $prevOrders = (int)   (clone $prevQuery)->count();

            if ($prevCost > 0) {
                $costChangePct = round((($currentCost - $prevCost) / $prevCost) * 100, 1);
            }
            if ($prevOrders > 0) {
                $ordersChangePct = round((($currentOrders - $prevOrders) / $prevOrders) * 100, 1);
            }
        }

        return [
            'total_purchase_cost'  => $currentCost,
            'total_purchases'      => $currentCost,
            'total_orders'         => $currentOrders,
            'purchases_count'      => $currentOrders,
            'total_paid'           => $currentPaid,
            'total_due'            => $currentDue,
            'outstanding_payments' => $currentDue,
            'received_count'       => $receivedOrders,
            'pending_count'        => $pendingOrders,
            'received_rate'        => $receivedRate,
            'total_items_sold'     => $totalItems, // items purchased
            'items_purchased'      => $totalItems,
            'total_suppliers'      => $currentSuppliers,
            'average_purchase'     => $avgPurchase,
            'total_returns'        => $totalReturns,
            'inventory_cost'       => $inventoryCost,
            'cost_change_pct'      => $costChangePct,
            'orders_change_pct'    => $ordersChangePct,
        ];
    }

    /**
     * Purchase Trend Analytics (PostgreSQL Safe)
     */
    public function getPurchaseTrend(array $filters, string $groupBy = 'daily'): array
    {
        $query = $this->buildFilteredQuery($filters)->where('status', '!=', 'cancelled');

        switch ($groupBy) {
            case 'monthly':
                $dateFormat = "TO_CHAR(date, 'YYYY-MM')";
                break;
            case 'weekly':
                $dateFormat = "TO_CHAR(date, 'IYYY-IW')";
                break;
            case 'yearly':
                $dateFormat = "TO_CHAR(date, 'YYYY')";
                break;
            case 'daily':
            default:
                $dateFormat = "TO_CHAR(date, 'YYYY-MM-DD')";
                break;
        }

        return $query->select(
            DB::raw("{$dateFormat} as date"),
            DB::raw("COALESCE(SUM(grand_total_base), 0) as cost"),
            DB::raw("COALESCE(SUM(grand_total_base), 0) as total"),
            DB::raw("COUNT(id) as orders")
        )
        ->groupBy(DB::raw($dateFormat))
        ->orderBy(DB::raw($dateFormat), 'asc')
        ->get()
        ->map(function ($row) {
            return [
                'date'   => $row->date,
                'cost'   => (float) $row->cost,
                'total'  => (float) $row->total,
                'orders' => (int)   $row->orders,
            ];
        })
        ->toArray();
    }

    /**
     * Purchase by Supplier Breakdown
     */
    public function getSupplierBreakdown(array $filters, int $limit = 10): array
    {
        $query = $this->buildFilteredQuery($filters)
            ->where('status', '!=', 'cancelled')
            ->join('suppliers', 'purchases.supplier_id', '=', 'suppliers.id');

        return $query->select(
            'suppliers.id',
            'suppliers.name',
            'suppliers.phone',
            'suppliers.email',
            DB::raw("COALESCE(SUM(purchases.grand_total_base), 0) as total"),
            DB::raw("COALESCE(SUM(purchases.due_amount_base), 0) as due"),
            DB::raw("COUNT(purchases.id) as count")
        )
        ->groupBy('suppliers.id', 'suppliers.name', 'suppliers.phone', 'suppliers.email')
        ->orderBy('total', 'desc')
        ->limit($limit)
        ->get()
        ->map(function ($row, $idx) {
            return [
                'rank'           => $idx + 1,
                'supplier_id'    => $row->id,
                'supplier_name'  => $row->name,
                'supplier_phone' => $row->phone,
                'supplier_email' => $row->email,
                'total_purchase' => (float) $row->total,
                'outstanding'    => (float) $row->due,
                'orders_count'   => (int) $row->count,
            ];
        })
        ->toArray();
    }

    public function getTopSuppliers(array $filters, int $limit = 10): array
    {
        return $this->getSupplierBreakdown($filters, $limit);
    }

    /**
     * Purchase by Product Category Breakdown
     */
    public function getCategoryBreakdown(array $filters): array
    {
        $query = PurchaseItem::query()
            ->join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
            ->join('products', 'purchase_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->whereNull('purchases.deleted_at')
            ->where('purchases.status', '!=', 'cancelled');

        if (!empty($filters['company_id'])) {
            $query->where('purchases.company_id', $filters['company_id']);
        }
        if (!empty($filters['branch_id'])) {
            $query->where('purchases.branch_id', $filters['branch_id']);
        }
        if (!empty($filters['date_from'])) {
            $query->where('purchases.date', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->where('purchases.date', '<=', $filters['date_to']);
        }

        return $query->select(
            'categories.id',
            'categories.name',
            DB::raw("COALESCE(SUM(purchase_items.total_base), 0) as total"),
            DB::raw("COALESCE(SUM(purchase_items.quantity), 0) as quantity")
        )
        ->groupBy('categories.id', 'categories.name')
        ->orderBy('total', 'desc')
        ->get()
        ->map(function ($row) {
            return [
                'id'       => $row->id,
                'name'     => $row->name,
                'total'    => (float) $row->total,
                'quantity' => (float) $row->quantity,
            ];
        })
        ->toArray();
    }

    /**
     * Purchase by Brand Breakdown
     */
    public function getBrandBreakdown(array $filters): array
    {
        $query = PurchaseItem::query()
            ->join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
            ->join('products', 'purchase_items.product_id', '=', 'products.id')
            ->join('brands', 'products.brand_id', '=', 'brands.id')
            ->whereNull('purchases.deleted_at')
            ->where('purchases.status', '!=', 'cancelled');

        if (!empty($filters['company_id'])) {
            $query->where('purchases.company_id', $filters['company_id']);
        }
        if (!empty($filters['date_from'])) {
            $query->where('purchases.date', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->where('purchases.date', '<=', $filters['date_to']);
        }

        return $query->select(
            'brands.id',
            'brands.name',
            DB::raw("COALESCE(SUM(purchase_items.total_base), 0) as total"),
            DB::raw("COALESCE(SUM(purchase_items.quantity), 0) as quantity")
        )
        ->groupBy('brands.id', 'brands.name')
        ->orderBy('total', 'desc')
        ->get()
        ->map(function ($row) {
            return [
                'id'       => $row->id,
                'name'     => $row->name,
                'total'    => (float) $row->total,
                'quantity' => (float) $row->quantity,
            ];
        })
        ->toArray();
    }

    /**
     * Warehouse Purchase Distribution
     */
    public function getWarehouseDistribution(array $filters): array
    {
        $query = $this->buildFilteredQuery($filters)
            ->where('status', '!=', 'cancelled')
            ->join('warehouses', 'purchases.warehouse_id', '=', 'warehouses.id');

        return $query->select(
            'warehouses.id',
            'warehouses.name',
            DB::raw("COALESCE(SUM(purchases.grand_total_base), 0) as total"),
            DB::raw("COUNT(purchases.id) as count")
        )
        ->groupBy('warehouses.id', 'warehouses.name')
        ->orderBy('total', 'desc')
        ->get()
        ->map(function ($row) {
            return [
                'id'     => $row->id,
                'name'   => $row->name,
                'total'  => (float) $row->total,
                'orders' => (int)   $row->count,
            ];
        })
        ->toArray();
    }

    /**
     * Purchase Status Breakdown
     */
    public function getStatusBreakdown(array $filters): array
    {
        $query = $this->buildFilteredQuery($filters);

        return $query->select(
            'status',
            DB::raw("COUNT(id) as count"),
            DB::raw("COALESCE(SUM(grand_total_base), 0) as total")
        )
        ->groupBy('status')
        ->get()
        ->map(function ($row) {
            return [
                'status' => $row->status,
                'count'  => (int) $row->count,
                'total'  => (float) $row->total,
            ];
        })
        ->toArray();
    }

    /**
     * Payment Status Breakdown
     */
    public function getPaymentStatusBreakdown(array $filters): array
    {
        $query = $this->buildFilteredQuery($filters)->where('status', '!=', 'cancelled');

        return $query->select(
            'payment_status',
            DB::raw("COUNT(id) as count"),
            DB::raw("COALESCE(SUM(grand_total_base), 0) as total")
        )
        ->groupBy('payment_status')
        ->get()
        ->map(function ($row) {
            return [
                'payment_status' => $row->payment_status ?? 'unpaid',
                'name'           => ucfirst($row->payment_status ?? 'unpaid'),
                'count'          => (int) $row->count,
                'total'          => (float) $row->total,
            ];
        })
        ->toArray();
    }

    /**
     * Purchase Return Trend
     */
    public function getReturnTrend(array $filters): array
    {
        $query = PurchaseReturn::query()->whereNull('deleted_at');

        if (!empty($filters['company_id'])) {
            $query->where('company_id', $filters['company_id']);
        }
        if (!empty($filters['supplier_id'])) {
            $query->where('supplier_id', $filters['supplier_id']);
        }
        if (!empty($filters['date_from'])) {
            $query->where('date', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->where('date', '<=', $filters['date_to']);
        }

        $dateFormat = "TO_CHAR(date, 'YYYY-MM-DD')";

        return $query->select(
            DB::raw("{$dateFormat} as date"),
            DB::raw("COALESCE(SUM(total_amount_base), 0) as amount"),
            DB::raw("COUNT(id) as returns_count")
        )
        ->groupBy(DB::raw($dateFormat))
        ->orderBy(DB::raw($dateFormat), 'asc')
        ->get()
        ->map(function ($row) {
            return [
                'date'          => $row->date,
                'amount'        => (float) $row->amount,
                'returns_count' => (int) $row->returns_count,
            ];
        })
        ->toArray();
    }

    /**
     * Top Purchased Products Leaderboard
     */
    public function getTopProducts(array $filters, int $limit = 10): array
    {
        $query = PurchaseItem::query()
            ->join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
            ->join('products', 'purchase_items.product_id', '=', 'products.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->whereNull('purchases.deleted_at')
            ->where('purchases.status', '!=', 'cancelled');

        if (!empty($filters['company_id'])) {
            $query->where('purchases.company_id', $filters['company_id']);
        }
        if (!empty($filters['branch_id'])) {
            $query->where('purchases.branch_id', $filters['branch_id']);
        }
        if (!empty($filters['date_from'])) {
            $query->where('purchases.date', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->where('purchases.date', '<=', $filters['date_to']);
        }

        return $query->select(
            'products.id as product_id',
            'products.name as product_name',
            'products.sku',
            'products.cost_price',
            DB::raw("(SELECT COALESCE(SUM(quantity), 0) FROM inventories WHERE product_id = products.id) as current_stock"),
            DB::raw("COALESCE(categories.name, 'General') as category_name"),
            DB::raw("COALESCE(SUM(purchase_items.quantity), 0) as quantity_purchased"),
            DB::raw("COALESCE(SUM(purchase_items.total_base), 0) as purchase_cost")
        )
        ->groupBy('products.id', 'products.name', 'products.sku', 'products.cost_price', 'categories.name')
        ->orderBy('purchase_cost', 'desc')
        ->limit($limit)
        ->get()
        ->map(function ($row, $idx) {
            $qty = (float) $row->quantity_purchased;
            $cost = (float) $row->purchase_cost;
            $avgCost = $qty > 0 ? round($cost / $qty, 2) : (float)$row->cost_price;

            return [
                'rank'               => $idx + 1,
                'product_id'         => $row->product_id,
                'product_name'       => $row->product_name,
                'sku'                => $row->sku ?? 'SKU-'.$row->product_id,
                'category_name'      => $row->category_name,
                'quantity_purchased' => $qty,
                'purchase_cost'      => $cost,
                'average_cost'       => $avgCost,
                'current_stock'      => (float) $row->current_stock,
            ];
        })
        ->toArray();
    }

    /**
     * Detailed Paginated Purchase Transactions
     */
    public function getDetailedPurchaseLog(array $filters, int $perPage = 15, int $page = 1): array
    {
        $query = $this->buildFilteredQuery($filters)
            ->with(['supplier', 'branch', 'warehouse', 'creator']);

        if (!empty($filters['search'])) {
            $s = strtolower($filters['search']);
            $query->where(function ($q) use ($s) {
                $q->whereRaw('LOWER(reference_number) LIKE ?', ["%{$s}%"])
                  ->orWhereHas('supplier', function ($sq) use ($s) {
                      $sq->whereRaw('LOWER(name) LIKE ?', ["%{$s}%"]);
                  });
            });
        }

        $sortBy    = $filters['sort_by']    ?? 'date';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        return [
            'data'       => $paginated->items(),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ];
    }

    /**
     * Purchase Return Transactions Log
     */
    public function getPurchaseReturnsLog(array $filters, int $perPage = 15, int $page = 1): array
    {
        $query = PurchaseReturn::query()
            ->with(['supplier', 'purchase', 'user'])
            ->whereNull('deleted_at');

        if (!empty($filters['company_id'])) {
            $query->where('company_id', $filters['company_id']);
        }
        if (!empty($filters['supplier_id'])) {
            $query->where('supplier_id', $filters['supplier_id']);
        }
        if (!empty($filters['date_from'])) {
            $query->where('date', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->where('date', '<=', $filters['date_to']);
        }

        $paginated = $query->orderBy('date', 'desc')->paginate($perPage, ['*'], 'page', $page);

        return [
            'data'       => $paginated->items(),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ];
    }
}
