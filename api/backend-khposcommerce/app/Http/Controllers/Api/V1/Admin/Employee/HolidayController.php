<?php

namespace App\Http\Controllers\Api\V1\Admin\Employee;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Employee\Holiday;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class HolidayController extends BaseApiController
{
    // ─── GET /holidays ────────────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $query = Holiday::query()
            ->search($request->get('search'))
            ->when($request->get('status'), fn($q, $s) => $q->where('status', $s))
            ->orderBy('date', 'asc');

        $perPage   = $request->integer('per_page', 10);
        $paginator = $query->paginate($perPage);

        return response()->json([
            'success'      => true,
            'message'      => 'Holidays retrieved successfully',
            'data'         => $paginator->items(),
            'current_page' => $paginator->currentPage(),
            'last_page'    => $paginator->lastPage(),
            'per_page'     => $paginator->perPage(),
            'total'        => $paginator->total(),
            'from'         => $paginator->firstItem(),
            'to'           => $paginator->lastItem(),
        ]);
    }

    // ─── POST /holidays ───────────────────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title_en'     => 'required|string|max:255',
            'title_km'     => 'nullable|string|max:255',
            'date'         => 'required|date',
            'description'  => 'nullable|string|max:2000',
            'status'       => ['nullable', Rule::in(['active', 'inactive'])],
            'is_recurring' => 'nullable|boolean',
        ]);

        $holiday = Holiday::create([
            'title_en'     => $validated['title_en'],
            'title_km'     => $validated['title_km'] ?? null,
            'date'         => $validated['date'],
            'description'  => $validated['description'] ?? null,
            'status'       => $validated['status'] ?? 'active',
            'is_recurring' => $validated['is_recurring'] ?? true,
        ]);

        return $this->successResponse($holiday, 'Holiday created successfully', 201);
    }

    // ─── GET /holidays/{id} ───────────────────────────────────────────────────
    public function show(int $id): JsonResponse
    {
        $holiday = Holiday::findOrFail($id);
        return $this->successResponse($holiday, 'Holiday retrieved successfully');
    }

    // ─── PUT /holidays/{id} ───────────────────────────────────────────────────
    public function update(Request $request, int $id): JsonResponse
    {
        $holiday = Holiday::findOrFail($id);

        $validated = $request->validate([
            'title_en'     => 'sometimes|required|string|max:255',
            'title_km'     => 'nullable|string|max:255',
            'date'         => 'sometimes|required|date',
            'description'  => 'nullable|string|max:2000',
            'status'       => ['nullable', Rule::in(['active', 'inactive'])],
            'is_recurring' => 'nullable|boolean',
        ]);

        $holiday->update($validated);

        return $this->successResponse($holiday->fresh(), 'Holiday updated successfully');
    }

    // ─── DELETE /holidays/{id} ────────────────────────────────────────────────
    public function destroy(int $id): JsonResponse
    {
        $holiday = Holiday::findOrFail($id);
        $holiday->delete();

        return $this->successResponse(null, 'Holiday deleted successfully');
    }

    // ─── POST /holidays/bulk-delete ───────────────────────────────────────────
    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:holidays,id',
        ]);

        $count = Holiday::whereIn('id', $request->ids)->delete();

        return $this->successResponse(
            ['deleted_count' => $count],
            "{$count} holiday(s) deleted successfully"
        );
    }

    // ─── POST /holidays/bulk-import ───────────────────────────────────────────
    public function bulkImport(Request $request): JsonResponse
    {
        $request->validate([
            'holidays'                  => 'required|array|min:1',
            'holidays.*.title_en'       => 'required|string|max:255',
            'holidays.*.title_km'       => 'nullable|string|max:255',
            'holidays.*.date'           => 'required|date',
            'holidays.*.description'    => 'nullable|string|max:2000',
            'holidays.*.is_recurring'   => 'nullable|boolean',
        ]);

        $inserted = collect($request->holidays)->map(fn($h) => Holiday::firstOrCreate(
            ['date' => $h['date'], 'title_en' => $h['title_en']],
            [
                'title_km'     => $h['title_km'] ?? null,
                'description'  => $h['description'] ?? null,
                'status'       => 'active',
                'is_recurring' => $h['is_recurring'] ?? true,
            ]
        ));

        return $this->successResponse(
            ['imported_count' => $inserted->count()],
            "Imported {$inserted->count()} holidays successfully",
            201
        );
    }
}
