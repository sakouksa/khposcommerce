<?php

namespace App\Format\Formatters;

use App\Enums\CurrencyCode;

class MoneyFormatter
{
    /**
     * Format an amount according to currency standards.
     * USD: $1,250.00
     * KHR: ៛5,125,000
     */
    public static function format(
        float|int|string $amount,
        string|CurrencyCode $currency = 'USD',
        bool $withSymbol = true
    ): string {
        $num = (float) $amount;
        $code = is_string($currency) ? strtoupper($currency) : $currency->value;

        if ($code === CurrencyCode::KHR->value) {
            $formatted = number_format(round($num, 0), 0, '.', ',');
            return $withSymbol ? ('៛' . $formatted) : $formatted;
        }

        // Default USD
        $formatted = number_format($num, 2, '.', ',');
        return $withSymbol ? ('$' . $formatted) : $formatted;
    }

    /**
     * Round amount according to enterprise currency precision.
     * USD: 2 decimal places
     * KHR: 0 decimal places
     */
    public static function round(float|int $amount, string|CurrencyCode $currency = 'USD'): float
    {
        $num = (float) $amount;
        $code = is_string($currency) ? strtoupper($currency) : $currency->value;

        if ($code === CurrencyCode::KHR->value) {
            return round($num, 0);
        }

        return round($num, 2);
    }

    /**
     * Convert between USD and KHR using an exchange rate.
     */
    public static function convert(
        float|int $amount,
        float $exchangeRate,
        string|CurrencyCode $toCurrency = 'KHR'
    ): float {
        $num = (float) $amount;
        $to = is_string($toCurrency) ? strtoupper($toCurrency) : $toCurrency->value;

        if ($to === CurrencyCode::KHR->value) {
            return self::round($num * $exchangeRate, 'KHR');
        }

        return self::round($exchangeRate > 0 ? ($num / $exchangeRate) : 0, 'USD');
    }
}
