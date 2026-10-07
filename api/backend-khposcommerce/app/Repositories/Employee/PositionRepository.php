<?php

namespace App\Repositories\Employee;

use App\Repositories\BaseRepository;
use App\Models\Employee\Position;

class PositionRepository extends BaseRepository
{
    public function __construct(Position $model)
    {
        parent::__construct($model);
    }

    public function paginateWithFilters(
        array $filters = [],
        int $perPage = 10,
        string $sort = 'created_at',
        string $order = 'desc'
    ): \Illuminate\Pagination\LengthAwarePaginator {
        $query = $this->model
            ->with(['company:id,name', 'department:id,name'])
            ->withCount(['employees'])
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('name', 'like', "%{$search}%")
                       ->orWhere('code', 'like', "%{$search}%")
                       ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($filters['company_id'] ?? null, fn($q, $v) => $q->where('company_id', $v))
            ->when($filters['department_id'] ?? null, fn($q, $v) => $q->where('department_id', $v))
            ->when(isset($filters['is_active']), function($q) use ($filters) {
                $q->where('is_active', (bool)$filters['is_active']);
            })
            ->when($filters['status'] ?? null, function ($q, $status) {
                if ($status === 'deleted') {
                    $q->onlyTrashed();
                } elseif ($status === 'active') {
                    $q->where('is_active', true);
                } elseif ($status === 'inactive') {
                    $q->where('is_active', false);
                }
            });

        $allowedSorts = ['name', 'code', 'is_active', 'created_at'];
        $sort = in_array($sort, $allowedSorts) ? $sort : 'created_at';

        return $query->orderBy($sort, $order === 'asc' ? 'asc' : 'desc')
                     ->paginate($perPage);
    }
}
