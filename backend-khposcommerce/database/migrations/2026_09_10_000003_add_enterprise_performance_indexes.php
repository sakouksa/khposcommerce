<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations to add enterprise-grade performance indexes
     * for high-volume data (100k - 1M+ records).
     */
    public function up(): void
    {
        // ─── 1. POS & SALES MODULE ──────────────────────────────────────────
        $this->addIndexIfNotExists('sales', ['company_id', 'status', 'created_at'], 'idx_sales_comp_stat_created');
        $this->addIndexIfNotExists('sales', ['company_id', 'date'], 'idx_sales_comp_date');
        $this->addIndexIfNotExists('sales', ['company_id', 'payment_method', 'date'], 'idx_sales_comp_pay_date');
        $this->addIndexIfNotExists('sales', ['customer_id', 'created_at'], 'idx_sales_cust_created');
        $this->addIndexIfNotExists('sales', ['deleted_at'], 'idx_sales_deleted_at');

        $this->addIndexIfNotExists('sale_items', ['product_id', 'created_at'], 'idx_sale_items_prod_created');
        $this->addIndexIfNotExists('sale_items', ['product_variant_id'], 'idx_sale_items_variant');

        // ─── 2. E-COMMERCE ORDERS MODULE ─────────────────────────────────────
        $this->addIndexIfNotExists('orders', ['company_id', 'created_at'], 'idx_orders_comp_created');
        $this->addIndexIfNotExists('orders', ['company_id', 'status', 'created_at'], 'idx_orders_comp_stat_created');
        $this->addIndexIfNotExists('orders', ['company_id', 'payment_status', 'created_at'], 'idx_orders_comp_paystat_created');
        $this->addIndexIfNotExists('orders', ['company_id', 'fulfillment_status'], 'idx_orders_comp_fulfill');
        $this->addIndexIfNotExists('orders', ['customer_id', 'created_at'], 'idx_orders_cust_created');
        $this->addIndexIfNotExists('orders', ['deleted_at'], 'idx_orders_deleted_at');

        $this->addIndexIfNotExists('order_items', ['product_id', 'created_at'], 'idx_order_items_prod_created');

        // ─── 3. INVENTORY & STOCK MOVEMENTS MODULE ───────────────────────────
        $this->addIndexIfNotExists('inventory_movements', ['company_id', 'warehouse_id', 'created_at'], 'idx_inv_mov_comp_wh_created');
        $this->addIndexIfNotExists('inventory_movements', ['company_id', 'product_id', 'created_at'], 'idx_inv_mov_comp_prod_created');
        $this->addIndexIfNotExists('inventory_movements', ['company_id', 'type', 'created_at'], 'idx_inv_mov_comp_type_created');
        $this->addIndexIfNotExists('inventory_movements', ['product_variant_id', 'created_at'], 'idx_inv_mov_var_created');

        // ─── 4. PRODUCTS & CATALOG MODULE ────────────────────────────────────
        $this->addIndexIfNotExists('products', ['company_id', 'status', 'created_at'], 'idx_products_comp_stat_created');
        $this->addIndexIfNotExists('products', ['company_id', 'brand_id', 'status'], 'idx_products_comp_brand_stat');
        $this->addIndexIfNotExists('products', ['company_id', 'is_featured', 'status'], 'idx_products_comp_feat_stat');
        $this->addIndexIfNotExists('products', ['company_id', 'sold_count'], 'idx_products_comp_sold');
        $this->addIndexIfNotExists('products', ['deleted_at'], 'idx_products_deleted_at');

        // ─── 5. CUSTOMERS & CRM MODULE ───────────────────────────────────────
        $this->addIndexIfNotExists('customers', ['company_id', 'phone'], 'idx_customers_comp_phone');
        $this->addIndexIfNotExists('customers', ['company_id', 'email'], 'idx_customers_comp_email');
        $this->addIndexIfNotExists('customers', ['company_id', 'name'], 'idx_customers_comp_name');
        $this->addIndexIfNotExists('customers', ['company_id', 'is_active', 'created_at'], 'idx_customers_comp_act_created');
        $this->addIndexIfNotExists('customers', ['company_id', 'total_spent'], 'idx_customers_comp_spent');
        $this->addIndexIfNotExists('customers', ['deleted_at'], 'idx_customers_deleted_at');

        // ─── 6. PURCHASES & SUPPLIERS MODULE ─────────────────────────────────
        $this->addIndexIfNotExists('purchases', ['company_id', 'date'], 'idx_purchases_comp_date');
        $this->addIndexIfNotExists('purchases', ['company_id', 'status', 'date'], 'idx_purchases_comp_stat_date');
        $this->addIndexIfNotExists('purchases', ['company_id', 'payment_status', 'date'], 'idx_purchases_comp_pay_date');
        $this->addIndexIfNotExists('purchases', ['deleted_at'], 'idx_purchases_deleted_at');

        $this->addIndexIfNotExists('purchase_items', ['product_id', 'created_at'], 'idx_purchase_items_prod_created');

        // ─── 7. EXPENSES MODULE ──────────────────────────────────────────────
        $this->addIndexIfNotExists('expenses', ['company_id', 'expense_category_id', 'date'], 'idx_expenses_comp_cat_date');
        $this->addIndexIfNotExists('expenses', ['company_id', 'status', 'date'], 'idx_expenses_comp_stat_date');
        $this->addIndexIfNotExists('expenses', ['deleted_at'], 'idx_expenses_deleted_at');

        // ─── 8. AUDIT LOGS & LOGIN HISTORIES MODULE ──────────────────────────
        $this->addIndexIfNotExists('audit_logs', ['company_id', 'created_at'], 'idx_audit_comp_created');
        $this->addIndexIfNotExists('audit_logs', ['user_id', 'created_at'], 'idx_audit_user_created');
        $this->addIndexIfNotExists('login_histories', ['user_id', 'created_at'], 'idx_login_hist_user_created');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $this->dropIndexIfExists('sales', 'idx_sales_comp_stat_created');
        $this->dropIndexIfExists('sales', 'idx_sales_comp_date');
        $this->dropIndexIfExists('sales', 'idx_sales_comp_pay_date');
        $this->dropIndexIfExists('sales', 'idx_sales_cust_created');
        $this->dropIndexIfExists('sales', 'idx_sales_deleted_at');

        $this->dropIndexIfExists('sale_items', 'idx_sale_items_prod_created');
        $this->dropIndexIfExists('sale_items', 'idx_sale_items_variant');

        $this->dropIndexIfExists('orders', 'idx_orders_comp_created');
        $this->dropIndexIfExists('orders', 'idx_orders_comp_stat_created');
        $this->dropIndexIfExists('orders', 'idx_orders_comp_paystat_created');
        $this->dropIndexIfExists('orders', 'idx_orders_comp_fulfill');
        $this->dropIndexIfExists('orders', 'idx_orders_cust_created');
        $this->dropIndexIfExists('orders', 'idx_orders_deleted_at');

        $this->dropIndexIfExists('order_items', 'idx_order_items_prod_created');

        $this->dropIndexIfExists('inventory_movements', 'idx_inv_mov_comp_wh_created');
        $this->dropIndexIfExists('inventory_movements', 'idx_inv_mov_comp_prod_created');
        $this->dropIndexIfExists('inventory_movements', 'idx_inv_mov_comp_type_created');
        $this->dropIndexIfExists('inventory_movements', 'idx_inv_mov_var_created');

        $this->dropIndexIfExists('products', 'idx_products_comp_stat_created');
        $this->dropIndexIfExists('products', 'idx_products_comp_brand_stat');
        $this->dropIndexIfExists('products', 'idx_products_comp_feat_stat');
        $this->dropIndexIfExists('products', 'idx_products_comp_sold');
        $this->dropIndexIfExists('products', 'idx_products_deleted_at');

        $this->dropIndexIfExists('customers', 'idx_customers_comp_phone');
        $this->dropIndexIfExists('customers', 'idx_customers_comp_email');
        $this->dropIndexIfExists('customers', 'idx_customers_comp_name');
        $this->dropIndexIfExists('customers', 'idx_customers_comp_act_created');
        $this->dropIndexIfExists('customers', 'idx_customers_comp_spent');
        $this->dropIndexIfExists('customers', 'idx_customers_deleted_at');

        $this->dropIndexIfExists('purchases', 'idx_purchases_comp_date');
        $this->dropIndexIfExists('purchases', 'idx_purchases_comp_stat_date');
        $this->dropIndexIfExists('purchases', 'idx_purchases_comp_pay_date');
        $this->dropIndexIfExists('purchases', 'idx_purchases_deleted_at');

        $this->dropIndexIfExists('purchase_items', 'idx_purchase_items_prod_created');

        $this->dropIndexIfExists('expenses', 'idx_expenses_comp_cat_date');
        $this->dropIndexIfExists('expenses', 'idx_expenses_comp_stat_date');
        $this->dropIndexIfExists('expenses', 'idx_expenses_deleted_at');

        $this->dropIndexIfExists('audit_logs', 'idx_audit_comp_created');
        $this->dropIndexIfExists('audit_logs', 'idx_audit_user_created');
        $this->dropIndexIfExists('login_histories', 'idx_login_hist_user_created');
    }

    /**
     * Helper to safely add an index only if it does not already exist.
     */
    protected function addIndexIfNotExists(string $table, array $columns, string $indexName): void
    {
        if (Schema::hasTable($table) && !Schema::hasIndex($table, $indexName)) {
            Schema::table($table, function (Blueprint $t) use ($columns, $indexName) {
                $t->index($columns, $indexName);
            });
        }
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
