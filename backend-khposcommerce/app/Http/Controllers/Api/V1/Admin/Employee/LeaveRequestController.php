<?php

namespace App\Http\Controllers\Api\V1\Admin\Employee;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\Employee\LeaveRequestResource;
use App\Models\Employee\Employee;
use App\Services\Employee\LeaveService;
use App\Services\Support\AccessScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveRequestController extends BaseApiController
{
    public function __construct(private readonly LeaveService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated(
            $request->integer('per_page', 10),
            $request->all(),
            $request->get('sort_by', 'created_at'),
            $request->get('sort_order', 'desc')
        );

        return $this->paginatedResourceResponse(
            LeaveRequestResource::collection($records),
            $records,
            'Leave requests retrieved successfully'
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|integer|exists:employees,id',
            'leave_type'  => 'required|string|in:annual,sick,maternity,special,unpaid',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after_or_equal:start_date',
            'total_days'  => 'nullable|numeric|min:0.5',
            'reason'      => 'nullable|string|max:1000',
        ]);

        $employee = Employee::findOrFail($validated['employee_id']);
        AccessScopeService::validateBranchAccess($request->user(), $employee->branch_id, 'submit leave request for this employee');

        $validated['company_id'] = $employee->company_id;
        $validated['branch_id']  = $employee->branch_id;

        $record = $this->service->create($validated);

        return $this->successResponse(
            new LeaveRequestResource($record),
            'Leave request submitted successfully',
            201
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        if ($record->branch_id) {
            AccessScopeService::validateBranchAccess($request->user(), $record->branch_id, 'view this leave request');
        }

        return $this->successResponse(
            new LeaveRequestResource($record),
            'Leave request details retrieved successfully'
        );
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        if ($record->branch_id) {
            AccessScopeService::validateBranchAccess($request->user(), $record->branch_id, 'approve this leave request');
        }

        $validated = $request->validate([
            'manager_notes' => 'nullable|string|max:1000',
        ]);

        $userId = $request->user()?->id ?? 1;
        $record = $this->service->approve($id, $userId, $validated['manager_notes'] ?? null);

        return $this->successResponse(
            new LeaveRequestResource($record),
            'Leave request approved and synced with attendance successfully'
        );
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        if ($record->branch_id) {
            AccessScopeService::validateBranchAccess($request->user(), $record->branch_id, 'reject this leave request');
        }

        $validated = $request->validate([
            'manager_notes' => 'required|string|max:1000',
        ]);

        $userId = $request->user()?->id ?? 1;
        $record = $this->service->reject($id, $userId, $validated['manager_notes']);

        return $this->successResponse(
            new LeaveRequestResource($record),
            'Leave request rejected'
        );
    }

    public function getBalance(Request $request, int $employeeId): JsonResponse
    {
        $employee = Employee::findOrFail($employeeId);
        AccessScopeService::validateBranchAccess($request->user(), $employee->branch_id, 'view leave balance for this employee');

        $year = $request->integer('year', (int) now()->year);
        $balance = $this->service->getBalance($employeeId, $year);

        return $this->successResponse([
            'employee_id'           => $balance->employee_id,
            'year'                  => $balance->year,
            'annual_leave_total'    => (float) $balance->annual_leave_total,
            'annual_leave_used'     => (float) $balance->annual_leave_used,
            'annual_leave_remaining'=> (float) max(0, $balance->annual_leave_total - $balance->annual_leave_used),
            'sick_leave_total'      => (float) $balance->sick_leave_total,
            'sick_leave_used'       => (float) $balance->sick_leave_used,
            'sick_leave_remaining'  => (float) max(0, $balance->sick_leave_total - $balance->sick_leave_used),
            'special_leave_total'   => (float) $balance->special_leave_total,
            'special_leave_used'    => (float) $balance->special_leave_used,
            'maternity_leave_total' => (float) $balance->maternity_leave_total,
            'maternity_leave_used'  => (float) $balance->maternity_leave_used,
        ], 'Leave balance retrieved successfully');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(null, 'Leave request deleted successfully');
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|integer',
        ]);

        $count = $this->service->bulkDelete($validated['ids']);
        return $this->successResponse(null, "{$count} leave requests deleted successfully");
    }
}
