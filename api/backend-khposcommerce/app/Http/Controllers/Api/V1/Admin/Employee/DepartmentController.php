<?php

namespace App\Http\Controllers\Api\V1\Admin\Employee;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Employee\CreateDepartmentRequest;
use App\Http\Requests\Employee\UpdateDepartmentRequest;
use App\Http\Resources\Employee\DepartmentResource;
use App\Services\Employee\DepartmentService;
use App\Models\Employee\Department;
use App\Services\Support\CsvService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DepartmentController extends BaseApiController
{
    public function __construct(
        private readonly DepartmentService $service,
        protected CsvService $csvService
    ) {}

    public function index(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('department.view')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $records = $this->service->getPaginated(
            $request->integer('per_page', 10),
            $request->all(),
            $request->get('sort_by', 'created_at'),
            $request->get('sort_order', 'desc')
        );

        return $this->paginatedResourceResponse(
            DepartmentResource::collection($records),
            $records,
            'Department list retrieved successfully'
        );
    }

    public function store(CreateDepartmentRequest $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('department.create')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new DepartmentResource($record),
            'Department created successfully',
            201
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        if ($request->user() && !$request->user()->can('department.view')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $record = $this->service->getById($id);
        return $this->successResponse(
            new DepartmentResource($record),
            'Department details retrieved successfully'
        );
    }

    public function update(UpdateDepartmentRequest $request, int $id): JsonResponse
    {
        if ($request->user() && !$request->user()->can('department.update')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new DepartmentResource($record),
            'Department updated successfully'
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        if ($request->user() && !$request->user()->can('department.delete')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $this->service->delete($id);
        return $this->successResponse(
            null,
            'Department deleted successfully'
        );
    }

    public function restore(Request $request, int $id): JsonResponse
    {
        if ($request->user() && !$request->user()->can('department.update')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $this->service->restore($id);
        return $this->successResponse(
            null,
            'Department restored successfully'
        );
    }

    public function forceDelete(Request $request, int $id): JsonResponse
    {
        if ($request->user() && !$request->user()->can('department.delete')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $this->service->forceDelete($id);
        return $this->successResponse(
            null,
            'Department permanently deleted successfully'
        );
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('department.delete')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $ids = $request->validate(['ids' => 'required|array'])['ids'];
        $count = $this->service->bulkDelete($ids);
        return $this->successResponse(null, "{$count} departments deleted successfully");
    }

    public function bulkRestore(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('department.update')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $ids = $request->validate(['ids' => 'required|array'])['ids'];
        $count = $this->service->bulkRestore($ids);
        return $this->successResponse(null, "{$count} departments restored successfully");
    }

    public function export(Request $request): StreamedResponse
    {
        $headers = ['ID', 'Name', 'Code', 'Description', 'Status'];
        $departments = Department::when($request->search, function ($q, $v) {
            $q->where('name', 'like', "%{$v}%")
              ->orWhere('code', 'like', "%{$v}%");
        })->get();

        return $this->csvService->streamExport(
            filename: 'departments_export_' . now()->format('Y-m-d') . '.csv',
            headers: $headers,
            rows: $departments,
            rowMapper: fn(Department $dept) => [
                $dept->id,
                $dept->name,
                $dept->code,
                $dept->description,
                $dept->is_active ? 'Active' : 'Inactive',
            ]
        );
    }

    public function import(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('department.create')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $request->validate([
            'file' => 'required|file|mimes:csv,txt',
        ]);

        $result = $this->csvService->parseCsv($request->file('file'), ['name']);
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
            $description = trim($data['description'] ?? '');
            $isActive = filter_var($data['status'] ?? $data['is_active'] ?? 'active', FILTER_VALIDATE_BOOLEAN) || strtolower($data['status'] ?? '') === 'active' || strtolower($data['status'] ?? '') === '1';

            if (empty($name)) {
                $errors[] = "Line {$line}: Name is required.";
                continue;
            }

            $exists = Department::where('name', $name)
                ->orWhere(function ($q) use ($code) {
                    if ($code) {
                        $q->where('code', $code);
                    }
                })
                ->exists();

            if ($exists) {
                $errors[] = "Line {$line}: Department with name '{$name}' or code '{$code}' already exists.";
                continue;
            }

            Department::create([
                'company_id'  => $request->user()?->company_id ?? 1,
                'branch_id'   => $request->user()?->branch_id ?? 1,
                'name'        => $name,
                'code'        => $code ?: null,
                'description' => $description ?: null,
                'is_active'   => $isActive,
            ]);

            $successCount++;
        }

        return $this->successResponse([
            'success_count' => $successCount,
            'errors'        => $errors,
        ], "Import completed. {$successCount} records imported successfully.");
    }
}
