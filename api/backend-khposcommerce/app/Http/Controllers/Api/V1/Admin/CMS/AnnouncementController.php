<?php

namespace App\Http\Controllers\Api\V1\Admin\CMS;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\CMS\Announcement;
use App\Models\Company\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AnnouncementController extends BaseApiController
{
    /**
     * Clear storefront caches when announcement changes
     */
    private function clearCache(): void
    {
        \App\Services\Support\StorefrontCacheService::clearAnnouncements();
    }

    /**
     * GET /api/v1/announcements
     */
    public function index(Request $request): JsonResponse
    {
        $hasSearch = $request->filled('search');
        $hasActive = $request->filled('is_active');
        $perPage   = (int) $request->input('per_page', 50);

        if (!$hasSearch && !$hasActive && $perPage <= 100) {
            $records = Cache::remember("admin_announcements_list_{$perPage}", 300, function () use ($perPage) {
                return Announcement::query()
                    ->orderByDesc('sort_order')
                    ->orderByDesc('id')
                    ->paginate($perPage);
            });

            return $this->paginatedResponse($records, 'Announcements retrieved successfully.');
        }

        $query = Announcement::query();

        if ($hasSearch) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('message_km', 'like', "%{$s}%")
                  ->orWhere('message_en', 'like', "%{$s}%")
                  ->orWhere('coupon_code', 'like', "%{$s}%")
                  ->orWhere('badge_text', 'like', "%{$s}%");
            });
        }

        if ($hasActive) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $records = $query->orderByDesc('sort_order')->orderByDesc('id')->paginate($perPage);

        return $this->paginatedResponse($records, 'Announcements retrieved successfully.');
    }

    /**
     * POST /api/v1/announcements
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'        => 'nullable|string|max:255',
            'message_km'   => 'required|string',
            'message_en'   => 'nullable|string',
            'badge_text'   => 'nullable|string|max:50',
            'coupon_code'  => 'nullable|string|max:50',
            'link_url'     => 'nullable|string|max:255',
            'bg_gradient'  => 'nullable|string|max:100',
            'is_active'    => 'nullable|boolean',
            'sort_order'   => 'nullable|integer',
            'starts_at'    => 'nullable|date',
            'ends_at'      => 'nullable|date',
        ]);

        $companyId = Company::value('id') ?? 1;
        $validated['company_id'] = $companyId;
        $validated['badge_text'] = $validated['badge_text'] ?? 'SPECIAL PROMO';
        $validated['link_url'] = $validated['link_url'] ?? '/promotions';
        $validated['bg_gradient'] = $validated['bg_gradient'] ?? 'from-indigo-600 to-purple-700';

        if (!empty($validated['is_active'])) {
            // Deactivate others to keep single primary active announcement strip
            Announcement::where('company_id', $companyId)->update(['is_active' => false]);
        }

        $record = Announcement::create($validated);
        $this->clearCache();

        return $this->successResponse($record, 'Announcement created successfully.', 201);
    }

    /**
     * GET /api/v1/announcements/{id}
     */
    public function show(int $id): JsonResponse
    {
        $record = Announcement::findOrFail($id);
        return $this->successResponse($record, 'Announcement details retrieved successfully.');
    }

    /**
     * PUT /api/v1/announcements/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $record = Announcement::findOrFail($id);

        $validated = $request->validate([
            'title'        => 'nullable|string|max:255',
            'message_km'   => 'sometimes|required|string',
            'message_en'   => 'nullable|string',
            'badge_text'   => 'nullable|string|max:50',
            'coupon_code'  => 'nullable|string|max:50',
            'link_url'     => 'nullable|string|max:255',
            'bg_gradient'  => 'nullable|string|max:100',
            'is_active'    => 'nullable|boolean',
            'sort_order'   => 'nullable|integer',
            'starts_at'    => 'nullable|date',
            'ends_at'      => 'nullable|date',
        ]);

        if (!empty($validated['is_active'])) {
            Announcement::where('id', '!=', $id)->update(['is_active' => false]);
        }

        $record->update($validated);
        $this->clearCache();

        return $this->successResponse($record, 'Announcement updated successfully.');
    }

    /**
     * DELETE /api/v1/announcements/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $record = Announcement::findOrFail($id);
        $record->delete();
        $this->clearCache();

        return $this->successResponse(null, 'Announcement deleted successfully.');
    }

    /**
     * POST /api/v1/announcements/{id}/toggle-active
     */
    public function toggleActive(int $id): JsonResponse
    {
        $record = Announcement::findOrFail($id);
        $newState = !$record->is_active;

        if ($newState) {
            Announcement::where('id', '!=', $id)->update(['is_active' => false]);
        }

        $record->update(['is_active' => $newState]);
        $this->clearCache();

        return $this->successResponse($record, 'Announcement status updated.');
    }

    /**
     * POST /api/v1/announcements/bulk-delete
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        if (empty($ids) || !is_array($ids)) {
            return $this->errorResponse('No IDs provided', 422);
        }

        $count = Announcement::whereIn('id', $ids)->delete();
        $this->clearCache();

        return $this->successResponse(['deleted_count' => $count], "Successfully deleted {$count} announcements.");
    }
}
