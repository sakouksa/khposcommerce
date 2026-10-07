<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. PROMOTION CAMPAIGNS (Container for campaigns)
        Schema::create('promotion_campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            
            // Status: draft, scheduled, active, paused, expired, cancelled
            $table->string('status', 30)->default('active');
            
            $table->dateTime('start_at')->nullable();
            $table->dateTime('end_at')->nullable();
            
            $table->integer('priority')->default(0);
            $table->boolean('is_stackable')->default(true);
            $table->boolean('is_active')->default(true);
            
            $table->integer('usage_limit')->nullable();
            $table->integer('usage_count')->default(0);
            
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'status', 'is_active']);
            $table->index(['start_at', 'end_at']);
        });

        // 2. PROMOTION RULES (Multiple discount rules under one campaign)
        Schema::create('promotion_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promotion_campaign_id')->constrained('promotion_campaigns')->cascadeOnDelete();
            $table->string('name');
            
            // rule_type: product_discount, category_discount, brand_discount, cart_discount, buy_x_get_y, bundle_discount, free_shipping, coupon_discount
            $table->string('rule_type', 50)->default('product_discount');
            
            // discount_type: percentage, fixed_amount, fixed_price, free_item, free_shipping
            $table->string('discount_type', 50)->default('percentage');
            $table->decimal('discount_value', 15, 2)->default(0);
            
            $table->decimal('min_qty', 15, 4)->nullable();
            $table->decimal('max_qty', 15, 4)->nullable();
            
            $table->decimal('min_subtotal', 15, 2)->nullable();
            $table->decimal('max_subtotal', 15, 2)->nullable();
            
            $table->decimal('max_discount_amount', 15, 2)->nullable();
            
            $table->integer('priority')->default(0);
            $table->boolean('is_stackable')->default(true);
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();

            $table->index(['promotion_campaign_id', 'rule_type', 'is_active']);
        });

        // 3. RULE TARGETS (Normalized Many-to-Many relations, no comma strings)
        Schema::create('promotion_rule_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promotion_rule_id')->constrained('promotion_rules')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['promotion_rule_id', 'product_id'], 'pr_rule_prod_unique');
        });

        Schema::create('promotion_rule_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promotion_rule_id')->constrained('promotion_rules')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['promotion_rule_id', 'category_id'], 'pr_rule_cat_unique');
        });

        Schema::create('promotion_rule_brands', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promotion_rule_id')->constrained('promotion_rules')->cascadeOnDelete();
            $table->foreignId('brand_id')->constrained('brands')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['promotion_rule_id', 'brand_id'], 'pr_rule_brand_unique');
        });

        // 4. BRANCH SCOPE (Data isolation & branch enforcement)
        Schema::create('promotion_campaign_branches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promotion_campaign_id')->constrained('promotion_campaigns')->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['promotion_campaign_id', 'branch_id'], 'pc_branch_unique');
        });

        // 5. CHANNEL SCOPE (pos, web, mobile, all)
        Schema::create('promotion_campaign_channels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promotion_campaign_id')->constrained('promotion_campaigns')->cascadeOnDelete();
            $table->string('channel', 30); // pos, web, mobile, all
            $table->timestamps();

            $table->unique(['promotion_campaign_id', 'channel'], 'pc_channel_unique');
        });

        // 6. CUSTOMER ELIGIBILITY (Groups & Specific Customers)
        Schema::create('promotion_customer_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promotion_campaign_id')->constrained('promotion_campaigns')->cascadeOnDelete();
            $table->foreignId('customer_group_id')->constrained('customer_groups')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['promotion_campaign_id', 'customer_group_id'], 'pc_cust_grp_unique');
        });

        Schema::create('promotion_customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promotion_campaign_id')->constrained('promotion_campaigns')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['promotion_campaign_id', 'customer_id'], 'pc_cust_unique');
        });

        // 7. COUPONS (Promo codes linked to campaigns)
        Schema::create('promotion_coupons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promotion_campaign_id')->constrained('promotion_campaigns')->cascadeOnDelete();
            $table->string('code')->unique();
            $table->integer('usage_limit')->nullable();
            $table->integer('usage_per_customer')->default(1);
            $table->integer('used_count')->default(0);
            $table->dateTime('starts_at')->nullable();
            $table->dateTime('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['code', 'is_active']);
        });

        // 8. USAGE TRACKING (Historical audit & limit validation)
        Schema::create('promotion_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promotion_campaign_id')->constrained('promotion_campaigns')->cascadeOnDelete();
            $table->foreignId('promotion_coupon_id')->nullable()->constrained('promotion_coupons')->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('sale_id')->nullable()->constrained('sales')->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->dateTime('used_at');
            $table->timestamps();

            $table->index(['promotion_campaign_id', 'customer_id']);
            $table->index(['promotion_coupon_id', 'customer_id']);
        });

        // 9. BUY X GET Y (Phase 2 feature, table prepared)
        Schema::create('promotion_buy_x_get_y', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promotion_rule_id')->constrained('promotion_rules')->cascadeOnDelete();
            $table->decimal('buy_quantity', 15, 4)->default(1);
            $table->decimal('get_quantity', 15, 4)->default(1);
            $table->foreignId('buy_product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->foreignId('get_product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('discount_type', 50)->default('percentage'); // percentage (100% = free), fixed_amount
            $table->decimal('discount_value', 15, 2)->default(100);
            $table->timestamps();
        });

        // 10. BUNDLE DISCOUNT (Phase 2 feature, table prepared)
        Schema::create('promotion_bundles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promotion_rule_id')->constrained('promotion_rules')->cascadeOnDelete();
            $table->string('name');
            $table->decimal('fixed_price', 15, 2);
            $table->timestamps();
        });

        Schema::create('promotion_bundle_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promotion_bundle_id')->constrained('promotion_bundles')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->decimal('quantity', 15, 4)->default(1);
            $table->timestamps();
        });

        // 11. DISCOUNT SNAPSHOT IN SALE_ITEMS & ORDER_ITEMS
        Schema::table('sale_items', function (Blueprint $table) {
            if (!Schema::hasColumn('sale_items', 'discount_type')) {
                $table->string('discount_type', 50)->nullable()->after('discount_amount');
            }
            if (!Schema::hasColumn('sale_items', 'promotion_id')) {
                $table->unsignedBigInteger('promotion_id')->nullable()->after('discount_type');
            }
            if (!Schema::hasColumn('sale_items', 'promotion_rule_id')) {
                $table->unsignedBigInteger('promotion_rule_id')->nullable()->after('promotion_id');
            }
            if (!Schema::hasColumn('sale_items', 'final_unit_price')) {
                $table->decimal('final_unit_price', 15, 2)->default(0)->after('promotion_rule_id');
            }
        });

        Schema::table('order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('order_items', 'discount_type')) {
                $table->string('discount_type', 50)->nullable()->after('discount_amount');
            }
            if (!Schema::hasColumn('order_items', 'promotion_id')) {
                $table->unsignedBigInteger('promotion_id')->nullable()->after('discount_type');
            }
            if (!Schema::hasColumn('order_items', 'promotion_rule_id')) {
                $table->unsignedBigInteger('promotion_rule_id')->nullable()->after('promotion_id');
            }
            if (!Schema::hasColumn('order_items', 'final_unit_price')) {
                $table->decimal('final_unit_price', 15, 2)->default(0)->after('promotion_rule_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['discount_type', 'promotion_id', 'promotion_rule_id', 'final_unit_price']);
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropColumn(['discount_type', 'promotion_id', 'promotion_rule_id', 'final_unit_price']);
        });

        Schema::dropIfExists('promotion_bundle_items');
        Schema::dropIfExists('promotion_bundles');
        Schema::dropIfExists('promotion_buy_x_get_y');
        Schema::dropIfExists('promotion_usages');
        Schema::dropIfExists('promotion_coupons');
        Schema::dropIfExists('promotion_customers');
        Schema::dropIfExists('promotion_customer_groups');
        Schema::dropIfExists('promotion_campaign_channels');
        Schema::dropIfExists('promotion_campaign_branches');
        Schema::dropIfExists('promotion_rule_brands');
        Schema::dropIfExists('promotion_rule_categories');
        Schema::dropIfExists('promotion_rule_products');
        Schema::dropIfExists('promotion_rules');
        Schema::dropIfExists('promotion_campaigns');
    }
};
