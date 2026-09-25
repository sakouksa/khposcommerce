<?php

namespace App\Http\Controllers\Api\V1\Admin\Employee;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Employee\CreatePositionRequest;
use App\Http\Requests\Employee\UpdatePositionRequest;
use App\Http\Resources\Employee\PositionResource;
use App\Services\Employee\PositionService;
use App\Models\Employee\Department;
use App\Models\Employee\Position;
use App\Services\Support\CsvService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PositionController extends BaseApiController
{
    public function __construct(
        private readonly PositionService $service,
        protected CsvService $csvService
    ) {}

    public function index(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('position.view')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $records = $this->service->getPaginated(
            $request->integer('per_page', 10),
            $request->all(),
            $request->get('sort_by', 'created_at'),
            $request->get('sort_order', 'desc')
        );

        return $this->paginatedResourceResponse(
            PositionResource::collection($records),
            $records,
            'Position list retrieved successfully'
        );
    }

    public function store(CreatePositionRequest $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('position.create')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new PositionResource($record),
            'Position created successfully',
            201
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        if ($request->user() && !$request->user()->can('position.view')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $record = $this->service->getById($id);
        return $this->successResponse(
            new PositionResource($record),
            'Position details retrieved successfully'
        );
    }

    public function update(UpdatePositionRequest $request, int $id): JsonResponse
    {
        if ($request->user() && !$request->user()->can('position.update')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new PositionResource($record),
            'Position updated successfully'
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        if ($request->user() && !$request->user()->can('position.delete')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $this->service->delete($id);
        return $this->successResponse(
            null,
            'Position deleted successfully'
        );
    }

    public function restore(Request $request, int $id): JsonResponse
    {
        if ($request->user() && !$request->user()->can('position.update')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $this->service->restore($id);
        return $this->successResponse(
            null,
            'Position restored successfully'
        );
    }

    public function forceDelete(Request $request, int $id): JsonResponse
    {
        if ($request->user() && !$request->user()->can('position.delete')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $this->service->forceDelete($id);
        return $this->successResponse(
            null,
            'Position permanently deleted successfully'
        );
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('position.delete')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $ids = $request->validate(['ids' => 'required|array'])['ids'];
        $count = $this->service->bulkDelete($ids);
        return $this->successResponse(null, "{$count} positions deleted successfully");
    }

    public function bulkRestore(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('position.update')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $ids = $request->validate(['ids' => 'required|array'])['ids'];
        $count = $this->service->bulkRestore($ids);
        return $this->successResponse(null, "{$count} positions restored successfully");
    }

    public function export(Request $request): StreamedResponse
    {
        $headers = ['ID', 'Name', 'Code', 'Department', 'Description', 'Status'];
        $positions = Position::with('department')->when($request->search, function ($q, $v) {
            $q->where('name', 'like', "%{$v}%")
              ->orWhere('code', 'like', "%{$v}%");
        })->get();

        return $this->csvService->streamExport(
            filename: 'positions_export_' . now()->format('Y-m-d') . '.csv',
            headers: $headers,
            rows: $positions,
            rowMapper: fn(Position $pos) => [
                $pos->id,
                $pos->name,
                $pos->code,
                $pos->department?->name ?? '',
                $pos->description,
                $pos->is_active ? 'Active' : 'Inactive',
            ]
        );
    }

    public function import(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('position.create')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $request->validate([
            'file' => 'required|file|mimes:csv,txt',
        ]);

        $result = $this->csvService->parseCsv($request->file('file'), ['name', 'department']);
        if (!$result['success']) {
            return $this->errorResponse($result['message'], $result['errors'], 400);
        }

        $successCount = 0;
        $errors = [];

        foreach ($result['rows'] as $rowItem) {
            $line = $rowItem['_line'];
            $data = $rowItem['data'];

            $name = trim($data['name'] ?? '');
            $code = trim($data['code'] ?? '');
            $departmentName = trim($data['department'] ?? '');
            $description = trim($data['description'] ?? '');
            $isActive = filter_var($data['status'] ?? $data['is_active'] ?? 'active', FILTER_VALIDATE_BOOLEAN) || strtolower($data['status'] ?? '') === 'active' || strtolower($data['status'] ?? '') === '1';

            if (empty($name)) {
                $errors[] = "Line {$line}: Name is required.";
                continue;
            }

            if (empty($departmentName)) {
                $errors[] = "Line {$line}: Department is required.";
                continue;
            }

            $dept = Department::where('name', $departmentName)->first();
            if (!$dept) {
                $errors[] = "Line {$line}: Department '{$departmentName}' not found.";
                continue;
            }

            $exists = Position::where('name', $name)
                ->where('department_id', $dept->id)
                ->orWhere(function ($q) use ($code) {
                    if ($code) {
                        $q->where('code', $code);
                    }
                })
                ->exists();

            if ($exists) {
                $errors[] = "Line {$line}: Position with name '{$name}' or code '{$code}' already exists.";
                continue;
            }

            Position::create([
                'company_id'    => $request->user()?->company_id ?? 1,
                'department_id' => $dept->id,
                'name'          => $name,
                'code'          => $code ?: null,
                'description'   => $description ?: null,
                'is_active'     => $isActive,
            ]);

            $successCount++;
        }

        return $this->successResponse([
            'success_count' => $successCount,
            'errors'        => $errors,
        ], "Import completed. {$successCount} records imported successfully.");
    }
}
