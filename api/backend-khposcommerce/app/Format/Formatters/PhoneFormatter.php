<?php

namespace App\Format\Formatters;

class PhoneFormatter
{
    public const DEFAULT_COUNTRY_CODE = '855';

    /**
     * Normalize any phone number into canonical E.164 format (+85512345678).
     *
     * @param string|null $phone
     * @param string $defaultCountry
     * @return string|null
     */
    public static function normalize(?string $phone, string $defaultCountry = '855'): ?string
    {
        if ($phone === null) {
            return null;
        }

        $cleaned = trim($phone);
        if ($cleaned === '') {
            return null;
        }

        // Keep leading '+' if present, strip all other non-digits
        $hasPlus = str_starts_with($cleaned, '+');
        $digits = preg_replace('/\D+/', '', $cleaned);

        if (empty($digits)) {
            return null;
        }

        // Case 1: Local Cambodian number starting with '0' (e.g. 012345678)
        if (str_starts_with($digits, '0')) {
            $digits = ltrim($digits, '0');
            return '+' . $defaultCountry . $digits;
        }

        // Case 2: Number starting with country code 855 without '+'
        if (str_starts_with($digits, $defaultCountry)) {
            return '+' . $digits;
        }

        // Case 3: Explicit '+' with international digits
        if ($hasPlus) {
            return '+' . $digits;
        }

        // Case 4: Raw 8-9 digits without leading 0 or country code -> treat as defaultCountry
        if (strlen($digits) >= 8 && strlen($digits) <= 9) {
            return '+' . $defaultCountry . $digits;
        }

        // Fallback: prepend '+'
        return '+' . $digits;
    }

    /**
     * Format into standard local Cambodian display format (e.g. 012 345 678 or 098 765 432).
     */
    public static function toLocal(?string $phone): ?string
    {
        $normalized = self::normalize($phone);
        if (!$normalized) {
            return null;
        }

        // If it starts with +855
        if (str_starts_with($normalized, '+855')) {
            $sub = substr($normalized, 4); // strip +855
            $local = '0' . $sub;

            // 012 345 678 (9 digits)
            if (strlen($local) === 9) {
                return substr($local, 0, 3) . ' ' . substr($local, 3, 3) . ' ' . substr($local, 6, 3);
            }
            // 098 765 4321 (10 digits)
            if (strlen($local) === 10) {
                return substr($local, 0, 3) . ' ' . substr($local, 3, 3) . ' ' . substr($local, 6, 4);
            }

            return $local;
        }

        return $normalized;
    }

    /**
     * Mask phone number for privacy / security (e.g. +855 12 *** 678).
     */
    public static function mask(?string $phone): ?string
    {
        $normalized = self::normalize($phone);
        if (!$normalized) {
            return null;
        }

        $length = strlen($normalized);
        if ($length <= 6) {
            return $normalized;
        }

        $start = substr($normalized, 0, $length - 6);
        $end   = substr($normalized, -3);

        return $start . '***' . $end;
    }

    /**
     * Check if the phone number is valid E.164 or valid Cambodian format.
     */
    public static function isValid(?string $phone): bool
    {
        $normalized = self::normalize($phone);
        if (!$normalized) {
            return false;
        }

        // Check if international E.164: + followed by 8 to 15 digits
        if (!preg_match('/^\+[1-9]\d{7,14}$/', $normalized)) {
            return false;
        }

        // If Cambodian (+855), verify local length (8-9 digits after +855)
        if (str_starts_with($normalized, '+855')) {
            $sub = substr($normalized, 4);
            return strlen($sub) >= 8 && strlen($sub) <= 9;
        }

        return true;
    }
}
