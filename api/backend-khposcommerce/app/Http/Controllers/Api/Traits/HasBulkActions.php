<?php

namespace App\Http\Controllers\Api\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Trait providing standard bulk action endpoints for API controllers.
 */
trait HasBulkActions
{
    /**
     * Bulk delete records by IDs.
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $ids = $request->validate(['ids' => 'required|array'])['ids'];
        $count = 0;

        if (property_exists($this, 'service') && method_exists($this->service, 'bulkDelete')) {
            $count = $this->service->bulkDelete($ids);
        } elseif (property_exists($this, 'service') && method_exists($this->service, 'delete')) {
            foreach ($ids as $id) {
                try {
                    $this->service->delete($id);
                    $count++;
                } catch (\Throwable) {}
            }
        } elseif (property_exists($this, 'modelClass') && class_exists($this->modelClass)) {
            $count = $this->modelClass::whereIn('id', $ids)->delete();
        }

        return $this->successResponse(null, "{$count} items deleted successfully");
    }

    /**
     * Bulk restore records by IDs.
     */
    public function bulkRestore(Request $request): JsonResponse
    {
        $ids = $request->validate(['ids' => 'required|array'])['ids'];
        $count = 0;

        if (property_exists($this, 'service') && method_exists($this->service, 'bulkRestore')) {
            $count = $this->service->bulkRestore($ids);
        } elseif (property_exists($this, 'modelClass') && class_exists($this->modelClass)) {
            $count = $this->modelClass::onlyTrashed()->whereIn('id', $ids)->restore();
        }

        return $this->successResponse(null, "{$count} items restored successfully");
    }
}
