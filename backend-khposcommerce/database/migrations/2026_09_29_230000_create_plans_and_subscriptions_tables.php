<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── 1. PLANS ──────────────────────────────────────────────────────────
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->text('description')->nullable();
            $table->decimal('price_monthly', 12, 2)->default(0);
            $table->decimal('price_yearly', 12, 2)->default(0);
            $table->string('currency', 10)->default('USD');
            
            // Numeric Limits (-1 for unlimited)
            $table->integer('max_branches')->default(1);
            $table->integer('max_users')->default(5);
            $table->integer('max_warehouses')->default(2);
            $table->integer('max_products')->default(500);
            $table->integer('max_orders_per_month')->default(1000);
            $table->integer('max_storage_mb')->default(1024);
            
            // JSON Feature Flags
            $table->json('features')->nullable();
            
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        // ─── 2. SUBSCRIPTIONS ──────────────────────────────────────────────────
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained('plans');
            $table->string('status', 30)->default('active'); // trialing, active, past_due, paused, cancelled, expired
            $table->string('billing_cycle', 20)->default('monthly'); // monthly, yearly
            $table->decimal('amount', 12, 2)->default(0);
            $table->string('currency', 10)->default('USD');
            
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('paused_at')->nullable();
            $table->boolean('auto_renew')->default(true);
            $table->string('payment_method', 50)->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'status']);
        });

        // ─── 3. SUBSCRIPTION INVOICES ──────────────────────────────────────────
        Schema::create('subscription_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained('subscriptions')->cascadeOnDelete();
            $table->string('invoice_number', 50)->unique();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 10)->default('USD');
            $table->string('status', 30)->default('paid'); // pending, paid, failed, refunded
            $table->string('billing_cycle', 20)->default('monthly');
            $table->string('payment_method', 50)->nullable();
            $table->string('transaction_id', 100)->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('due_date')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'status']);
        });

        // ─── 4. ADD PRIMARY OWNER TO COMPANIES ─────────────────────────────────
        if (!Schema::hasColumn('companies', 'primary_owner_id')) {
            Schema::table('companies', function (Blueprint $table) {
                $table->foreignId('primary_owner_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('companies', 'primary_owner_id')) {
            Schema::table('companies', function (Blueprint $table) {
                $table->dropForeign(['primary_owner_id']);
                $table->dropColumn('primary_owner_id');
            });
        }
        Schema::dropIfExists('subscription_invoices');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('plans');
    }
};
