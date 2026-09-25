<?php

namespace App\Http\Controllers\Api\V1\Admin\Product;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Product\StoreAttributeRequest;
use App\Http\Requests\Product\UpdateAttributeRequest;
use App\Models\Product\Attribute;
use App\Services\Support\CsvService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttributeController extends BaseApiController
{
    public function __construct(
        protected CsvService $csvService
    ) {}

    /**
     * GET /api/v1/attributes
     */
    public function index(Request $request): JsonResponse
    {
        $sortBy = $request->get('sort_by', 'id');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedSorts = ['id', 'name', 'type', 'is_active', 'created_at'];
        $sortBy = in_array($sortBy, $allowedSorts, true) ? $sortBy : 'id';
        $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc'], true) ? $sortOrder : 'desc';

        $attributes = Attribute::with(['values' => fn($q) => $q->orderBy('sort_order')->orderBy('id')])
            ->when($request->status === 'deleted', function ($q) {
                $q->onlyTrashed();
            })
            ->when($request->status && $request->status !== 'deleted', function ($q) use ($request) {
                $q->where('is_active', $request->status === 'active');
            })
            ->when($request->search, fn($q, $v) => $q->where('name', 'like', "%{$v}%"))
            ->orderBy($sortBy, $sortOrder)
            ->paginate($request->integer('per_page', 10));

        return $this->paginatedResponse($attributes);
    }

    public function show(int $id): JsonResponse
    {
        $attribute = Attribute::with('values')->findOrFail($id);
        return $this->successResponse($attribute);
    }

    public function store(StoreAttributeRequest $request): JsonResponse
    {
        $attribute = Attribute::create($request->validated());
        if ($request->has('values') && is_array($request->values)) {
            foreach ($request->values as $val) {
                if (!empty($val['value'])) {
                    $attribute->values()->create([
                        'value'      => $val['value'],
                        'color_code' => $val['color_code'] ?? null,
                        'sort_order' => $val['sort_order'] ?? 0,
                    ]);
                }
            }
        }
        return $this->successResponse($attribute->load('values'), 'Attribute created successfully', 201);
    }

    public function update(UpdateAttributeRequest $request, int $id): JsonResponse
    {
        $attribute = Attribute::findOrFail($id);
        $attribute->update($request->validated());
        if ($request->has('values') && is_array($request->values)) {
            $attribute->values()->delete();
            foreach ($request->values as $val) {
                if (!empty($val['value'])) {
                    $attribute->values()->create([
                        'value'      => $val['value'],
                        'color_code' => $val['color_code'] ?? null,
                        'sort_order' => $val['sort_order'] ?? 0,
                    ]);
                }
            }
        }
        return $this->successResponse($attribute->load('values'), 'Attribute updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $attribute = Attribute::findOrFail($id);
        $attribute->delete();
        return $this->successResponse(null, 'Attribute deleted successfully');
    }

    public function restore(int $id): JsonResponse
    {
        $attribute = Attribute::onlyTrashed()->findOrFail($id);
        $attribute->restore();
        return $this->successResponse($attribute, 'Attribute restored successfully');
    }

    public function forceDelete(int $id): JsonResponse
    {
        $attribute = Attribute::withTrashed()->findOrFail($id);
        $attribute->forceDelete();
        return $this->successResponse(null, 'Attribute permanently deleted successfully');
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $ids = $request->validate(['ids' => 'required|array'])['ids'];
        $count = Attribute::whereIn('id', $ids)->delete();
        return $this->successResponse(null, "{$count} attributes deleted successfully");
    }

    public function bulkRestore(Request $request): JsonResponse
    {
        $ids = $request->validate(['ids' => 'required|array'])['ids'];
        $count = Attribute::onlyTrashed()->whereIn('id', $ids)->restore();
        return $this->successResponse(null, "{$count} attributes restored successfully");
    }

    public function export(Request $request): StreamedResponse
    {
        $headers = ['Name', 'Type', 'Active'];
        $attributes = Attribute::all();

        return $this->csvService->streamExport(
            filename: 'attributes_export_' . now()->format('Y-m-d') . '.csv',
            headers: $headers,
            rows: $attributes,
            rowMapper: fn(Attribute $attr) => [
                $attr->name,
                $attr->type,
                $attr->is_active ? '1' : '0',
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
            if (!$name) {
                $errors[] = "Line {$line}: Name is required.";
                continue;
            }

            Attribute::create([
                'company_id' => $request->user()?->company_id ?? 1,
                'name'       => $name,
                'type'       => trim($data['type'] ?? 'select'),
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
