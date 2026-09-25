<?php

namespace App\Http\Controllers\Api\V1\Admin\Employee;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Employee\CreatePayrollRequest;
use App\Http\Requests\Employee\UpdatePayrollRequest;
use App\Http\Resources\Employee\PayrollResource;
use App\Services\Employee\PayrollService;
use App\Models\Employee\Employee;
use App\Models\Employee\Payroll;
use App\Services\Support\CsvService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpFoundation\Response;

class PayrollController extends BaseApiController
{
    public function __construct(
        private readonly PayrollService $service,
        protected CsvService $csvService
    ) {}

    public function index(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('payroll.view')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $records = $this->service->getPaginated(
            $request->integer('per_page', 10),
            $request->all(),
            $request->get('sort_by', 'period_month'),
            $request->get('sort_order', 'desc')
        );

        return $this->paginatedResourceResponse(
            PayrollResource::collection($records),
            $records,
            'Payroll list retrieved successfully'
        );
    }

    public function store(CreatePayrollRequest $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('payroll.create')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new PayrollResource($record),
            'Payroll created successfully',
            201
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        if ($request->user() && !$request->user()->can('payroll.view')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $record = $this->service->getById($id);
        return $this->successResponse(
            new PayrollResource($record),
            'Payroll details retrieved successfully'
        );
    }

    public function update(UpdatePayrollRequest $request, int $id): JsonResponse
    {
        if ($request->user() && !$request->user()->can('payroll.update')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new PayrollResource($record),
            'Payroll updated successfully'
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        if ($request->user() && !$request->user()->can('payroll.delete')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $this->service->delete($id);
        return $this->successResponse(
            null,
            'Payroll deleted successfully'
        );
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('payroll.delete')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $ids = $request->validate(['ids' => 'required|array'])['ids'];
        $count = $this->service->bulkDelete($ids);

        return $this->successResponse(
            null,
            "{$count} payroll records deleted successfully"
        );
    }

    /**
     * Auto-Generate Monthly Payroll for all active employees
     */
    public function autoGenerate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'period_month' => 'required|string|regex:/^\d{4}-\d{2}$/',
            'company_id'   => 'nullable|integer|exists:companies,id',
            'branch_id'    => 'nullable|integer|exists:branches,id',
        ]);

        $result = $this->service->autoGenerateMonthlyPayroll(
            $validated['period_month'],
            $validated['company_id'] ?? null,
            $validated['branch_id'] ?? null
        );

        return $this->successResponse(
            $result,
            "Successfully generated/updated payroll for {$result['generated_count']} employees for month {$result['period_month']}."
        );
    }

    /**
     * Get Printable Payslip Details
     */
    public function getPayslip(Request $request, int $id): JsonResponse
    {
        $data = $this->service->getPayslipData($id);
        return $this->successResponse($data, 'Payslip retrieved successfully');
    }

    /**
     * Get ABA Bulk Transfer Readiness Preview
     */
    public function abaPreview(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('payroll.view')) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $periodMonth = $request->get('period_month', now()->format('Y-m'));
        $debitAccount = $request->get('debit_account');
        $preview = $this->service->getAbaBulkPreview($periodMonth, $debitAccount);

        return $this->successResponse($preview, 'ABA Bulk Preview retrieved successfully');
    }

    /**
     * Export ABA Bank Bulk Transfer CSV
     */
    public function exportAbaBulk(Request $request): Response
    {
        if ($request->user() && !$request->user()->can('payroll.view')) {
            return response('Unauthorized', 403);
        }

        $periodMonth = $request->get('period_month', now()->format('Y-m'));
        $debitAccount = $request->get('debit_account');
        $excludeMissing = filter_var($request->get('exclude_missing', true), FILTER_VALIDATE_BOOLEAN);
        $markAsPaid = filter_var($request->get('mark_paid', false), FILTER_VALIDATE_BOOLEAN);

        $csvContent = $this->service->generateAbaBulkCsv($periodMonth, $debitAccount, $excludeMissing, $markAsPaid);

        $filename = "ABA_Bulk_Payroll_{$periodMonth}.csv";

        return response($csvContent, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $records = $this->service->getAll(['employee.department', 'employee.position', 'employee.branch']);

        $columns = [
            'period_month'          => 'Period Month',
            'employee.name'         => 'Employee Name',
            'employee.employee_number' => 'Employee Number',
            'employee.department.name' => 'Department',
            'employee.position.name'   => 'Position',
            'working_days'          => 'Working Days',
            'present_days'          => 'Present Days',
            'basic_salary'          => 'Basic Salary ($)',
            'allowances'            => 'Allowances ($)',
            'overtime_pay'          => 'Overtime Pay ($)',
            'sales_commission'      => 'Sales Commission ($)',
            'seniority_pay'         => 'Seniority Pay ($)',
            'deductions'            => 'Other Deductions ($)',
            'nssf_deduction'        => 'NSSF Deduction ($)',
            'tax_deduction'         => 'Salary Tax ($)',
            'net_salary'            => 'Net Salary ($)',
            'status'                => 'Status',
            'payment_method'        => 'Payment Method',
            'bank_account_snapshot' => 'Bank Account',
            'paid_at'               => 'Paid At',
        ];

        return $this->csvService->export($records, $columns, 'payrolls-' . date('Y-m-d') . '.csv');
    }
}
