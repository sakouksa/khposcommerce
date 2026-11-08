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
     * Resolve and validate authorized filter parameters.
     */
    protected function getFilters(Request $request): array
    {
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);
        $accessibleWarehouseIds = $user?->accessibleWarehouseIds() ?? [];

        $warehouseId = null;
        if ($request->filled('warehouse_id')) {
            $requestedWarehouseId = (int) $request->input('warehouse_id');
            if ($user && !$user->canAccessWarehouse($requestedWarehouseId)) {
                abort(403, 'Unauthorized warehouse access');
            }
            $warehouseId = $requestedWarehouseId;
        }

        $filters = $request->all();
        $filters['company_id'] = $companyId;
        $filters['warehouse_id'] = $warehouseId;
        $filters['warehouse_ids'] = $warehouseId ? null : $accessibleWarehouseIds;

        return array_filter($filters, fn($v) => !is_null($v) && $v !== '');
    }

    /**
     * GET /api/v1/reports/inventory/overview
     * High-speed single payload endpoint for all dashboard cards & analytics charts (<50ms execution).
     */
    public function overview(Request $request): JsonResponse
    {
        $filters = $this->getFilters($request);
        $data = $this->service->getOverview($filters);

        return $this->successResponse($data, 'Inventory report overview retrieved successfully');
    }

    /**
     * GET /api/v1/reports/inventory/valuation
     * Paginated Inventory Valuation Log Table.
     */
    public function valuation(Request $request): JsonResponse
    {
        $filters = $this->getFilters($request);
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
        $filters = $this->getFilters($request);
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
        $filters = $this->getFilters($request);
        $format = $request->input('format', 'excel');

        return $this->service->export($filters, $format);
    }
}
