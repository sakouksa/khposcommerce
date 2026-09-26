<?php

namespace App\Services\Reports;

use App\Repositories\Reports\PurchaseReportRepository;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PurchaseReportService
{
    protected PurchaseReportRepository $repository;

    public function __construct(PurchaseReportRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getConsolidatedOverview(array $filters, string $trendGroupBy = 'daily'): array
    {
        return [
            'summary'          => $this->repository->getDashboardSummary($filters),
            'trend'            => $this->repository->getPurchaseTrend($filters, $trendGroupBy),
            'suppliers'        => $this->repository->getSupplierBreakdown($filters),
            'categories'       => $this->repository->getCategoryBreakdown($filters),
            'brands'           => $this->repository->getBrandBreakdown($filters),
            'warehouses'       => $this->repository->getWarehouseDistribution($filters),
            'status'           => $this->repository->getStatusBreakdown($filters),
            'payment_status'   => $this->repository->getPaymentStatusBreakdown($filters),
            'return_trend'     => $this->repository->getReturnTrend($filters),
            'top_suppliers'    => $this->repository->getTopSuppliers($filters, 10),
            'top_products'     => $this->repository->getTopProducts($filters, 10),
        ];
    }

    public function exportPurchaseReport(array $filters, string $format = 'csv'): StreamedResponse
    {
        $summary = $this->repository->getDashboardSummary($filters);
        $records = $this->repository->getDetailedPurchaseLog($filters, 10000, 1)['data'];

        $filename = 'purchase_report_' . date('Y-m-d_His') . '.' . ($format === 'excel' ? 'csv' : 'csv');

        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma'              => 'no-cache',
            'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0',
            'Expires'             => '0',
        ];

        $callback = function () use ($summary, $records, $filters) {
            $file = fopen('php://output', 'w');
            // UTF-8 BOM
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // Executive Title Block
            fputcsv($file, ['========================================================================================']);
            fputcsv($file, ['ENTERPRISE POS SYSTEM - PURCHASE PERFORMANCE REPORT']);
            fputcsv($file, ['Generated At:', date('Y-m-d H:i:s')]);
            fputcsv($file, ['Period Scope:', ($filters['date_from'] ?? 'All Time') . ' to ' . ($filters['date_to'] ?? 'Now')]);
            fputcsv($file, ['========================================================================================']);
            fputcsv($file, []);

            // Summary KPIs Block
            fputcsv($file, ['KPI METRIC', 'VALUE']);
            fputcsv($file, ['Total Purchase Cost ($)', number_format($summary['total_purchase_cost'], 2)]);
            fputcsv($file, ['Total Purchase Orders', number_format($summary['total_orders'])]);
            fputcsv($file, ['Total Items Purchased', number_format($summary['items_purchased'])]);
            fputcsv($file, ['Total Active Suppliers', number_format($summary['total_suppliers'])]);
            fputcsv($file, ['Average Order Value ($)', number_format($summary['average_purchase'], 2)]);
            fputcsv($file, ['Total Purchase Returns ($)', number_format($summary['total_returns'], 2)]);
            fputcsv($file, ['Inventory Cost Value ($)', number_format($summary['inventory_cost'], 2)]);
            fputcsv($file, ['Outstanding Payments ($)', number_format($summary['outstanding_payments'], 2)]);
            fputcsv($file, []);

            // Detailed Transaction Log Table
            fputcsv($file, [
                'Reference No', 'Date', 'Supplier', 'Branch', 'Warehouse',
                'Status', 'Payment Status', 'Subtotal ($)', 'Tax ($)',
                'Discount ($)', 'Shipping ($)', 'Grand Total ($)', 'Paid ($)', 'Due ($)'
            ]);

            $totalGrandTotal = 0;
            $totalPaid = 0;
            $totalDue = 0;

            foreach ($records as $row) {
                $grandTotal = (float)($row->grand_total_base ?? $row->grand_total ?? 0);
                $paid       = (float)($row->paid_amount_base ?? $row->paid_amount ?? 0);
                $due        = (float)($row->due_amount_base ?? $row->due_amount ?? 0);

                $totalGrandTotal += $grandTotal;
                $totalPaid += $paid;
                $totalDue += $due;

                fputcsv($file, [
                    $row->reference_number ?? 'PUR-'.$row->id,
                    $row->date ? date('Y-m-d', strtotime($row->date)) : '',
                    $row->supplier->name ?? 'N/A',
                    $row->branch->name ?? 'N/A',
                    $row->warehouse->name ?? 'N/A',
                    strtoupper($row->status ?? 'RECEIVED'),
                    strtoupper($row->payment_status ?? 'UNPAID'),
                    number_format((float)($row->subtotal_base ?? $row->subtotal ?? 0), 2),
                    number_format((float)($row->tax_amount_base ?? $row->tax_amount ?? 0), 2),
                    number_format((float)($row->discount_amount_base ?? $row->discount_amount ?? 0), 2),
                    number_format((float)($row->shipping_cost_base ?? $row->shipping_cost ?? 0), 2),
                    number_format($grandTotal, 2),
                    number_format($paid, 2),
                    number_format($due, 2),
                ]);
            }

            // Summary Totals Row
            fputcsv($file, []);
            fputcsv($file, [
                'TOTALS SUMMARY', '', '', '', '', '', '',
                '', '', '', '',
                number_format($totalGrandTotal, 2),
                number_format($totalPaid, 2),
                number_format($totalDue, 2)
            ]);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
