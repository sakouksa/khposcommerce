<?php

namespace App\Traits;

use Illuminate\Support\Facades\DB;

trait SoftDeletesEnterprise
{
    /**
     * Boot the trait to hook into Eloquent's deleting event.
     */
    public static function bootSoftDeletesEnterprise()
    {
        static::deleting(function ($model) {
            // 1. Transaction Safety Check
            $model->validateDeletionSafety();

            // 2. Backup snapshot JSON
            $model->backupBeforeDelete();
        });
    }

    /**
     * Enforce strict dependency validation rules before letting any records delete.
     */
    public function validateDeletionSafety()
    {
        // Allow soft delete so records can be safely moved to Recycle Bin.
        // Only enforce strict relational dependency checks during permanent force deletion.
        if (method_exists($this, 'isForceDeleting') && !$this->isForceDeleting()) {
            return;
        }

        $class = get_class($this);

        // Products check
        if (str_contains($class, 'Product') && !str_contains($class, 'ProductVariant') && !str_contains($class, 'ProductPrice') && !str_contains($class, 'ProductReview') && !str_contains($class, 'ProductImage')) {
            $hasTransactions = DB::table('sale_items')->where('product_id', $this->id)->exists()
                || DB::table('purchase_items')->where('product_id', $this->id)->exists()
                || DB::table('order_items')->where('product_id', $this->id)->exists()
                || DB::table('inventory_movements')->where('product_id', $this->id)->exists()
                || DB::table('stock_adjustment_items')->where('product_id', $this->id)->exists()
                || DB::table('stock_opname_items')->where('product_id', $this->id)->exists()
                || DB::table('stock_transfer_items')->where('product_id', $this->id)->exists();

            if ($hasTransactions) {
                throw new \Exception("Cannot delete this product because it has active transaction history. Please archive it instead.");
            }
        }

        // Customers check
        if (str_contains($class, 'Customer') && !str_contains($class, 'CustomerGroup') && !str_contains($class, 'CustomerAddress')) {
            $hasTransactions = DB::table('orders')->where('customer_id', $this->id)->exists()
                || DB::table('sales')->where('customer_id', $this->id)->exists()
                || DB::table('payments')->where('customer_id', $this->id)->exists();

            if ($hasTransactions) {
                throw new \Exception("Cannot delete this customer because they have active order or transaction history. Please archive instead.");
            }
        }

        // Suppliers check
        if (str_contains($class, 'Supplier')) {
            $hasTransactions = DB::table('purchases')->where('supplier_id', $this->id)->exists()
                || DB::table('purchase_returns')->where('supplier_id', $this->id)->exists();

            if ($hasTransactions) {
                throw new \Exception("Cannot delete this supplier because they have active purchase transactions.");
            }
        }

        // Category check
        if (str_contains($class, 'Category') && !str_contains($class, 'BlogCategory') && !str_contains($class, 'ExpenseCategory')) {
            $hasProducts = DB::table('products')->where('category_id', $this->id)->exists();
            if ($hasProducts) {
                throw new \Exception("Cannot delete this category because it contains products.");
            }
        }

        // Brand check
        if (str_contains($class, 'Brand')) {
            $hasProducts = DB::table('products')->where('brand_id', $this->id)->exists();
            if ($hasProducts) {
                throw new \Exception("Cannot delete this brand because it contains products.");
            }
        }

        // Warehouse check
        if (str_contains($class, 'Warehouse')) {
            $hasInventory = DB::table('inventories')
                ->where('warehouse_id', $this->id)
                ->where('quantity', '>', 0)
                ->exists();
            if ($hasInventory) {
                throw new \Exception("Cannot delete this warehouse because it has active stock items.");
            }
        }

        // Company check
        if (str_contains($class, 'Company')) {
            throw new \Exception("Company configuration cannot be deleted. You can set it to inactive instead.");
        }
    }

    /**
     * Create a backup log payload of the model and its relations before it gets deleted.
     */
    public function backupBeforeDelete()
    {
        try {
            $backupPayload = [
                'model_data' => $this->toArray(),
            ];

            // If it's a product, load images/variants/prices
            $class = get_class($this);
            if (str_contains($class, 'Product') && !str_contains($class, 'ProductVariant') && !str_contains($class, 'ProductPrice') && !str_contains($class, 'ProductReview') && !str_contains($class, 'ProductImage') && method_exists($this, 'relationLoaded')) {
                $this->loadMissing(['images', 'variants', 'prices']);
                $backupPayload['images'] = $this->images ? $this->images->toArray() : [];
                $backupPayload['variants'] = $this->variants ? $this->variants->toArray() : [];
                $backupPayload['prices'] = $this->prices ? $this->prices->toArray() : [];
            }

            // Write to ActivityLog
            \App\Models\Log\ActivityLog::create([
                'log_name' => 'backup_snapshot',
                'description' => "Backup before deleting " . class_basename($this) . ": " . ($this->name ?? $this->id),
                'subject_type' => get_class($this),
                'subject_id' => $this->id,
                'causer_type' => auth()->user() ? get_class(auth()->user()) : null,
                'causer_id' => auth()->id(),
                'event' => 'deleted',
                'properties' => $backupPayload,
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("ActivityLog backup before delete skipped: " . $e->getMessage());
        }
    }

    /**
     * Prepare a date for array / JSON serialization in Cambodia Timezone (Asia/Phnom_Penh).
     */
    protected function serializeDate(\DateTimeInterface $date): string
    {
        return \Carbon\Carbon::instance($date)->timezone('Asia/Phnom_Penh')->format('Y-m-d H:i:s');
    }
}
