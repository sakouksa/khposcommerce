<?php

namespace App\Format\Formatters;

use Illuminate\Support\Str;

class StorageFormatter
{
    /**
     * Normalize storage file path (uniform forward slashes, no leading/trailing slash, prevent traversal).
     * Example: "\products//2026/img.jpg" -> "products/2026/img.jpg"
     */
    public static function normalizePath(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        // Replace backslashes
        $clean = str_replace('\\', '/', trim($path));
        // Remove duplicate slashes
        $clean = preg_replace('#/+#', '/', $clean);
        // Prevent path traversal
        $clean = str_replace('../', '', $clean);
        // Trim slashes
        $clean = trim($clean, '/');

        return !empty($clean) ? $clean : null;
    }

    /**
     * Generate dated storage file path.
     * Example: datedPath('products', 'item.jpg') -> "products/2026/09/unique_item.jpg"
     */
    public static function datedPath(string $folder, string $filename, bool $unique = true): string
    {
        $cleanFolder = self::normalizePath($folder) ?? 'uploads';
        $yearMonth = now()->format('Y/m');

        if ($unique) {
            $extension = pathinfo($filename, PATHINFO_EXTENSION);
            $basename = pathinfo($filename, PATHINFO_FILENAME);
            $safeName = Str::slug($basename) . '_' . time() . '_' . Str::random(6);
            $filename = !empty($extension) ? "{$safeName}.{$extension}" : $safeName;
        }

        return "{$cleanFolder}/{$yearMonth}/{$filename}";
    }

    /**
     * Convert file size in bytes to human-readable string.
     * Example: 2500000 -> "2.38 MB"
     */
    public static function humanSize(int|float|null $bytes, int $decimals = 2): string
    {
        if ($bytes === null || $bytes <= 0) {
            return '0 B';
        }

        $units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        $power = (int) floor(log($bytes, 1024));
        $power = min($power, count($units) - 1);

        $size = $bytes / pow(1024, $power);

        return round($size, $decimals) . ' ' . $units[$power];
    }

    /**
     * Parse human readable size string back to bytes.
     * Example: "2.5 MB" -> 2621440
     */
    public static function parseToBytes(string $formatted): int
    {
        $formatted = trim($formatted);
        $units = [
            'B'  => 1,
            'KB' => 1024,
            'MB' => 1024 ** 2,
            'GB' => 1024 ** 3,
            'TB' => 1024 ** 4,
        ];

        if (preg_match('/^([0-9.]+)\s*([A-Za-z]+)?$/', $formatted, $matches)) {
            $number = (float) $matches[1];
            $unit = strtoupper($matches[2] ?? 'B');

            if (isset($units[$unit])) {
                return (int) round($number * $units[$unit]);
            }
        }

        return (int) $formatted;
    }
}
