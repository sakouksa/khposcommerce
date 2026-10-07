<?php

namespace App\Format\Formatters;

use App\Enums\QuantityUnit;
use Illuminate\Support\Str;

class IdentifierFormatter
{
    /**
     * Normalize SKU (uppercase, trimmed, safe chars, optional prefix).
     */
    public static function sku(?string $sku, ?string $defaultPrefix = null): ?string
    {
        if (empty($sku)) {
            return null;
        }

        $clean = strtoupper(trim($sku));
        $clean = preg_replace('/[^A-Z0-9\-_]/', '', $clean);

        if ($defaultPrefix !== null && !Str::startsWith($clean, $defaultPrefix . '-')) {
            $clean = rtrim($defaultPrefix, '-') . '-' . ltrim($clean, '-');
        }

        return $clean;
    }

    /**
     * Clean and normalize barcode (keep only digits).
     */
    public static function barcode(?string $barcode): ?string
    {
        if (empty($barcode)) {
            return null;
        }

        $clean = preg_replace('/\D/', '', $barcode);
        return !empty($clean) ? $clean : null;
    }

    /**
     * Validate barcode format (6-18 numeric digits, with optional strict checksum validation).
     */
    public static function isValidBarcode(?string $barcode, bool $strict = false): bool
    {
        $clean = self::barcode($barcode);
        if (!$clean) {
            return false;
        }

        $len = strlen($clean);
        if ($len < 6 || $len > 18) {
            return false;
        }

        if (!$strict) {
            return true;
        }

        if ($len === 13) {
            return self::validateEanChecksum($clean);
        }

        if ($len === 8) {
            return self::validateEan8Checksum($clean);
        }

        if ($len === 12) {
            return self::validateUpcAChecksum($clean);
        }

        return true;
    }

    /**
     * Calculate EAN-13 check digit.
     */
    public static function calculateEan13CheckDigit(string $first12): int
    {
        $sum = 0;
        for ($i = 0; $i < 12; $i++) {
            $digit = (int) $first12[$i];
            $sum += ($i % 2 === 0) ? $digit : ($digit * 3);
        }
        $remainder = $sum % 10;
        return ($remainder === 0) ? 0 : (10 - $remainder);
    }

    /**
     * Validate EAN-13 checksum.
     */
    public static function validateEanChecksum(string $ean13): bool
    {
        if (strlen($ean13) !== 13) {
            return false;
        }
        $expected = self::calculateEan13CheckDigit(substr($ean13, 0, 12));
        return ((int) $ean13[12]) === $expected;
    }

    protected static function validateEan8Checksum(string $ean8): bool
    {
        if (strlen($ean8) !== 8) {
            return false;
        }
        $sum = 0;
        for ($i = 0; $i < 7; $i++) {
            $digit = (int) $ean8[$i];
            $sum += ($i % 2 === 0) ? ($digit * 3) : $digit;
        }
        $remainder = $sum % 10;
        $expected = ($remainder === 0) ? 0 : (10 - $remainder);
        return ((int) $ean8[7]) === $expected;
    }

    protected static function validateUpcAChecksum(string $upc): bool
    {
        if (strlen($upc) !== 12) {
            return false;
        }
        $sum = 0;
        for ($i = 0; $i < 11; $i++) {
            $digit = (int) $upc[$i];
            $sum += ($i % 2 === 0) ? ($digit * 3) : $digit;
        }
        $remainder = $sum % 10;
        $expected = ($remainder === 0) ? 0 : (10 - $remainder);
        return ((int) $upc[11]) === $expected;
    }

    /**
     * Normalize IMEI number (15 digits).
     */
    public static function imei(?string $imei): ?string
    {
        if (empty($imei)) {
            return null;
        }

        $clean = preg_replace('/\D/', '', $imei);
        return strlen($clean) === 15 ? $clean : $clean;
    }

    /**
     * Validate 15-digit IMEI using standard Luhn algorithm.
     */
    public static function isValidImei(?string $imei): bool
    {
        $clean = self::imei($imei);
        if (!$clean || strlen($clean) !== 15) {
            return false;
        }

        $sum = 0;
        for ($i = 0; $i < 14; $i++) {
            $digit = (int) $clean[$i];
            if ($i % 2 !== 0) {
                $doubled = $digit * 2;
                $sum += ($doubled > 9) ? ($doubled - 9) : $doubled;
            } else {
                $sum += $digit;
            }
        }

        $checkDigit = ($sum % 10 === 0) ? 0 : (10 - ($sum % 10));
        return ((int) $clean[14]) === $checkDigit;
    }

    /**
     * Mask IMEI for safe display (e.g. 356789******678).
     */
    public static function maskImei(?string $imei): ?string
    {
        $clean = self::imei($imei);
        if (!$clean) {
            return null;
        }

        if (strlen($clean) === 15) {
            return substr($clean, 0, 6) . '******' . substr($clean, -3);
        }

        return substr($clean, 0, 4) . '***' . substr($clean, -3);
    }

    /**
     * Generate standard UUID v4.
     */
    public static function uuid(): string
    {
        return Str::uuid()->toString();
    }

    /**
     * Validate if string is a valid UUID.
     */
    public static function isValidUuid(?string $uuid): bool
    {
        return !empty($uuid) && Str::isUuid($uuid);
    }

    /**
     * Normalize Tax Identification Number (uppercase, trimmed, safe chars, optional prefix).
     */
    public static function taxId(?string $taxId, ?string $defaultPrefix = null): ?string
    {
        if (empty($taxId)) {
            return null;
        }

        $clean = strtoupper(trim($taxId));
        $clean = preg_replace('/[^A-Z0-9\-]/', '', $clean);

        if ($defaultPrefix !== null && !Str::startsWith($clean, $defaultPrefix . '-')) {
            $clean = rtrim($defaultPrefix, '-') . '-' . ltrim($clean, '-');
        }

        return $clean;
    }

    /**
     * Normalize unit of measure (e.g. " PCS " -> "pcs").
     */
    public static function unit(?string $unit, string $default = 'pcs'): string
    {
        if (empty($unit)) {
            return $default;
        }

        return QuantityUnit::tryFromString($unit, QuantityUnit::PCS)->value;
    }
}
