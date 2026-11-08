<?php

namespace App\Http\Controllers\Api\V1\Admin\Employee;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Employee\Shift;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Services\Support\AccessScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ShiftController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Shift::with(['company', 'branch']);

        if ($user) {
            $companyId = (int) ($user->company_id ?? 1);
            $query->where('company_id', $companyId);
            $requestedBranchId = $request->filled('branch_id') ? $request->integer('branch_id') : null;
            AccessScopeService::scopeBranches($query, $user, $requestedBranchId);
        }

        $shifts = $query->orderBy('id', 'desc')->get();

        return $this->successResponse($shifts, 'Shift schedule list retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);

        $validated = $request->validate([
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

        $branchId = isset($validated['branch_id']) && $validated['branch_id'] > 0
            ? AccessScopeService::validateBranchAccess($user, $validated['branch_id'], 'create shift for this branch')
            : ($user?->getActiveBranchId($request) ?? (int) (DB::table('branches')->where('company_id', $companyId)->value('id') ?? 1));

        $validated['company_id'] = $companyId;
        $validated['branch_id']  = $branchId;

        $shift = Shift::create($validated);

        return $this->successResponse($shift->load(['company', 'branch']), 'Shift schedule created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $shift = Shift::with(['company', 'branch'])->findOrFail($id);
        $user = auth()->user();
        if ($user && (int) $shift->company_id !== (int) $user->company_id) {
            abort(403, 'Unauthorized company access.');
        }
        if ($user && $shift->branch_id) {
            AccessScopeService::validateBranchAccess($user, $shift->branch_id, 'view shift in this branch');
        }

        return $this->successResponse($shift, 'Shift details retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $shift = Shift::findOrFail($id);
        $user = $request->user();

        if ($user && (int) $shift->company_id !== (int) $user->company_id) {
            abort(403, 'Unauthorized company access.');
        }
        if ($user && $shift->branch_id) {
            AccessScopeService::validateBranchAccess($user, $shift->branch_id, 'update shift in this branch');
        }

        $validated = $request->validate([
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

        if (isset($validated['branch_id']) && $validated['branch_id'] != $shift->branch_id) {
            AccessScopeService::validateBranchAccess($user, $validated['branch_id'], 'move shift to this branch');
        }

        unset($validated['company_id']);
        $shift->update($validated);

        return $this->successResponse($shift->load(['company', 'branch']), 'Shift schedule updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $shift = Shift::findOrFail($id);
        $user = auth()->user();

        if ($user && (int) $shift->company_id !== (int) $user->company_id) {
            abort(403, 'Unauthorized company access.');
        }
        if ($user && $shift->branch_id) {
            AccessScopeService::validateBranchAccess($user, $shift->branch_id, 'delete shift in this branch');
        }

        $shift->delete();
        return $this->successResponse(null, 'Shift schedule deleted successfully');
    }
}
