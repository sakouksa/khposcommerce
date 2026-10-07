<?php

namespace App\Http\Controllers\Api\V1\Admin\Report;

use App\Http\Controllers\Api\BaseApiController;
use App\Repositories\Eloquent\Reports\PurchaseReportRepository;
use App\Services\Reports\PurchaseReportService;
use App\Models\Purchase\Purchase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PurchaseReportController extends BaseApiController
{
    protected PurchaseReportRepository $repository;
    protected PurchaseReportService $service;

    public function __construct(
        PurchaseReportRepository $repository,
        PurchaseReportService $service
    ) {
        $this->repository = $repository;
        $this->service    = $service;
    }

    /**
     * Resolve and validate authorized filter parameters.
     */
    protected function getFilters(Request $request): array
    {
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);
        $accessibleBranchIds = $user?->accessibleBranchIds() ?? [];
        $accessibleWarehouseIds = $user?->accessibleWarehouseIds() ?? [];

        $branchId = null;
        if ($request->filled('branch_id')) {
            $requestedBranchId = (int) $request->input('branch_id');
            if ($user && !$user->canAccessBranch($requestedBranchId)) {
                abort(403, 'Unauthorized branch access');
            }
            $branchId = $requestedBranchId;
        }

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
        $filters['branch_id'] = $branchId;
        $filters['branch_ids'] = $branchId ? null : $accessibleBranchIds;
        $filters['warehouse_id'] = $warehouseId;
        $filters['warehouse_ids'] = $warehouseId ? null : $accessibleWarehouseIds;

        return array_filter($filters, fn($v) => !is_null($v) && $v !== '');
    }

    /**
     * GET /api/v1/purchase-report
     */
    public function index(Request $request): JsonResponse
    {
        $summary = $this->repository->getDashboardSummary($this->getFilters($request));

        return $this->successResponse($summary);
    }

    /**
     * GET /api/v1/reports/purchase/overview
     * Single Consolidated Endpoint for 10x Performance
     */
    public function overview(Request $request): JsonResponse
    {
        $filters      = $this->getFilters($request);
        $trendGroupBy = $request->get('group_by', 'daily');

        $data = $this->service->getConsolidatedOverview($filters, $trendGroupBy);

        return $this->successResponse($data);
    }

    /**
     * GET /api/v1/reports/purchase/dashboard
     */
    public function dashboard(Request $request): JsonResponse
    {
        $summary = $this->repository->getDashboardSummary($this->getFilters($request));
        return $this->successResponse($summary);
    }

    /**
     * GET /api/v1/reports/purchase/trend
     */
    public function trend(Request $request): JsonResponse
    {
        $groupBy = $request->get('group_by', 'daily');
        $trend   = $this->repository->getPurchaseTrend($this->getFilters($request), $groupBy);
        return $this->successResponse($trend);
    }

    /**
     * GET /api/v1/reports/purchase/suppliers
     */
    public function suppliers(Request $request): JsonResponse
    {
        $limit     = (int) $request->get('limit', 10);
        $suppliers = $this->repository->getSupplierBreakdown($this->getFilters($request), $limit);
        return $this->successResponse($suppliers);
    }

    /**
     * GET /api/v1/reports/purchase/categories
     */
    public function categories(Request $request): JsonResponse
    {
        $categories = $this->repository->getCategoryBreakdown($this->getFilters($request));
        return $this->successResponse($categories);
    }

    /**
     * GET /api/v1/reports/purchase/brands
     */
    public function brands(Request $request): JsonResponse
    {
        $brands = $this->repository->getBrandBreakdown($this->getFilters($request));
        return $this->successResponse($brands);
    }

    /**
     * GET /api/v1/reports/purchase/warehouses
     */
    public function warehouses(Request $request): JsonResponse
    {
        $warehouses = $this->repository->getWarehouseDistribution($this->getFilters($request));
        return $this->successResponse($warehouses);
    }

    /**
     * GET /api/v1/reports/purchase/products
     */
    public function products(Request $request): JsonResponse
    {
        $limit    = (int) $request->get('limit', 10);
        $products = $this->repository->getTopProducts($this->getFilters($request), $limit);
        return $this->successResponse($products);
    }

    /**
     * GET /api/v1/reports/purchase/status
     */
    public function status(Request $request): JsonResponse
    {
        $status = $this->repository->getStatusBreakdown($this->getFilters($request));
        return $this->successResponse($status);
    }

    /**
     * GET /api/v1/reports/purchase/payment-status
     */
    public function paymentStatus(Request $request): JsonResponse
    {
        $paymentStatus = $this->repository->getPaymentStatusBreakdown($this->getFilters($request));
        return $this->successResponse($paymentStatus);
    }

    /**
     * GET /api/v1/reports/purchase/returns
     */
    public function returns(Request $request): JsonResponse
    {
        $returns = $this->repository->getReturnTrend($this->getFilters($request));
        return $this->successResponse($returns);
    }

    /**
     * GET /api/v1/reports/purchase/table
     */
    public function table(Request $request): JsonResponse
    {
        $perPage = (int) $request->get('per_page', 15);
        $page    = (int) $request->get('page', 1);

        $table = $this->repository->getDetailedPurchaseLog($this->getFilters($request), $perPage, $page);
        return $this->successResponse($table);
    }

    /**
     * GET /api/v1/reports/purchase/returns-table
     */
    public function returnsTable(Request $request): JsonResponse
    {
        $perPage = (int) $request->get('per_page', 15);
        $page    = (int) $request->get('page', 1);

        $returnsTable = $this->repository->getPurchaseReturnsLog($this->getFilters($request), $perPage, $page);
        return $this->successResponse($returnsTable);
    }

    /**
     * GET /api/v1/reports/purchase/export
     */
    public function export(Request $request): StreamedResponse
    {
        $format = $request->get('format', 'excel');
        return $this->service->exportPurchaseReport($this->getFilters($request), $format);
    }
}
