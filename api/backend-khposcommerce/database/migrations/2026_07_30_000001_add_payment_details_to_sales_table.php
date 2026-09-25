<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            if (!Schema::hasColumn('sales', 'payment_method')) {
                $table->string('payment_method')->nullable()->after('payment_method_id');
            }
            if (!Schema::hasColumn('sales', 'payment_details')) {
                $table->json('payment_details')->nullable()->after('payment_method');
            }
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            if (Schema::hasColumn('sales', 'payment_details')) {
                $table->dropColumn('payment_details');
            }
            if (Schema::hasColumn('sales', 'payment_method')) {
                $table->dropColumn('payment_method');
            }
        });
    }
};
