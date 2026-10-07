<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── INVENTORIES ─────────────────────────────────────────────────────
        Schema::create('inventories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('quantity', 15, 4)->default(0);
            $table->decimal('reserved_quantity', 15, 4)->default(0); // held by pending orders
            $table->decimal('available_quantity', 15, 4)->storedAs('quantity - reserved_quantity');
            $table->decimal('reorder_point', 15, 4)->default(5);
            $table->decimal('reorder_qty', 15, 4)->default(10);
            $table->timestamps();

            $table->unique(['warehouse_id', 'product_id', 'product_variant_id']);
            $table->index(['company_id', 'warehouse_id']);
            $table->index('product_id');
        });

        // ─── INVENTORY MOVEMENTS ─────────────────────────────────────────────
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reference_type')->nullable(); // purchase, sale, transfer, adjustment
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->enum('type', ['in', 'out', 'transfer_in', 'transfer_out', 'adjustment', 'opname']);
            $table->decimal('quantity', 15, 4);
            $table->decimal('quantity_before', 15, 4)->default(0);
            $table->decimal('quantity_after', 15, 4)->default(0);
            $table->decimal('unit_cost', 15, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['warehouse_id', 'product_id']);
            $table->index(['reference_type', 'reference_id']);
            $table->index('created_at');
        });

        // ─── STOCK ADJUSTMENTS ────────────────────────────────────────────────
        Schema::create('stock_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reference_number')->unique();
            $table->date('date');
            $table->enum('type', ['addition', 'subtraction', 'recount']);
            $table->text('reason')->nullable();
            $table->enum('status', ['draft', 'approved', 'cancelled'])->default('draft');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'warehouse_id']);
        });

        // ─── STOCK ADJUSTMENT ITEMS ─────────────────────────────────────────
        Schema::create('stock_adjustment_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_adjustment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('quantity_before', 15, 4)->default(0);
            $table->decimal('quantity_adjusted', 15, 4);
            $table->decimal('quantity_after', 15, 4)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('stock_adjustment_id');
        });

        // ─── STOCK TRANSFERS ─────────────────────────────────────────────────
        Schema::create('stock_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_warehouse_id')->constrained('warehouses')->cascadeOnDelete();
            $table->foreignId('to_warehouse_id')->constrained('warehouses')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reference_number')->unique();
            $table->date('date');
            $table->text('notes')->nullable();
            $table->enum('status', ['draft', 'in_transit', 'received', 'cancelled'])->default('draft');
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'from_warehouse_id', 'to_warehouse_id'], 'st_comp_from_to_idx');
        });

        // ─── STOCK TRANSFER ITEMS ─────────────────────────────────────────────
        Schema::create('stock_transfer_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_transfer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('quantity_requested', 15, 4);
            $table->decimal('quantity_sent', 15, 4)->default(0);
            $table->decimal('quantity_received', 15, 4)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('stock_transfer_id');
        });

        // ─── STOCK OPNAMES ────────────────────────────────────────────────────
        Schema::create('stock_opnames', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reference_number')->unique();
            $table->date('date');
            $table->text('notes')->nullable();
            $table->enum('status', ['draft', 'counting', 'done', 'cancelled'])->default('draft');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // ─── STOCK OPNAME ITEMS ───────────────────────────────────────────────
        Schema::create('stock_opname_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_opname_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('system_quantity', 15, 4)->default(0);
            $table->decimal('physical_quantity', 15, 4)->nullable();
            $table->decimal('difference', 15, 4)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('stock_opname_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_opname_items');
        Schema::dropIfExists('stock_opnames');
        Schema::dropIfExists('stock_transfer_items');
        Schema::dropIfExists('stock_transfers');
        Schema::dropIfExists('stock_adjustment_items');
        Schema::dropIfExists('stock_adjustments');
        Schema::dropIfExists('inventory_movements');
        Schema::dropIfExists('inventories');
    }
};
