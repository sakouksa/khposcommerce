<?php

namespace App\Services\Support;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class ReferenceNumberService
{
    /**
     * Generate a unique reference number with prefix, date stamp, and random characters/digits.
     *
     * @param string $prefix Prefix like 'PO-', 'INV-', 'EXP-'
     * @param string|null $modelClass Eloquent model class to check for duplicates
     * @param string $column Database column to check
     * @param int $length Number of random digits or characters
     * @param string $mode 'numeric' for random padded integers, 'alphanumeric' for random uppercase characters
     * @return string
     */
    public static function generate(
        string $prefix,
        ?string $modelClass = null,
        string $column = 'reference_number',
        int $length = 4,
        string $mode = 'numeric'
    ): string {
        $datePrefix = rtrim($prefix, '-') . '-' . now()->format('Ymd') . '-';

        do {
            if ($mode === 'alphanumeric') {
                $suffix = strtoupper(Str::random($length));
            } else {
                $max = (int) str_repeat('9', $length);
                $min = 1;
                $suffix = str_pad((string) mt_rand($min, $max), $length, '0', STR_PAD_LEFT);
            }

            $candidate = $datePrefix . $suffix;
            $exists = false;

            if ($modelClass && class_exists($modelClass)) {
                try {
                    $modelInstance = new $modelClass();
                    $table = $modelInstance->getTable();
                    if (Schema::hasColumn($table, $column)) {
                        $exists = $modelClass::where($column, $candidate)->exists();
                    }
                } catch (\Throwable) {
                    $exists = false;
                }
            }
        } while ($exists);

        return $candidate;
    }

    /**
     * Generate sequential entity code (e.g. CUS-000001, EMP-000001, WH-001).
     */
    public static function generateSequential(
        string $prefix,
        ?string $modelClass = null,
        string $column = 'code',
        int $length = 6
    ): string {
        $cleanPrefix = rtrim($prefix, '-') . '-';
        $nextNumber = 1;

        if ($modelClass && class_exists($modelClass)) {
            try {
                $modelInstance = new $modelClass();
                $table = $modelInstance->getTable();
                if (Schema::hasColumn($table, $column)) {
                    $latest = $modelClass::where($column, 'LIKE', "{$cleanPrefix}%")
                        ->orderByDesc('id')
                        ->value($column);

                    if ($latest && preg_match('/-(\d+)$/', $latest, $matches)) {
                        $nextNumber = ((int) $matches[1]) + 1;
                    } else {
                        $nextNumber = $modelClass::count() + 1;
                    }
                } else {
                    $nextNumber = $modelClass::count() + 1;
                }
            } catch (\Throwable) {
                $nextNumber = mt_rand(1, (int) str_repeat('9', $length));
            }
        }

        $padded = str_pad((string) $nextNumber, $length, '0', STR_PAD_LEFT);
        return $cleanPrefix . $padded;
    }

    /**
     * Generate invoice number for Sales (e.g. INV-20260913-AB12CD).
     */
    public static function invoice(string $prefix = 'INV-'): string
    {
        return self::generate(
            prefix: $prefix,
            modelClass: \App\Models\Sale\Sale::class,
            column: 'invoice_number',
            length: 6,
            mode: 'alphanumeric'
        );
    }

    /**
     * Generate order number for E-Commerce / Orders (e.g. ORD-20260913-0001).
     */
    public static function order(string $prefix = 'ORD-'): string
    {
        return self::generate(
            prefix: $prefix,
            modelClass: \App\Models\Order\Order::class,
            column: 'order_number',
            length: 4,
            mode: 'numeric'
        );
    }

    /**
     * Generate payment reference code (e.g. PAY-20260913-0001).
     */
    public static function payment(string $prefix = 'PAY-'): string
    {
        return self::generate(
            prefix: $prefix,
            modelClass: \App\Models\Payment\Payment::class,
            column: 'reference',
            length: 4,
            mode: 'numeric'
        );
    }

    /**
     * Generate reference number for Purchase Orders (e.g. PO-20260913-0042).
     */
    public static function purchaseOrder(string $prefix = 'PO-'): string
    {
        return self::generate(
            prefix: $prefix,
            modelClass: \App\Models\Purchase\Purchase::class,
            column: 'reference_number',
            length: 4,
            mode: 'numeric'
        );
    }

    /**
     * Generate reference number for Purchase Returns (e.g. PR-20260913-0015).
     */
    public static function purchaseReturn(string $prefix = 'PR-'): string
    {
        return self::generate(
            prefix: $prefix,
            modelClass: \App\Models\Purchase\PurchaseReturn::class,
            column: 'reference_number',
            length: 4,
            mode: 'numeric'
        );
    }

    /**
     * Generate reference number for Expenses (e.g. EXP-20260913-4821).
     */
    public static function expense(string $prefix = 'EXP-'): string
    {
        return self::generate(
            prefix: $prefix,
            modelClass: \App\Models\Expense\Expense::class,
            column: 'reference_number',
            length: 4,
            mode: 'numeric'
        );
    }

    /**
     * Generate reference number for Stock Adjustments (e.g. ADJ-20260913-8192).
     */
    public static function stockAdjustment(string $prefix = 'ADJ-'): string
    {
        return self::generate(
            prefix: $prefix,
            modelClass: \App\Models\Inventory\StockAdjustment::class,
            column: 'reference_number',
            length: 4,
            mode: 'numeric'
        );
    }

    /**
     * Generate reference number for Stock Opnames (e.g. OPN-20260913-7392).
     */
    public static function stockOpname(string $prefix = 'OPN-'): string
    {
        return self::generate(
            prefix: $prefix,
            modelClass: \App\Models\Inventory\StockOpname::class,
            column: 'reference_number',
            length: 4,
            mode: 'numeric'
        );
    }

    /**
     * Generate reference number for Stock Transfers (e.g. TRF-20260913-1823).
     */
    public static function stockTransfer(string $prefix = 'TRF-'): string
    {
        return self::generate(
            prefix: $prefix,
            modelClass: \App\Models\Inventory\StockTransfer::class,
            column: 'reference_number',
            length: 4,
            mode: 'numeric'
        );
    }

    /**
     * Generate reference number for Customer Support Tickets (e.g. TCK-20260913-5821).
     */
    public static function ticket(string $prefix = 'TCK-'): string
    {
        return self::generate(
            prefix: $prefix,
            modelClass: \App\Models\Customer\CustomerTicket::class,
            column: 'ticket_number',
            length: 4,
            mode: 'numeric'
        );
    }

    /**
     * Generate customer code (e.g. CUS-000001).
     */
    public static function customer(string $prefix = 'CUS-'): string
    {
        return self::generateSequential(
            prefix: $prefix,
            modelClass: \App\Models\Customer\Customer::class,
            column: 'code',
            length: 6
        );
    }

    /**
     * Generate supplier code (e.g. SUP-000001).
     */
    public static function supplier(string $prefix = 'SUP-'): string
    {
        return self::generateSequential(
            prefix: $prefix,
            modelClass: \App\Models\Supplier\Supplier::class,
            column: 'code',
            length: 6
        );
    }

    /**
     * Generate employee code (e.g. EMP-000001).
     */
    public static function employee(string $prefix = 'EMP-'): string
    {
        return self::generateSequential(
            prefix: $prefix,
            modelClass: \App\Models\Employee\Employee::class,
            column: 'employee_number',
            length: 6
        );
    }

    /**
     * Generate company code (e.g. CMP-001).
     */
    public static function company(string $prefix = 'CMP-'): string
    {
        return self::generateSequential(
            prefix: $prefix,
            modelClass: \App\Models\Company\Company::class,
            column: 'code',
            length: 3
        );
    }

    /**
     * Generate branch code (e.g. BR-001).
     */
    public static function branch(string $prefix = 'BR-'): string
    {
        return self::generateSequential(
            prefix: $prefix,
            modelClass: \App\Models\Company\Branch::class,
            column: 'code',
            length: 3
        );
    }

    /**
     * Generate warehouse code (e.g. WH-001).
     */
    public static function warehouse(string $prefix = 'WH-'): string
    {
        return self::generateSequential(
            prefix: $prefix,
            modelClass: \App\Models\Company\Warehouse::class,
            column: 'code',
            length: 3
        );
    }

    /**
     * Generate shipping tracking number (e.g. KH123456789).
     */
    public static function trackingNumber(string $prefix = 'KH'): string
    {
        return $prefix . mt_rand(100000000, 999999999);
    }

    /**
     * Generate standard SKU (e.g. SKU-A1B2C3).
     */
    public static function sku(string $prefix = 'SKU'): string
    {
        return rtrim($prefix, '-') . '-' . strtoupper(Str::random(6));
    }
}
