<?php

namespace App\Http\Controllers\Api\V1\Admin\CMS;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\CMS\CreateBlogTagRequest;
use App\Http\Requests\CMS\UpdateBlogTagRequest;
use App\Http\Resources\CMS\BlogTagResource;
use App\Services\CMS\BlogTagService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogTagController extends BaseApiController
{
    public function __construct(private readonly BlogTagService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            BlogTagResource::collection($records),
            'BlogTag list retrieved successfully'
        );
    }

    public function store(CreateBlogTagRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new BlogTagResource($record),
            'BlogTag created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new BlogTagResource($record),
            'BlogTag details retrieved successfully'
        );
    }

    public function update(UpdateBlogTagRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new BlogTagResource($record),
            'BlogTag updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'BlogTag deleted successfully'
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
            return $this->successResponse(['deleted_count' => $count], "Successfully deleted {$count} tags");
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
