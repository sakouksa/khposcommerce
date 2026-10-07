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
        Schema::table('expense_categories', function (Blueprint $table) {
            if (Schema::hasColumn('expense_categories', 'icon')) {
                $table->dropColumn('icon');
            }
            if (Schema::hasColumn('expense_categories', 'color')) {
                $table->dropColumn('color');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expense_categories', function (Blueprint $table) {
            $table->string('icon', 50)->nullable()->after('code');
            $table->string('color', 50)->nullable()->after('icon');
        });
    }
};
