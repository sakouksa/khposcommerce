<?php

namespace App\Services\Reports;

use App\Repositories\Reports\SalesReportRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class SalesReportService
{
    protected SalesReportRepository $repository;

    public function __construct(SalesReportRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get complete dashboard summary cards with % change relative to previous period.
     */
    public function getDashboardSummary(array $filters): array
    {
        $currentStats = $this->repository->getDashboardStats($filters);

        // Compute previous period filters if date_from & date_to provided
        $revenueDiffPct = 0;
        $ordersDiffPct  = 0;
        $profitDiffPct  = 0;

        if (!empty($filters['date_from']) && !empty($filters['date_to'])) {
            $from = Carbon::parse($filters['date_from']);
            $to   = Carbon::parse($filters['date_to']);
            $days = $from->diffInDays($to) + 1;

            $prevFrom = $from->copy()->subDays($days)->toDateString();
            $prevTo   = $from->copy()->subDays(1)->toDateString();

            $prevFilters = array_merge($filters, [
                'date_from' => $prevFrom,
                'date_to'   => $prevTo,
            ]);

            $prevStats = $this->repository->getDashboardStats($prevFilters);

            $revenueDiffPct = $this->calcPercentageChange($currentStats['total_revenue'], $prevStats['total_revenue']);
            $ordersDiffPct  = $this->calcPercentageChange($currentStats['total_orders'], $prevStats['total_orders']);
            $profitDiffPct  = $this->calcPercentageChange($currentStats['total_profit'], $prevStats['total_profit']);
        }

        return array_merge($currentStats, [
            'revenue_change_pct' => $revenueDiffPct,
            'orders_change_pct'  => $ordersDiffPct,
            'profit_change_pct'  => $profitDiffPct,
            'currency_symbol'    => '$',
            'currency_code'      => 'USD',
        ]);
    }

    /**
     * Get revenue trend chart data.
     */
    public function getRevenueTrend(array $filters, string $groupBy = 'daily'): array
    {
        return $this->repository->getRevenueTrend($filters, $groupBy);
    }

    /**
     * Get sales by category chart data.
     */
    public function getCategorySales(array $filters): array
    {
        return $this->repository->getCategorySales($filters);
    }

    /**
     * Get sales by brand chart data.
     */
    public function getBrandSales(array $filters): array
    {
        return $this->repository->getBrandSales($filters);
    }

    /**
     * Get payment methods breakdown.
     */
    public function getPaymentMethodSales(array $filters): array
    {
        return $this->repository->getPaymentMethodSales($filters);
    }

    /**
     * Get top selling products.
     */
    public function getTopProducts(array $filters, int $limit = 10): array
    {
        return $this->repository->getTopProducts($filters, $limit);
    }

    /**
     * Get top purchasing customers.
     */
    public function getTopCustomers(array $filters, int $limit = 10): array
    {
        return $this->repository->getTopCustomers($filters, $limit);
    }

    /**
     * Get paginated sales list for data table.
     */
    public function getSalesList(array $filters, int $perPage = 15)
    {
        return $this->repository->getSalesList($filters, $perPage);
    }

    /**
     * Export sales report data (CSV / Excel stream content with Executive formatting).
     */
    public function exportSalesReport(array $filters, string $format = 'csv'): array
    {
        $filters['sort_by'] = 'date';
        $filters['sort_order'] = 'desc';

        // 1. Get Summary Stats
        $stats = $this->repository->getDashboardStats($filters);

        // 2. Get Sales Transactions (capped at 5000)
        $sales = $this->repository->getSalesList($filters, 5000)->items();

        $rows = [];

        // Title Header Block
        $rows[] = ['ENTERPRISE POS SYSTEM - SALES PERFORMANCE REPORT'];
        $rows[] = ['Generated On: ' . Carbon::now()->format('Y-m-d H:i:s')];
        $rows[] = ['Period Range: ' . ($filters['date_from'] ?? 'All') . ' to ' . ($filters['date_to'] ?? 'All')];
        $rows[] = []; // Blank separator line

        // KPI Summary Block
        $rows[] = ['=== EXECUTIVE KPI SUMMARY ==='];
        $rows[] = [
            'Total Revenue ($)',
            'Total Orders',
            'Avg Order Value ($)',
            'Total Profit ($)',
            'Total Customers',
            'Items Sold'
        ];
        $rows[] = [
            '$' . number_format($stats['total_revenue'], 2),
            number_format($stats['total_orders']),
            '$' . number_format($stats['average_order_value'], 2),
            '$' . number_format($stats['total_profit'], 2),
            number_format($stats['total_customers']),
            number_format($stats['items_sold'], 0),
        ];
        $rows[] = []; // Blank separator line

        // Detailed Transactions Header
        $rows[] = ['=== DETAILED SALES TRANSACTIONS LOG ==='];
        $rows[] = [
            'Invoice Number',
            'Date',
            'Customer',
            'Branch',
            'Warehouse',
            'Payment Method',
            'Items Count',
            'Subtotal ($)',
            'Discount ($)',
            'Tax ($)',
            'Grand Total ($)',
            'Profit ($)',
            'Status'
        ];

        $sumSubtotal = 0;
        $sumDiscount = 0;
        $sumTax      = 0;
        $sumGrand    = 0;
        $sumProfit   = 0;
        $sumItems    = 0;

        foreach ($sales as $sale) {
            $sub     = (float) $sale->subtotal;
            $disc    = (float) $sale->discount_amount;
            $tax     = (float) $sale->tax_amount;
            $grand   = (float) $sale->grand_total;
            $profit  = (float) ($sale->profit ?? 0);
            $items   = (float) ($sale->items_count ?? 0);

            $sumSubtotal += $sub;
            $sumDiscount += $disc;
            $sumTax      += $tax;
            $sumGrand    += $grand;
            $sumProfit   += $profit;
            $sumItems    += $items;

            $rows[] = [
                $sale->invoice_number,
                $sale->date ? Carbon::parse($sale->date)->format('Y-m-d H:i:s') : '',
                $sale->customer ? $sale->customer->name : 'Walk-in Customer',
                $sale->branch ? $sale->branch->name : 'Main Branch',
                $sale->warehouse ? $sale->warehouse->name : 'Main Warehouse',
                $sale->paymentMethod ? $sale->paymentMethod->name : 'Cash',
                $items,
                number_format($sub, 2, '.', ''),
                number_format($disc, 2, '.', ''),
                number_format($tax, 2, '.', ''),
                number_format($grand, 2, '.', ''),
                number_format($profit, 2, '.', ''),
                ucfirst($sale->status ?? 'completed'),
            ];
        }

        // Totals Summary Row
        $rows[] = [];
        $rows[] = [
            'TOTALS',
            '',
            '',
            '',
            '',
            '',
            $sumItems,
            number_format($sumSubtotal, 2, '.', ''),
            number_format($sumDiscount, 2, '.', ''),
            number_format($sumTax, 2, '.', ''),
            number_format($sumGrand, 2, '.', ''),
            number_format($sumProfit, 2, '.', ''),
            ''
        ];

        return [
            'filename' => 'sales_report_' . date('Y-m-d_H-i-s') . '.' . ($format === 'excel' ? 'csv' : $format),
            'rows'     => $rows,
        ];
    }

    /**
     * Helper to compute percentage change between current and previous values.
     */
    protected function calcPercentageChange(float $current, float $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}
