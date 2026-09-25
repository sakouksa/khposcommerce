<?php

use App\Enums\CurrencyCode;
use App\Format\GlobalFormat;
use App\Format\ValueObjects\Money;
use App\Format\ValueObjects\PhoneNumber;

if (!function_exists('format_money')) {
    /**
     * Format money into localized currency string.
     */
    function format_money(float|int|string $amount, string|CurrencyCode $currency = 'USD', bool $withSymbol = true): string
    {
        return GlobalFormat::money($amount, $currency, $withSymbol);
    }
}

if (!function_exists('money')) {
    /**
     * Create a Money value object.
     */
    function money(float|int|string $amount, string|CurrencyCode $currency = 'USD'): Money
    {
        return GlobalFormat::moneyObject($amount, $currency);
    }
}

if (!function_exists('format_phone')) {
    /**
     * Format phone number for local display (e.g. 012 345 678).
     */
    function format_phone(?string $phone, bool $canonical = false): ?string
    {
        return $canonical ? GlobalFormat::phone($phone) : GlobalFormat::phoneLocal($phone);
    }
}

if (!function_exists('canonical_phone')) {
    /**
     * Alias for canonical E.164 phone normalization.
     */
    function canonical_phone(?string $phone): ?string
    {
        return GlobalFormat::phone($phone);
    }
}

if (!function_exists('phone_obj')) {
    /**
     * Create a PhoneNumber value object.
     */
    function phone_obj(?string $phone): PhoneNumber
    {
        return GlobalFormat::phoneObject($phone);
    }
}

if (!function_exists('format_date')) {
    /**
     * Format date using API Y-m-d standard in Asia/Phnom_Penh.
     */
    function format_date(mixed $date): ?string
    {
        return GlobalFormat::date($date);
    }
}

if (!function_exists('format_bytes')) {
    /**
     * Format bytes into human readable format (MB, GB).
     */
    function format_bytes(int|float $bytes): string
    {
        return GlobalFormat::bytes($bytes);
    }
}

if (!function_exists('format_status_badge')) {
    /**
     * Format status with label and CSS color badge.
     */
    function format_status_badge(mixed $status): array
    {
        return GlobalFormat::statusBadge($status);
    }
}
