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
        // 1. Update purchases table
        Schema::table('purchases', function (Blueprint $table) {
            $table->decimal('subtotal_base', 15, 2)->default(0)->after('due_amount');
            $table->decimal('tax_amount_base', 15, 2)->default(0)->after('subtotal_base');
            $table->decimal('discount_amount_base', 15, 2)->default(0)->after('tax_amount_base');
            $table->decimal('shipping_cost_base', 15, 2)->default(0)->after('discount_amount_base');
            $table->decimal('grand_total_base', 15, 2)->default(0)->after('shipping_cost_base');
            $table->decimal('paid_amount_base', 15, 2)->default(0)->after('grand_total_base');
            $table->decimal('due_amount_base', 15, 2)->default(0)->after('paid_amount_base');
        });

        // 2. Update purchase_items table
        Schema::table('purchase_items', function (Blueprint $table) {
            $table->string('currency_code', 10)->default('USD')->after('notes');
            $table->decimal('exchange_rate', 15, 6)->default(1)->after('currency_code');
            $table->decimal('unit_cost_base', 15, 2)->default(0)->after('exchange_rate');
            $table->decimal('subtotal_base', 15, 2)->default(0)->after('unit_cost_base');
            $table->decimal('total_base', 15, 2)->default(0)->after('subtotal_base');
        });

        // 3. Update purchase_returns table
        Schema::table('purchase_returns', function (Blueprint $table) {
            $table->string('currency_code', 10)->default('USD')->after('status');
            $table->decimal('exchange_rate', 15, 6)->default(1)->after('currency_code');
            $table->decimal('total_amount_base', 15, 2)->default(0)->after('exchange_rate');
        });

        // 4. Update purchase_return_items table
        Schema::table('purchase_return_items', function (Blueprint $table) {
            $table->decimal('unit_cost_base', 15, 2)->default(0)->after('notes');
            $table->decimal('total_base', 15, 2)->default(0)->after('unit_cost_base');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_return_items', function (Blueprint $table) {
            $table->dropColumn(['unit_cost_base', 'total_base']);
        });

        Schema::table('purchase_returns', function (Blueprint $table) {
            $table->dropColumn(['currency_code', 'exchange_rate', 'total_amount_base']);
        });

        Schema::table('purchase_items', function (Blueprint $table) {
            $table->dropColumn(['currency_code', 'exchange_rate', 'unit_cost_base', 'subtotal_base', 'total_base']);
        });

        Schema::table('purchases', function (Blueprint $table) {
            $table->dropColumn([
                'subtotal_base',
                'tax_amount_base',
                'discount_amount_base',
                'shipping_cost_base',
                'grand_total_base',
                'paid_amount_base',
                'due_amount_base'
            ]);
        });
    }
};
