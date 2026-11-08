<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── COUPONS ──────────────────────────────────────────────────────────
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->unique();
            $table->enum('type', ['percentage', 'fixed', 'free_shipping'])->default('percentage');
            $table->decimal('value', 15, 2)->default(0);
            $table->decimal('min_purchase', 15, 2)->nullable();
            $table->decimal('max_discount', 15, 2)->nullable();
            $table->integer('usage_limit')->nullable();
            $table->integer('usage_limit_per_customer')->nullable();
            $table->integer('used_count')->default(0);
            $table->dateTime('starts_at')->nullable();
            $table->dateTime('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('company_id');
        });

        // ─── COUPON PRODUCTS ─────────────────────────────────────────────────
        Schema::create('coupon_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['coupon_id', 'product_id']);
        });

        // ─── FLASH SALES ─────────────────────────────────────────────────────
        Schema::create('flash_sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // ─── FLASH SALE PRODUCTS ─────────────────────────────────────────────
        Schema::create('flash_sale_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flash_sale_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('flash_price', 15, 2);
            $table->decimal('discount_percent', 8, 4)->default(0);
            $table->integer('quota')->nullable();
            $table->integer('sold_count')->default(0);
            $table->timestamps();

            $table->index('flash_sale_id');
        });

        // ─── PROMOTIONS ───────────────────────────────────────────────────────
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['buy_x_get_y', 'bundle', 'percentage', 'fixed', 'free_item']);
            $table->json('conditions')->nullable();
            $table->json('rewards')->nullable();
            $table->dateTime('starts_at')->nullable();
            $table->dateTime('ends_at')->nullable();
            $table->integer('priority')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // ─── BANNERS ──────────────────────────────────────────────────────────
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('store_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('image');
            $table->string('mobile_image')->nullable();
            $table->string('link')->nullable();
            $table->enum('position', ['hero', 'sidebar', 'popup', 'footer'])->default('hero');
            $table->integer('sort_order')->default(0);
            $table->dateTime('starts_at')->nullable();
            $table->dateTime('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // ─── PRODUCT REVIEWS ──────────────────────────────────────────────────
        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_item_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('email')->nullable();
            $table->unsignedTinyInteger('rating'); // 1-5
            $table->string('title')->nullable();
            $table->text('body');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->boolean('is_verified_purchase')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['product_id', 'status']);
        });

        // ─── REVIEW IMAGES ────────────────────────────────────────────────────
        Schema::create('review_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_review_id')->constrained()->cascadeOnDelete();
            $table->string('image');
            $table->timestamps();
        });

        // ─── EXPENSE CATEGORIES ───────────────────────────────────────────────
        Schema::create('expense_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ─── EXPENSES ─────────────────────────────────────────────────────────
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('expense_category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reference_number')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->string('receipt')->nullable(); // file path
            $table->enum('status', ['draft', 'approved', 'rejected', 'paid'])->default('draft');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'branch_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('expense_categories');
        Schema::dropIfExists('review_images');
        Schema::dropIfExists('product_reviews');
        Schema::dropIfExists('banners');
        Schema::dropIfExists('promotions');
        Schema::dropIfExists('flash_sale_products');
        Schema::dropIfExists('flash_sales');
        Schema::dropIfExists('coupon_products');
        Schema::dropIfExists('coupons');
    }
};
