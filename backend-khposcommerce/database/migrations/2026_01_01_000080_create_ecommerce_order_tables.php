<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── SHIPPING METHODS ─────────────────────────────────────────────────
        Schema::create('shipping_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('provider')->nullable(); // JNE, J&T, SiCepat, etc.
            $table->decimal('base_price', 15, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ─── SHIPPING ZONES ───────────────────────────────────────────────────
        Schema::create('shipping_zones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->json('countries')->nullable();
            $table->json('provinces')->nullable();
            $table->json('cities')->nullable();
            $table->timestamps();
        });

        // ─── SHIPPING RATES ───────────────────────────────────────────────────
        Schema::create('shipping_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipping_method_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shipping_zone_id')->constrained()->cascadeOnDelete();
            $table->decimal('min_weight', 10, 3)->default(0);
            $table->decimal('max_weight', 10, 3)->nullable();
            $table->decimal('price', 15, 2)->default(0);
            $table->integer('estimated_days_min')->nullable();
            $table->integer('estimated_days_max')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['shipping_method_id', 'shipping_zone_id']);
        });

        // ─── CARTS ────────────────────────────────────────────────────────────
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_id')->nullable(); // for guest carts
            $table->string('currency_code', 10)->default('IDR');
            $table->timestamps();

            $table->index(['store_id', 'customer_id']);
            $table->index('session_id');
        });

        // ─── CART ITEMS ───────────────────────────────────────────────────────
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('quantity', 15, 4)->default(1);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->timestamps();

            $table->index('cart_id');
        });

        // ─── WISHLISTS ────────────────────────────────────────────────────────
        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->unique(['customer_id', 'product_id', 'product_variant_id']);
        });

        // ─── ORDERS ───────────────────────────────────────────────────────────
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('warehouse_id')->nullable()->constrained()->nullOnDelete();
            $table->string('order_number')->unique();
            $table->enum('status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'])->default('pending');
            $table->enum('payment_status', ['unpaid', 'partial', 'paid', 'refunded'])->default('unpaid');
            $table->enum('fulfillment_status', ['unfulfilled', 'partial', 'fulfilled'])->default('unfulfilled');
            $table->string('shipping_name')->nullable();
            $table->string('shipping_phone')->nullable();
            $table->text('shipping_address')->nullable();
            $table->string('shipping_city')->nullable();
            $table->string('shipping_province')->nullable();
            $table->string('shipping_country')->nullable();
            $table->string('shipping_postal_code')->nullable();
            $table->foreignId('shipping_method_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('shipping_cost', 15, 2)->default(0);
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2)->default(0);
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->string('coupon_code')->nullable();
            $table->string('currency_code', 10)->default('IDR');
            $table->decimal('exchange_rate', 15, 6)->default(1);
            $table->text('customer_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'store_id', 'status']);
            $table->index('customer_id');
            $table->index('order_number');
        });

        // ─── ORDER ITEMS ──────────────────────────────────────────────────────
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name');
            $table->string('product_sku');
            $table->string('product_image')->nullable();
            $table->decimal('quantity', 15, 4);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);
            $table->timestamps();

            $table->index('order_id');
        });

        // ─── ORDER STATUS HISTORIES ───────────────────────────────────────────
        Schema::create('order_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status');
            $table->text('comment')->nullable();
            $table->boolean('notify_customer')->default(false);
            $table->timestamps();

            $table->index('order_id');
        });

        // ─── SHIPMENTS ────────────────────────────────────────────────────────
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shipping_method_id')->nullable()->constrained()->nullOnDelete();
            $table->string('tracking_number')->nullable();
            $table->string('carrier')->nullable();
            $table->enum('status', ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'])->default('pending');
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();

            $table->index('order_id');
        });

        // ─── PAYMENTS ─────────────────────────────────────────────────────────
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_method_id')->nullable()->constrained()->nullOnDelete();
            $table->string('payable_type'); // order, purchase, etc.
            $table->unsignedBigInteger('payable_id');
            $table->string('transaction_id')->nullable()->unique();
            $table->string('reference_number')->nullable();
            $table->decimal('amount', 15, 2);
            $table->decimal('fee_amount', 15, 2)->default(0);
            $table->string('currency_code', 10)->default('IDR');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'])->default('pending');
            $table->json('gateway_response')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['payable_type', 'payable_id']);
            $table->index('status');
        });

        // ─── TRANSACTIONS ─────────────────────────────────────────────────────
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type'); // debit, credit
            $table->decimal('amount', 15, 2);
            $table->string('description')->nullable();
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('shipments');
        Schema::dropIfExists('order_status_histories');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('wishlists');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
        Schema::dropIfExists('shipping_rates');
        Schema::dropIfExists('shipping_zones');
        Schema::dropIfExists('shipping_methods');
    }
};
