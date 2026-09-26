<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations to add extended enterprise-grade performance indexes
     * across POS, inventory, catalog, HR, and marketing modules.
     */
    public function up(): void
    {
        // Ensure pg_trgm extension is available for PostgreSQL full-text/trigram search
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
        }

        // ─── 1. POS, SALES RETURNS & CASH REGISTERS MODULE ──────────────────
        $this->addIndexIfNotExists('sales', ['company_id', 'payment_method_id', 'date'], 'idx_sales_comp_payid_date');
        $this->addIndexIfNotExists('sales', ['company_id', 'warehouse_id', 'date'], 'idx_sales_comp_wh_date');
        $this->addIndexIfNotExists('sales', ['company_id', 'user_id', 'date'], 'idx_sales_comp_user_date');

        $this->addIndexIfNotExists('sale_returns', ['company_id', 'status', 'date'], 'idx_sale_returns_comp_stat_date');
        $this->addIndexIfNotExists('sale_returns', ['sale_id'], 'idx_sale_returns_sale_id');
        $this->addIndexIfNotExists('sale_returns', ['user_id'], 'idx_sale_returns_user_id');
        $this->addIndexIfNotExists('sale_returns', ['deleted_at'], 'idx_sale_returns_deleted_at');

        $this->addIndexIfNotExists('sale_return_items', ['sale_return_id', 'product_id'], 'idx_sale_ret_items_ret_prod');
        $this->addIndexIfNotExists('sale_return_items', ['product_variant_id'], 'idx_sale_ret_items_variant');
        $this->addIndexIfNotExists('sale_return_items', ['sale_item_id'], 'idx_sale_ret_items_sale_item');

        $this->addIndexIfNotExists('cash_registers', ['company_id', 'user_id', 'status'], 'idx_cash_reg_comp_user_stat');
        $this->addIndexIfNotExists('cash_registers', ['company_id', 'branch_id', 'status'], 'idx_cash_reg_comp_branch_stat');
        $this->addIndexIfNotExists('cash_registers', ['deleted_at'], 'idx_cash_reg_deleted_at');

        $this->addIndexIfNotExists('cash_register_transactions', ['cash_register_id', 'created_at'], 'idx_crt_reg_created');
        $this->addIndexIfNotExists('cash_register_transactions', ['user_id'], 'idx_crt_user_id');
        $this->addIndexIfNotExists('cash_register_transactions', ['reference_type', 'reference_id'], 'idx_crt_ref_type_id');

        // ─── 2. PRODUCTS, CATALOG & SEARCH OPTIMIZATION ─────────────────────
        // PostgreSQL GIN Trigram Search Indexes for fast LIKE '%query%' queries
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);');
            DB::statement('CREATE INDEX IF NOT EXISTS idx_products_sku_trgm ON products USING gin (sku gin_trgm_ops);');
            DB::statement('CREATE INDEX IF NOT EXISTS idx_customers_name_trgm ON customers USING gin (name gin_trgm_ops);');
            DB::statement('CREATE INDEX IF NOT EXISTS idx_customers_phone_trgm ON customers USING gin (phone gin_trgm_ops);');
        }

        $this->addIndexIfNotExists('products', ['company_id', 'status', 'selling_price'], 'idx_products_comp_stat_price');
        $this->addIndexIfNotExists('products', ['company_id', 'status', 'rating_avg'], 'idx_products_comp_stat_rating');

        $this->addIndexIfNotExists('product_variants', ['product_id', 'is_active'], 'idx_variants_prod_active');
        $this->addIndexIfNotExists('product_variants', ['deleted_at'], 'idx_variants_deleted_at');

        $this->addIndexIfNotExists('product_images', ['product_id', 'is_primary'], 'idx_prod_images_prod_primary');

        $this->addIndexIfNotExists('product_prices', ['product_variant_id', 'is_active'], 'idx_prod_prices_variant_active');
        $this->addIndexIfNotExists('product_prices', ['product_id', 'is_active'], 'idx_prod_prices_prod_active');

        $this->addIndexIfNotExists('inventories', ['product_variant_id'], 'idx_inventories_variant_id');

        // ─── 3. STOCK TRANSFERS, ADJUSTMENTS & OPNAMES MODULE ───────────────
        $this->addIndexIfNotExists('stock_transfers', ['company_id', 'status', 'date'], 'idx_stock_trans_comp_stat_date');
        $this->addIndexIfNotExists('stock_transfers', ['deleted_at'], 'idx_stock_trans_deleted_at');

        $this->addIndexIfNotExists('stock_transfer_items', ['stock_transfer_id', 'product_id'], 'idx_sti_trans_prod');
        $this->addIndexIfNotExists('stock_transfer_items', ['product_variant_id'], 'idx_sti_variant_id');

        $this->addIndexIfNotExists('stock_adjustments', ['company_id', 'status', 'date'], 'idx_stock_adj_comp_stat_date');
        $this->addIndexIfNotExists('stock_adjustments', ['deleted_at'], 'idx_stock_adj_deleted_at');

        $this->addIndexIfNotExists('stock_adjustment_items', ['stock_adjustment_id', 'product_id'], 'idx_saj_adj_prod');
        $this->addIndexIfNotExists('stock_adjustment_items', ['product_variant_id'], 'idx_saj_variant_id');

        $this->addIndexIfNotExists('stock_opnames', ['company_id', 'warehouse_id', 'status'], 'idx_stock_opn_comp_wh_stat');
        $this->addIndexIfNotExists('stock_opnames', ['date'], 'idx_stock_opn_date');
        $this->addIndexIfNotExists('stock_opnames', ['deleted_at'], 'idx_stock_opn_deleted_at');

        $this->addIndexIfNotExists('stock_opname_items', ['stock_opname_id', 'product_id'], 'idx_soi_opn_prod');
        $this->addIndexIfNotExists('stock_opname_items', ['product_variant_id'], 'idx_soi_variant_id');

        // ─── 4. PURCHASES & SUPPLIER RETURNS MODULE ─────────────────────────
        $this->addIndexIfNotExists('purchase_items', ['product_variant_id'], 'idx_purchase_items_variant');

        $this->addIndexIfNotExists('purchase_returns', ['company_id', 'status', 'date'], 'idx_pur_returns_comp_stat_date');
        $this->addIndexIfNotExists('purchase_returns', ['supplier_id'], 'idx_pur_returns_supplier_id');
        $this->addIndexIfNotExists('purchase_returns', ['deleted_at'], 'idx_pur_returns_deleted_at');

        $this->addIndexIfNotExists('purchase_return_items', ['purchase_return_id', 'product_id'], 'idx_pri_return_prod');
        $this->addIndexIfNotExists('purchase_return_items', ['product_variant_id'], 'idx_pri_variant_id');
        $this->addIndexIfNotExists('purchase_return_items', ['purchase_item_id'], 'idx_pri_purchase_item_id');

        // ─── 5. E-COMMERCE, MARKETING & PROMOTIONS MODULE ────────────────────
        $this->addIndexIfNotExists('flash_sales', ['company_id', 'is_active', 'starts_at', 'ends_at'], 'idx_flash_sales_comp_act_time');
        $this->addIndexIfNotExists('flash_sales', ['deleted_at'], 'idx_flash_sales_deleted_at');

        $this->addIndexIfNotExists('flash_sale_products', ['product_id', 'flash_sale_id'], 'idx_fsp_prod_sale');
        $this->addIndexIfNotExists('flash_sale_products', ['product_variant_id'], 'idx_fsp_variant_id');

        $this->addIndexIfNotExists('promotions', ['company_id', 'is_active', 'starts_at', 'ends_at'], 'idx_promotions_comp_act_time');
        $this->addIndexIfNotExists('promotions', ['deleted_at'], 'idx_promotions_deleted_at');

        $this->addIndexIfNotExists('banners', ['company_id', 'is_active', 'sort_order'], 'idx_banners_comp_act_sort');
        $this->addIndexIfNotExists('banners', ['deleted_at'], 'idx_banners_deleted_at');

        $this->addIndexIfNotExists('coupons', ['company_id', 'is_active', 'starts_at', 'expires_at'], 'idx_coupons_comp_act_time');
        $this->addIndexIfNotExists('coupons', ['deleted_at'], 'idx_coupons_deleted_at');

        $this->addIndexIfNotExists('cart_items', ['cart_id', 'product_id'], 'idx_cart_items_cart_prod');
        $this->addIndexIfNotExists('cart_items', ['product_variant_id'], 'idx_cart_items_variant_id');

        $this->addIndexIfNotExists('shipments', ['tracking_number'], 'idx_shipments_tracking_number');
        $this->addIndexIfNotExists('shipments', ['order_id', 'status'], 'idx_shipments_order_status');
        $this->addIndexIfNotExists('shipments', ['status', 'created_at'], 'idx_shipments_stat_created');

        // ─── 6. USERS, EMPLOYEES & AUTHENTICATION MODULE ────────────────────
        $this->addIndexIfNotExists('users', ['company_id', 'is_active'], 'idx_users_comp_active');
        $this->addIndexIfNotExists('users', ['company_id', 'branch_id'], 'idx_users_comp_branch');
        $this->addIndexIfNotExists('users', ['phone'], 'idx_users_phone');
        $this->addIndexIfNotExists('users', ['manager_pin'], 'idx_users_manager_pin');
        $this->addIndexIfNotExists('users', ['deleted_at'], 'idx_users_deleted_at');

        $this->addIndexIfNotExists('employees', ['company_id', 'status'], 'idx_employees_comp_status');
        $this->addIndexIfNotExists('employees', ['pos_pin'], 'idx_employees_pos_pin');
        $this->addIndexIfNotExists('employees', ['card_uid'], 'idx_employees_card_uid');
        $this->addIndexIfNotExists('employees', ['department_id'], 'idx_employees_department_id');
        $this->addIndexIfNotExists('employees', ['position_id'], 'idx_employees_position_id');
        $this->addIndexIfNotExists('employees', ['phone'], 'idx_employees_phone');
        $this->addIndexIfNotExists('employees', ['deleted_at'], 'idx_employees_deleted_at');

        $this->addIndexIfNotExists('payrolls', ['status', 'period_month'], 'idx_payrolls_stat_period');
        $this->addIndexIfNotExists('departments', ['company_id', 'is_active'], 'idx_departments_comp_active');
        $this->addIndexIfNotExists('positions', ['company_id', 'department_id'], 'idx_positions_comp_dept');

        // ─── 7. CRM, CUSTOMER GROUPS & PAYMENTS MODULE ──────────────────────
        $this->addIndexIfNotExists('customer_groups', ['company_id', 'is_active'], 'idx_customer_groups_comp_active');
        $this->addIndexIfNotExists('customer_groups', ['deleted_at'], 'idx_customer_groups_deleted_at');

        $this->addIndexIfNotExists('customer_points_ledger', ['customer_id', 'created_at'], 'idx_cpl_cust_created');
        $this->addIndexIfNotExists('customer_wallet_transactions', ['customer_id', 'created_at'], 'idx_cwt_cust_created');
        $this->addIndexIfNotExists('telegram_users', ['user_id'], 'idx_telegram_users_user_id');

        $this->addIndexIfNotExists('payments', ['company_id', 'status', 'paid_at'], 'idx_payments_comp_stat_paid');
        $this->addIndexIfNotExists('payments', ['reference_number'], 'idx_payments_reference_no');
        $this->addIndexIfNotExists('payments', ['payment_method_id'], 'idx_payments_method_id');

        $this->addIndexIfNotExists('transactions', ['company_id', 'created_at'], 'idx_transactions_comp_created');
        $this->addIndexIfNotExists('transactions', ['reference_type', 'reference_id'], 'idx_transactions_ref_type_id');
        $this->addIndexIfNotExists('transactions', ['payment_id'], 'idx_transactions_payment_id');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. POS, SALES RETURNS & CASH REGISTERS
        $this->dropIndexIfExists('sales', 'idx_sales_comp_payid_date');
        $this->dropIndexIfExists('sales', 'idx_sales_comp_wh_date');
        $this->dropIndexIfExists('sales', 'idx_sales_comp_user_date');

        $this->dropIndexIfExists('sale_returns', 'idx_sale_returns_comp_stat_date');
        $this->dropIndexIfExists('sale_returns', 'idx_sale_returns_sale_id');
        $this->dropIndexIfExists('sale_returns', 'idx_sale_returns_user_id');
        $this->dropIndexIfExists('sale_returns', 'idx_sale_returns_deleted_at');

        $this->dropIndexIfExists('sale_return_items', 'idx_sale_ret_items_ret_prod');
        $this->dropIndexIfExists('sale_return_items', 'idx_sale_ret_items_variant');
        $this->dropIndexIfExists('sale_return_items', 'idx_sale_ret_items_sale_item');

        $this->dropIndexIfExists('cash_registers', 'idx_cash_reg_comp_user_stat');
        $this->dropIndexIfExists('cash_registers', 'idx_cash_reg_comp_branch_stat');
        $this->dropIndexIfExists('cash_registers', 'idx_cash_reg_deleted_at');

        $this->dropIndexIfExists('cash_register_transactions', 'idx_crt_reg_created');
        $this->dropIndexIfExists('cash_register_transactions', 'idx_crt_user_id');
        $this->dropIndexIfExists('cash_register_transactions', 'idx_crt_ref_type_id');

        // 2. PRODUCTS, CATALOG & SEARCH OPTIMIZATION
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('DROP INDEX IF EXISTS idx_products_name_trgm;');
            DB::statement('DROP INDEX IF EXISTS idx_products_sku_trgm;');
            DB::statement('DROP INDEX IF EXISTS idx_customers_name_trgm;');
            DB::statement('DROP INDEX IF EXISTS idx_customers_phone_trgm;');
        }

        $this->dropIndexIfExists('products', 'idx_products_comp_stat_price');
        $this->dropIndexIfExists('products', 'idx_products_comp_stat_rating');

        $this->dropIndexIfExists('product_variants', 'idx_variants_prod_active');
        $this->dropIndexIfExists('product_variants', 'idx_variants_deleted_at');

        $this->dropIndexIfExists('product_images', 'idx_prod_images_prod_primary');

        $this->dropIndexIfExists('product_prices', 'idx_prod_prices_variant_active');
        $this->dropIndexIfExists('product_prices', 'idx_prod_prices_prod_active');

        $this->dropIndexIfExists('inventories', 'idx_inventories_variant_id');

        // 3. STOCK TRANSFERS, ADJUSTMENTS & OPNAMES
        $this->dropIndexIfExists('stock_transfers', 'idx_stock_trans_comp_stat_date');
        $this->dropIndexIfExists('stock_transfers', 'idx_stock_trans_deleted_at');

        $this->dropIndexIfExists('stock_transfer_items', 'idx_sti_trans_prod');
        $this->dropIndexIfExists('stock_transfer_items', 'idx_sti_variant_id');

        $this->dropIndexIfExists('stock_adjustments', 'idx_stock_adj_comp_stat_date');
        $this->dropIndexIfExists('stock_adjustments', 'idx_stock_adj_deleted_at');

        $this->dropIndexIfExists('stock_adjustment_items', 'idx_saj_adj_prod');
        $this->dropIndexIfExists('stock_adjustment_items', 'idx_saj_variant_id');

        $this->dropIndexIfExists('stock_opnames', 'idx_stock_opn_comp_wh_stat');
        $this->dropIndexIfExists('stock_opnames', 'idx_stock_opn_date');
        $this->dropIndexIfExists('stock_opnames', 'idx_stock_opn_deleted_at');

        $this->dropIndexIfExists('stock_opname_items', 'idx_soi_opn_prod');
        $this->dropIndexIfExists('stock_opname_items', 'idx_soi_variant_id');

        // 4. PURCHASES & SUPPLIER RETURNS
        $this->dropIndexIfExists('purchase_items', 'idx_purchase_items_variant');

        $this->dropIndexIfExists('purchase_returns', 'idx_pur_returns_comp_stat_date');
        $this->dropIndexIfExists('purchase_returns', 'idx_pur_returns_supplier_id');
        $this->dropIndexIfExists('purchase_returns', 'idx_pur_returns_deleted_at');

        $this->dropIndexIfExists('purchase_return_items', 'idx_pri_return_prod');
        $this->dropIndexIfExists('purchase_return_items', 'idx_pri_variant_id');
        $this->dropIndexIfExists('purchase_return_items', 'idx_pri_purchase_item_id');

        // 5. E-COMMERCE, MARKETING & PROMOTIONS
        $this->dropIndexIfExists('flash_sales', 'idx_flash_sales_comp_act_time');
        $this->dropIndexIfExists('flash_sales', 'idx_flash_sales_deleted_at');

        $this->dropIndexIfExists('flash_sale_products', 'idx_fsp_prod_sale');
        $this->dropIndexIfExists('flash_sale_products', 'idx_fsp_variant_id');

        $this->dropIndexIfExists('promotions', 'idx_promotions_comp_act_time');
        $this->dropIndexIfExists('promotions', 'idx_promotions_deleted_at');

        $this->dropIndexIfExists('banners', 'idx_banners_comp_act_sort');
        $this->dropIndexIfExists('banners', 'idx_banners_deleted_at');

        $this->dropIndexIfExists('coupons', 'idx_coupons_comp_act_time');
        $this->dropIndexIfExists('coupons', 'idx_coupons_deleted_at');

        $this->dropIndexIfExists('cart_items', 'idx_cart_items_cart_prod');
        $this->dropIndexIfExists('cart_items', 'idx_cart_items_variant_id');

        $this->dropIndexIfExists('shipments', 'idx_shipments_tracking_number');
        $this->dropIndexIfExists('shipments', 'idx_shipments_order_status');
        $this->dropIndexIfExists('shipments', 'idx_shipments_stat_created');

        // 6. USERS, EMPLOYEES & AUTHENTICATION
        $this->dropIndexIfExists('users', 'idx_users_comp_active');
        $this->dropIndexIfExists('users', 'idx_users_comp_branch');
        $this->dropIndexIfExists('users', 'idx_users_phone');
        $this->dropIndexIfExists('users', 'idx_users_manager_pin');
        $this->dropIndexIfExists('users', 'idx_users_deleted_at');

        $this->dropIndexIfExists('employees', 'idx_employees_comp_status');
        $this->dropIndexIfExists('employees', 'idx_employees_pos_pin');
        $this->dropIndexIfExists('employees', 'idx_employees_card_uid');
        $this->dropIndexIfExists('employees', 'idx_employees_department_id');
        $this->dropIndexIfExists('employees', 'idx_employees_position_id');
        $this->dropIndexIfExists('employees', 'idx_employees_phone');
        $this->dropIndexIfExists('employees', 'idx_employees_deleted_at');

        $this->dropIndexIfExists('payrolls', 'idx_payrolls_stat_period');
        $this->dropIndexIfExists('departments', 'idx_departments_comp_active');
        $this->dropIndexIfExists('positions', 'idx_positions_comp_dept');

        // 7. CRM, CUSTOMER GROUPS & PAYMENTS
        $this->dropIndexIfExists('customer_groups', 'idx_customer_groups_comp_active');
        $this->dropIndexIfExists('customer_groups', 'idx_customer_groups_deleted_at');

        $this->dropIndexIfExists('customer_points_ledger', 'idx_cpl_cust_created');
        $this->dropIndexIfExists('customer_wallet_transactions', 'idx_cwt_cust_created');
        $this->dropIndexIfExists('telegram_users', 'idx_telegram_users_user_id');

        $this->dropIndexIfExists('payments', 'idx_payments_comp_stat_paid');
        $this->dropIndexIfExists('payments', 'idx_payments_reference_no');
        $this->dropIndexIfExists('payments', 'idx_payments_method_id');

        $this->dropIndexIfExists('transactions', 'idx_transactions_comp_created');
        $this->dropIndexIfExists('transactions', 'idx_transactions_ref_type_id');
        $this->dropIndexIfExists('transactions', 'idx_transactions_payment_id');
    }

    /**
     * Helper to safely add an index only if it does not already exist
     * and all target columns exist.
     */
    protected function addIndexIfNotExists(string $table, array $columns, string $indexName): void
    {
        if (!Schema::hasTable($table) || Schema::hasIndex($table, $indexName)) {
            return;
        }

        foreach ($columns as $column) {
            if (!Schema::hasColumn($table, $column)) {
                return;
            }
        }

        Schema::table($table, function (Blueprint $t) use ($columns, $indexName) {
            $t->index($columns, $indexName);
        });
    }

    /**
     * Helper to safely drop an index only if it exists.
     */
    protected function dropIndexIfExists(string $table, string $indexName): void
    {
        if (Schema::hasTable($table) && Schema::hasIndex($table, $indexName)) {
            Schema::table($table, function (Blueprint $t) use ($indexName) {
                $t->dropIndex($indexName);
            });
        }
    }
};
