<?php
namespace App\Http\Controllers\Api\V1\Admin\Employee;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Employee\CreateAttendanceRequest;
use App\Http\Requests\Employee\UpdateAttendanceRequest;
use App\Http\Resources\Employee\AttendanceResource;
use App\Services\Employee\AttendanceService;
use App\Services\Employee\QrAttendanceService;
use App\Models\Employee\Employee;
use App\Http\Controllers\Api\Traits\HandlesExportDateRange;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends BaseApiController
{
    use HandlesExportDateRange;

    public function __construct(
        private readonly AttendanceService $service,
        private readonly QrAttendanceService $qrService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated(
            $request->integer('per_page', 10),
            $request->all(),
            $request->get('sort_by', 'attendance_date'),
            $request->get('sort_order', 'desc')
        );

        return $this->paginatedResourceResponse(
            AttendanceResource::collection($records),
            $records,
            'Attendance list retrieved successfully'
        );
    }

    public function monthlySummary(Request $request): JsonResponse
    {
        $periodMonth = (string) $request->get('period_month', now()->format('Y-m'));
        $companyId = $request->has('company_id') && $request->get('company_id') !== '' ? (int) $request->get('company_id') : null;
        $branchId = $request->has('branch_id') && $request->get('branch_id') !== '' ? (int) $request->get('branch_id') : null;

        $summary = $this->service->getMonthlySummary($periodMonth, $companyId, $branchId);

        return $this->successResponse($summary, 'Monthly attendance summary retrieved successfully');
    }

    public function store(CreateAttendanceRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new AttendanceResource($record),
            'Attendance created successfully',
            201
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $record = $this->service->getById($id, ['employee', 'department', 'position', 'shift', 'company', 'branch']);
        return $this->successResponse(
            new AttendanceResource($record),
            'Attendance details retrieved successfully'
        );
    }

    public function update(UpdateAttendanceRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new AttendanceResource($record),
            'Attendance updated successfully'
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'Attendance deleted successfully'
        );
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $ids = $request->validate(['ids' => 'required|array'])['ids'];
        $count = $this->service->bulkDelete($ids);

        return $this->successResponse(
            null,
            "{$count} attendance records deleted successfully"
        );
    }

    // ─── DYNAMIC QR & COMPANY ENTRANCE QR GENERATOR (ADMIN / KIOSK / STANDEE) ───
    public function generateQr(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id'       => 'nullable|integer|exists:companies,id',
            'branch_id'        => 'nullable|integer|exists:branches,id',
            'shift_id'         => 'nullable|integer|exists:shifts,id',
            'interval_seconds' => 'nullable|integer',
            'is_standee'       => 'nullable|boolean',
            'checkpoint_name'  => 'nullable|string|max:150',
            'radius_meters'    => 'nullable|integer|min:5|max:1000',
            'wifi_ssid'        => 'nullable|string|max:100',
            'gps_latitude'     => 'nullable|numeric|between:-90,90',
            'gps_longitude'    => 'nullable|numeric|between:-180,180',
            'force_regenerate' => 'nullable|boolean',
        ]);

        $companyId = $validated['company_id'] ?? \App\Models\Company\Company::first()?->id ?? 1;
        $branchId = $validated['branch_id'] ?? \App\Models\Company\Branch::where('company_id', $companyId)->first()?->id ?? 1;
        $isStandee = !empty($validated['is_standee']);

        $data = $this->qrService->generateDynamicQr(
            (int) $companyId,
            (int) $branchId,
            $validated['shift_id'] ?? null,
            (int) ($validated['interval_seconds'] ?? ($isStandee ? 31536000 : 30)),
            $isStandee,
            [
                'checkpoint_name'  => $validated['checkpoint_name'] ?? null,
                'radius_meters'    => $validated['radius_meters'] ?? 50,
                'wifi_ssid'        => $validated['wifi_ssid'] ?? null,
                'gps_latitude'     => $validated['gps_latitude'] ?? null,
                'gps_longitude'    => $validated['gps_longitude'] ?? null,
                'force_regenerate' => !empty($validated['force_regenerate']),
            ]
        );

        $msg = $isStandee
            ? 'Company Entrance Standee QR retrieved / generated successfully'
            : 'Dynamic Kiosk Attendance QR Token generated successfully';

        return $this->successResponse($data, $msg);
    }

    /**
     * Get the active Entrance Standee QR for a branch without revoking/regenerating.
     */
    public function getEntranceQr(Request $request): JsonResponse
    {
        $companyId = $request->integer('company_id') ?: (\App\Models\Company\Company::first()?->id ?? 1);
        $branchId = $request->integer('branch_id') ?: (\App\Models\Company\Branch::where('company_id', $companyId)->first()?->id ?? 1);

        $data = $this->qrService->getActiveEntranceQr($companyId, $branchId);

        // If no active entrance standee exists yet for this branch, create the initial one
        if (!$data) {
            $data = $this->qrService->generateEntranceQr([
                'company_id'       => $companyId,
                'branch_id'        => $branchId,
                'checkpoint_name'  => 'ច្រកចូលក្រុមហ៊ុន (Main Entrance)',
                'radius_meters'    => 50,
                'force_regenerate' => false,
            ]);
        }

        return $this->successResponse($data, 'Active Company Entrance QR retrieved successfully');
    }

    /**
     * Explicitly revoke an active Entrance Standee QR session.
     */
    public function revokeEntranceQr(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id' => 'required|integer|exists:companies,id',
            'branch_id'  => 'required|integer|exists:branches,id',
            'session_id' => 'nullable|integer|exists:attendance_qr_sessions,id',
        ]);

        $revoked = $this->qrService->revokeEntranceQr(
            (int) $validated['company_id'],
            (int) $validated['branch_id'],
            $validated['session_id'] ?? null
        );

        return $this->successResponse(['revoked' => $revoked], 'Entrance QR session revoked successfully');
    }

    // ─── MOBILE QR SCAN ATTENDANCE (EMPLOYEE SCAN) ──────────────────────────
    public function scanQr(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'qr_token'         => 'required|string',
            'device_id'        => 'required|string',
            'device_name'      => 'nullable|string',
            'device_platform'  => 'nullable|string|in:android,ios,web',
            'device_ip'        => 'nullable|string',
            'device_wifi_ssid' => 'nullable|string|max:100',
            'gps_latitude'     => 'nullable|numeric|between:-90,90',
            'gps_longitude'    => 'nullable|numeric|between:-180,180',
            'type'             => 'nullable|string|in:check_in,check_out,auto',
            'employee_id'      => 'nullable|integer|exists:employees,id',
        ]);

        // Determine employee either from authenticated user or explicit employee_id
        if ($request->user() && $request->user()->employee) {
            $employee = $request->user()->employee;
        } elseif (!empty($validated['employee_id'])) {
            $employee = Employee::findOrFail($validated['employee_id']);
        } else {
            // Default to first active employee if testing/simulation
            $employee = Employee::firstOrFail();
        }

        $record = $this->service->scanQrCode($validated, $employee);

        return $this->successResponse(
            new AttendanceResource($record),
            "Attendance successfully recorded via Mobile QR Scan."
        );
    }

    // ─── DASHBOARD STATISTICS API ──────────────────────────────────────────
    public function dashboardStats(Request $request): JsonResponse
    {
        $stats = $this->service->getDashboardStats(
            $request->integer('company_id'),
            $request->integer('branch_id'),
            $request->get('date')
        );

        return $this->successResponse($stats, 'Attendance dashboard metrics retrieved successfully');
    }

    // ─── EXPORT CSV ─────────────────────────────────────────────────────────
    public function export(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $dateRange = $this->resolveExportDateRange($request);
        $rangeSuffix = $dateRange['range'] !== 'all' ? '_' . $dateRange['range'] : '';
        $filename = 'attendances_export_' . ($dateRange['startDate'] ?? now()->format('Y-m-d')) . $rangeSuffix . '.csv';

        $headers = [
            'Content-type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma'              => 'no-cache',
            'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0',
            'Expires'             => '0'
        ];

        $callback = function () use ($request) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($file, ['Employee Number', 'Employee Name', 'Date', 'Check In', 'Check Out', 'Worked Hours', 'Late Minutes', 'Early Leave', 'Overtime', 'Status', 'Device', 'Notes']);

            $query = \App\Models\Employee\Attendance::with(['employee', 'department', 'position']);

            // Apply date range filtering (1_day, 7_days, 1_month, custom, or all)
            $this->applyExportDateRange($query, $request, ['attendance_date', 'date']);

            if ($request->filled('company_id')) {
                $query->where('company_id', $request->integer('company_id'));
            }
            if ($request->filled('branch_id')) {
                $query->where('branch_id', $request->integer('branch_id'));
            }

            $attendances = $query->when($request->search, function($q, $v) {
                $q->whereHas('employee', function($sq) use ($v) {
                    $sq->where('name', 'like', "%{$v}%")
                      ->orWhere('employee_number', 'like', "%{$v}%");
                });
            })->orderBy('attendance_date', 'desc')->get();

            foreach ($attendances as $att) {
                fputcsv($file, [
                    $att->employee?->employee_number ?? '',
                    $att->employee?->name ?? '',
                    $att->attendance_date ? (is_string($att->attendance_date) ? $att->attendance_date : $att->attendance_date->format('Y-m-d')) : ($att->date ? (is_string($att->date) ? $att->date : $att->date->format('Y-m-d')) : ''),
                    $att->check_in ?? '',
                    $att->check_out ?? '',
                    $att->worked_hours_formatted,
                    $att->late_minutes ?? 0,
                    $att->early_leave_minutes ?? 0,
                    $att->overtime_minutes ?? 0,
                    $att->status,
                    $att->device_name ?? 'Web',
                    $att->notes ?? ''
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    // ─── IMPORT CSV ─────────────────────────────────────────────────────────
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt'
        ]);

        $file = $request->file('file');
        $filePath = $file->getRealPath();

        $handle = fopen($filePath, 'r');
        if ($handle === false) {
            return $this->errorResponse('Cannot open the uploaded file.');
        }

        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            rewind($handle);
        }

        $headers = fgetcsv($handle);
        if (!$headers) {
            fclose($handle);
            return $this->errorResponse('Empty CSV file.');
        }

        $headers = array_map(fn($h) => strtolower(trim($h)), $headers);

        $successCount = 0;
        $errors = [];
        $line = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $line++;
            
            if (count($row) < count($headers)) {
                $row = array_pad($row, count($headers), '');
            } elseif (count($row) > count($headers)) {
                $row = array_slice($row, 0, count($headers));
            }

            $data = array_combine($headers, $row);
            if (!$data) {
                $errors[] = "Line {$line}: Mismatched columns count.";
                continue;
            }

            $employee_number = trim($data['employee_number'] ?? $data['employee number'] ?? '');
            $date = trim($data['date'] ?? '');
            $check_in = trim($data['check_in'] ?? $data['check in'] ?? '');
            $check_out = trim($data['check_out'] ?? $data['check out'] ?? '');
            $status = strtolower(trim($data['status'] ?? 'present'));
            $notes = trim($data['notes'] ?? '');

            if (empty($employee_number) || empty($date)) {
                $errors[] = "Line {$line}: Employee Number and Date are required.";
                continue;
            }

            $emp = Employee::where('employee_number', $employee_number)->first();
            if (!$emp) {
                $errors[] = "Line {$line}: Employee with number '{$employee_number}' not found.";
                continue;
            }

            $this->service->create([
                'company_id'      => $emp->company_id,
                'branch_id'       => $emp->branch_id,
                'employee_id'     => $emp->id,
                'department_id'   => $emp->department_id,
                'position_id'     => $emp->position_id,
                'attendance_date' => $date,
                'date'            => $date,
                'check_in'        => $check_in ?: null,
                'check_out'       => $check_out ?: null,
                'status'          => in_array($status, ['present', 'absent', 'late', 'leave', 'holiday']) ? $status : 'present',
                'notes'           => $notes ?: null
            ]);

            $successCount++;
        }

        fclose($handle);

        return $this->successResponse([
            'success_count' => $successCount,
            'errors'        => $errors
        ], "Import completed. {$successCount} records imported successfully.");
    }
}
