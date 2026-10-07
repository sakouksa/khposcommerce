<?php

namespace App\Http\Controllers\Api\V1\Admin\CMS;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\CMS\CreatePageRequest;
use App\Http\Requests\CMS\UpdatePageRequest;
use App\Http\Resources\CMS\PageResource;
use App\Services\CMS\PageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PageController extends BaseApiController
{
    public function __construct(private readonly PageService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            PageResource::collection($records),
            'Page list retrieved successfully'
        );
    }

    public function store(CreatePageRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new PageResource($record),
            'Page created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new PageResource($record),
            'Page details retrieved successfully'
        );
    }

    public function update(UpdatePageRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new PageResource($record),
            'Page updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'Page deleted successfully'
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
            return $this->successResponse(['deleted_count' => $count], "Successfully deleted {$count} pages");
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
