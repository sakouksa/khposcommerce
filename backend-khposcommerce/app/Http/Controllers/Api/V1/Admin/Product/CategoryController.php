<?php

namespace App\Http\Controllers\Api\V1\Admin\Product;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Product\StoreCategoryRequest;
use App\Http\Requests\Product\UpdateCategoryRequest;
use App\Models\Product\Category;
use App\Services\Support\CsvService;
use App\Services\Support\FileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CategoryController extends BaseApiController
{
    public function __construct(
        protected FileService $fileService,
        protected CsvService $csvService
    ) {}

    /**
     * GET /api/v1/categories
     */
    public function index(Request $request): JsonResponse
    {
        $sortBy = $request->get('sort_by', 'id');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedSorts = ['id', 'name', 'slug', 'description', 'is_active', 'created_at', 'sort_order'];
        $sortBy = in_array($sortBy, $allowedSorts, true) ? $sortBy : 'id';
        $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc'], true) ? $sortOrder : 'desc';

        $categories = Category::with('parent')
            ->withCount('products')
            ->when($request->status === 'deleted', function ($q) {
                $q->onlyTrashed();
            })
            ->when($request->status && $request->status !== 'deleted', function ($q) use ($request) {
                $q->where('is_active', $request->status === 'active' || $request->status === '1');
            })
            ->when($request->search, fn($q, $v) => $q->where('name', 'like', "%{$v}%"))
            ->orderBy($sortBy, $sortOrder)
            ->paginate($request->integer('per_page', 10));

        return $this->paginatedResponse($categories);
    }

    /**
     * GET /api/v1/categories/{id}
     */
    public function show(int $id): JsonResponse
    {
        $category = Category::with('parent')->withCount('products')->findOrFail($id);
        return $this->successResponse($category);
    }

    /**
     * POST /api/v1/categories
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();
        if (!isset($data['slug']) || empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $uploadedImage = $request->file('image_file') ?? $request->file('image');
        if ($uploadedImage) {
            $data['image'] = $this->fileService->upload($uploadedImage, 'categories');
        }

        $category = Category::create($data);

        return $this->successResponse($category, 'Category created successfully', 201);
    }

    /**
     * PUT /api/v1/categories/{id}
     */
    public function update(UpdateCategoryRequest $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $data = $request->validated();

        if (isset($data['name']) && (!isset($data['slug']) || empty($data['slug']))) {
            $data['slug'] = Str::slug($data['name']);
        }

        $uploadedImage = $request->file('image_file') ?? $request->file('image');
        if ($uploadedImage) {
            $data['image'] = $this->fileService->replace($uploadedImage, $category->image, 'categories');
        } elseif ($request->boolean('remove_image') || ($request->has('image') && ($request->input('image') === '' || $request->input('image') === null || $request->input('image') === 'null'))) {
            if ($category->image) {
                $this->fileService->delete($category->image);
            }
            $data['image'] = null;
        }

        $category->update($data);

        return $this->successResponse($category, 'Category updated successfully');
    }

    /**
     * DELETE /api/v1/categories/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $category = Category::findOrFail($id);
            $category->delete();
            return $this->successResponse(null, 'Category deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    /**
     * POST /api/v1/categories/{id}/restore
     */
    public function restore(int $id): JsonResponse
    {
        try {
            $category = Category::onlyTrashed()->findOrFail($id);
            $category->restore();
            return $this->successResponse(null, 'Category restored successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    /**
     * DELETE /api/v1/categories/{id}/force
     */
    public function forceDelete(int $id): JsonResponse
    {
        try {
            $category = Category::withTrashed()->findOrFail($id);
            if ($category->image) {
                $this->fileService->delete($category->image);
            }
            $category->forceDelete();
            return $this->successResponse(null, 'Category permanently deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    /**
     * GET /api/v1/store/categories/{slug}
     */
    public function showBySlug(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)->firstOrFail();
        return $this->successResponse($category);
    }

    /**
     * POST /api/v1/categories/bulk-delete
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $ids = $request->validate(['ids' => 'required|array'])['ids'];
        $count = Category::whereIn('id', $ids)->delete();
        return $this->successResponse(null, "{$count} categories deleted successfully");
    }

    /**
     * POST /api/v1/categories/bulk-restore
     */
    public function bulkRestore(Request $request): JsonResponse
    {
        $ids = $request->validate(['ids' => 'required|array'])['ids'];
        $count = Category::onlyTrashed()->whereIn('id', $ids)->restore();
        return $this->successResponse(null, "{$count} categories restored successfully");
    }

    /**
     * GET /api/v1/categories/export
     */
    public function export(Request $request): StreamedResponse
    {
        $headers = ['Parent Category', 'Name', 'Slug', 'Description', 'Image', 'Sort Order', 'Active'];
        $categories = Category::with('parent')->get();

        return $this->csvService->streamExport(
            filename: 'categories_export_' . now()->format('Y-m-d') . '.csv',
            headers: $headers,
            rows: $categories,
            rowMapper: fn(Category $cat) => [
                $cat->parent?->name ?? '',
                $cat->name,
                $cat->slug,
                $cat->description ?? '',
                $cat->image ?? '',
                $cat->sort_order,
                $cat->is_active ? '1' : '0',
            ]
        );
    }

    /**
     * POST /api/v1/categories/import
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
            if (Category::where('slug', $slug)->exists()) {
                $errors[] = "Line {$line}: Category slug '{$slug}' already exists.";
                continue;
            }

            $parentId = null;
            $parentName = trim($data['parent_category'] ?? $data['parent category'] ?? '');
            if ($parentName) {
                $parentId = Category::where('name', $parentName)->value('id');
            }

            Category::create([
                'company_id'  => $request->user()?->company_id ?? 1,
                'parent_id'   => $parentId,
                'name'        => $name,
                'slug'        => $slug,
                'description' => trim($data['description'] ?? '') ?: null,
                'image'       => trim($data['image'] ?? '') ?: null,
                'sort_order'  => (int) ($data['sort_order'] ?? $data['sort order'] ?? 0),
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
