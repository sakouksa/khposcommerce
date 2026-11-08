<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait Filterable
{
    /**
     * Scope query to filter by active status or trash state.
     * Supports: 'active', 'inactive', '1', '0', true, false, 'deleted', 'trashed', 'all'.
     */
    public function scopeFilterStatus(Builder $query, mixed $status, string $column = 'is_active'): Builder
    {
        if ($status === null || $status === '' || $status === 'all') {
            return $query;
        }

        if ($status === 'deleted' || $status === 'trashed') {
            if (method_exists($this, 'onlyTrashed')) {
                return $query->onlyTrashed();
            }
            return $query;
        }

        if ($status === 'active' || $status === '1' || $status === 1 || $status === true || $status === 'true') {
            return $query->where($this->qualifyColumn($column), true);
        }

        if ($status === 'inactive' || $status === '0' || $status === 0 || $status === false || $status === 'false') {
            return $query->where($this->qualifyColumn($column), false);
        }

        return $query;
    }

    /**
     * Scope query to perform search across multiple columns.
     */
    public function scopeFilterSearch(Builder $query, ?string $search, array $columns): Builder
    {
        $term = trim((string) $search);
        if ($term === '' || empty($columns)) {
            return $query;
        }

        return $query->where(function (Builder $subQuery) use ($term, $columns) {
            foreach ($columns as $index => $column) {
                if (str_contains($column, '.')) {
                    [$relation, $relColumn] = explode('.', $column, 2);
                    if ($index === 0) {
                        $subQuery->whereHas($relation, fn(Builder $rq) => $rq->where($relColumn, 'like', "%{$term}%"));
                    } else {
                        $subQuery->orWhereHas($relation, fn(Builder $rq) => $rq->where($relColumn, 'like', "%{$term}%"));
                    }
                } else {
                    if ($index === 0) {
                        $subQuery->where($column, 'like', "%{$term}%");
                    } else {
                        $subQuery->orWhere($column, 'like', "%{$term}%");
                    }
                }
            }
        });
    }

    /**
     * Scope query to safely sort by an allowed list of columns.
     */
    public function scopeFilterSort(
        Builder $query,
        ?string $sortBy,
        ?string $sortOrder = 'desc',
        array $allowedColumns = ['id', 'created_at'],
        string $defaultSort = 'id'
    ): Builder {
        $sort = in_array($sortBy, $allowedColumns, true) ? $sortBy : $defaultSort;
        $order = in_array(strtolower((string) $sortOrder), ['asc', 'desc'], true) ? strtolower((string) $sortOrder) : 'desc';

        return $query->orderBy($sort, $order);
    }
}
