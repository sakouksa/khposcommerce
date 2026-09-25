<?php

namespace App\Services\Reports;

use App\Repositories\Reports\InventoryReportRepository;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\DB;

class InventoryReportService
{
    protected InventoryReportRepository $repository;

    public function __construct(InventoryReportRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getOverview(array $filters): array
    {
        return $this->repository->getOverview($filters);
    }

    public function getValuationTable(array $filters, int $perPage = 15)
    {
        return $this->repository->getValuationTable($filters, $perPage);
    }

    public function getMovementsTable(array $filters, int $perPage = 15)
    {
        return $this->repository->getMovementsTable($filters, $perPage);
    }

    /**
     * Stream Executive CSV/Excel Export.
     */
    public function export(array $filters, string $format = 'excel'): StreamedResponse
    {
        $fileName = 'Inventory_Report_' . date('Y-m-d_His') . '.csv';

        $headers = [
            'Content-type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
            'Pragma'              => 'no-cache',
            'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0',
            'Expires'             => '0'
        ];

        $callback = function () use ($filters) {
            $file = fopen('php://output', 'w');

            // UTF-8 BOM for Excel
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Section 1: Executive KPI Summary Header
            $summary = $this->repository->getSummaryMetrics($filters);
            fputcsv($file, ['================================================================']);
            fputcsv($file, ['ENTERPRISE INVENTORY ANALYTICS & VALUATION REPORT']);
            fputcsv($file, ['Generated At:', date('Y-m-d H:i:s')]);
            fputcsv($file, ['================================================================']);
            fputcsv($file, []);

            fputcsv($file, ['KEY PERFORMANCE INDICATORS (KPIs)']);
            fputcsv($file, ['Total Inventory Value ($)', number_format($summary['total_inventory_value'], 2)]);
            fputcsv($file, ['Potential Revenue ($)',     number_format($summary['potential_revenue'], 2)]);
            fputcsv($file, ['Total Products Count',     $summary['total_products']]);
            fputcsv($file, ['Total Stock Quantity',     $summary['total_stock_quantity']]);
            fputcsv($file, ['Low Stock Products Count', $summary['low_stock_products']]);
            fputcsv($file, ['Out Of Stock Products Count', $summary['out_of_stock']]);
            fputcsv($file, ['Total Warehouses Count',   $summary['total_warehouses']]);
            fputcsv($file, []);

            // Section 2: Detailed Inventory Valuation Log
            fputcsv($file, ['DETAILED INVENTORY VALUATION LOG']);
            fputcsv($file, [
                'Product ID',
                'Product Name',
                'SKU',
                'Category',
                'Brand',
                'Warehouse',
                'Current Stock Quantity',
                'Cost Price ($)',
                'Total Inventory Cost ($)',
                'Selling Price ($)',
                'Potential Revenue ($)',
                'Profit Margin (%)'
            ]);

            $valuationData = $this->repository->getValuationTable($filters, 5000);

            $grandCost = 0;
            $grandRevenue = 0;

            foreach ($valuationData->items() as $item) {
                $costVal = (float) $item->inventory_value;
                $revVal  = (float) $item->potential_revenue;
                $grandCost += $costVal;
                $grandRevenue += $revVal;

                fputcsv($file, [
                    $item->id,
                    $item->name,
                    $item->sku,
                    $item->category_name,
                    $item->brand_name,
                    $item->warehouse_name,
                    $item->quantity,
                    number_format((float) $item->cost_price, 2, '.', ''),
                    number_format($costVal, 2, '.', ''),
                    number_format((float) $item->selling_price, 2, '.', ''),
                    number_format($revVal, 2, '.', ''),
                    number_format((float) $item->margin_pct, 2, '.', '') . '%'
                ]);
            }

            fputcsv($file, []);
            fputcsv($file, [
                'GRAND TOTALS', '', '', '', '', '', '', '',
                number_format($grandCost, 2, '.', ''),
                '',
                number_format($grandRevenue, 2, '.', '')
            ]);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
