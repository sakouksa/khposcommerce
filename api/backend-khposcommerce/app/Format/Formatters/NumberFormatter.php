<?php

namespace App\Format\Formatters;

class NumberFormatter
{
    /**
     * Normalize decimal to controlled precision (default 2 for currency/cost/price).
     */
    public static function decimal(mixed $val, int $precision = 2): float
    {
        return round((float) $val, $precision);
    }

    /**
     * Normalize integer (for quantity, stock counts).
     */
    public static function integer(mixed $val): int
    {
        return (int) round((float) $val);
    }

    /**
     * Normalize quantity (precision 3 for fractional kg/meters/liters).
     */
    public static function quantity(mixed $val, int $precision = 3): float
    {
        return round((float) $val, $precision);
    }

    /**
     * Normalize weight in kg (precision 3).
     */
    public static function weight(mixed $val, int $precision = 3): float
    {
        return round((float) $val, $precision);
    }

    /**
     * Normalize percentage (precision 2, e.g. 10.50%).
     */
    public static function percentage(mixed $val, int $precision = 2): float
    {
        return round((float) $val, $precision);
    }

    /**
     * Normalize currency exchange rate (precision 4, e.g. 4100.0000 or 1.0750).
     */
    public static function exchangeRate(mixed $val, int $precision = 4): float
    {
        return round((float) $val, $precision);
    }

    /**
     * Format number into display string with thousands separators.
     */
    public static function formatDisplay(mixed $val, int $precision = 2): string
    {
        return number_format((float) $val, $precision, '.', ',');
    }
}
