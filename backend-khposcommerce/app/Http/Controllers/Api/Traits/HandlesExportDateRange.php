<?php

namespace App\Http\Controllers\Api\Traits;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait HandlesExportDateRange
{
    /**
     * Resolve date boundaries from Request parameters:
     * - range: '1_day' | 'today' | '7_days' | 'week' | '1_month' | 'month' | 'this_month' | 'all'
     * - date_from / date_to (or date_start / date_end)
     * - date
     *
     * @return array{startDate: ?string, endDate: ?string, range: string}
     */
    protected function resolveExportDateRange(Request $request): array
    {
        $range = $request->input('range', 'all');
        $dateFrom = $request->input('date_from', $request->input('date_start'));
        $dateTo = $request->input('date_to', $request->input('date_end'));
        $specificDate = $request->input('date');

        if ($specificDate) {
            return [
                'startDate' => Carbon::parse($specificDate)->format('Y-m-d'),
                'endDate'   => Carbon::parse($specificDate)->format('Y-m-d'),
                'range'     => '1_day',
            ];
        }

        if ($range === '1_day' || $range === 'today') {
            $today = Carbon::today()->format('Y-m-d');
            return [
                'startDate' => $today,
                'endDate'   => $today,
                'range'     => '1_day',
            ];
        }

        if ($range === '7_days' || $range === 'week') {
            return [
                'startDate' => Carbon::today()->subDays(6)->format('Y-m-d'),
                'endDate'   => Carbon::today()->format('Y-m-d'),
                'range'     => '7_days',
            ];
        }

        if ($range === '1_month' || $range === 'month' || $range === 'this_month') {
            return [
                'startDate' => Carbon::today()->startOfMonth()->format('Y-m-d'),
                'endDate'   => Carbon::today()->format('Y-m-d'),
                'range'     => '1_month',
            ];
        }

        if ($dateFrom && $dateTo) {
            return [
                'startDate' => Carbon::parse($dateFrom)->format('Y-m-d'),
                'endDate'   => Carbon::parse($dateTo)->format('Y-m-d'),
                'range'     => 'custom',
            ];
        }

        if ($dateFrom) {
            return [
                'startDate' => Carbon::parse($dateFrom)->format('Y-m-d'),
                'endDate'   => null,
                'range'     => 'custom',
            ];
        }

        return [
            'startDate' => null,
            'endDate'   => null,
            'range'     => 'all',
        ];
    }

    /**
     * Apply date range filtering on an Eloquent query for date or datetime columns.
     */
    protected function applyExportDateRange(Builder $query, Request $request, string|array $dateColumns = 'created_at'): Builder
    {
        $dates = $this->resolveExportDateRange($request);
        $startDate = $dates['startDate'];
        $endDate = $dates['endDate'];

        if (!$startDate && !$endDate) {
            return $query;
        }

        $columns = is_array($dateColumns) ? $dateColumns : [$dateColumns];

        $query->where(function (Builder $subQuery) use ($columns, $startDate, $endDate) {
            foreach ($columns as $idx => $column) {
                $method = $idx === 0 ? 'where' : 'orWhere';

                $subQuery->$method(function (Builder $colQuery) use ($column, $startDate, $endDate) {
                    if ($startDate && $endDate) {
                        if ($startDate === $endDate) {
                            $colQuery->whereDate($column, $startDate);
                        } else {
                            $colQuery->where(function ($q) use ($column, $startDate, $endDate) {
                                $q->whereBetween($column, [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                                  ->orWhereBetween($column, [$startDate, $endDate]);
                            });
                        }
                    } elseif ($startDate) {
                        $colQuery->whereDate($column, '>=', $startDate);
                    } elseif ($endDate) {
                        $colQuery->whereDate($column, '<=', $endDate);
                    }
                });
            }
        });

        return $query;
    }
}
