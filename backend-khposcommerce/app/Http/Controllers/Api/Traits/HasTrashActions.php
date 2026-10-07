<?php

namespace App\Http\Controllers\Api\Traits;

use Illuminate\Http\JsonResponse;

/**
 * Trait providing standard soft-delete restore and permanent force delete endpoints.
 */
trait HasTrashActions
{
    /**
     * Restore a soft-deleted record.
     */
    public function restore(int $id): JsonResponse
    {
        try {
            if (property_exists($this, 'service') && method_exists($this->service, 'restore')) {
                $this->service->restore($id);
            } elseif (property_exists($this, 'modelClass') && class_exists($this->modelClass)) {
                $record = $this->modelClass::onlyTrashed()->findOrFail($id);
                $record->restore();
            } else {
                throw new \RuntimeException('Restore action not configured.');
            }

            return $this->successResponse(null, 'Restored successfully');
        } catch (\Throwable $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    /**
     * Force delete a record permanently.
     */
    public function forceDelete(int $id): JsonResponse
    {
        try {
            if (property_exists($this, 'service') && method_exists($this->service, 'forceDelete')) {
                $this->service->forceDelete($id);
            } elseif (property_exists($this, 'modelClass') && class_exists($this->modelClass)) {
                $record = $this->modelClass::withTrashed()->findOrFail($id);
                $record->forceDelete();
            } else {
                throw new \RuntimeException('Force delete action not configured.');
            }

            return $this->successResponse(null, 'Permanently deleted successfully');
        } catch (\Throwable $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }
}
