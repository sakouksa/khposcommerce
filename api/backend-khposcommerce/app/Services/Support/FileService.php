<?php

namespace App\Services\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileService
{
    /**
     * Protected system assets, seed avatars, and default template files
     * that must NEVER be deleted from the filesystem.
     */
    protected const PROTECTED_FILES = [
        'companies/company-logo.png',
        'companies/nexpos-logo.jpg',
        'settings/logo-light.png',
        'settings/logo-dark.png',
        'settings/favicon.ico',
        'default-supplier.svg',
        'default-product.png',
        'default-avatar.png',
        'default.png',
        'default.svg',
        'logo.png',
        'logo.svg',
        'nexpos-logo.jpg',
    ];

    /**
     * Store an uploaded file to a specified directory and disk.
     */
    public function upload(
        UploadedFile $file,
        string $directory = 'uploads',
        string $disk = 'public',
        ?string $customFilename = null
    ): string {
        $filename = $customFilename ?: (Str::random(40) . '.' . $file->getClientOriginalExtension());
        return $file->storeAs($directory, $filename, $disk);
    }

    /**
     * Delete a file and its potential thumbnails from disk if it exists.
     */
    public function delete(?string $path, string $disk = 'public'): bool
    {
        if (empty($path)) {
            return false;
        }

        $relativePath = $this->getRelativePath($path, $disk);
        if (empty($relativePath) || $this->isProtectedAsset($relativePath)) {
            return false;
        }

        $deleted = false;

        // 1. Delete main file from Storage disk
        if (Storage::disk($disk)->exists($relativePath)) {
            $deleted = Storage::disk($disk)->delete($relativePath);
        }

        // 2. Also check fallback by basename in root if path was saved flat
        $baseName = basename($relativePath);
        if (!$deleted && $baseName !== $relativePath && Storage::disk($disk)->exists($baseName)) {
            $deleted = Storage::disk($disk)->delete($baseName);
        }

        // 3. Remove physical file from public/storage directory if symlinked or mirrored
        $publicPath = public_path('storage/' . $relativePath);
        if (file_exists($publicPath) && is_file($publicPath)) {
            @unlink($publicPath);
            $deleted = true;
        }

        // 4. Also automatically clean associated thumbnail if it exists (e.g. dir/thumbs/file.ext)
        $dir = dirname($relativePath);
        $thumbRelative = ($dir === '.' ? 'thumbs/' : ($dir . '/thumbs/')) . $baseName;
        if (Storage::disk($disk)->exists($thumbRelative)) {
            Storage::disk($disk)->delete($thumbRelative);
        }
        $publicThumb = public_path('storage/' . $thumbRelative);
        if (file_exists($publicThumb) && is_file($publicThumb)) {
            @unlink($publicThumb);
        }

        return $deleted;
    }

    /**
     * Check if a given file path is a protected default asset that should never be deleted.
     */
    public function isProtectedAsset(string $path): bool
    {
        $clean = ltrim($path, '/');
        $baseName = basename($clean);

        // Check exact match in protected list or by basename
        if (in_array($clean, self::PROTECTED_FILES, true) || in_array($baseName, self::PROTECTED_FILES, true)) {
            return true;
        }

        // Check if starts with default- or /images/ or images/
        if (str_starts_with($clean, 'images/') || str_starts_with($clean, 'default-')) {
            return true;
        }

        // Protect seed customer/employee avatars: customers/avatar_01.png to avatar_10.png
        if (preg_match('#^customers/avatar_\d{2}\.png$#i', $clean)) {
            return true;
        }

        return false;
    }

    /**
     * Replace an existing file with a new uploaded file.
     */
    public function replace(
        UploadedFile $newFile,
        ?string $oldPath,
        string $directory = 'uploads',
        string $disk = 'public'
    ): string {
        $this->delete($oldPath, $disk);
        return $this->upload($newFile, $directory, $disk);
    }

    /**
     * Delete an entire directory on the given disk.
     */
    public function deleteDirectory(string $directory, string $disk = 'public'): bool
    {
        $cleanDir = $this->getRelativePath($directory, $disk);
        if (!empty($cleanDir) && Storage::disk($disk)->exists($cleanDir)) {
            return Storage::disk($disk)->deleteDirectory($cleanDir);
        }
        return false;
    }

    /**
     * Get the full public URL for a stored file path.
     */
    public function getUrl(?string $path, string $disk = 'public'): ?string
    {
        if (!$path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $relativePath = $this->getRelativePath($path, $disk);
        return Storage::disk($disk)->url($relativePath);
    }

    /**
     * Convert full URL or relative path to a clean relative storage path.
     * Robustly handles:
     * - "http://localhost:8000/storage/suppliers/spl-001.png?v=1" -> "suppliers/spl-001.png"
     * - "https://domain.com/api/v1/storage/suppliers/spl-001.png" -> "suppliers/spl-001.png"
     * - "/storage/suppliers/spl-001.png" -> "suppliers/spl-001.png"
     * - "storage/suppliers/spl-001.png" -> "suppliers/spl-001.png"
     * - "suppliers/spl-001.png" -> "suppliers/spl-001.png"
     */
    public function getRelativePath(?string $path, string $disk = 'public'): string
    {
        if (empty($path)) {
            return '';
        }

        $trimmed = trim($path);

        // Discard data URIs / blobs
        if (str_starts_with($trimmed, 'data:') || str_starts_with($trimmed, 'blob:')) {
            return '';
        }

        // Check if external domain (e.g. Unsplash, Placeholder, etc.)
        if (preg_match('#^https?://#i', $trimmed)) {
            $parsedHost = parse_url($trimmed, PHP_URL_HOST);
            if ($parsedHost) {
                $externalDomains = ['unsplash.com', 'images.unsplash.com', 'placeholder.com', 'via.placeholder.com', 'cloudinary.com', 'imgur.com'];
                foreach ($externalDomains as $domain) {
                    if (str_ends_with(strtolower($parsedHost), $domain)) {
                        return ''; // External URL, not a local storage path
                    }
                }
            }
        }

        // Extract path component from URL (ignoring query strings and hash)
        $parsedPath = parse_url($trimmed, PHP_URL_PATH);
        $clean = $parsedPath !== null ? $parsedPath : $trimmed;

        // Strip leading slashes
        $clean = ltrim($clean, '/');

        // Strip known API and storage route prefixes
        $clean = preg_replace('#^(api/v1/storage/|storage/)#i', '', $clean);

        return ltrim($clean, '/');
    }
}

