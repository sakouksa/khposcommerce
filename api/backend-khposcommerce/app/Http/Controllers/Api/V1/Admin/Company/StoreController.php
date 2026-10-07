<?php

namespace App\Http\Controllers\Api\V1\Admin\Company;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Company\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StoreController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $stores = Store::with(['branch'])
            ->when($request->status === 'deleted', function ($q) {
                $q->onlyTrashed();
            })
            ->when($request->status && $request->status !== 'deleted', function ($q) use ($request) {
                $q->where('is_active', $request->status === 'active');
            })
            ->when($request->filled('search'), fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 10));

        return $this->paginatedResponse($stores);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id'  => 'required|integer|exists:companies,id',
            'branch_id'   => 'required|integer|exists:branches,id',
            'name'        => 'required|string|max:255',
            'slug'        => 'nullable|string|max:255|unique:stores,slug',
            'domain'      => 'nullable|string|max:255|unique:stores,domain',
            'email'       => 'nullable|email|max:255',
            'phone'       => 'nullable|string|max:50',
            'address'     => 'nullable|string',
            'logo'        => 'nullable|string',
            'banner'      => 'nullable|string',
            'description' => 'nullable|string',
            'type'        => 'required|string|in:online,offline,hybrid',
            'is_active'   => 'boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $store = Store::create($validated);

        return $this->successResponse($store, 'Store created successfully.', 201);
    }

    public function show(int $id): JsonResponse
    {
        return $this->successResponse(Store::with(['branch'])->findOrFail($id));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $store = Store::findOrFail($id);

        $validated = $request->validate([
            'company_id'  => 'sometimes|required|integer|exists:companies,id',
            'branch_id'   => 'sometimes|required|integer|exists:branches,id',
            'name'        => 'sometimes|required|string|max:255',
            'slug'        => "sometimes|required|string|max:255|unique:stores,slug,{$id}",
            'domain'      => "nullable|string|max:255|unique:stores,domain,{$id}",
            'email'       => 'nullable|email|max:255',
            'phone'       => 'nullable|string|max:50',
            'address'     => 'nullable|string',
            'logo'        => 'nullable|string',
            'banner'      => 'nullable|string',
            'description' => 'nullable|string',
            'type'        => 'sometimes|required|string|in:online,offline,hybrid',
            'is_active'   => 'boolean',
        ]);

        if ($request->has('remove_logo') || ($request->has('logo') && empty($validated['logo']))) {
            $validated['logo'] = null;
        }
        if ($request->has('remove_banner') || ($request->has('banner') && empty($validated['banner']))) {
            $validated['banner'] = null;
        }

        $store->update($validated);

        return $this->successResponse($store, 'Store updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $store = Store::findOrFail($id);
            $store->delete();
            return $this->successResponse(null, 'Store deleted successfully.');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * POST /api/v1/stores/{id}/restore
     */
    public function restore(int $id): JsonResponse
    {
        try {
            $store = Store::onlyTrashed()->findOrFail($id);
            $store->restore();
            return $this->successResponse(null, 'Store restored successfully.');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * DELETE /api/v1/stores/{id}/force
     */
    public function forceDelete(int $id): JsonResponse
    {
        try {
            $store = Store::withTrashed()->findOrFail($id);
            
            // Clean physical logo & banner if exists via FileService
            if ($store->logo) {
                app(\App\Services\Support\FileService::class)->delete($store->logo);
            }
            if ($store->banner) {
                app(\App\Services\Support\FileService::class)->delete($store->banner);
            }
            
            $store->forceDelete();
            return $this->successResponse(null, 'Store permanently deleted successfully.');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
