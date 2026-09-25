<?php

namespace App\Services\Employee;

use App\Repositories\Employee\PayrollRepository;
use App\Models\Employee\Payroll;
use App\Models\Employee\Employee;
use App\Models\Employee\Attendance;
use App\Models\Sales\Sale;
use App\Models\Company\Company;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PayrollService
{
    public function __construct(private readonly PayrollRepository $repository)
    {
    }

    public function getAll(array $relations = []): Collection
    {
        return $this->repository->all(relations: $relations);
    }

    public function getPaginated(int $perPage = 15, array $filters = [], string $sort = 'period_month', string $order = 'desc'): LengthAwarePaginator
    {
        return $this->repository->paginateWithFilters($filters, $perPage, $sort, $order);
    }

    public function getById(int|string $id, array $relations = ['employee', 'employee.department', 'employee.position', 'employee.branch']): Payroll
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): Payroll
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): Payroll
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }

    public function bulkDelete(array $ids): int
    {
        return $this->repository->bulkDelete($ids);
    }

    /**
     * Auto-generate Monthly Payroll for all active employees
     */
    public function autoGenerateMonthlyPayroll(string $periodMonth, ?int $companyId = null, ?int $branchId = null): array
    {
        $query = Employee::where('status', 'active');
        if ($companyId) $query->where('company_id', $companyId);
        if ($branchId) $query->where('branch_id', $branchId);

        $employees = $query->with(['department', 'position'])->get();
        $generatedCount = 0;
        $totalGross = 0;
        $totalNet = 0;
        $totalCommission = 0;
        $totalNssf = 0;
        $totalTax = 0;

        $startDate = Carbon::parse($periodMonth . '-01')->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();
        $standardWorkingDays = 22;
        $items = [];

        foreach ($employees as $employee) {
            $basicSalary = (float) $employee->basic_salary;
            if ($basicSalary <= 0) $basicSalary = 350.00; // fallback standard minimum

            // 1. Calculate Attendance & Overtime
            $attendances = Attendance::where('employee_id', $employee->id)
                ->where(function ($q) use ($startDate, $endDate) {
                    $q->whereBetween('attendance_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                      ->orWhereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);
                })
                ->get();

            $presentDays = $attendances->whereIn('status', ['present', 'late'])->count();
            if ($presentDays === 0) {
                // If no attendance records logged, default to standard present days for active staff
                $presentDays = $standardWorkingDays;
            }

            $totalOvertimeMinutes = $attendances->sum('overtime_minutes');
            $hourlyRate = ($basicSalary / $standardWorkingDays) / 8;
            $overtimePay = round(($totalOvertimeMinutes / 60) * $hourlyRate * 1.5, 2);

            // 2. Calculate POS Sales Commission
            $salesCommission = 0.00;
            if ($employee->user_id && $employee->sales_commission_rate > 0) {
                $totalSales = Sale::where('user_id', $employee->user_id)
                    ->where('status', 'completed')
                    ->whereBetween('date', [$startDate->format('Y-m-d 00:00:00'), $endDate->format('Y-m-d 23:59:59')])
                    ->sum('grand_total');

                $salesCommission = round($totalSales * ((float) $employee->sales_commission_rate / 100), 2);
            }

            // 3. Seniority Pay (Cambodia Labor Law: June & Dec for UDC contract)
            $seniorityPay = 0.00;
            $monthNum = (int) $startDate->format('m');
            if (($monthNum === 6 || $monthNum === 12) && ($employee->contract_type === 'udc' || empty($employee->contract_type))) {
                $seniorityPay = round(($basicSalary / 22) * 7.5, 2);
            }

            $allowances = 0.00; // Standard meal/transport allowance if configured

            // 4. Calculate Cambodia NSSF (Pension 2% on max $300 cap)
            $nssfDeduction = 0.00;
            if ($employee->has_nssf) {
                $nssfBase = min($basicSalary, 300.00);
                $nssfDeduction = round($nssfBase * 0.02, 2);
            }

            // 5. Calculate Cambodia Tax on Salary
            $taxableIncome = ($basicSalary + $allowances + $overtimePay + $salesCommission) - $nssfDeduction;
            $dependentsDeduction = (int) $employee->dependents_count * 37.50; // ~150,000 KHR per dependent
            $taxableBase = max(0, $taxableIncome - $dependentsDeduction);

            $taxDeduction = $this->calculateCambodiaSalaryTax($taxableBase);

            $deductions = 0.00;
            $netSalary = round($basicSalary + $allowances + $overtimePay + $salesCommission + $seniorityPay - $deductions - $nssfDeduction - $taxDeduction, 2);

            // Bank Snapshot
            $bankSnapshot = null;
            $hasValidBank = !empty($employee->bank_account_number) && strlen(trim($employee->bank_account_number)) >= 6;
            if ($employee->bank_name && $employee->bank_account_number) {
                $bankSnapshot = "{$employee->bank_name} - {$employee->bank_account_number} ({$employee->bank_account_holder})";
            }

            $payroll = Payroll::updateOrCreate(
                [
                    'employee_id'  => $employee->id,
                    'period_month' => $periodMonth,
                ],
                [
                    'working_days'          => $standardWorkingDays,
                    'present_days'          => $presentDays,
                    'basic_salary'          => $basicSalary,
                    'allowances'            => $allowances,
                    'overtime_pay'          => $overtimePay,
                    'sales_commission'      => $salesCommission,
                    'seniority_pay'         => $seniorityPay,
                    'deductions'            => $deductions,
                    'nssf_deduction'        => $nssfDeduction,
                    'tax_deduction'         => $taxDeduction,
                    'net_salary'            => $netSalary,
                    'status'                => 'draft',
                    'payment_method'        => 'bank_transfer',
                    'bank_account_snapshot' => $bankSnapshot,
                    'notes'                 => "Auto-calculated: {$presentDays} days worked, {$totalOvertimeMinutes}m OT, " . ($salesCommission > 0 ? "Commission \${$salesCommission}" : "No commission"),
                ]
            );

            $generatedCount++;
            $totalGross += ($basicSalary + $allowances + $overtimePay + $salesCommission + $seniorityPay);
            $totalNet += $netSalary;
            $totalCommission += $salesCommission;
            $totalNssf += $nssfDeduction;
            $totalTax += $taxDeduction;

            $items[] = [
                'id'                   => $payroll->id,
                'employee_id'          => $employee->id,
                'employee_name'        => $employee->name,
                'employee_number'      => $employee->employee_number,
                'department'           => $employee->department?->name ?? 'General',
                'position'             => $employee->position?->name ?? 'Staff',
                'basic_salary'         => $basicSalary,
                'overtime_pay'         => $overtimePay,
                'sales_commission'     => $salesCommission,
                'nssf_deduction'       => $nssfDeduction,
                'tax_deduction'        => $taxDeduction,
                'net_salary'           => $netSalary,
                'bank_name'            => $employee->bank_name ?? 'ABA Bank',
                'bank_account_number'  => $employee->bank_account_number,
                'has_valid_bank'       => $hasValidBank,
            ];
        }

        return [
            'period_month'     => $periodMonth,
            'generated_count'  => $generatedCount,
            'total_gross'      => round($totalGross, 2),
            'total_net'        => round($totalNet, 2),
            'total_commission' => round($totalCommission, 2),
            'total_nssf'       => round($totalNssf, 2),
            'total_tax'        => round($totalTax, 2),
            'items'            => $items,
        ];
    }

    /**
     * Progressive Cambodian Tax on Salary Bracket Calculation (USD)
     */
    private function calculateCambodiaSalaryTax(float $taxableBase): float
    {
        if ($taxableBase <= 375.00) {
            return 0.00;
        } elseif ($taxableBase <= 500.00) {
            return round(($taxableBase - 375.00) * 0.05, 2);
        } elseif ($taxableBase <= 2125.00) {
            return round((125.00 * 0.05) + (($taxableBase - 500.00) * 0.10), 2);
        } elseif ($taxableBase <= 3125.00) {
            return round((125.00 * 0.05) + (1625.00 * 0.10) + (($taxableBase - 2125.00) * 0.15), 2);
        } else {
            return round((125.00 * 0.05) + (1625.00 * 0.10) + (1000.00 * 0.15) + (($taxableBase - 3125.00) * 0.20), 2);
        }
    }

    /**
     * Generate Payslip details
     */
    public function getPayslipData(int $payrollId): array
    {
        $payroll = Payroll::with([
            'employee.company',
            'employee.branch',
            'employee.department',
            'employee.position',
        ])->findOrFail($payrollId);

        $emp = $payroll->employee;
        $khrExchangeRate = 4100; // Standard USD to KHR conversion rate
        $grossSalary = (float) $payroll->basic_salary + (float) $payroll->allowances + (float) $payroll->overtime_pay + (float) $payroll->sales_commission + (float) $payroll->seniority_pay;
        $totalDeductions = (float) $payroll->deductions + (float) $payroll->nssf_deduction + (float) $payroll->tax_deduction;

        return [
            'payslip_number'   => 'PS-' . str_replace('-', '', $payroll->period_month) . '-' . str_pad($payroll->id, 4, '0', STR_PAD_LEFT),
            'period_month'     => $payroll->period_month,
            'issue_date'       => $payroll->paid_at ? $payroll->paid_at->format('Y-m-d') : now()->format('Y-m-d'),
            'status'           => $payroll->status,
            'company'          => [
                'name'    => $emp->company?->name ?? 'Enterprise POS & E-Commerce',
                'address' => $emp->company?->address ?? 'Phnom Penh, Cambodia',
                'phone'   => $emp->company?->phone ?? '+855 23 999 888',
                'email'   => $emp->company?->email ?? 'info@enterprise-pos.com',
                'logo'    => $emp->company?->logo,
            ],
            'employee'         => [
                'id'              => $emp->id,
                'name'            => $emp->name,
                'employee_number' => $emp->employee_number,
                'department'      => $emp->department?->name ?? 'General',
                'position'        => $emp->position?->name ?? 'Staff',
                'branch'          => $emp->branch?->name ?? 'Headquarters',
                'join_date'       => $emp->join_date?->format('Y-m-d'),
                'bank_name'       => $emp->bank_name ?? 'ABA Bank',
                'bank_account_no' => $emp->bank_account_number ?? '000 123 456',
                'bank_holder'     => $emp->bank_account_holder ?? $emp->name,
                'nssf_number'     => $emp->nssf_number ?? 'NSSF-'.str_pad($emp->id, 6, '0', STR_PAD_LEFT),
            ],
            'work_summary'     => [
                'working_days' => $payroll->working_days,
                'present_days' => $payroll->present_days,
                'payment_date' => $payroll->paid_at?->format('Y-m-d'),
            ],
            'earnings'         => [
                'basic_salary'     => (float) $payroll->basic_salary,
                'allowances'       => (float) $payroll->allowances,
                'overtime_pay'     => (float) $payroll->overtime_pay,
                'sales_commission' => (float) $payroll->sales_commission,
                'seniority_pay'    => (float) $payroll->seniority_pay,
                'total_earnings'   => $grossSalary,
            ],
            'deductions'       => [
                'nssf_deduction'   => (float) $payroll->nssf_deduction,
                'tax_deduction'    => (float) $payroll->tax_deduction,
                'other_deductions' => (float) $payroll->deductions,
                'total_deductions' => $totalDeductions,
            ],
            'net_salary'       => (float) $payroll->net_salary,
            'net_salary_khr'   => round((float) $payroll->net_salary * $khrExchangeRate, 0),
            'currency'         => 'USD',
            'exchange_rate'    => $khrExchangeRate,
            'notes'            => $payroll->notes,
        ];
    }

    /**
     * Get ABA Bulk Transfer Preview & Readiness Report
     */
    public function getAbaBulkPreview(string $periodMonth, ?string $debitAccount = null): array
    {
        $payrolls = Payroll::with(['employee.department', 'employee.position', 'employee.branch'])
            ->where('period_month', $periodMonth)
            ->get();

        $companyDebitAccount = $debitAccount ?: '000123456';
        $totalCount = $payrolls->count();
        $totalAmount = 0.0;
        $readyCount = 0;
        $readyAmount = 0.0;
        $missingCount = 0;
        $missingAmount = 0.0;
        $items = [];

        foreach ($payrolls as $p) {
            $emp = $p->employee;
            if (!$emp) continue;

            $net = (float) $p->net_salary;
            $totalAmount += $net;

            $bankAccount = trim((string) ($emp->bank_account_number ?? ''));
            $isValidAba = !empty($bankAccount) && strlen($bankAccount) >= 6 && $bankAccount !== '000000000';

            if ($isValidAba) {
                $readyCount++;
                $readyAmount += $net;
            } else {
                $missingCount++;
                $missingAmount += $net;
            }

            $items[] = [
                'id'                   => $p->id,
                'employee_id'          => $emp->id,
                'employee_name'        => $emp->name,
                'employee_number'      => $emp->employee_number,
                'department'           => $emp->department?->name ?? 'General',
                'position'             => $emp->position?->name ?? 'Staff',
                'net_salary'           => $net,
                'bank_name'            => $emp->bank_name ?: 'ABA Bank',
                'bank_account_number'  => $bankAccount ?: '-',
                'bank_account_holder'  => $emp->bank_account_holder ?: $emp->name,
                'phone'                => $emp->phone ?? '',
                'is_valid_aba'         => $isValidAba,
                'status'               => $p->status,
            ];
        }

        return [
            'period_month'          => $periodMonth,
            'company_debit_account' => $companyDebitAccount,
            'total_count'           => $totalCount,
            'total_amount'          => round($totalAmount, 2),
            'ready_count'           => $readyCount,
            'ready_amount'          => round($readyAmount, 2),
            'missing_count'         => $missingCount,
            'missing_amount'        => round($missingAmount, 2),
            'items'                 => $items,
        ];
    }

    /**
     * Export ABA Bank Bulk Payment CSV
     */
    public function generateAbaBulkCsv(
        string $periodMonth,
        ?string $debitAccount = null,
        bool $excludeMissing = true,
        bool $markAsPaid = false
    ): string {
        $payrolls = Payroll::with('employee')
            ->where('period_month', $periodMonth)
            ->get();

        $companyDebitAccount = !empty($debitAccount) ? trim($debitAccount) : '000123456';
        $rows = [];
        $rows[] = ['Debit Account', 'Beneficiary Account', 'Beneficiary Name', 'Amount (USD)', 'Currency', 'Payment Details', 'Beneficiary Phone'];

        foreach ($payrolls as $p) {
            $emp = $p->employee;
            if (!$emp) continue;

            $bankAccount = trim((string) ($emp->bank_account_number ?? ''));
            $isValid = !empty($bankAccount) && strlen($bankAccount) >= 6 && $bankAccount !== '000000000';

            if ($excludeMissing && !$isValid) {
                continue;
            }

            // Clean beneficiary name for ABA Bank (uppercase ASCII, remove accents/punctuations)
            $holder = !empty($emp->bank_account_holder) ? $emp->bank_account_holder : $emp->name;
            $cleanHolder = strtoupper(preg_replace('/[^A-Za-z0-9\s]/', '', $holder));
            if (empty($cleanHolder)) {
                $cleanHolder = strtoupper($emp->name);
            }

            $details = substr("Salary {$periodMonth} for {$emp->employee_number}", 0, 50);

            $rows[] = [
                $companyDebitAccount,
                $isValid ? $bankAccount : '000000000',
                $cleanHolder,
                number_format((float) $p->net_salary, 2, '.', ''),
                'USD',
                $details,
                $emp->phone ?? '',
            ];

            if ($markAsPaid) {
                $p->update([
                    'status'  => 'paid',
                    'paid_at' => now(),
                ]);
            }
        }

        $output = fopen('php://temp', 'r+');
        foreach ($rows as $row) {
            fputcsv($output, $row);
        }
        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }
}
