<?php

namespace App\Format\Formatters;

use BackedEnum;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Contracts\Pagination\Paginator;

class StateFormatter
{
    /**
     * Normalize any truthy/falsy value to strict boolean.
     * Examples: '1', 'true', 'yes', 'on', true -> true
     *           '0', 'false', 'no', 'off', null, false -> false
     */
    public static function boolean(mixed $val): bool
    {
        if (is_bool($val)) {
            return $val;
        }

        if (is_numeric($val)) {
            return ((int) $val) === 1;
        }

        if (is_string($val)) {
            $normalized = strtolower(trim($val));
            return in_array($normalized, ['true', '1', 'yes', 'on', 'active'], true);
        }

        return (bool) $val;
    }

    /**
     * Standardize API pagination metadata.
     */
    public static function paginationMeta(mixed $paginator, ?int $page = null, ?int $perPage = null, ?int $total = null): array
    {
        if ($paginator instanceof LengthAwarePaginator) {
            return [
                'current_page' => $paginator->currentPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'last_page'    => $paginator->lastPage(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
                'has_more'     => $paginator->hasMorePages(),
            ];
        }

        if ($paginator instanceof Paginator) {
            return [
                'current_page' => $paginator->currentPage(),
                'per_page'     => $paginator->perPage(),
                'has_more'     => $paginator->hasMorePages(),
            ];
        }

        // Custom manual array / integers
        $currentPage = max(1, $page ?? 1);
        $itemsPerPage = max(1, $perPage ?? 15);
        $totalItems = max(0, $total ?? 0);
        $lastPage = (int) ceil($totalItems / $itemsPerPage);

        return [
            'current_page' => $currentPage,
            'per_page'     => $itemsPerPage,
            'total'        => $totalItems,
            'last_page'    => max(1, $lastPage),
            'has_more'     => $currentPage < $lastPage,
        ];
    }

    /**
     * Standardize business status into a complete badge metadata structure.
     */
    public static function statusBadge(mixed $status): array
    {
        if ($status instanceof BackedEnum) {
            $value = $status->value;
            $label = method_exists($status, 'label') ? $status->label() : ucfirst(str_replace('_', ' ', $value));
            $labelKh = method_exists($status, 'labelKhmer') ? $status->labelKhmer() : $label;
            $color = method_exists($status, 'badgeColor') ? $status->badgeColor() : 'gray';

            return [
                'value'       => $value,
                'label'       => $label,
                'label_khmer' => $labelKh,
                'color'       => $color,
            ];
        }

        $strValue = strtolower(trim((string) $status));
        $label = ucfirst(str_replace('_', ' ', $strValue));

        $color = match ($strValue) {
            'active', 'paid', 'completed', 'delivered', 'available', 'success' => 'success',
            'pending', 'processing', 'shipping', 'partially_paid'              => 'warning',
            'inactive', 'cancelled', 'failed', 'damaged', 'out_of_stock'      => 'danger',
            'refunded', 'returned', 'expired'                                 => 'purple',
            default                                                           => 'secondary',
        };

        return [
            'value'       => $strValue,
            'label'       => $label,
            'label_khmer' => $label,
            'color'       => $color,
        ];
    }

    /**
     * Clean and ensure valid JSON metadata array.
     */
    public static function cleanJson(mixed $data): array
    {
        if (empty($data)) {
            return [];
        }

        if (is_array($data)) {
            return $data;
        }

        if (is_string($data)) {
            $decoded = json_decode($data, true);
            return is_array($decoded) ? $decoded : [];
        }

        return (array) $data;
    }

    /**
     * Serialize array/object into uniform JSON string.
     */
    public static function toJson(mixed $data, bool $pretty = false): string
    {
        $flags = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES;
        if ($pretty) {
            $flags |= JSON_PRETTY_PRINT;
        }

        return (string) json_encode($data, $flags);
    }
}
