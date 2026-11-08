<?php

namespace App\Http\Controllers\Api\V1\Admin\Company;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Company\Warehouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WarehouseController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);
        $whIds = $user?->accessibleWarehouseIds() ?? [];

        $warehouses = Warehouse::with(['branch'])
            ->where('company_id', $companyId)
            ->whereIn('id', $whIds)
            ->when($request->status === 'deleted', function ($q) {
                $q->onlyTrashed();
            })
            ->when($request->status && $request->status !== 'deleted', function ($q) use ($request) {
                $q->where('is_active', $request->status === 'active');
            })
            ->when($request->filled('search'), fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 10));

        return $this->paginatedResponse($warehouses);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Warehouse::class);
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);

        $validated = $request->validate([
            'branch_id'  => 'required|integer|exists:branches,id',
            'name'       => 'required|string|max:255',
            'code'       => 'required|string|max:100|unique:warehouses,code',
            'address'    => 'nullable|string',
            'city'       => 'nullable|string|max:100',
            'province'   => 'nullable|string|max:100',
            'phone'      => 'nullable|string|max:50',
            'pic_name'   => 'nullable|string|max:100',
            'is_main'    => 'boolean',
            'is_active'  => 'boolean',
        ]);

        if ($user && !$user->canAccessBranch((int) $validated['branch_id'])) {
            return $this->errorResponse('Unauthorized access to branch', 403);
        }

        $validated['company_id'] = $companyId;
        $warehouse = Warehouse::create($validated);

        return $this->successResponse($warehouse, 'Warehouse created successfully.', 201);
    }

    public function show(int $id): JsonResponse
    {
        $warehouse = Warehouse::with(['branch'])->findOrFail($id);
        $this->authorize('view', $warehouse);

        return $this->successResponse($warehouse);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $warehouse = Warehouse::findOrFail($id);
        $this->authorize('update', $warehouse);
        $user = $request->user();

        $validated = $request->validate([
            'branch_id'  => 'sometimes|required|integer|exists:branches,id',
            'name'       => 'sometimes|required|string|max:255',
            'code'       => "sometimes|required|string|max:100|unique:warehouses,code,{$id}",
            'address'    => 'nullable|string',
            'city'       => 'nullable|string|max:100',
            'province'   => 'nullable|string|max:100',
            'phone'      => 'nullable|string|max:50',
            'pic_name'   => 'nullable|string|max:100',
            'is_main'    => 'boolean',
            'is_active'  => 'boolean',
        ]);

        if (!empty($validated['branch_id']) && $user && !$user->canAccessBranch((int) $validated['branch_id'])) {
            return $this->errorResponse('Cannot move warehouse to unauthorized branch', 403);
        }

        $warehouse->update($validated);

        return $this->successResponse($warehouse, 'Warehouse updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $warehouse = Warehouse::findOrFail($id);
            $this->authorize('delete', $warehouse);

            $warehouse->delete();
            return $this->successResponse(null, 'Warehouse deleted successfully.');
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * POST /api/v1/warehouses/{id}/restore
     */
    public function restore(int $id): JsonResponse
    {
        try {
            $warehouse = Warehouse::onlyTrashed()->findOrFail($id);
            $this->authorize('delete', $warehouse);

            $warehouse->restore();
            return $this->successResponse(null, 'Warehouse restored successfully.');
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * DELETE /api/v1/warehouses/{id}/force
     */
    public function forceDelete(int $id): JsonResponse
    {
        try {
            $warehouse = Warehouse::withTrashed()->findOrFail($id);
            $warehouse->forceDelete();
            return $this->successResponse(null, 'Warehouse permanently deleted successfully.');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
