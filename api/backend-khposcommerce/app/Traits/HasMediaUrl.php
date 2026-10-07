<?php

namespace App\Traits;

/**
 * Enterprise Reusable Media URL Formatter Trait for Eloquent Models
 *
 * Provides standardized full URL resolution for stored images, logos, and attachments.
 */
trait HasMediaUrl
{
    /**
     * Format a relative or absolute storage path into a fully qualified API URL.
     *
     * @param string|null $path Stored path, absolute URL, or data URI
     * @param string|null $fallback Optional fallback path if empty/invalid
     * @return string|null
     */
    public function formatStorageUrl(?string $path, ?string $fallback = null): ?string
    {
        if (
            !$path ||
            $path === '[]' ||
            $path === '""' ||
            $path === 'null' ||
            str_contains($path, 'blob:http') ||
            str_contains($path, '/storage/[]')
        ) {
            return $fallback ? url($fallback) : null;
        }

        if (
            str_starts_with($path, 'http://') ||
            str_starts_with($path, 'https://') ||
            str_starts_with($path, 'data:')
        ) {
            return $path;
        }

        $clean = ltrim(preg_replace('#^storage/#', '', $path), '/');
        return url('api/v1/storage/' . $clean);
    }

    /**
     * Alias for formatStorageUrl to maintain full backward and cross-layer compatibility.
     */
    public function formatMediaUrl(?string $path, ?string $fallback = null): ?string
    {
        return $this->formatStorageUrl($path, $fallback);
    }
}
