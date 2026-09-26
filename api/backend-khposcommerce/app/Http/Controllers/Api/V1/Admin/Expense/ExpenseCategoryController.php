<?php

namespace App\Http\Controllers\Api\V1\Admin\Expense;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Expense\CreateExpenseCategoryRequest;
use App\Http\Requests\Expense\UpdateExpenseCategoryRequest;
use App\Http\Resources\Expense\ExpenseCategoryResource;
use App\Services\Expense\ExpenseCategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseCategoryController extends BaseApiController
{
    public function __construct(private readonly ExpenseCategoryService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status', 'sort_by', 'sort_order']);
        $records = $this->service->getPaginated(
            perPage: (int) $request->get('per_page', 15),
            filters: $filters
        );

        return $this->successResponse(
            ExpenseCategoryResource::collection($records),
            'ExpenseCategory list retrieved successfully'
        );
    }

    public function store(CreateExpenseCategoryRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new ExpenseCategoryResource($record),
            'ExpenseCategory created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new ExpenseCategoryResource($record),
            'ExpenseCategory details retrieved successfully'
        );
    }

    public function update(UpdateExpenseCategoryRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new ExpenseCategoryResource($record),
            'ExpenseCategory updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->service->delete($id);
            return $this->successResponse(
                null,
                'ExpenseCategory deleted successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        if (empty($ids) || !is_array($ids)) {
            return $this->errorResponse('Please provide category IDs to delete', null, 422);
        }

        try {
            $count = $this->service->bulkDelete($ids);
            return $this->successResponse(
                ['deleted_count' => $count],
                "{$count} expense categories deleted successfully"
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }
    }
}
