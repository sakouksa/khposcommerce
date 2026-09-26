<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ─── 1. RETURN POLICIES ─────────────────────────────────────────────
        Schema::create('return_policies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('name');
            $table->integer('return_window_days')->default(7);
            $table->boolean('is_returnable')->default(true);
            $table->boolean('allow_exchange')->default(true);
            $table->decimal('restocking_fee_percentage', 5, 2)->default(0);
            $table->decimal('restocking_fee_flat', 15, 2)->default(0);
            $table->decimal('customer_fault_shipping_fee', 15, 2)->default(0);
            $table->decimal('store_fault_shipping_fee', 15, 2)->default(0);
            $table->boolean('requires_original_packaging')->default(true);
            $table->boolean('requires_receipt')->default(true);
            $table->json('conditions_accepted')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index(['company_id', 'is_default']);
            $table->index('category_id');
        });

        // ─── 2. ORDER RETURNS (RMA REQUESTS) ────────────────────────────────
        Schema::create('order_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->foreignId('sale_id')->nullable()->constrained('sales')->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
            $table->string('return_number')->unique();
            $table->string('type', 20)->default('return'); // 'return', 'exchange'
            $table->string('channel', 20)->default('web'); // 'web', 'pos', 'mobile', 'admin'
            $table->string('fault', 20)->default('customer'); // 'customer', 'store', 'courier'
            $table->string('reason_code', 50); // 'wrong_variant_selected', 'wrong_item_sent', 'defective', 'changed_mind', 'damaged_in_transit'
            $table->text('reason_notes')->nullable();
            $table->string('status', 30)->default('requested'); 
            // 'requested', 'approved', 'rejected', 'in_transit', 'received', 'inspecting', 'completed', 'cancelled', 'expired'
            $table->string('currency_code', 10)->default('USD');
            $table->decimal('exchange_rate', 15, 6)->default(1);
            $table->decimal('subtotal_amount', 15, 2)->default(0);
            $table->decimal('allocated_discount_amount', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('restocking_fee', 15, 2)->default(0);
            $table->decimal('return_shipping_fee', 15, 2)->default(0);
            $table->decimal('total_refund_amount', 15, 2)->default(0);
            $table->string('refund_status', 30)->default('pending'); // 'pending', 'partial', 'refunded', 'offset_exchange', 'store_credit'
            $table->string('refund_method', 30)->default('original_payment'); // 'original_payment', 'store_credit', 'cash', 'bakong_khqr', 'bank_transfer'
            $table->json('refund_account_info')->nullable(); // bank/KHQR account details
            $table->timestamp('expires_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'status']);
            $table->index('order_id');
            $table->index('sale_id');
            $table->index('customer_id');
            $table->index('return_number');
        });

        // ─── 3. ORDER RETURN ITEMS ──────────────────────────────────────────
        Schema::create('order_return_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_return_id')->constrained('order_returns')->cascadeOnDelete();
            $table->foreignId('order_item_id')->nullable()->constrained('order_items')->nullOnDelete();
            $table->foreignId('sale_item_id')->nullable()->constrained('sale_items')->nullOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained('product_variants')->nullOnDelete();
            $table->decimal('quantity_requested', 15, 4);
            $table->decimal('quantity_received', 15, 4)->default(0);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('allocated_discount', 15, 2)->default(0);
            $table->decimal('allocated_tax', 15, 2)->default(0);
            $table->decimal('net_unit_refund', 15, 2)->default(0);
            $table->decimal('total_refund', 15, 2)->default(0);
            $table->string('sold_serial_number', 100)->nullable();
            $table->string('returned_serial_number', 100)->nullable();
            $table->string('condition_grade', 50)->nullable(); // 'resellable_new', 'open_box', 'refurbished', 'damaged', 'scrap'
            $table->string('inspection_status', 30)->default('pending'); // 'pending', 'passed', 'failed', 'partial'
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('order_return_id');
            $table->index('product_id');
        });

        // ─── 4. RETURN SHIPMENTS (REVERSE LOGISTICS) ─────────────────────────
        Schema::create('return_shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_return_id')->constrained('order_returns')->cascadeOnDelete();
            $table->foreignId('shipping_method_id')->nullable()->constrained('shipping_methods')->nullOnDelete();
            $table->string('carrier')->nullable();
            $table->string('tracking_number')->nullable();
            $table->string('pickup_type', 30)->default('courier_dropoff'); // 'courier_dropoff', 'courier_pickup', 'store_dropoff', 'driver_intercept'
            $table->decimal('shipping_fee', 15, 2)->default(0);
            $table->string('paid_by', 20)->default('customer'); // 'customer', 'store', 'split'
            $table->string('status', 30)->default('pending'); // 'pending', 'picked_up', 'in_transit', 'delivered', 'failed'
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('order_return_id');
            $table->index('tracking_number');
        });

        // ─── 5. RETURN INSPECTIONS (WAREHOUSE QC) ───────────────────────────
        Schema::create('return_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_return_id')->constrained('order_returns')->cascadeOnDelete();
            $table->foreignId('warehouse_id')->constrained('warehouses')->cascadeOnDelete();
            $table->foreignId('inspector_id')->constrained('users')->cascadeOnDelete();
            $table->string('inspection_number')->unique();
            $table->string('status', 30)->default('completed'); // 'in_progress', 'completed', 'disputed'
            $table->string('verdict', 30)->default('pass'); // 'pass', 'partial_pass', 'reject', 'fraud_suspected'
            $table->text('summary_notes')->nullable();
            $table->json('images')->nullable();
            $table->timestamp('inspected_at')->nullable();
            $table->timestamps();

            $table->index('order_return_id');
            $table->index('inspection_number');
        });

        Schema::create('return_inspection_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('return_inspection_id')->constrained('return_inspections')->cascadeOnDelete();
            $table->foreignId('order_return_item_id')->constrained('order_return_items')->cascadeOnDelete();
            $table->boolean('serial_matched')->default(true);
            $table->json('accessories_checklist')->nullable(); // e.g. {"box": true, "charger": true, "cable": false}
            $table->string('condition_grade', 30)->default('resellable_new'); // 'resellable_new', 'open_box', 'refurbished', 'damaged_repairable', 'scrap'
            $table->decimal('deduction_amount', 15, 2)->default(0);
            $table->string('inventory_action', 40)->default('restock_available'); 
            // 'restock_available', 'move_to_refurbished', 'move_to_damaged_quarantine', 'scrap_write_off', 'return_to_customer'
            $table->text('inspector_notes')->nullable();
            $table->json('photos')->nullable();
            $table->timestamps();

            $table->index('return_inspection_id');
            $table->index('order_return_item_id');
        });

        // ─── 6. EXCHANGE ORDERS ─────────────────────────────────────────────
        Schema::create('exchange_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_return_id')->constrained('order_returns')->cascadeOnDelete();
            $table->foreignId('replacement_order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->foreignId('replacement_sale_id')->nullable()->constrained('sales')->nullOnDelete();
            $table->decimal('old_items_credit', 15, 2)->default(0);
            $table->decimal('new_items_cost', 15, 2)->default(0);
            $table->decimal('price_difference', 15, 2)->default(0);
            $table->decimal('exchange_fee', 15, 2)->default(0);
            $table->decimal('shipping_difference', 15, 2)->default(0);
            $table->decimal('customer_balance_due', 15, 2)->default(0);
            $table->decimal('store_refund_due', 15, 2)->default(0);
            $table->string('payment_status', 30)->default('unpaid'); // 'unpaid', 'paid', 'refunded', 'waived'
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('order_return_id');
            $table->index('replacement_order_id');
        });

        // ─── 7. CUSTOMER WALLETS & STORE CREDITS ─────────────────────────────
        Schema::create('customer_wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->unique()->constrained('customers')->cascadeOnDelete();
            $table->decimal('balance', 15, 2)->default(0);
            $table->string('currency_code', 10)->default('USD');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['company_id', 'customer_id']);
        });

        Schema::create('store_credit_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_wallet_id')->constrained('customer_wallets')->cascadeOnDelete();
            $table->foreignId('order_return_id')->nullable()->constrained('order_returns')->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('type', 30); // 'credit_return', 'debit_purchase', 'expired', 'adjustment'
            $table->decimal('amount', 15, 2);
            $table->decimal('balance_before', 15, 2);
            $table->decimal('balance_after', 15, 2);
            $table->timestamp('expires_at')->nullable();
            $table->string('reference_number', 50)->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('customer_wallet_id');
            $table->index('order_return_id');
        });

        // ─── 8. WARRANTIES & RMA CLAIMS ──────────────────────────────────────
        Schema::create('warranties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_item_id')->nullable()->constrained('order_items')->nullOnDelete();
            $table->foreignId('sale_item_id')->nullable()->constrained('sale_items')->nullOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('serial_number', 100)->nullable();
            $table->string('warranty_code', 50)->unique();
            $table->integer('duration_months')->default(12);
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status', 30)->default('active'); // 'active', 'expired', 'voided'
            $table->text('terms')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'serial_number']);
            $table->index('customer_id');
            $table->index('product_id');
        });

        Schema::create('warranty_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warranty_id')->constrained('warranties')->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('claim_number', 50)->unique();
            $table->text('issue_description');
            $table->string('claim_type', 30)->default('repair'); // 'repair', 'replacement', 'refund'
            $table->string('status', 30)->default('pending'); // 'pending', 'in_review', 'in_repair', 'resolved', 'rejected'
            $table->string('resolution', 30)->nullable(); // 'repaired', 'replaced_new', 'refunded', 'rejected_uncovered'
            $table->decimal('repair_cost', 15, 2)->default(0);
            $table->timestamp('repaired_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('warranty_id');
            $table->index('claim_number');
        });

        // ─── 9. UPDATE INVENTORY MOVEMENTS TYPE CONSTRAINT ───────────────────
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_type_check');
            DB::statement("ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movements_type_check CHECK (type IN ('in', 'out', 'transfer_in', 'transfer_out', 'adjustment', 'opname', 'purchase_return', 'purchase', 'sale_return', 'sale_return_restock', 'damaged_quarantine', 'scrap_loss'))");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('warranty_claims');
        Schema::dropIfExists('warranties');
        Schema::dropIfExists('store_credit_transactions');
        Schema::dropIfExists('customer_wallets');
        Schema::dropIfExists('exchange_orders');
        Schema::dropIfExists('return_inspection_items');
        Schema::dropIfExists('return_inspections');
        Schema::dropIfExists('return_shipments');
        Schema::dropIfExists('order_return_items');
        Schema::dropIfExists('order_returns');
        Schema::dropIfExists('return_policies');

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_type_check');
            DB::statement("ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movements_type_check CHECK (type IN ('in', 'out', 'transfer_in', 'transfer_out', 'adjustment', 'opname', 'purchase_return', 'purchase'))");
        }
    }
};
