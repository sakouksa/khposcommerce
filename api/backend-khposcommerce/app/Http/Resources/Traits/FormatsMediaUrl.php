<?php

namespace App\Http\Resources\Traits;

use Illuminate\Support\Facades\Storage;

trait FormatsMediaUrl
{
    /**
     * Formats any stored media path (e.g. "products/1/img.webp", "storage/products/...", full URL)
     * into a fully qualified, secure, production-ready public media URL.
     */
    protected function formatMediaUrl(?string $path, ?string $fallback = null, string $disk = 'public'): ?string
    {
        if (empty($path)) {
            return $fallback;
        }

        $trimmed = trim($path);

        // Data URIs or Blob URIs
        if (str_starts_with($trimmed, 'data:') || str_starts_with($trimmed, 'blob:')) {
            return $trimmed;
        }

        // Already absolute HTTP/HTTPS URL
        if (str_starts_with($trimmed, 'http://') || str_starts_with($trimmed, 'https://')) {
            // Upgrade insecure Render URLs to HTTPS
            if (str_starts_with($trimmed, 'http://enterprise-pos-api.onrender.com')) {
                return str_replace('http://', 'https://', $trimmed);
            }
            return $trimmed;
        }

        // Clean redundant leading slashes and storage prefixes
        $clean = ltrim($trimmed, '/');
        if (str_starts_with($clean, 'api/v1/storage/')) {
            $clean = substr($clean, 15);
        } elseif (str_starts_with($clean, 'storage/')) {
            $clean = substr($clean, 8);
        }

        // Generate URL via Laravel Public Storage Disk or APP_URL asset
        $diskUrl = Storage::disk($disk)->url($clean);

        if (str_starts_with($diskUrl, 'http://enterprise-pos-api.onrender.com')) {
            $diskUrl = str_replace('http://', 'https://', $diskUrl);
        }

        return $diskUrl;
    }

    /**
     * Alias for formatMediaUrl to maintain cross-compatibility with models and services.
     */
    public function formatStorageUrl(?string $path, ?string $fallback = null, string $disk = 'public'): ?string
    {
        return $this->formatMediaUrl($path, $fallback, $disk);
    }
}
