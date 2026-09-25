<?php

namespace App\Http\Controllers\Api\V1\Admin\CMS;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\CMS\CreateBlogCategoryRequest;
use App\Http\Requests\CMS\UpdateBlogCategoryRequest;
use App\Http\Resources\CMS\BlogCategoryResource;
use App\Services\CMS\BlogCategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogCategoryController extends BaseApiController
{
    public function __construct(private readonly BlogCategoryService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            BlogCategoryResource::collection($records),
            'BlogCategory list retrieved successfully'
        );
    }

    public function store(CreateBlogCategoryRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new BlogCategoryResource($record),
            'BlogCategory created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new BlogCategoryResource($record),
            'BlogCategory details retrieved successfully'
        );
    }

    public function update(UpdateBlogCategoryRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new BlogCategoryResource($record),
            'BlogCategory updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'BlogCategory deleted successfully'
        );
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        if (empty($ids) || !is_array($ids)) {
            return $this->errorResponse('No IDs provided', 422);
        }

        try {
            $count = $this->service->bulkDelete($ids);
            return $this->successResponse(['deleted_count' => $count], "Successfully deleted {$count} categories");
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
