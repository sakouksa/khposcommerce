<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── PAYMENT METHODS ─────────────────────────────────────────────────
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->unique();
            $table->enum('type', ['cash', 'bank_transfer', 'credit_card', 'debit_card', 'ewallet', 'qris', 'other']);
            $table->string('logo')->nullable();
            $table->json('config')->nullable(); // gateway credentials etc.
            $table->decimal('fee_percent', 8, 4)->default(0);
            $table->decimal('fee_fixed', 15, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('available_pos')->default(true);
            $table->boolean('available_online')->default(true);
            $table->timestamps();
        });

        // ─── SALES (POS) ─────────────────────────────────────────────────────
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('store_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // cashier
            $table->string('invoice_number')->unique();
            $table->dateTime('date');
            $table->enum('status', ['pending', 'completed', 'cancelled', 'refunded'])->default('completed');
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2)->default(0);
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->decimal('change_amount', 15, 2)->default(0);
            $table->string('currency_code', 10)->default('IDR');
            $table->foreignId('payment_method_id')->nullable()->constrained()->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'branch_id', 'date']);
            $table->index('customer_id');
            $table->index('invoice_number');
        });

        // ─── SALE ITEMS ───────────────────────────────────────────────────────
        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name');
            $table->string('sku');
            $table->decimal('quantity', 15, 4);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('discount_percent', 8, 4)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('tax_percent', 8, 4)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);
            $table->timestamps();

            $table->index('sale_id');
        });

        // ─── SALE RETURNS ─────────────────────────────────────────────────────
        Schema::create('sale_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sale_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reference_number')->unique();
            $table->dateTime('date');
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->decimal('refund_amount', 15, 2)->default(0);
            $table->enum('refund_method', ['cash', 'store_credit', 'original_payment'])->default('cash');
            $table->text('reason')->nullable();
            $table->enum('status', ['draft', 'approved', 'cancelled'])->default('draft');
            $table->timestamps();
            $table->softDeletes();
        });

        // ─── SALE RETURN ITEMS ────────────────────────────────────────────────
        Schema::create('sale_return_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_return_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sale_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('quantity', 15, 4);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('sale_return_id');
        });

        // ─── CASH REGISTERS ───────────────────────────────────────────────────
        Schema::create('cash_registers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('store_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('code')->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ─── CASH REGISTER TRANSACTIONS ───────────────────────────────────────
        Schema::create('cash_register_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cash_register_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['open', 'close', 'cash_in', 'cash_out', 'sale', 'refund']);
            $table->decimal('amount', 15, 2)->default(0);
            $table->decimal('balance_before', 15, 2)->default(0);
            $table->decimal('balance_after', 15, 2)->default(0);
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['cash_register_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_register_transactions');
        Schema::dropIfExists('cash_registers');
        Schema::dropIfExists('sale_return_items');
        Schema::dropIfExists('sale_returns');
        Schema::dropIfExists('sale_items');
        Schema::dropIfExists('sales');
        Schema::dropIfExists('payment_methods');
    }
};
