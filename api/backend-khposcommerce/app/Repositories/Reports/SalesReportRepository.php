<?php

namespace App\Repositories\Reports;

use App\Models\Sales\Sale;
use App\Models\Sales\SaleItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;

class SalesReportRepository
{
    /**
     * Build base query with standard filters.
     */
    protected function buildBaseQuery(array $filters): Builder
    {
        $query = Sale::query();

        // Scope company
        if (!empty($filters['company_id'])) {
            $query->where('company_id', $filters['company_id']);
        }

        // Filter status: include completed, paid, or exclude cancelled
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        } else {
            $query->whereNotIn('status', ['cancelled', 'void']);
        }

        // Branch filter
        if (!empty($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }

        // Warehouse filter
        if (!empty($filters['warehouse_id'])) {
            $query->where('warehouse_id', $filters['warehouse_id']);
        }

        // Customer filter
        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        // Payment method filter
        if (!empty($filters['payment_method_id'])) {
            $query->where('payment_method_id', $filters['payment_method_id']);
        }

        // Date range filter
        if (!empty($filters['date_from'])) {
            $query->where('date', '>=', $filters['date_from'] . ' 00:00:00');
        }

        if (!empty($filters['date_to'])) {
            $query->where('date', '<=', $filters['date_to'] . ' 23:59:59');
        }

        // Product filter (has item with product_id)
        if (!empty($filters['product_id'])) {
            $productId = $filters['product_id'];
            $query->whereHas('items', function ($q) use ($productId) {
                $q->where('product_id', $productId);
            });
        }

        return $query;
    }

    /**
     * Get aggregate statistics for cards.
     */
    public function getDashboardStats(array $filters): array
    {
        $query = $this->buildBaseQuery($filters);

        $stats = $query->selectRaw("
            COALESCE(SUM(grand_total), 0) as total_revenue,
            COALESCE(SUM(subtotal), 0) as total_subtotal,
            COALESCE(SUM(tax_amount), 0) as total_tax,
            COALESCE(SUM(discount_amount), 0) as total_discount,
            COUNT(id) as total_orders,
            COUNT(DISTINCT customer_id) as total_customers
        ")->first();

        // Calculate total profit & total items sold from sale_items
        $itemStatsQuery = DB::table('sale_items')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->leftJoin('products', 'sale_items.product_id', '=', 'products.id')
            ->whereNull('sales.deleted_at')
            ->whereNotIn('sales.status', ['cancelled', 'void']);

        if (!empty($filters['company_id'])) {
            $itemStatsQuery->where('sales.company_id', $filters['company_id']);
        }
        if (!empty($filters['branch_id'])) {
            $itemStatsQuery->where('sales.branch_id', $filters['branch_id']);
        }
        if (!empty($filters['warehouse_id'])) {
            $itemStatsQuery->where('sales.warehouse_id', $filters['warehouse_id']);
        }
        if (!empty($filters['customer_id'])) {
            $itemStatsQuery->where('sales.customer_id', $filters['customer_id']);
        }
        if (!empty($filters['payment_method_id'])) {
            $itemStatsQuery->where('sales.payment_method_id', $filters['payment_method_id']);
        }
        if (!empty($filters['date_from'])) {
            $itemStatsQuery->where('sales.date', '>=', $filters['date_from'] . ' 00:00:00');
        }
        if (!empty($filters['date_to'])) {
            $itemStatsQuery->where('sales.date', '<=', $filters['date_to'] . ' 23:59:59');
        }
        if (!empty($filters['product_id'])) {
            $itemStatsQuery->where('sale_items.product_id', $filters['product_id']);
        }

        $itemStats = $itemStatsQuery->selectRaw("
            COALESCE(SUM(sale_items.quantity), 0) as items_sold,
            COALESCE(SUM(sale_items.total - (COALESCE(products.cost_price, 0) * sale_items.quantity)), 0) as total_profit
        ")->first();

        $totalRevenue = (float) ($stats->total_revenue ?? 0);
        $totalOrders  = (int) ($stats->total_orders ?? 0);
        $avgOrderVal  = $totalOrders > 0 ? round($totalRevenue / $totalOrders, 2) : 0;

        return [
            'total_revenue'      => $totalRevenue,
            'total_orders'       => $totalOrders,
            'average_order_value'=> $avgOrderVal,
            'total_profit'       => round((float) ($itemStats->total_profit ?? 0), 2),
            'total_customers'    => (int) ($stats->total_customers ?? 0),
            'items_sold'         => (float) ($itemStats->items_sold ?? 0),
            'total_subtotal'     => (float) ($stats->total_subtotal ?? 0),
            'total_tax'          => (float) ($stats->total_tax ?? 0),
            'total_discount'     => (float) ($stats->total_discount ?? 0),
        ];
    }

    /**
     * Get revenue trend chart data.
     * PostgreSQL compatible date grouping using TO_CHAR
     */
    public function getRevenueTrend(array $filters, string $groupBy = 'daily'): array
    {
        $query = $this->buildBaseQuery($filters);

        $format = match ($groupBy) {
            'monthly' => 'YYYY-MM',
            'weekly'  => 'IYYY-IW',
            default   => 'YYYY-MM-DD',
        };

        $results = $query
            ->selectRaw("TO_CHAR(date, '{$format}') as date_group, COALESCE(SUM(grand_total), 0) as revenue, COUNT(id) as orders")
            ->groupBy(DB::raw("TO_CHAR(date, '{$format}')"))
            ->orderBy('date_group', 'asc')
            ->get();

        return $results->map(function ($row) {
            return [
                'date'    => $row->date_group,
                'revenue' => (float) $row->revenue,
                'orders'  => (int) $row->orders,
            ];
        })->toArray();
    }

    /**
     * Get sales breakdown by category (Pie chart data).
     */
    public function getCategorySales(array $filters): array
    {
        $query = DB::table('sale_items')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->whereNull('sales.deleted_at')
            ->whereNotIn('sales.status', ['cancelled', 'void']);

        $this->applyItemFilters($query, $filters);

        $results = $query
            ->select('categories.id', 'categories.name')
            ->selectRaw('COALESCE(SUM(sale_items.quantity), 0) as quantity')
            ->selectRaw('COALESCE(SUM(sale_items.total), 0) as total')
            ->groupBy('categories.id', 'categories.name')
            ->orderBy('total', 'desc')
            ->limit(10)
            ->get();

        return $results->map(function ($row) {
            return [
                'id'       => $row->id,
                'name'     => $row->name,
                'quantity' => (float) $row->quantity,
                'total'    => (float) $row->total,
                'revenue'  => (float) $row->total,
            ];
        })->toArray();
    }

    /**
     * Get sales breakdown by brand (Bar chart data).
     */
    public function getBrandSales(array $filters): array
    {
        $query = DB::table('sale_items')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->join('brands', 'products.brand_id', '=', 'brands.id')
            ->whereNull('sales.deleted_at')
            ->whereNotIn('sales.status', ['cancelled', 'void']);

        $this->applyItemFilters($query, $filters);

        $results = $query
            ->select('brands.id', 'brands.name')
            ->selectRaw('COALESCE(SUM(sale_items.quantity), 0) as quantity')
            ->selectRaw('COALESCE(SUM(sale_items.total), 0) as total')
            ->groupBy('brands.id', 'brands.name')
            ->orderBy('total', 'desc')
            ->limit(10)
            ->get();

        return $results->map(function ($row) {
            return [
                'id'       => $row->id,
                'name'     => $row->name,
                'quantity' => (float) $row->quantity,
                'total'    => (float) $row->total,
                'revenue'  => (float) $row->total,
            ];
        })->toArray();
    }

    /**
     * Get sales breakdown by payment method.
     */
    public function getPaymentMethodSales(array $filters): array
    {
        $query = DB::table('sales')
            ->leftJoin('payment_methods', 'sales.payment_method_id', '=', 'payment_methods.id')
            ->whereNull('sales.deleted_at')
            ->whereNotIn('sales.status', ['cancelled', 'void']);

        if (!empty($filters['company_id'])) {
            $query->where('sales.company_id', $filters['company_id']);
        }
        if (!empty($filters['branch_id'])) {
            $query->where('sales.branch_id', $filters['branch_id']);
        }
        if (!empty($filters['warehouse_id'])) {
            $query->where('sales.warehouse_id', $filters['warehouse_id']);
        }
        if (!empty($filters['customer_id'])) {
            $query->where('sales.customer_id', $filters['customer_id']);
        }
        if (!empty($filters['payment_method_id'])) {
            $query->where('sales.payment_method_id', $filters['payment_method_id']);
        }
        if (!empty($filters['date_from'])) {
            $query->where('sales.date', '>=', $filters['date_from'] . ' 00:00:00');
        }
        if (!empty($filters['date_to'])) {
            $query->where('sales.date', '<=', $filters['date_to'] . ' 23:59:59');
        }

        $results = $query
            ->select(
                DB::raw("COALESCE(payment_methods.name, 'Other') as name"),
                DB::raw("COALESCE(payment_methods.code, 'other') as code")
            )
            ->selectRaw('COUNT(sales.id) as orders')
            ->selectRaw('COALESCE(SUM(sales.grand_total), 0) as total')
            ->groupBy('payment_methods.name', 'payment_methods.code')
            ->orderBy('total', 'desc')
            ->get();

        return $results->map(function ($row) {
            return [
                'name'    => $row->name,
                'code'    => $row->code,
                'orders'  => (int) $row->orders,
                'total'   => (float) $row->total,
                'revenue' => (float) $row->total,
            ];
        })->toArray();
    }

    /**
     * Get top selling products table.
     */
    public function getTopProducts(array $filters, int $limit = 10): array
    {
        $query = DB::table('sale_items')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->leftJoin('products', 'sale_items.product_id', '=', 'products.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->whereNull('sales.deleted_at')
            ->whereNotIn('sales.status', ['cancelled', 'void']);

        $this->applyItemFilters($query, $filters);

        $results = $query
            ->select(
                'sale_items.product_id',
                'sale_items.product_name',
                'sale_items.sku',
                DB::raw("COALESCE(categories.name, 'Uncategorized') as category_name")
            )
            ->selectRaw('COALESCE(SUM(sale_items.quantity), 0) as quantity_sold')
            ->selectRaw('COALESCE(SUM(sale_items.total), 0) as revenue')
            ->selectRaw('COALESCE(SUM(sale_items.total - (COALESCE(products.cost_price, 0) * sale_items.quantity)), 0) as profit')
            ->groupBy('sale_items.product_id', 'sale_items.product_name', 'sale_items.sku', 'categories.name')
            ->orderBy('revenue', 'desc')
            ->limit($limit)
            ->get();

        return $results->map(function ($row, $index) {
            return [
                'rank'          => $index + 1,
                'product_id'    => $row->product_id,
                'product_name'  => $row->product_name,
                'sku'           => $row->sku ?? 'N/A',
                'category_name' => $row->category_name,
                'quantity_sold' => (float) $row->quantity_sold,
                'revenue'       => (float) $row->revenue,
                'profit'        => round((float) $row->profit, 2),
            ];
        })->toArray();
    }

    /**
     * Get top purchasing customers table.
     */
    public function getTopCustomers(array $filters, int $limit = 10): array
    {
        $query = DB::table('sales')
            ->leftJoin('customers', 'sales.customer_id', '=', 'customers.id')
            ->whereNull('sales.deleted_at')
            ->whereNotIn('sales.status', ['cancelled', 'void']);

        if (!empty($filters['company_id'])) {
            $query->where('sales.company_id', $filters['company_id']);
        }
        if (!empty($filters['branch_id'])) {
            $query->where('sales.branch_id', $filters['branch_id']);
        }
        if (!empty($filters['warehouse_id'])) {
            $query->where('sales.warehouse_id', $filters['warehouse_id']);
        }
        if (!empty($filters['customer_id'])) {
            $query->where('sales.customer_id', $filters['customer_id']);
        }
        if (!empty($filters['payment_method_id'])) {
            $query->where('sales.payment_method_id', $filters['payment_method_id']);
        }
        if (!empty($filters['date_from'])) {
            $query->where('sales.date', '>=', $filters['date_from'] . ' 00:00:00');
        }
        if (!empty($filters['date_to'])) {
            $query->where('sales.date', '<=', $filters['date_to'] . ' 23:59:59');
        }

        $results = $query
            ->select(
                'sales.customer_id',
                DB::raw("COALESCE(customers.name, 'Walk-in Customer') as customer_name"),
                DB::raw("COALESCE(customers.email, '') as customer_email"),
                DB::raw("COALESCE(customers.phone, '') as customer_phone")
            )
            ->selectRaw('COUNT(sales.id) as orders_count')
            ->selectRaw('COALESCE(SUM(sales.grand_total), 0) as total_purchase')
            ->selectRaw('MAX(sales.date) as last_purchase_date')
            ->groupBy('sales.customer_id', 'customers.name', 'customers.email', 'customers.phone')
            ->orderBy('total_purchase', 'desc')
            ->limit($limit)
            ->get();

        return $results->map(function ($row, $index) {
            return [
                'rank'               => $index + 1,
                'customer_id'        => $row->customer_id,
                'customer_name'      => $row->customer_name,
                'customer_email'     => $row->customer_email,
                'customer_phone'     => $row->customer_phone,
                'orders_count'       => (int) $row->orders_count,
                'total_purchase'     => (float) $row->total_purchase,
                'last_purchase_date' => $row->last_purchase_date,
            ];
        })->toArray();
    }

    /**
     * Get paginated sales report table.
     */
    public function getSalesList(array $filters, int $perPage = 15)
    {
        $query = $this->buildBaseQuery($filters)
            ->with([
                'customer:id,name,email,phone',
                'branch:id,name',
                'warehouse:id,name',
                'paymentMethod:id,name,code',
                'cashier:id,name',
                'items.product:id,cost_price',
            ])
            ->orderBy($filters['sort_by'] ?? 'date', $filters['sort_order'] ?? 'desc');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'ILIKE', "%{$search}%")
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('name', 'ILIKE', "%{$search}%")
                         ->orWhere('phone', 'ILIKE', "%{$search}%");
                  });
            });
        }

        $paginator = $query->paginate($perPage);

        // Calculate profit dynamically per sale item
        $paginator->getCollection()->transform(function ($sale) {
            $profit = 0;
            $itemsCount = 0;
            foreach ($sale->items as $item) {
                $itemsCount += (float) $item->quantity;
                $cost = $item->product ? (float) $item->product->cost_price : 0;
                $profit += ((float) $item->total - ($cost * (float) $item->quantity));
            }
            $sale->profit = round($profit, 2);
            $sale->items_count = $itemsCount;
            return $sale;
        });

        return $paginator;
    }

    /**
     * Helper to apply filters on raw sale_items query.
     */
    protected function applyItemFilters($query, array $filters): void
    {
        if (!empty($filters['company_id'])) {
            $query->where('sales.company_id', $filters['company_id']);
        }
        if (!empty($filters['branch_id'])) {
            $query->where('sales.branch_id', $filters['branch_id']);
        }
        if (!empty($filters['warehouse_id'])) {
            $query->where('sales.warehouse_id', $filters['warehouse_id']);
        }
        if (!empty($filters['customer_id'])) {
            $query->where('sales.customer_id', $filters['customer_id']);
        }
        if (!empty($filters['payment_method_id'])) {
            $query->where('sales.payment_method_id', $filters['payment_method_id']);
        }
        if (!empty($filters['date_from'])) {
            $query->where('sales.date', '>=', $filters['date_from'] . ' 00:00:00');
        }
        if (!empty($filters['date_to'])) {
            $query->where('sales.date', '<=', $filters['date_to'] . ' 23:59:59');
        }
        if (!empty($filters['product_id'])) {
            $query->where('sale_items.product_id', $filters['product_id']);
        }
    }
}
