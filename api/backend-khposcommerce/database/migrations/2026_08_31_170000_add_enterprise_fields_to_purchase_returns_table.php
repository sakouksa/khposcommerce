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
        Schema::table('purchase_returns', function (Blueprint $table) {
            $table->string('rma_number')->nullable()->after('reference_number');
            $table->string('shipping_carrier')->nullable()->after('status');
            $table->string('tracking_number')->nullable()->after('shipping_carrier');
            $table->string('refund_status', 30)->default('pending')->after('tracking_number'); // pending, offset, credited, refunded
            $table->string('refund_method', 50)->nullable()->after('refund_status'); // offset_invoice, credit_note, bank_transfer, cash, replacement
            $table->decimal('refund_amount', 15, 2)->default(0)->after('refund_method');
            $table->date('refund_date')->nullable()->after('refund_amount');
            $table->text('attachment_url')->nullable()->after('reason');
            $table->text('settlement_notes')->nullable()->after('refund_date');
        });

        Schema::table('purchase_return_items', function (Blueprint $table) {
            $table->string('batch_number')->nullable()->after('product_variant_id');
            $table->string('serial_number')->nullable()->after('batch_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_return_items', function (Blueprint $table) {
            $table->dropColumn(['batch_number', 'serial_number']);
        });

        Schema::table('purchase_returns', function (Blueprint $table) {
            $table->dropColumn([
                'rma_number',
                'shipping_carrier',
                'tracking_number',
                'refund_status',
                'refund_method',
                'refund_amount',
                'refund_date',
                'attachment_url',
                'settlement_notes',
            ]);
        });
    }
};
