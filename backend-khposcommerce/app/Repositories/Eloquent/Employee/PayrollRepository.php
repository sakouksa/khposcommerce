<?php

namespace App\Repositories\Eloquent\Employee;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Employee\Payroll;

class PayrollRepository extends BaseRepository
{
    public function __construct(Payroll $model)
    {
        parent::__construct($model);
    }

    public function paginateWithFilters(
        array $filters = [],
        int $perPage = 10,
        string $sort = 'period_month',
        string $order = 'desc'
    ): \Illuminate\Pagination\LengthAwarePaginator {
        $user = auth()->user();
        $companyId = (int) ($user?->company_id ?? 1);
        $branchIds = $user?->accessibleBranchIds() ?? [];

        $query = $this->model
            ->with(['employee:id,name,employee_number,photo,basic_salary'])
            ->whereHas('employee', function ($sq) use ($companyId, $branchIds, $filters) {
                $sq->where('company_id', $companyId)
                   ->whereIn('branch_id', $branchIds);

                if (!empty($filters['branch_id']) && $filters['branch_id'] !== 'all') {
                    $sq->where('branch_id', (int) $filters['branch_id']);
                }
            })
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->whereHas('employee', function ($sq) use ($search) {
                    $sq->where('name', 'like', "%{$search}%")
                       ->orWhere('employee_number', 'like', "%{$search}%");
                });
            })
            ->when($filters['department_id'] ?? null, function ($q, $v) {
                $q->whereHas('employee', fn($sq) => $sq->where('department_id', $v));
            })
            ->when($filters['position_id'] ?? null, function ($q, $v) {
                $q->whereHas('employee', fn($sq) => $sq->where('position_id', $v));
            })
            ->when($filters['employee_id'] ?? null, fn($q, $v) => $q->where('employee_id', $v))
            ->when($filters['period_month'] ?? null, fn($q, $v) => $q->where('period_month', $v))
            ->when($filters['status'] ?? null, fn($q, $v) => $q->where('status', $v));

        $allowedSorts = ['period_month', 'basic_salary', 'net_salary', 'status', 'paid_at', 'created_at'];
        $sort = in_array($sort, $allowedSorts) ? $sort : 'period_month';

        return $query->orderBy($sort, $order === 'asc' ? 'asc' : 'desc')
                     ->paginate($perPage);
    }
}
