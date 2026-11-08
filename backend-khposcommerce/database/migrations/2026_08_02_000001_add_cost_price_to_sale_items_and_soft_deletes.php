<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── Add cost_price to sale_items for profit reporting ────────────────
        Schema::table('sale_items', function (Blueprint $table) {
            if (!Schema::hasColumn('sale_items', 'cost_price')) {
                $table->decimal('cost_price', 15, 2)->default(0)->after('sku');
            }
        });

        // ─── Add soft deletes + reference_no to units & taxes ────────────────
        Schema::table('units', function (Blueprint $table) {
            if (!Schema::hasColumn('units', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        Schema::table('taxes', function (Blueprint $table) {
            if (!Schema::hasColumn('taxes', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    public function down(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {
            if (Schema::hasColumn('sale_items', 'cost_price')) {
                $table->dropColumn('cost_price');
            }
        });

        Schema::table('units', function (Blueprint $table) {
            if (Schema::hasColumn('units', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });

        Schema::table('taxes', function (Blueprint $table) {
            if (Schema::hasColumn('taxes', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};
