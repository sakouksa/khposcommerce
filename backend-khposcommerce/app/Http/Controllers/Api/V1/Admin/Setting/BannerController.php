<?php

namespace App\Http\Controllers\Api\V1\Admin\Setting;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Marketing\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use App\Traits\HasFileUpload;
use App\Services\Support\StorefrontCacheService;

class BannerController extends BaseApiController
{
    use HasFileUpload;

    public function __construct(
        protected \App\Services\Support\FileService $fileService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Banner::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('subtitle', 'like', "%{$search}%")
                  ->orWhere('link', 'like', "%{$search}%");
            });
        }

        if ($request->filled('position') && $request->position !== 'all') {
            $query->where('position', $request->position);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'active' || $request->status === '1') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive' || $request->status === '0') {
                $query->where('is_active', false);
            }
        }

        $banners = $query->orderBy('sort_order')->orderByDesc('id')->paginate($request->get('per_page', 10));

        return $this->paginatedResponse($banners);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id'     => 'nullable|integer',
            'store_id'       => 'nullable|integer',
            'title'          => 'required|string|max:255',
            'subtitle'       => 'nullable|string|max:255',
            'badge'          => 'nullable|string|max:255',
            'discount_tag'   => 'nullable|string|max:255',
            'button_text'    => 'nullable|string|max:255',
            'theme_gradient' => 'nullable|string|max:255',
            'image'          => 'nullable',
            'image_url'      => 'nullable',
            'image_file'     => 'nullable',
            'link'           => 'nullable|string',
            'link_url'       => 'nullable|string',
            'position'       => 'nullable|string',
            'sort_order'     => 'nullable|integer',
            'is_active'      => 'nullable',
            'starts_at'      => 'nullable|date',
            'ends_at'        => 'nullable|date',
        ]);

        $validated['company_id'] = $request->input('company_id') ?? auth()->user()?->company_id ?? 1;
        $validated['image'] = $this->processBannerImage($request);
        $validated['link'] = $request->input('link') ?? $request->input('link_url');
        $validated['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        unset($validated['image_url'], $validated['link_url'], $validated['image_file']);

        $positionMap = [
            'home_hero'      => 'hero',
            'home_secondary' => 'sidebar',
            'category'       => 'sidebar',
        ];
        if (isset($validated['position']) && isset($positionMap[$validated['position']])) {
            $validated['position'] = $positionMap[$validated['position']];
        }

        $banner = Banner::create($validated);
        StorefrontCacheService::clearHomepage();

        return $this->successResponse($banner, 'Banner created successfully.', 201);
    }

    public function show(int $id): JsonResponse
    {
        $banner = Banner::findOrFail($id);

        return $this->successResponse($banner);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $banner = Banner::findOrFail($id);

        $validated = $request->validate([
            'company_id'     => 'nullable|integer',
            'store_id'       => 'nullable|integer',
            'title'          => 'sometimes|required|string|max:255',
            'subtitle'       => 'nullable|string|max:255',
            'badge'          => 'nullable|string|max:255',
            'discount_tag'   => 'nullable|string|max:255',
            'button_text'    => 'nullable|string|max:255',
            'theme_gradient' => 'nullable|string|max:255',
            'image'          => 'nullable',
            'image_url'      => 'nullable',
            'image_file'     => 'nullable',
            'link'           => 'nullable|string',
            'link_url'       => 'nullable|string',
            'position'       => 'nullable|string',
            'sort_order'     => 'nullable|integer',
            'is_active'      => 'nullable',
            'starts_at'      => 'nullable|date',
            'ends_at'        => 'nullable|date',
        ]);

        if ($request->hasFile('image_file') || $request->has('image') || $request->has('image_url')) {
            $validated['image'] = $this->processBannerImage($request, $banner->image);
        }

        if ($request->has('link') || $request->has('link_url')) {
            $validated['link'] = $request->input('link') ?? $request->input('link_url');
        }

        if ($request->has('is_active')) {
            $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }

        unset($validated['image_url'], $validated['link_url'], $validated['image_file']);

        $positionMap = [
            'home_hero'      => 'hero',
            'home_secondary' => 'sidebar',
            'category'       => 'sidebar',
        ];
        if (isset($validated['position']) && isset($positionMap[$validated['position']])) {
            $validated['position'] = $positionMap[$validated['position']];
        }

        $banner->update($validated);
        StorefrontCacheService::clearHomepage();

        return $this->successResponse($banner, 'Banner updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $banner = Banner::findOrFail($id);
        if ($banner->image) {
            $this->fileService->delete($banner->image);
        }
        if ($banner->mobile_image) {
            $this->fileService->delete($banner->mobile_image);
        }
        $banner->forceDelete();
        StorefrontCacheService::clearHomepage();

        return $this->successResponse(null, 'Banner deleted successfully.');
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        if (empty($ids) || !is_array($ids)) {
            return $this->errorResponse('No IDs provided', 422);
        }

        $banners = Banner::whereIn('id', $ids)->get();
        foreach ($banners as $banner) {
            if ($banner->image) {
                $this->fileService->delete($banner->image);
            }
            if ($banner->mobile_image) {
                $this->fileService->delete($banner->mobile_image);
            }
            $banner->forceDelete();
        }
        StorefrontCacheService::clearHomepage();

        return $this->successResponse(null, count($ids) . ' banners deleted successfully.');
    }

    private function processBannerImage(Request $request, ?string $existingImage = null): ?string
    {
        // 0. Check for explicit image removal
        $rawImage = $request->input('image') ?? $request->input('image_url');
        if (is_array($rawImage)) {
            $rawImage = reset($rawImage) ?: null;
        }

        if ($request->has('remove_image') || ($request->has('image') && empty($rawImage) && !$request->hasFile('image_file') && !$request->hasFile('image'))) {
            if ($existingImage) {
                $this->fileService->delete($existingImage);
            }
            return null;
        }

        // 1. Check for Multipart File Upload
        $file = $request->file('image_file') ?? $request->file('image');
        if ($file && is_object($file) && method_exists($file, 'store') && $file->isValid()) {
            if ($existingImage) {
                $this->fileService->delete($existingImage);
            }
            return $this->uploadFile($file, 'banners');
        }

        // 2. Check for Base64 Encoded Image Data
        if (is_string($rawImage) && str_starts_with($rawImage, 'data:image')) {
            $uploaded = $this->uploadFile($rawImage, 'banners');
            if ($uploaded) {
                if ($existingImage) {
                    $this->fileService->delete($existingImage);
                }
                return $uploaded;
            }
        }

        // 3. Check for Existing String URL or relative path
        if (is_string($rawImage) && !empty($rawImage) && $rawImage !== '[]' && $rawImage !== '""' && !str_starts_with($rawImage, 'blob:')) {
            if (str_contains($rawImage, '/storage/')) {
                return substr($rawImage, strpos($rawImage, '/storage/') + 9);
            }
            return $rawImage;
        }

        // 4. Preserve existing image if editing
        if (!empty($existingImage) && $existingImage !== '[]' && !str_contains($existingImage, 'blob:http')) {
            return $existingImage;
        }

        return null;
    }
}
