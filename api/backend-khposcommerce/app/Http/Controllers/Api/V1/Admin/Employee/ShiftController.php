<?php

namespace App\Http\Controllers\Api\V1\Admin\Employee;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Employee\Shift;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShiftController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $shifts = Shift::with(['company', 'branch'])
            ->when($request->company_id, fn($q, $v) => $q->where('company_id', $v))
            ->when($request->branch_id, fn($q, $v) => $q->where('branch_id', $v))
            ->orderBy('id', 'desc')
            ->get();

        return $this->successResponse($shifts, 'Shift schedule list retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id'           => 'nullable|integer|exists:companies,id',
            'branch_id'            => 'nullable|integer|exists:branches,id',
            'name'                 => 'required|string|max:255',
            'start_time'           => 'required|string',
            'end_time'             => 'required|string',
            'break_minutes'        => 'nullable|integer',
            'late_grace_minutes'   => 'nullable|integer',
            'max_check_in_time'    => 'nullable|string',
            'min_check_out_time'   => 'nullable|string',
            'max_overtime_minutes' => 'nullable|integer',
            'working_days'         => 'nullable|array',
            'is_active'            => 'nullable|boolean',
        ]);

        if (empty($validated['company_id'])) {
            $validated['company_id'] = Company::first()?->id ?? 1;
        }
        if (empty($validated['branch_id'])) {
            $validated['branch_id'] = Branch::first()?->id ?? 1;
        }

        $shift = Shift::create($validated);

        return $this->successResponse($shift->load(['company', 'branch']), 'Shift schedule created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $shift = Shift::with(['company', 'branch'])->findOrFail($id);
        return $this->successResponse($shift, 'Shift details retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $shift = Shift::findOrFail($id);

        $validated = $request->validate([
            'company_id'           => 'sometimes|integer|exists:companies,id',
            'branch_id'            => 'sometimes|integer|exists:branches,id',
            'name'                 => 'sometimes|string|max:255',
            'start_time'           => 'sometimes|string',
            'end_time'             => 'sometimes|string',
            'break_minutes'        => 'nullable|integer',
            'late_grace_minutes'   => 'nullable|integer',
            'max_check_in_time'    => 'nullable|string',
            'min_check_out_time'   => 'nullable|string',
            'max_overtime_minutes' => 'nullable|integer',
            'working_days'         => 'nullable|array',
            'is_active'            => 'nullable|boolean',
        ]);

        $shift->update($validated);

        return $this->successResponse($shift->load(['company', 'branch']), 'Shift schedule updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $shift = Shift::findOrFail($id);
        $shift->delete();
        return $this->successResponse(null, 'Shift schedule deleted successfully');
    }
}
