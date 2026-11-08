<?php

namespace App\Http\Controllers\Api\V1\Admin\Employee;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Employee\CreateEmployeeRequest;
use App\Http\Requests\Employee\UpdateEmployeeRequest;
use App\Http\Resources\Employee\EmployeeResource;
use App\Services\Employee\EmployeeService;
use App\Models\Employee\Attendance;
use App\Models\Employee\Department;
use App\Models\Employee\Employee;
use App\Models\Employee\Payroll;
use App\Models\Employee\Position;
use App\Services\Support\CsvService;
use App\Services\Support\FileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EmployeeController extends BaseApiController
{
    public function __construct(
        private readonly EmployeeService $service,
        protected FileService $fileService,
        protected CsvService $csvService
    ) {}

    public function index(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('employee.view')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $records = $this->service->getPaginated(
            $request->integer('per_page', 10),
            $request->all(),
            $request->get('sort_by', 'created_at'),
            $request->get('sort_order', 'desc')
        );

        return $this->paginatedResourceResponse(
            EmployeeResource::collection($records),
            $records,
            'Employee list retrieved successfully'
        );
    }

    public function store(CreateEmployeeRequest $request): JsonResponse
    {
        $user = $request->user();
        if ($user && !$user->can('employee.create')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $data = $request->validated();
        $targetBranchId = (int) ($data['branch_id'] ?? $user?->getActiveBranchId() ?? 1);
        if ($user && !$user->canAccessBranch($targetBranchId)) {
            return $this->errorResponse('Unauthorized access to branch', null, 403);
        }
        $data['company_id'] = $user?->company_id ?? 1;
        $data['branch_id'] = $targetBranchId;

        if ($request->hasFile('photo')) {
            $data['photo'] = $this->fileService->upload($request->file('photo'), 'employees');
        }

        $record = $this->service->create($data);
        return $this->successResponse(
            new EmployeeResource($record),
            'Employee created successfully',
            201
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        $this->authorize('view', $record);

        return $this->successResponse(
            new EmployeeResource($record),
            'Employee details retrieved successfully'
        );
    }

    public function update(UpdateEmployeeRequest $request, int $id): JsonResponse
    {
        $employee = $this->service->getById($id);
        $this->authorize('update', $employee);

        $data = $request->validated();
        if (!empty($data['branch_id']) && (int) $data['branch_id'] !== (int) $employee->branch_id) {
            if ($request->user() && !$request->user()->canAccessBranch((int) $data['branch_id'])) {
                return $this->errorResponse('Cannot move employee to unauthorized branch', null, 403);
            }
        }

        if ($request->hasFile('photo')) {
            $data['photo'] = $this->fileService->replace($request->file('photo'), $employee?->photo, 'employees');
        } elseif ($request->boolean('remove_photo') || ($request->has('photo') && (empty($request->input('photo')) || $request->input('photo') === 'null'))) {
            if (!empty($employee?->photo)) {
                $this->fileService->delete($employee->photo);
            }
            $data['photo'] = null;
        } elseif ($request->filled('photo') && $employee?->photo) {
            $cleanNew = $this->fileService->getRelativePath($request->input('photo'));
            $cleanOld = $this->fileService->getRelativePath($employee->photo);
            if (!empty($cleanNew) && $cleanNew !== $cleanOld) {
                $this->fileService->delete($employee->photo);
                $data['photo'] = $cleanNew;
            }
        }

        $record = $this->service->update($id, $data);
        return $this->successResponse(
            new EmployeeResource($record),
            'Employee updated successfully'
        );
    }

    public function uploadPhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif,webp,svg|max:5120',
        ]);

        if ($request->hasFile('photo')) {
            $path = $this->fileService->upload($request->file('photo'), 'employees');
            return $this->successResponse([
                'path' => $path,
                'url'  => $this->fileService->getUrl($path),
            ], 'Photo uploaded successfully');
        }

        return $this->errorResponse('No file uploaded', null, 400);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $employee = $this->service->getById($id);
        $this->authorize('delete', $employee);

        $this->service->delete($id);
        return $this->successResponse(
            null,
            'Employee deleted successfully'
        );
    }

    public function restore(Request $request, int $id): JsonResponse
    {
        $record = Employee::onlyTrashed()->findOrFail($id);
        $this->authorize('delete', $record);

        $record->restore();
        return $this->successResponse(new EmployeeResource($record), 'Employee restored successfully');
    }

    public function forceDelete(Request $request, int $id): JsonResponse
    {
        $record = Employee::withTrashed()->findOrFail($id);
        $this->authorize('delete', $record);

        if ($record->photo) {
            $this->fileService->delete($record->photo);
        }
        $record->forceDelete();
        return $this->successResponse(null, 'Employee permanently deleted successfully');
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('employee.delete')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $ids = $request->validate(['ids' => 'required|array'])['ids'];
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);
        $branchIds = $user?->accessibleBranchIds() ?? [];

        $count = Employee::where('company_id', $companyId)
            ->whereIn('branch_id', $branchIds)
            ->whereIn('id', $ids)
            ->delete();

        return $this->successResponse(null, "{$count} employees deleted successfully");
    }

    public function bulkRestore(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('employee.delete')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $ids = $request->validate(['ids' => 'required|array'])['ids'];
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);
        $branchIds = $user?->accessibleBranchIds() ?? [];

        $count = Employee::onlyTrashed()
            ->where('company_id', $companyId)
            ->whereIn('branch_id', $branchIds)
            ->whereIn('id', $ids)
            ->restore();

        return $this->successResponse(null, "{$count} employees restored successfully");
    }

    public function stats(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('employee.view')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);
        $branchIds = $user?->accessibleBranchIds() ?? [];

        $baseEmp = Employee::where('company_id', $companyId)->whereIn('branch_id', $branchIds);
        $totalEmployees = (clone $baseEmp)->count();
        $activeEmployees = (clone $baseEmp)->where('status', 'active')->count();
        $resignedEmployees = (clone $baseEmp)->where('status', 'resigned')->count();
        $newTodayEmployees = (clone $baseEmp)->whereDate('created_at', now()->today())->count();
        $totalDepartments = Department::where('company_id', $companyId)->count();
        $totalPositions = Position::where('company_id', $companyId)->count();
        $totalDrivers = (clone $baseEmp)->where('is_driver', true)->where('status', 'active')->count();
        $totalPosSupervisors = (clone $baseEmp)->where('is_pos_supervisor', true)->where('status', 'active')->count();
        $pendingLeavesCount = \App\Models\Employee\LeaveRequest::whereHas('employee', fn($eq) => $eq->where('company_id', $companyId)->whereIn('branch_id', $branchIds))->where('status', 'pending')->count();

        $today = now()->toDateString();
        $presentToday = Attendance::where('company_id', $companyId)->whereIn('branch_id', $branchIds)->whereDate('date', $today)->where('status', 'present')->count();
        $absentToday = Attendance::where('company_id', $companyId)->whereIn('branch_id', $branchIds)->whereDate('date', $today)->where('status', 'absent')->count();
        $lateToday = Attendance::where('company_id', $companyId)->whereIn('branch_id', $branchIds)->whereDate('date', $today)->where('status', 'late')->count();
        $leaveToday = Attendance::where('company_id', $companyId)->whereIn('branch_id', $branchIds)->whereDate('date', $today)->where('status', 'leave')->count();
        $holidayToday = Attendance::where('company_id', $companyId)->whereIn('branch_id', $branchIds)->whereDate('date', $today)->where('status', 'holiday')->count();

        $payrollScope = fn($eq) => $eq->where('company_id', $companyId)->whereIn('branch_id', $branchIds);

        $payrollDraft = Payroll::whereHas('employee', $payrollScope)->where('status', 'draft')->count();
        $payrollApproved = Payroll::whereHas('employee', $payrollScope)->where('status', 'approved')->count();
        $payrollPaid = Payroll::whereHas('employee', $payrollScope)->where('status', 'paid')->count();

        $currentMonth = now()->format('Y-m');
        $monthlySalaryExpense = Payroll::whereHas('employee', $payrollScope)
            ->where('period_month', $currentMonth)
            ->whereIn('status', ['approved', 'paid'])
            ->sum('net_salary');
        if ($monthlySalaryExpense == 0) {
            $monthlySalaryExpense = (clone $baseEmp)->where('status', 'active')->sum('basic_salary');
        }

        $averageSalary = (clone $baseEmp)->where('status', 'active')->avg('basic_salary') ?? 0;

        return $this->successResponse([
            'total_employees'       => $totalEmployees,
            'active_employees'      => $activeEmployees,
            'resigned_employees'    => $resignedEmployees,
            'new_today_employees'   => $newTodayEmployees,
            'total_departments'     => $totalDepartments,
            'total_positions'       => $totalPositions,
            'total_drivers'         => $totalDrivers,
            'total_pos_supervisors' => $totalPosSupervisors,
            'pending_leaves_count'  => $pendingLeavesCount,
            'attendance_today'      => [
                'present' => $presentToday,
                'absent'  => $absentToday,
                'late'    => $lateToday,
                'leave'   => $leaveToday,
                'holiday' => $holidayToday,
            ],
            'payroll_draft'         => $payrollDraft,
            'payroll_approved'      => $payrollApproved,
            'payroll_paid'          => $payrollPaid,
            'monthly_salary_expense'=> (float) $monthlySalaryExpense,
            'average_salary'        => (float) $averageSalary,
        ], 'Employee statistics retrieved successfully');
    }

    public function export(Request $request): StreamedResponse
    {
        $headers = [
            'Employee Number', 'Name', 'Email', 'Phone', 'NIK', 'Gender',
            'Birth Date', 'Address', 'Department', 'Position', 'Basic Salary',
            'Join Date', 'Resign Date', 'Status'
        ];

        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? 1);
        $branchIds = $user?->accessibleBranchIds() ?? [];

        $employees = Employee::with(['department', 'position'])
            ->where('company_id', $companyId)
            ->whereIn('branch_id', $branchIds)
            ->when($request->search, function ($q, $v) {
                $q->where('name', 'like', "%{$v}%")
                  ->orWhere('employee_number', 'like', "%{$v}%")
                  ->orWhere('email', 'like', "%{$v}%");
            })->get();

        return $this->csvService->streamExport(
            filename: 'employees_export_' . now()->format('Y-m-d') . '.csv',
            headers: $headers,
            rows: $employees,
            rowMapper: fn(Employee $emp) => [
                $emp->employee_number,
                $emp->name,
                $emp->email ?? '',
                $emp->phone ?? '',
                $emp->nik ?? '',
                $emp->gender ?? '',
                $emp->birth_date ? $emp->birth_date->format('Y-m-d') : '',
                $emp->address ?? '',
                $emp->department?->name ?? '',
                $emp->position?->name ?? '',
                $emp->basic_salary,
                $emp->join_date ? $emp->join_date->format('Y-m-d') : '',
                $emp->resign_date ? $emp->resign_date->format('Y-m-d') : '',
                $emp->status,
            ]
        );
    }

    public function import(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user && !$user->can('employee.create')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $request->validate([
            'file' => 'required|file|mimes:csv,txt',
        ]);

        $result = $this->csvService->parseCsv($request->file('file'), ['employee_number', 'name']);
        if (!$result['success']) {
            return $this->errorResponse($result['message'], $result['errors'], 400);
        }

        $targetBranchId = (int) ($request->input('branch_id') ?? $user?->getActiveBranchId() ?? 1);
        if ($user && !$user->canAccessBranch($targetBranchId)) {
            return $this->errorResponse('Unauthorized access to branch', null, 403);
        }
        $companyId = (int) ($user?->company_id ?? 1);

        $successCount = 0;
        $errors = [];

        foreach ($result['rows'] as $rowItem) {
            $line = $rowItem['_line'];
            $data = $rowItem['data'];

            $employeeNumber = trim($data['employee_number'] ?? $data['employee number'] ?? '');
            $name = trim($data['name'] ?? '');
            $email = trim($data['email'] ?? '');
            $phone = trim($data['phone'] ?? '');
            $nik = trim($data['nik'] ?? $data['national id'] ?? '');
            $gender = strtolower(trim($data['gender'] ?? ''));
            $birthDate = trim($data['birth_date'] ?? $data['birth date'] ?? '');
            $address = trim($data['address'] ?? '');
            $departmentName = trim($data['department'] ?? '');
            $positionName = trim($data['position'] ?? '');
            $basicSalary = (float) ($data['basic_salary'] ?? $data['basic salary'] ?? 0);
            $joinDate = trim($data['join_date'] ?? $data['join date'] ?? '');
            $resignDate = trim($data['resign_date'] ?? $data['resign date'] ?? '');
            $status = strtolower(trim($data['status'] ?? 'active'));

            if (empty($employeeNumber)) {
                $errors[] = "Line {$line}: Employee Number is required.";
                continue;
            }

            if (empty($name)) {
                $errors[] = "Line {$line}: Name is required.";
                continue;
            }

            if (Employee::where('company_id', $companyId)->where('employee_number', $employeeNumber)->exists()) {
                $errors[] = "Line {$line}: Employee with number '{$employeeNumber}' already exists.";
                continue;
            }

            $deptId = null;
            if ($departmentName) {
                $dept = Department::where('company_id', $companyId)->where('name', $departmentName)->first();
                $deptId = $dept?->id;
                if (!$deptId) {
                    $errors[] = "Line {$line}: Department '{$departmentName}' not found.";
                    continue;
                }
            }

            $posId = null;
            if ($positionName) {
                $pos = Position::where('company_id', $companyId)->where('name', $positionName)->first();
                $posId = $pos?->id;
                if (!$posId) {
                    $errors[] = "Line {$line}: Position '{$positionName}' not found.";
                    continue;
                }
            }

            Employee::create([
                'company_id'      => $companyId,
                'branch_id'       => $targetBranchId,
                'department_id'   => $deptId,
                'position_id'     => $posId,
                'user_id'         => null,
                'employee_number' => $employeeNumber,
                'name'            => $name,
                'email'           => $email ?: null,
                'phone'           => $phone ?: null,
                'nik'             => $nik ?: null,
                'gender'          => in_array($gender, ['male', 'female']) ? $gender : null,
                'birth_date'      => $birthDate ?: null,
                'address'         => $address ?: null,
                'photo'           => null,
                'join_date'       => $joinDate ?: null,
                'resign_date'     => $resignDate ?: null,
                'status'          => in_array($status, ['active', 'inactive', 'resigned']) ? $status : 'active',
                'basic_salary'    => $basicSalary,
            ]);

            $successCount++;
        }

        return $this->successResponse([
            'success_count' => $successCount,
            'errors'        => $errors,
        ], "Import completed. {$successCount} records imported successfully.");
    }
}
