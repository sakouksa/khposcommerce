<?php

namespace App\Http\Controllers\Api\V1\Admin\Expense;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Expense\CreateExpenseRequest;
use App\Http\Requests\Expense\UpdateExpenseRequest;
use App\Http\Resources\Expense\ExpenseResource;
use App\Services\Expense\ExpenseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends BaseApiController
{
    public function __construct(private readonly ExpenseService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search',
            'status',
            'expense_category_id',
            'category_id',
            'branch_id',
            'user_id',
            'start_date',
            'end_date',
            'from_date',
            'to_date',
            'date_start',
            'date_end',
            'min_amount',
            'max_amount',
            'amount_min',
            'amount_max',
            'sort_by',
            'sort_order',
        ]);

        $records = $this->service->getPaginated(
            $request->integer('per_page', 15),
            $filters,
            ['category', 'branch', 'user']
        );
        
        $resourceCollection = ExpenseResource::collection($records);
        
        return response()->json([
            'success'    => true,
            'message'    => 'Success',
            'data'       => $resourceCollection->resolve(),
            'pagination' => [
                'total'        => $records->total(),
                'per_page'     => $records->perPage(),
                'current_page' => $records->currentPage(),
                'last_page'    => $records->lastPage(),
                'from'         => $records->firstItem(),
                'to'           => $records->lastItem(),
            ],
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $stats = $this->service->getStats($request->all());
        return $this->successResponse($stats, 'Expense statistics retrieved successfully');
    }

    public function store(CreateExpenseRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new ExpenseResource($record),
            'Expense created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id, ['category', 'branch', 'user']);
        return $this->successResponse(
            new ExpenseResource($record),
            'Expense details retrieved successfully'
        );
    }

    public function update(UpdateExpenseRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new ExpenseResource($record),
            'Expense updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->service->delete($id);
            return $this->successResponse(null, 'Expense deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:expenses,id',
        ]);

        try {
            $count = $this->service->bulkDelete($request->input('ids', []));
            return $this->successResponse(['deleted_count' => $count], "Successfully deleted {$count} expenses");
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }
    }

    public function bulkRestore(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer',
        ]);

        try {
            $count = $this->service->bulkRestore($request->input('ids', []));
            return $this->successResponse(['restored_count' => $count], "Successfully restored {$count} expenses");
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    public function restore(int $id): JsonResponse
    {
        try {
            $this->service->restore($id);
            return $this->successResponse(null, 'Expense restored successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    public function forceDelete(int $id): JsonResponse
    {
        try {
            $this->service->forceDelete($id);
            return $this->successResponse(null, 'Expense permanently deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }
    }
}
