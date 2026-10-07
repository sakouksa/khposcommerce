<?php

namespace App\Http\Controllers\Api\V1\Admin\Report;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\Reports\SalesReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\Traits\HandlesExportDateRange;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SalesReportController extends BaseApiController
{
    use HandlesExportDateRange;

    protected SalesReportService $service;

    public function __construct(SalesReportService $service)
    {
        $this->service = $service;
    }

    /**
     * Parse common filter request parameters.
     */
    protected function getFilters(Request $request): array
    {
        $user = $request->user();
        $dateRange = $this->resolveExportDateRange($request);

        $dateFrom = $dateRange['startDate'] ?? $request->input('date_from');
        $dateTo   = $dateRange['endDate'] ?? $request->input('date_to');

        $filters = [
            'company_id'        => $request->input('company_id', $user?->company_id),
            'branch_id'         => $request->input('branch_id'),
            'warehouse_id'      => $request->input('warehouse_id'),
            'customer_id'       => $request->input('customer_id'),
            'payment_method_id' => $request->input('payment_method_id'),
            'product_id'        => $request->input('product_id'),
            'date_from'         => $dateFrom,
            'date_to'           => $dateTo,
            'status'            => $request->input('status'),
            'search'            => $request->input('search'),
            'sort_by'           => $request->input('sort_by', 'date'),
            'sort_order'        => $request->input('sort_order', 'desc'),
        ];

        return array_filter($filters, fn($v) => !is_null($v) && $v !== '');
    }

    /**
     * GET /api/v1/reports/sales/overview
     * Consolidated overview report endpoint (All widgets in 1 single HTTP request for 10x speed).
     */
    public function overview(Request $request): JsonResponse
    {
        $filters = $this->getFilters($request);
        $groupBy = $request->input('group_by', 'daily');

        $data = [
            'summary'         => $this->service->getDashboardSummary($filters),
            'trend'           => $this->service->getRevenueTrend($filters, $groupBy),
            'categories'      => $this->service->getCategorySales($filters),
            'brands'          => $this->service->getBrandSales($filters),
            'payment_methods' => $this->service->getPaymentMethodSales($filters),
            'top_products'    => $this->service->getTopProducts($filters, 10),
            'top_customers'   => $this->service->getTopCustomers($filters, 10),
        ];

        return $this->successResponse($data, 'Sales report overview retrieved successfully');
    }

    /**
     * GET /api/v1/reports/sales/dashboard
     * Dashboard statistics summary cards
     */
    public function dashboard(Request $request): JsonResponse
    {
        $filters = $this->getFilters($request);
        $summary = $this->service->getDashboardSummary($filters);

        return $this->successResponse($summary, 'Sales report dashboard stats retrieved successfully');
    }

    /**
     * GET /api/v1/reports/sales/trend
     * Revenue trend line chart data
     */
    public function trend(Request $request): JsonResponse
    {
        $filters = $this->getFilters($request);
        $groupBy = $request->input('group_by', 'daily');
        $data = $this->service->getRevenueTrend($filters, $groupBy);

        return $this->successResponse($data, 'Revenue trend retrieved successfully');
    }

    /**
     * GET /api/v1/reports/sales/categories
     * Sales by category pie chart data
     */
    public function categories(Request $request): JsonResponse
    {
        $filters = $this->getFilters($request);
        $data = $this->service->getCategorySales($filters);

        return $this->successResponse($data, 'Sales by category retrieved successfully');
    }

    /**
     * GET /api/v1/reports/sales/brands
     * Sales by brand bar chart data
     */
    public function brands(Request $request): JsonResponse
    {
        $filters = $this->getFilters($request);
        $data = $this->service->getBrandSales($filters);

        return $this->successResponse($data, 'Sales by brand retrieved successfully');
    }

    /**
     * GET /api/v1/reports/sales/payment-methods
     * Payment method analysis chart data
     */
    public function paymentMethods(Request $request): JsonResponse
    {
        $filters = $this->getFilters($request);
        $data = $this->service->getPaymentMethodSales($filters);

        return $this->successResponse($data, 'Payment method analysis retrieved successfully');
    }

    /**
     * GET /api/v1/reports/sales/top-products
     * Top selling products table
     */
    public function topProducts(Request $request): JsonResponse
    {
        $filters = $this->getFilters($request);
        $limit   = (int) $request->input('limit', 10);
        $data    = $this->service->getTopProducts($filters, $limit);

        return $this->successResponse($data, 'Top products retrieved successfully');
    }

    /**
     * GET /api/v1/reports/sales/top-customers
     * Top customers table
     */
    public function topCustomers(Request $request): JsonResponse
    {
        $filters = $this->getFilters($request);
        $limit   = (int) $request->input('limit', 10);
        $data    = $this->service->getTopCustomers($filters, $limit);

        return $this->successResponse($data, 'Top customers retrieved successfully');
    }

    /**
     * GET /api/v1/reports/sales/list
     * Main sales report paginated table
     */
    public function list(Request $request): JsonResponse
    {
        $filters = $this->getFilters($request);
        $perPage = (int) $request->input('per_page', 15);
        $paginated = $this->service->getSalesList($filters, $perPage);

        return $this->successResponse($paginated, 'Sales list retrieved successfully');
    }

    /**
     * GET /api/v1/reports/sales/export
     * Export report data as CSV / Excel / PDF
     */
    public function export(Request $request): StreamedResponse
    {
        $filters = $this->getFilters($request);
        $format  = strtolower($request->input('format', 'csv'));

        $exportData = $this->service->exportSalesReport($filters, $format);

        $headers = [
            'Content-type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$exportData['filename']}\"",
            'Pragma'              => 'no-cache',
            'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0',
            'Expires'             => '0',
        ];

        return response()->stream(function () use ($exportData) {
            $handle = fopen('php://output', 'w');
            // Write UTF-8 BOM for Excel compatibility
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            foreach ($exportData['rows'] as $row) {
                fputcsv($handle, $row);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
