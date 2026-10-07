<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Enterprise Reusable File & Media Upload Trait
 * 
 * Provides professional file management across all models and services:
 * - Direct UploadedFile handling
 * - Base64 Data URL decoding and physical disk storage
 * - Automatic old file removal upon update/replacement
 * - Multi-disk and configurable directory support
 * - Safe sanitization and orphan prevention
 */
trait HasFileUpload
{
    /**
     * Upload a file or process a base64 string to storage disk.
     *
     * @param UploadedFile|string|null $file
     * @param string $directory Subdirectory inside disk (e.g. 'receipts', 'products')
     * @param string $disk Storage disk (default: 'public')
     * @return string|null Relative storage path
     */
    public function uploadFile(mixed $file, string $directory = 'uploads', string $disk = 'public'): ?string
    {
        if (empty($file)) {
            return null;
        }

        // 1. Direct UploadedFile instance
        if ($file instanceof UploadedFile) {
            return $file->store($directory, $disk);
        }

        // 2. Base64 Data URI string (e.g. "data:image/png;base64,...", "data:application/pdf;base64,...")
        if (is_string($file) && str_starts_with($file, 'data:')) {
            if (preg_match('/^data:([^;]+);base64,(.+)$/', $file, $matches)) {
                $mime = strtolower(trim($matches[1]));
                $decoded = base64_decode($matches[2], true);

                if ($decoded === false) {
                    return null;
                }

                $extension = $this->resolveExtensionFromMime($mime);
                $filename = $directory . '/' . Str::slug(pathinfo($directory, PATHINFO_BASENAME)) . '_' . uniqid() . '.' . $extension;

                Storage::disk($disk)->put($filename, $decoded);
                return $filename;
            }
        }

        // 3. String that is already a valid relative or existing storage path
        if (is_string($file) && !str_starts_with($file, 'http://') && !str_starts_with($file, 'https://')) {
            $cleaned = ltrim($file, '/');
            return $cleaned;
        }

        return is_string($file) ? $file : null;
    }

    /**
     * Upload a new file and automatically delete the previous file from storage disk.
     *
     * @param mixed $newFile New file input (UploadedFile, base64, null, or string)
     * @param string|null $oldFilePath Existing file path to clean up
     * @param string $directory Storage directory
     * @param string $disk Storage disk
     * @return string|null New relative file path
     */
    public function uploadOrReplaceFile(
        mixed $newFile,
        ?string $oldFilePath = null,
        string $directory = 'uploads',
        string $disk = 'public'
    ): ?string {
        // If explicitly cleared (null or empty string)
        if (empty($newFile)) {
            if (!empty($oldFilePath)) {
                $this->deleteStorageFile($oldFilePath, $disk);
            }
            return null;
        }

        // If it's a new upload or base64 payload
        if ($newFile instanceof UploadedFile || (is_string($newFile) && str_starts_with($newFile, 'data:'))) {
            $uploadedPath = $this->uploadFile($newFile, $directory, $disk);

            // Delete previous physical file
            if (!empty($oldFilePath) && $oldFilePath !== $uploadedPath) {
                $this->deleteStorageFile($oldFilePath, $disk);
            }

            return $uploadedPath;
        }

        // If newFile is an existing path string that is different from oldFilePath
        if (is_string($newFile) && $newFile !== $oldFilePath && !empty($oldFilePath)) {
            $this->deleteStorageFile($oldFilePath, $disk);
        }

        return is_string($newFile) ? $newFile : null;
    }

    /**
     * Safely delete a physical file from the storage disk.
     *
     * @param string|null $filePath
     * @param string $disk
     * @return bool
     */
    public function deleteStorageFile(?string $filePath, string $disk = 'public'): bool
    {
        if (empty($filePath)) {
            return false;
        }

        return app(\App\Services\Support\FileService::class)->delete($filePath, $disk);
    }

    /**
     * Bulk delete multiple files from the storage disk.
     *
     * @param array $filePaths
     * @param string $disk
     * @return int Count of files processed
     */
    public function bulkDeleteStorageFiles(array $filePaths, string $disk = 'public'): int
    {
        $count = 0;
        foreach ($filePaths as $path) {
            if ($this->deleteStorageFile($path, $disk)) {
                $count++;
            }
        }
        return $count;
    }

    /**
     * Resolve reliable file extension from MIME type.
     */
    private function resolveExtensionFromMime(string $mime): string
    {
        $mimeMap = [
            'image/jpeg'                    => 'jpg',
            'image/jpg'                     => 'jpg',
            'image/png'                     => 'png',
            'image/webp'                    => 'webp',
            'image/gif'                     => 'gif',
            'image/svg+xml'                 => 'svg',
            'application/pdf'               => 'pdf',
            'application/msword'            => 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
            'application/vnd.ms-excel'      => 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'        => 'xlsx',
        ];

        return $mimeMap[$mime] ?? (explode('/', $mime)[1] ?? 'bin');
    }
}
