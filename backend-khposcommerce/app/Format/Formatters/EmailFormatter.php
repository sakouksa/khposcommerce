<?php

namespace App\Format\Formatters;

class EmailFormatter
{
    /**
     * Normalize email: trimmed and converted to lowercase.
     */
    public static function normalize(?string $email): ?string
    {
        if ($email === null) {
            return null;
        }

        $clean = strtolower(trim($email));
        return $clean === '' ? null : $clean;
    }

    /**
     * Mask email for public display or security logs (e.g. u***r@example.com).
     */
    public static function mask(?string $email): ?string
    {
        $clean = self::normalize($email);
        if (!$clean || !str_contains($clean, '@')) {
            return $clean;
        }

        [$user, $domain] = explode('@', $clean, 2);
        $userLen = strlen($user);

        if ($userLen <= 2) {
            $maskedUser = $user[0] . '***';
        } else {
            $maskedUser = $user[0] . '***' . $user[$userLen - 1];
        }

        return $maskedUser . '@' . $domain;
    }

    /**
     * Validate email format.
     */
    public static function isValid(?string $email): bool
    {
        $clean = self::normalize($email);
        return $clean !== null && filter_var($clean, FILTER_VALIDATE_EMAIL) !== false;
    }
}
