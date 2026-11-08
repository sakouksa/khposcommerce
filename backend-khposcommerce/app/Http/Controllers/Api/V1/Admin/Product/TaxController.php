<?php

namespace App\Http\Controllers\Api\V1\Admin\Product;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Product\CreateTaxRequest;
use App\Http\Requests\Product\UpdateTaxRequest;
use App\Http\Resources\Product\TaxResource;
use App\Services\Product\TaxService;
use App\Models\Product\Tax;
use App\Services\Support\CsvService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TaxController extends BaseApiController
{
    public function __construct(
        private readonly TaxService $service,
        protected CsvService $csvService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $sortBy = $request->get('sort_by', 'id');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedSorts = ['id', 'name', 'rate', 'type', 'is_active', 'created_at'];
        $sortBy = in_array($sortBy, $allowedSorts, true) ? $sortBy : 'id';
        $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc'], true) ? $sortOrder : 'desc';

        $query = Tax::when($request->status === 'deleted', function ($q) {
                $q->onlyTrashed();
            })
            ->when($request->status && $request->status !== 'deleted', function ($q) use ($request) {
                $q->where('is_active', $request->status === 'active');
            })
            ->when($request->type, function ($q, $type) {
                $q->where('type', $type);
            })
            ->when($request->search, function ($q, $search) {
                $q->where('name', 'like', "%{$search}%");
            });

        $records = $query->orderBy($sortBy, $sortOrder)
                         ->paginate($request->integer('per_page', 10));

        return $this->paginatedResourceResponse(
            TaxResource::collection($records),
            $records,
            'Tax list retrieved successfully'
        );
    }

    public function store(CreateTaxRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new TaxResource($record),
            'Tax created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new TaxResource($record),
            'Tax details retrieved successfully'
        );
    }

    public function update(UpdateTaxRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new TaxResource($record),
            'Tax updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'Tax deleted successfully'
        );
    }

    public function restore(int $id): JsonResponse
    {
        $record = Tax::onlyTrashed()->findOrFail($id);
        $record->restore();
        return $this->successResponse(new TaxResource($record), 'Tax restored successfully');
    }

    public function forceDelete(int $id): JsonResponse
    {
        $record = Tax::withTrashed()->findOrFail($id);
        $record->forceDelete();
        return $this->successResponse(null, 'Tax permanently deleted successfully');
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $ids = $request->validate(['ids' => 'required|array'])['ids'];
        $count = Tax::whereIn('id', $ids)->delete();
        return $this->successResponse(null, "{$count} taxes deleted successfully");
    }

    public function bulkRestore(Request $request): JsonResponse
    {
        $ids = $request->validate(['ids' => 'required|array'])['ids'];
        $count = Tax::onlyTrashed()->whereIn('id', $ids)->restore();
        return $this->successResponse(null, "{$count} taxes restored successfully");
    }

    public function export(Request $request): StreamedResponse
    {
        $headers = ['Name', 'Rate', 'Type', 'Active'];
        $records = Tax::all();

        return $this->csvService->streamExport(
            filename: 'taxes_export_' . now()->format('Y-m-d') . '.csv',
            headers: $headers,
            rows: $records,
            rowMapper: fn(Tax $rec) => [
                $rec->name,
                $rec->rate,
                $rec->type,
                $rec->is_active ? '1' : '0',
            ]
        );
    }

    public function import(Request $request): JsonResponse
    {
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
            $rate = (float) ($data['rate'] ?? 0);
            if (!$name) {
                $errors[] = "Line {$line}: Name is required.";
                continue;
            }

            Tax::create([
                'company_id' => $request->user()?->company_id ?? 1,
                'name'       => $name,
                'rate'       => $rate,
                'type'       => trim($data['type'] ?? 'percentage'),
                'is_active'  => filter_var($data['active'] ?? $data['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
            ]);

            $successCount++;
        }

        return $this->successResponse([
            'success_count' => $successCount,
            'errors'        => $errors,
        ], 'Import completed');
    }
}
