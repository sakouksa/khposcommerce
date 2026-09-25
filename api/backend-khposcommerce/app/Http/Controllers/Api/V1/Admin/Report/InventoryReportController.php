<?php

namespace App\Http\Controllers\Api\V1\Admin\Report;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\Reports\InventoryReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InventoryReportController extends BaseApiController
{
    protected InventoryReportService $service;

    public function __construct(InventoryReportService $service)
    {
        $this->service = $service;
    }

    /**
     * GET /api/v1/reports/inventory/overview
     * High-speed single payload endpoint for all dashboard cards & analytics charts (<50ms execution).
     */
    public function overview(Request $request): JsonResponse
    {
        $filters = $request->only([
            'date_from', 'date_to', 'warehouse_id', 'branch_id',
            'company_id', 'category_id', 'brand_id', 'group_by'
        ]);

        $data = $this->service->getOverview($filters);

        return $this->successResponse($data, 'Inventory report overview retrieved successfully');
    }

    /**
     * GET /api/v1/reports/inventory/valuation
     * Paginated Inventory Valuation Log Table.
     */
    public function valuation(Request $request): JsonResponse
    {
        $filters = $request->only([
            'date_from', 'date_to', 'warehouse_id', 'category_id', 'brand_id', 'search'
        ]);
        $perPage = (int) $request->input('per_page', 15);

        $paginated = $this->service->getValuationTable($filters, $perPage);

        return $this->successResponse($paginated, 'Inventory valuation table retrieved successfully');
    }

    /**
     * GET /api/v1/reports/inventory/movements
     * Paginated Inventory Movements Log Table.
     */
    public function movements(Request $request): JsonResponse
    {
        $filters = $request->only([
            'date_from', 'date_to', 'warehouse_id', 'movement_type', 'search'
        ]);
        $perPage = (int) $request->input('per_page', 15);

        $paginated = $this->service->getMovementsTable($filters, $perPage);

        return $this->successResponse($paginated, 'Inventory movements table retrieved successfully');
    }

    /**
     * GET /api/v1/reports/inventory/export
     * Streamed Executive CSV/Excel export respecting all active filters.
     */
    public function export(Request $request): StreamedResponse
    {
        $filters = $request->only([
            'date_from', 'date_to', 'warehouse_id', 'branch_id',
            'company_id', 'category_id', 'brand_id'
        ]);
        $format = $request->input('format', 'excel');

        return $this->service->export($filters, $format);
    }
}
