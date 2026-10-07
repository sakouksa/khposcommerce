<?php

namespace App\Http\Controllers\Api\V1\Admin\Media;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\Support\FileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MediaController extends BaseApiController
{
    public function __construct(
        protected FileService $fileService
    ) {}

    /**
     * POST /api/v1/media/delete-file
     * Delete an unlinked or temporary file from storage disk.
     */
    public function deleteFile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'path' => 'required|string',
        ]);

        $deleted = $this->fileService->delete($validated['path']);

        return $this->successResponse([
            'path'    => $validated['path'],
            'deleted' => $deleted,
        ], $deleted ? 'File deleted successfully from storage.' : 'File not found or already protected.');
    }
}
