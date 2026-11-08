<?php

namespace App\Http\Controllers\Api\V1\Admin\Company;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Company\Branch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BranchController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);
        $branchIds = $user?->accessibleBranchIds() ?? [];

        $branches = Branch::query()
            ->where('company_id', $companyId)
            ->whereIn('id', $branchIds)
            ->when($request->status === 'deleted', function ($q) {
                $q->onlyTrashed();
            })
            ->when($request->status && $request->status !== 'deleted', function ($q) use ($request) {
                $q->where('is_active', $request->status === 'active');
            })
            ->when($request->filled('search'), fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 10));

        return $this->paginatedResponse($branches);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Branch::class);

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'code'        => 'required|string|max:100|unique:branches,code',
            'email'       => 'nullable|email|max:255',
            'phone'       => 'nullable|string|max:50',
            'address'     => 'nullable|string',
            'city'        => 'nullable|string|max:100',
            'province'    => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'is_main'     => 'boolean',
            'is_active'   => 'boolean',
        ]);

        $validated['company_id'] = (int) ($request->user()?->company_id ?? 1);

        $branch = Branch::create($validated);

        return $this->successResponse($branch, 'Branch created successfully.', 201);
    }

    public function show(int $id): JsonResponse
    {
        $branch = Branch::findOrFail($id);
        $this->authorize('view', $branch);

        return $this->successResponse($branch);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $branch = Branch::findOrFail($id);
        $this->authorize('update', $branch);

        $validated = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'code'        => "sometimes|required|string|max:100|unique:branches,code,{$id}",
            'email'       => 'nullable|email|max:255',
            'phone'       => 'nullable|string|max:50',
            'address'     => 'nullable|string',
            'city'        => 'nullable|string|max:100',
            'province'    => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'is_main'     => 'boolean',
            'is_active'   => 'boolean',
        ]);

        $branch->update($validated);

        return $this->successResponse($branch, 'Branch updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $branch = Branch::findOrFail($id);
            $this->authorize('delete', $branch);

            $branch->delete();
            return $this->successResponse(null, 'Branch deleted successfully.');
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
     * POST /api/v1/branches/{id}/restore
     */
    public function restore(int $id): JsonResponse
    {
        try {
            $branch = Branch::onlyTrashed()->findOrFail($id);
            $this->authorize('delete', $branch);

            $branch->restore();
            return $this->successResponse(null, 'Branch restored successfully.');
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
     * DELETE /api/v1/branches/{id}/force
     */
    public function forceDelete(int $id): JsonResponse
    {
        try {
            $branch = Branch::withTrashed()->findOrFail($id);
            $branch->forceDelete();
            return $this->successResponse(null, 'Branch permanently deleted successfully.');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
