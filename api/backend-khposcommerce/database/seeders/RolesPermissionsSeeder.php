<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Company
            'company.view', 'company.create', 'company.update', 'company.delete',
            'branch.view', 'branch.create', 'branch.update', 'branch.delete',
            'store.view', 'store.create', 'store.update', 'store.delete',
            'warehouse.view', 'warehouse.create', 'warehouse.update', 'warehouse.delete',

            // Products
            'product.view', 'product.create', 'product.update', 'product.delete',
            'category.view', 'category.create', 'category.update', 'category.delete',
            'brand.view', 'brand.create', 'brand.update', 'brand.delete',

            // Inventory
            'inventory.view', 'inventory.adjust', 'inventory.transfer', 'inventory.opname',

            // Purchase
            'purchase.view', 'purchase.create', 'purchase.update', 'purchase.delete', 'purchase.approve',
            'supplier.view', 'supplier.create', 'supplier.update', 'supplier.delete',

            // Sales / POS
            'sale.view', 'sale.create', 'sale.return',
            'cash_register.view', 'cash_register.manage',

            // Orders
            'order.view', 'order.manage', 'order.refund',

            // Customers
            'customer.view', 'customer.create', 'customer.update', 'customer.delete',

            // Payments
            'payment.view', 'payment.process',

            // Reports
            'report.view', 'report.export',
            'reports.sales.view', 'reports.sales.export', 'reports.sales.detail',

            // Settings
            'setting.view', 'setting.update',

            // Users / Roles
            'user.view', 'user.create', 'user.update', 'user.delete',
            'role.view', 'role.create', 'role.update', 'role.delete',

            // Expenses
            'expense.view', 'expense.create', 'expense.update', 'expense.delete', 'expense.approve',
        ];

        $tables = [
            'activity_log', 'attendance', 'attributes', 'attribute_values', 'audit_logs', 'banners', 'blogs', 
            'blog_categories', 'blog_tags', 'branches', 'brands', 'carts', 'cart_items', 
            'cash_registers', 'cash_register_transactions', 'categories', 'cities', 'companies', 'countries', 
            'coupons', 'currencies', 'customers', 'customer_addresses', 'customer_groups', 
            'departments', 'employees', 'expenses', 'expense_categories', 'faqs', 'flash_sales', 
            'inventories', 'inventory_movements', 'languages', 'login_histories', 'notification_logs', 'orders', 
            'order_items', 'order_status_histories', 'pages', 'payments', 'payment_methods', 'payrolls', 'permissions', 
            'positions', 'products', 'product_images', 'product_prices', 'product_reviews', 'product_variants', 
            'product_variant_values', 'promotions', 'provinces', 'purchases', 'purchase_items', 'purchase_returns', 
            'purchase_return_items', 'roles', 'sales', 'sale_items', 'sale_returns', 
            'sale_return_items', 'settings', 'shipments', 'shipping_methods', 'shipping_rates', 'shipping_zones', 
            'stock_adjustments', 'stock_adjustment_items', 'stock_opnames', 'stock_opname_items', 'stock_transfers', 
            'stock_transfer_items', 'stores', 'suppliers', 'supplier_contacts', 'taxes', 'transactions', 'units', 
            'users', 'warehouses', 'wishlists'
        ];

        foreach ($tables as $table) {
            $singular = \Illuminate\Support\Str::singular($table);
            if ($table === 'attendance') $singular = 'attendance';
            $permName = \Illuminate\Support\Str::snake($singular);
            $actions = ['view', 'create', 'update', 'delete'];
            foreach ($actions as $action) {
                $permissions[] = "{$permName}.{$action}";
            }
        }

        $permissions = array_unique($permissions);

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'api']);
        }

        // ─── Super Admin ──────────────────────────────────────────────────────
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'api']);
        $superAdmin->givePermissionTo(Permission::where('guard_name', 'api')->get());

        // ─── Admin ────────────────────────────────────────────────────────────
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'api']);
        $admin->givePermissionTo(Permission::where('guard_name', 'api')->whereNotIn('name', [
            'company.delete', 'role.delete', 'user.delete',
        ])->get());

        // ─── Manager ──────────────────────────────────────────────────────────
        $manager = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'api']);
        $manager->givePermissionTo([
            'product.view', 'product.create', 'product.update',
            'inventory.view', 'inventory.adjust', 'inventory.transfer',
            'purchase.view', 'purchase.create', 'purchase.update',
            'supplier.view', 'supplier.create',
            'sale.view', 'sale.create', 'sale.return',
            'order.view', 'order.manage',
            'customer.view', 'customer.create', 'customer.update',
            'report.view', 'report.export',
            'expense.view', 'expense.create',
        ]);

        // ─── Cashier ──────────────────────────────────────────────────────────
        $cashier = Role::firstOrCreate(['name' => 'cashier', 'guard_name' => 'api']);
        $cashier->givePermissionTo([
            'product.view',
            'inventory.view',
            'sale.view', 'sale.create', 'sale.return',
            'order.view',
            'customer.view', 'customer.create',
            'cash_register.view', 'cash_register.manage',
            'payment.view', 'payment.process',
        ]);

        // ─── Warehouse Staff ──────────────────────────────────────────────────
        $warehouse = Role::firstOrCreate(['name' => 'warehouse_staff', 'guard_name' => 'api']);
        $warehouse->givePermissionTo([
            'product.view',
            'inventory.view', 'inventory.adjust', 'inventory.transfer', 'inventory.opname',
            'purchase.view',
        ]);

        // ─── Customer ─────────────────────────────────────────────────────────
        Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'api']);

        $this->command->info('Roles and permissions seeded successfully.');
    }
}
