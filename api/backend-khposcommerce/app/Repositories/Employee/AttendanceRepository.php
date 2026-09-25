<?php

namespace App\Repositories\Employee;

use App\Repositories\BaseRepository;
use App\Models\Employee\Attendance;

class AttendanceRepository extends BaseRepository
{
    public function __construct(Attendance $model)
    {
        parent::__construct($model);
    }

    public function paginateWithFilters(
        array $filters = [],
        int $perPage = 10,
        string $sort = 'date',
        string $order = 'desc'
    ): \Illuminate\Pagination\LengthAwarePaginator {
        $query = $this->model
            ->with([
                'employee:id,name,employee_number,photo,department_id,position_id',
                'employee.department:id,name',
                'employee.position:id,name'
            ])
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->whereHas('employee', function ($sq) use ($search) {
                    $sq->where('name', 'like', "%{$search}%")
                       ->orWhere('employee_number', 'like', "%{$search}%");
                });
            })
            ->when($filters['company_id'] ?? null, function ($q, $v) {
                $q->whereHas('employee', fn($sq) => $sq->where('company_id', $v));
            })
            ->when($filters['branch_id'] ?? null, function ($q, $v) {
                $q->whereHas('employee', fn($sq) => $sq->where('branch_id', $v));
            })
            ->when($filters['department_id'] ?? null, function ($q, $v) {
                $q->whereHas('employee', fn($sq) => $sq->where('department_id', $v));
            })
            ->when($filters['position_id'] ?? null, function ($q, $v) {
                $q->whereHas('employee', fn($sq) => $sq->where('position_id', $v));
            })
            ->when($filters['employee_id'] ?? null, fn($q, $v) => $q->where('employee_id', $v))
            ->when($filters['month'] ?? null, function ($q, $m) {
                try {
                    $start = \Carbon\Carbon::parse($m . '-01')->startOfMonth()->format('Y-m-d');
                    $end   = \Carbon\Carbon::parse($m . '-01')->endOfMonth()->format('Y-m-d');
                    $q->where(function($sq) use ($start, $end) {
                        $sq->whereBetween('attendance_date', [$start, $end])
                           ->orWhereBetween('date', [$start, $end]);
                    });
                } catch (\Exception $e) {
                    // ignore
                }
            })
            ->when($filters['date'] ?? null, fn($q, $v) => $q->where('date', $v))
            ->when($filters['date_start'] ?? null, fn($q, $v) => $q->where('date', '>=', $v))
            ->when($filters['date_end'] ?? null, fn($q, $v) => $q->where('date', '<=', $v))
            ->when($filters['status'] ?? null, fn($q, $v) => $q->where('status', $v));

        $allowedSorts = ['date', 'check_in', 'check_out', 'status', 'created_at'];
        $sort = in_array($sort, $allowedSorts) ? $sort : 'date';

        return $query->orderBy($sort, $order === 'asc' ? 'asc' : 'desc')
                     ->paginate($perPage);
    }
}
