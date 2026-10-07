<?php

namespace App\Traits;

use App\Services\Support\FileService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Enterprise Eloquent Trait: CleansStorageFiles
 * 
 * Automatically cleans up obsolete or deleted files from storage:
 * 1. On `updating`: When a file attribute is changed or cleared (set to null/empty),
 *    the previous physical file is automatically deleted from storage.
 * 2. On `deleting` / `forceDeleted`: When a record is permanently deleted
 *    (or regular deleted if model does not use SoftDeletes), its physical files are deleted.
 */
trait CleansStorageFiles
{
    /**
     * Common file attributes to inspect across models.
     */
    protected static array $defaultFileAttributes = [
        'logo',
        'image',
        'photo',
        'avatar',
        'receipt',
        'featured_image',
        'banner',
        'file_url',
    ];

    /**
     * Boot the trait and register Eloquent event listeners.
     */
    public static function bootCleansStorageFiles(): void
    {
        // 1. On Updating: delete old physical file if replaced or cleared
        static::updating(function (Model $model) {
            $fileService = app(FileService::class);
            $attributes = $model->getFileCleanableAttributes();

            foreach ($attributes as $attribute) {
                if ($model->isDirty($attribute)) {
                    $original = $model->getOriginal($attribute);
                    $current  = $model->getAttribute($attribute);

                    if (!empty($original) && $original !== $current) {
                        $fileService->delete($original);
                    }
                }
            }
        });

        // 2. On Deleting: delete files on permanent deletion (or regular deletion if non-soft-deleted)
        static::deleting(function (Model $model) {
            $usesSoftDeletes = in_array(SoftDeletes::class, class_uses_recursive($model), true);
            $isPermanent = !$usesSoftDeletes || (method_exists($model, 'isForceDeleting') && $model->isForceDeleting());

            if ($isPermanent) {
                $fileService = app(FileService::class);
                $attributes = $model->getFileCleanableAttributes();

                foreach ($attributes as $attribute) {
                    $val = $model->getAttribute($attribute);
                    if (!empty($val)) {
                        $fileService->delete($val);
                    }
                }
            }
        });

        // 3. On ForceDeleted: safeguard for permanent deletion on models using SoftDeletes
        if (in_array(SoftDeletes::class, class_uses_recursive(static::class), true)) {
            static::forceDeleted(function (Model $model) {
                $fileService = app(FileService::class);
                $attributes = $model->getFileCleanableAttributes();

                foreach ($attributes as $attribute) {
                    $val = $model->getAttribute($attribute);
                    if (!empty($val)) {
                        $fileService->delete($val);
                    }
                }
            });
        }
    }

    /**
     * Get the list of attributes that represent physical files on this model.
     *
     * @return array<string>
     */
    public function getFileCleanableAttributes(): array
    {
        if (property_exists($this, 'fileCleanableAttributes') && is_array($this->fileCleanableAttributes)) {
            return $this->fileCleanableAttributes;
        }

        // Auto-detect matching file columns from model's fillable or current attributes
        $candidates = array_unique(array_merge(
            $this->getFillable(),
            array_keys($this->getAttributes())
        ));

        return array_values(array_intersect($candidates, static::$defaultFileAttributes));
    }
}
