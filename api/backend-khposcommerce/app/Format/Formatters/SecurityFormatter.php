<?php

namespace App\Format\Formatters;

class SecurityFormatter
{
    /**
     * Mask bank account / card number for PCI/security compliance.
     * Example: "12345678901234" -> "•••• •••• •••• 1234"
     */
    public static function maskBankAccount(?string $account, string $maskChar = '•'): ?string
    {
        if (empty($account)) {
            return null;
        }

        $clean = preg_replace('/[^a-zA-Z0-9]/', '', $account);
        $len = strlen($clean);

        if ($len <= 4) {
            return str_repeat($maskChar, $len);
        }

        $last4 = substr($clean, -4);
        return str_repeat($maskChar, 4) . ' ' .
               str_repeat($maskChar, 4) . ' ' .
               str_repeat($maskChar, 4) . ' ' .
               $last4;
    }

    /**
     * Clean bank account string (remove spaces, hyphens).
     */
    public static function cleanBankAccount(?string $account): ?string
    {
        if (empty($account)) {
            return null;
        }

        return preg_replace('/[^a-zA-Z0-9]/', '', $account);
    }

    /**
     * Validate and normalize IP Address (IPv4 or IPv6).
     */
    public static function normalizeIp(?string $ip): ?string
    {
        if (empty($ip)) {
            return null;
        }

        $trimmed = trim($ip);
        if (filter_var($trimmed, FILTER_VALIDATE_IP)) {
            return $trimmed;
        }

        return null;
    }

    /**
     * Validate IP address.
     */
    public static function isValidIp(?string $ip): bool
    {
        return self::normalizeIp($ip) !== null;
    }

    /**
     * Anonymize IP address for GDPR / privacy audit logs.
     * Example: 192.168.1.10 -> 192.168.1.0
     */
    public static function anonymizeIp(?string $ip): ?string
    {
        $validIp = self::normalizeIp($ip);
        if (!$validIp) {
            return null;
        }

        if (filter_var($validIp, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $parts = explode('.', $validIp);
            $parts[3] = '0';
            return implode('.', $parts);
        }

        if (filter_var($validIp, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            $parts = explode(':', $validIp);
            return implode(':', array_slice($parts, 0, 3)) . '::';
        }

        return $validIp;
    }

    /**
     * Summarize User Agent string into human-friendly client info.
     * Example: "Chrome on macOS" or "Safari on iOS"
     */
    public static function summarizeUserAgent(?string $ua): string
    {
        if (empty($ua)) {
            return 'Unknown Device';
        }

        // Detect OS
        $os = 'Unknown OS';
        if (stripos($ua, 'iPhone') !== false || stripos($ua, 'iPad') !== false) {
            $os = 'iOS';
        } elseif (stripos($ua, 'Android') !== false) {
            $os = 'Android';
        } elseif (stripos($ua, 'Macintosh') !== false || stripos($ua, 'Mac OS') !== false) {
            $os = 'macOS';
        } elseif (stripos($ua, 'Windows') !== false) {
            $os = 'Windows';
        } elseif (stripos($ua, 'Linux') !== false) {
            $os = 'Linux';
        }

        // Detect Browser
        $browser = 'Browser';
        if (stripos($ua, 'Edg') !== false) {
            $browser = 'Edge';
        } elseif (stripos($ua, 'Chrome') !== false && stripos($ua, 'Edg') === false) {
            $browser = 'Chrome';
        } elseif (stripos($ua, 'Safari') !== false && stripos($ua, 'Chrome') === false) {
            $browser = 'Safari';
        } elseif (stripos($ua, 'Firefox') !== false) {
            $browser = 'Firefox';
        } elseif (stripos($ua, 'Opera') !== false || stripos($ua, 'OPR') !== false) {
            $browser = 'Opera';
        }

        return "{$browser} on {$os}";
    }
}
