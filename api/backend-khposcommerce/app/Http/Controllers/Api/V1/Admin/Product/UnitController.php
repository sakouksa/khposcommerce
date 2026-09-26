<?php

namespace App\Http\Controllers\Api\V1\Admin\Product;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Product\CreateUnitRequest;
use App\Http\Requests\Product\UpdateUnitRequest;
use App\Http\Resources\Product\UnitResource;
use App\Services\Product\UnitService;
use App\Models\Product\Unit;
use App\Services\Support\CsvService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UnitController extends BaseApiController
{
    public function __construct(
        private readonly UnitService $service,
        protected CsvService $csvService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $sortBy = $request->get('sort_by', 'id');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedSorts = ['id', 'name', 'symbol', 'description', 'is_active', 'created_at'];
        $sortBy = in_array($sortBy, $allowedSorts, true) ? $sortBy : 'id';
        $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc'], true) ? $sortOrder : 'desc';

        $query = Unit::when($request->status === 'deleted', function ($q) {
                $q->onlyTrashed();
            })
            ->when($request->status && $request->status !== 'deleted', function ($q) use ($request) {
                $q->where('is_active', $request->status === 'active');
            })
            ->when($request->search, function ($q, $search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('symbol', 'like', "%{$search}%");
            });

        $records = $query->orderBy($sortBy, $sortOrder)
                         ->paginate($request->integer('per_page', 10));

        return $this->paginatedResourceResponse(
            UnitResource::collection($records),
            $records,
            'Unit list retrieved successfully'
        );
    }

    public function store(CreateUnitRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new UnitResource($record),
            'Unit created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new UnitResource($record),
            'Unit details retrieved successfully'
        );
    }

    public function update(UpdateUnitRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new UnitResource($record),
            'Unit updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'Unit deleted successfully'
        );
    }

    public function restore(int $id): JsonResponse
    {
        $record = Unit::onlyTrashed()->findOrFail($id);
        $record->restore();
        return $this->successResponse(new UnitResource($record), 'Unit restored successfully');
    }

    public function forceDelete(int $id): JsonResponse
    {
        $record = Unit::withTrashed()->findOrFail($id);
        $record->forceDelete();
        return $this->successResponse(null, 'Unit permanently deleted successfully');
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $ids = $request->validate(['ids' => 'required|array'])['ids'];
        $count = Unit::whereIn('id', $ids)->delete();
        return $this->successResponse(null, "{$count} units deleted successfully");
    }

    public function bulkRestore(Request $request): JsonResponse
    {
        $ids = $request->validate(['ids' => 'required|array'])['ids'];
        $count = Unit::onlyTrashed()->whereIn('id', $ids)->restore();
        return $this->successResponse(null, "{$count} units restored successfully");
    }

    public function export(Request $request): StreamedResponse
    {
        $headers = ['Name', 'Symbol', 'Description', 'Active'];
        $records = Unit::all();

        return $this->csvService->streamExport(
            filename: 'units_export_' . now()->format('Y-m-d') . '.csv',
            headers: $headers,
            rows: $records,
            rowMapper: fn(Unit $rec) => [
                $rec->name,
                $rec->symbol,
                $rec->description ?? '',
                $rec->is_active ? '1' : '0',
            ]
        );
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt',
        ]);

        $result = $this->csvService->parseCsv($request->file('file'), ['name', 'symbol']);
        if (!$result['success']) {
            return $this->errorResponse($result['message'], $result['errors'], 400);
        }

        $successCount = 0;
        $errors = [];

        foreach ($result['rows'] as $rowItem) {
            $line = $rowItem['_line'];
            $data = $rowItem['data'];

            $name = trim($data['name'] ?? '');
            $symbol = trim($data['symbol'] ?? '');
            if (!$name || !$symbol) {
                $errors[] = "Line {$line}: Name and Symbol are required.";
                continue;
            }

            Unit::create([
                'company_id'  => $request->user()?->company_id ?? 1,
                'name'        => $name,
                'symbol'      => $symbol,
                'description' => trim($data['description'] ?? '') ?: null,
                'is_active'   => filter_var($data['active'] ?? $data['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
            ]);

            $successCount++;
        }

        return $this->successResponse([
            'success_count' => $successCount,
            'errors'        => $errors,
        ], 'Import completed');
    }
}
