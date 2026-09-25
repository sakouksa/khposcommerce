<?php

namespace App\Http\Controllers\Api\V1\Admin\Report;

use App\Http\Controllers\Api\BaseApiController;
use App\Repositories\Reports\PurchaseReportRepository;
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
     * GET /api/v1/purchase-report
     */
    public function index(Request $request): JsonResponse
    {
        $summary = $this->repository->getDashboardSummary($request->all());

        return $this->successResponse($summary);
    }

    /**
     * GET /api/v1/reports/purchase/overview
     * Single Consolidated Endpoint for 10x Performance
     */
    public function overview(Request $request): JsonResponse
    {
        $filters      = $request->all();
        $trendGroupBy = $request->get('group_by', 'daily');

        $data = $this->service->getConsolidatedOverview($filters, $trendGroupBy);

        return $this->successResponse($data);
    }

    /**
     * GET /api/v1/reports/purchase/dashboard
     */
    public function dashboard(Request $request): JsonResponse
    {
        $summary = $this->repository->getDashboardSummary($request->all());
        return $this->successResponse($summary);
    }

    /**
     * GET /api/v1/reports/purchase/trend
     */
    public function trend(Request $request): JsonResponse
    {
        $groupBy = $request->get('group_by', 'daily');
        $trend   = $this->repository->getPurchaseTrend($request->all(), $groupBy);
        return $this->successResponse($trend);
    }

    /**
     * GET /api/v1/reports/purchase/suppliers
     */
    public function suppliers(Request $request): JsonResponse
    {
        $limit     = (int) $request->get('limit', 10);
        $suppliers = $this->repository->getSupplierBreakdown($request->all(), $limit);
        return $this->successResponse($suppliers);
    }

    /**
     * GET /api/v1/reports/purchase/categories
     */
    public function categories(Request $request): JsonResponse
    {
        $categories = $this->repository->getCategoryBreakdown($request->all());
        return $this->successResponse($categories);
    }

    /**
     * GET /api/v1/reports/purchase/brands
     */
    public function brands(Request $request): JsonResponse
    {
        $brands = $this->repository->getBrandBreakdown($request->all());
        return $this->successResponse($brands);
    }

    /**
     * GET /api/v1/reports/purchase/warehouses
     */
    public function warehouses(Request $request): JsonResponse
    {
        $warehouses = $this->repository->getWarehouseDistribution($request->all());
        return $this->successResponse($warehouses);
    }

    /**
     * GET /api/v1/reports/purchase/products
     */
    public function products(Request $request): JsonResponse
    {
        $limit    = (int) $request->get('limit', 10);
        $products = $this->repository->getTopProducts($request->all(), $limit);
        return $this->successResponse($products);
    }

    /**
     * GET /api/v1/reports/purchase/status
     */
    public function status(Request $request): JsonResponse
    {
        $status = $this->repository->getStatusBreakdown($request->all());
        return $this->successResponse($status);
    }

    /**
     * GET /api/v1/reports/purchase/payment-status
     */
    public function paymentStatus(Request $request): JsonResponse
    {
        $paymentStatus = $this->repository->getPaymentStatusBreakdown($request->all());
        return $this->successResponse($paymentStatus);
    }

    /**
     * GET /api/v1/reports/purchase/returns
     */
    public function returns(Request $request): JsonResponse
    {
        $returns = $this->repository->getReturnTrend($request->all());
        return $this->successResponse($returns);
    }

    /**
     * GET /api/v1/reports/purchase/table
     */
    public function table(Request $request): JsonResponse
    {
        $perPage = (int) $request->get('per_page', 15);
        $page    = (int) $request->get('page', 1);

        $table = $this->repository->getDetailedPurchaseLog($request->all(), $perPage, $page);
        return $this->successResponse($table);
    }

    /**
     * GET /api/v1/reports/purchase/returns-table
     */
    public function returnsTable(Request $request): JsonResponse
    {
        $perPage = (int) $request->get('per_page', 15);
        $page    = (int) $request->get('page', 1);

        $returnsTable = $this->repository->getPurchaseReturnsLog($request->all(), $perPage, $page);
        return $this->successResponse($returnsTable);
    }

    /**
     * GET /api/v1/reports/purchase/export
     */
    public function export(Request $request): StreamedResponse
    {
        $format = $request->get('format', 'excel');
        return $this->service->exportPurchaseReport($request->all(), $format);
    }
}
