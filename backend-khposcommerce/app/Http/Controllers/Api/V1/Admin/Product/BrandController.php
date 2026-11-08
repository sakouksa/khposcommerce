<?php

namespace App\Http\Controllers\Api\V1\Admin\Product;

use App\Http\Controllers\Api\Traits\HasBulkActions;
use App\Http\Controllers\Api\Traits\HasTrashActions;
use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Product\StoreBrandRequest;
use App\Http\Requests\Product\UpdateBrandRequest;
use App\Models\Product\Brand;
use App\Services\Support\CsvService;
use App\Services\Support\FileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BrandController extends BaseApiController
{
    use HasBulkActions, HasTrashActions;

    protected string $modelClass = Brand::class;

    public function __construct(
        protected FileService $fileService,
        protected CsvService $csvService
    ) {}

    /**
     * GET /api/v1/brands
     */
    public function index(Request $request): JsonResponse
    {
        $sortBy = $request->get('sort_by', 'id');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedSorts = ['id', 'name', 'slug', 'description', 'is_active', 'created_at'];
        $sortBy = in_array($sortBy, $allowedSorts, true) ? $sortBy : 'id';
        $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc'], true) ? $sortOrder : 'desc';

        $brands = Brand::withCount('products')
            ->when($request->status === 'deleted', function ($q) {
                $q->onlyTrashed();
            })
            ->when($request->status && $request->status !== 'deleted', function ($q) use ($request) {
                $q->where('is_active', $request->status === 'active' || $request->status === '1');
            })
            ->when($request->search, fn($q, $v) => $q->where('name', 'like', "%{$v}%"))
            ->orderBy($sortBy, $sortOrder)
            ->paginate($request->integer('per_page', 10));

        return $this->paginatedResponse($brands);
    }

    /**
     * GET /api/v1/brands/{id}
     */
    public function show(int $id): JsonResponse
    {
        $brand = Brand::withCount('products')->findOrFail($id);
        return $this->successResponse($brand);
    }

    /**
     * POST /api/v1/brands
     */
    public function store(StoreBrandRequest $request): JsonResponse
    {
        $data = $request->validated();
        if (!isset($data['slug']) || empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $uploadedLogo = $request->file('logo_file') ?? $request->file('logo');
        if ($uploadedLogo) {
            $data['logo'] = $this->fileService->upload($uploadedLogo, 'brands');
        }

        $brand = Brand::create($data);

        return $this->successResponse($brand, 'Brand created successfully', 201);
    }

    /**
     * PUT /api/v1/brands/{id}
     */
    public function update(UpdateBrandRequest $request, int $id): JsonResponse
    {
        $brand = Brand::findOrFail($id);
        $data = $request->validated();

        if (isset($data['name']) && (!isset($data['slug']) || empty($data['slug']))) {
            $data['slug'] = Str::slug($data['name']);
        }

        $uploadedLogo = $request->file('logo_file') ?? $request->file('logo');
        if ($uploadedLogo) {
            $data['logo'] = $this->fileService->replace($uploadedLogo, $brand->logo, 'brands');
        } elseif ($request->boolean('remove_logo') || ($request->has('logo') && ($request->input('logo') === '' || $request->input('logo') === null || $request->input('logo') === 'null'))) {
            if ($brand->logo) {
                $this->fileService->delete($brand->logo);
            }
            $data['logo'] = null;
        }

        $brand->update($data);

        return $this->successResponse($brand, 'Brand updated successfully');
    }

    /**
     * DELETE /api/v1/brands/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $brand = Brand::findOrFail($id);
            $brand->delete();
            return $this->successResponse(null, 'Brand deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    /**
     * DELETE /api/v1/brands/{id}/force
     */
    public function forceDelete(int $id): JsonResponse
    {
        try {
            $brand = Brand::withTrashed()->findOrFail($id);
            if ($brand->logo) {
                $this->fileService->delete($brand->logo);
            }
            $brand->forceDelete();
            return $this->successResponse(null, 'Brand permanently deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    /**
     * GET /api/v1/brands/export
     */
    public function export(Request $request): StreamedResponse
    {
        $headers = ['Name', 'Slug', 'Description', 'Logo', 'Active'];
        $brands = Brand::all();

        return $this->csvService->streamExport(
            filename: 'brands_export_' . now()->format('Y-m-d') . '.csv',
            headers: $headers,
            rows: $brands,
            rowMapper: fn(Brand $brand) => [
                $brand->name,
                $brand->slug,
                $brand->description ?? '',
                $brand->logo ?? '',
                $brand->is_active ? '1' : '0',
            ]
        );
    }

    /**
     * POST /api/v1/brands/import
     */
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

            $slug = trim($data['slug'] ?? '') ?: Str::slug($name);
            if (Brand::where('slug', $slug)->exists()) {
                $errors[] = "Line {$line}: Brand slug '{$slug}' already exists.";
                continue;
            }

            Brand::create([
                'company_id'  => $request->user()?->company_id ?? 1,
                'name'        => $name,
                'slug'        => $slug,
                'description' => trim($data['description'] ?? '') ?: null,
                'logo'        => trim($data['logo'] ?? '') ?: null,
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
