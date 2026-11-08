<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── CATEGORIES ─────────────────────────────────────────────────────
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'parent_id']);
        });

        // ─── BRANDS ─────────────────────────────────────────────────────────
        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('logo')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('company_id');
        });

        // ─── UNITS ──────────────────────────────────────────────────────────
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('symbol', 20);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ─── TAXES ──────────────────────────────────────────────────────────
        Schema::create('taxes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('rate', 8, 4); // e.g. 11.0000 for 11% PPN
            $table->enum('type', ['percentage', 'fixed'])->default('percentage');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ─── ATTRIBUTES ─────────────────────────────────────────────────────
        Schema::create('attributes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['select', 'color', 'button', 'text'])->default('select');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ─── ATTRIBUTE VALUES ────────────────────────────────────────────────
        Schema::create('attribute_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attribute_id')->constrained()->cascadeOnDelete();
            $table->string('value');
            $table->string('color_code', 10)->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('attribute_id');
        });

        // ─── PRODUCTS ───────────────────────────────────────────────────────
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('brand_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('tax_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku')->unique();
            $table->string('barcode')->nullable()->unique();
            $table->text('description')->nullable();
            $table->text('short_description')->nullable();
            $table->decimal('cost_price', 15, 2)->default(0);
            $table->decimal('selling_price', 15, 2)->default(0);
            $table->decimal('compare_price', 15, 2)->nullable();
            $table->decimal('weight', 10, 3)->nullable(); // kg
            $table->decimal('length', 10, 2)->nullable(); // cm
            $table->decimal('width', 10, 2)->nullable();
            $table->decimal('height', 10, 2)->nullable();
            $table->boolean('has_variants')->default(false);
            $table->boolean('track_inventory')->default(true);
            $table->integer('low_stock_threshold')->default(5);
            $table->enum('status', ['active', 'inactive', 'draft', 'archived'])->default('active');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_digital')->default(false);
            $table->integer('sold_count')->default(0);
            $table->integer('view_count')->default(0);
            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->integer('rating_count')->default(0);
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'category_id', 'status']);
            $table->index('slug');
            $table->index('sku');
        });

        // ─── PRODUCT IMAGES ─────────────────────────────────────────────────
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('image');
            $table->string('alt_text')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->index('product_id');
        });

        // ─── PRODUCT VARIANTS ───────────────────────────────────────────────
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('sku')->unique();
            $table->string('barcode')->nullable()->unique();
            $table->decimal('cost_price', 15, 2)->default(0);
            $table->decimal('selling_price', 15, 2)->default(0);
            $table->decimal('compare_price', 15, 2)->nullable();
            $table->decimal('weight', 10, 3)->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('product_id');
        });

        // ─── PRODUCT VARIANT VALUES ──────────────────────────────────────────
        Schema::create('product_variant_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_variant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('attribute_id')->constrained()->cascadeOnDelete();
            $table->foreignId('attribute_value_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->index(['product_variant_id', 'attribute_id']);
        });

        // ─── PRODUCT PRICES (multi-tier pricing) ────────────────────────────
        Schema::create('product_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->string('price_type'); // retail, wholesale, member, etc.
            $table->integer('min_qty')->default(1);
            $table->decimal('price', 15, 2);
            $table->string('currency_code', 10)->default('IDR');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['product_id', 'price_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_prices');
        Schema::dropIfExists('product_variant_values');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('products');
        Schema::dropIfExists('attribute_values');
        Schema::dropIfExists('attributes');
        Schema::dropIfExists('taxes');
        Schema::dropIfExists('units');
        Schema::dropIfExists('brands');
        Schema::dropIfExists('categories');
    }
};
