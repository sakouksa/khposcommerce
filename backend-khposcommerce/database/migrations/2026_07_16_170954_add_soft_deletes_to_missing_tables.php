<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $tables = [
            'blog_categories',
            'blog_tags',
            'faqs',
            'units',
            'attributes',
            'customer_groups',
            'customer_addresses',
            'expense_categories',
            'shipping_methods',
            'shipping_zones',
            'shipping_rates',
            'payment_methods',
            'currencies',
            'taxes',
            'inventories',
        ];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName) && !Schema::hasColumn($tableName, 'deleted_at')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->softDeletes();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'blog_categories',
            'blog_tags',
            'faqs',
            'units',
            'attributes',
            'customer_groups',
            'customer_addresses',
            'expense_categories',
            'shipping_methods',
            'shipping_zones',
            'shipping_rates',
            'payment_methods',
            'currencies',
            'taxes',
            'inventories',
        ];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'deleted_at')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->dropSoftDeletes();
                });
            }
        }
    }
};
