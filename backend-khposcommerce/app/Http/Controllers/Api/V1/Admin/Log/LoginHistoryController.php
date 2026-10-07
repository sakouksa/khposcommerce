<?php

namespace App\Http\Controllers\Api\V1\Admin\Log;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Log\CreateLoginHistoryRequest;
use App\Http\Requests\Log\UpdateLoginHistoryRequest;
use App\Http\Resources\Log\LoginHistoryResource;
use App\Services\Log\LoginHistoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoginHistoryController extends BaseApiController
{
    public function __construct(private readonly LoginHistoryService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = \App\Models\Log\LoginHistory::whereHas('user', fn($q) => $q->where('company_id', $user->company_id))
            ->latest();
        $records = $query->paginate($request->integer('per_page', 15));
        return $this->successResponse(
            LoginHistoryResource::collection($records),
            'LoginHistory list retrieved successfully'
        );
    }

    public function store(CreateLoginHistoryRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new LoginHistoryResource($record),
            'LoginHistory created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = \App\Models\Log\LoginHistory::with('user')->findOrFail($id);
        if ($record->user && $record->user->company_id !== request()->user()?->company_id) {
            abort(403, 'Unauthorized access to login history');
        }
        return $this->successResponse(
            new LoginHistoryResource($record),
            'LoginHistory details retrieved successfully'
        );
    }

    public function update(UpdateLoginHistoryRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new LoginHistoryResource($record),
            'LoginHistory updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'LoginHistory deleted successfully'
        );
    }
}
