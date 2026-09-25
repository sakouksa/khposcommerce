<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SystemAuditCommand extends Command
{
    protected $signature = 'system:audit';
    protected $description = 'Audit database tables and report missing models, controllers, resources, routes, pages, and permissions';

    private $tables = [
        'activity_log', 'attendance', 'attributes', 'attribute_values', 'audit_logs', 'banners', 'blogs', 
        'blog_blog_tag', 'blog_categories', 'blog_tags', 'branches', 'brands', 'carts', 'cart_items', 
        'cash_registers', 'cash_register_transactions', 'categories', 'cities', 'companies', 'countries', 
        'coupons', 'coupon_products', 'currencies', 'customers', 'customer_addresses', 'customer_groups', 
        'departments', 'employees', 'expenses', 'expense_categories', 'faqs', 'flash_sales', 'flash_sale_products', 
        'inventories', 'inventory_movements', 'languages', 'login_histories', 'media', 'model_has_permissions', 
        'model_has_roles', 'notification_logs', 'orders', 'order_items', 'order_status_histories', 'pages', 
        'payments', 'payment_methods', 'payrolls', 'permissions', 'personal_access_tokens', 'positions', 
        'products', 'product_images', 'product_prices', 'product_reviews', 'product_variants', 
        'product_variant_values', 'promotions', 'provinces', 'purchases', 'purchase_items', 'purchase_returns', 
        'purchase_return_items', 'roles', 'role_has_permissions', 'sales', 'sale_items', 'sale_returns', 
        'sale_return_items', 'settings', 'shipments', 'shipping_methods', 'shipping_rates', 'shipping_zones', 
        'stock_adjustments', 'stock_adjustment_items', 'stock_opnames', 'stock_opname_items', 'stock_transfers', 
        'stock_transfer_items', 'stores', 'suppliers', 'supplier_contacts', 'taxes', 'transactions', 'units', 
        'users', 'warehouses', 'wishlists'
    ];

    public function handle()
    {
        $this->info("Starting ERP System Audit...");

        $missingModels = [];
        $missingControllers = [];
        $missingResources = [];
        $missingRoutes = [];
        $missingPages = [];
        $missingPermissions = [];

        // Fetch registered routes
        $routeList = collect(Route::getRoutes())->map(function ($route) {
            return [
                'uri' => $route->uri(),
                'action' => $route->getActionName(),
            ];
        });

        // Spatie Permissions
        $existingPermissions = [];
        if (Schema::hasTable('permissions')) {
            $existingPermissions = DB::table('permissions')->pluck('name')->toArray();
        }

        foreach ($this->tables as $table) {
            // Pivot tables and polymorphic relationship tables don't need standalone CRUD components
            $isPivot = in_array($table, [
                'blog_blog_tag', 'coupon_products', 'flash_sale_products', 
                'model_has_permissions', 'model_has_roles', 'role_has_permissions',
                'personal_access_tokens', 'media'
            ]);

            $singular = Str::singular($table);
            $modelName = Str::studly($singular);
            if ($table === 'attendance') {
                $modelName = 'Attendance';
                $singular = 'attendance';
            }

            // 1. Model Check
            $modelFound = false;
            $modelNamespaces = ['Product', 'Employee', 'CMS', 'Expense', 'Shipping', 'Setting', 'Payment', 'Order', 'Company', 'Customer', 'Purchase', 'Marketing', 'Review', 'Notification', 'General', 'Log', 'POS', 'Sales', 'Supplier', 'Inventory', 'Auth', ''];
            foreach ($modelNamespaces as $ns) {
                $class = $ns ? "App\\Models\\{$ns}\\{$modelName}" : "App\\Models\\{$modelName}";
                if (class_exists($class)) {
                    $modelFound = true;
                    break;
                }
            }
            if ($modelName === 'ActivityLog' && class_exists(\Spatie\Activitylog\Models\Activity::class)) {
                $modelFound = true;
            }
            if ($modelName === 'Permission' && class_exists(\Spatie\Permission\Models\Permission::class)) {
                $modelFound = true;
            }
            if ($modelName === 'Role' && class_exists(\Spatie\Permission\Models\Role::class)) {
                $modelFound = true;
            }
            if (!$modelFound && !$isPivot) {
                $missingModels[] = "{$modelName} (Table: {$table})";
            }

            // 2. Controller Check
            $controllerFound = false;
            $controllerNamespaces = ['Product', 'Employee', 'CMS', 'Expense', 'Shipping', 'Setting', 'Payment', 'Order', 'Company', 'Customer', 'Purchase', 'Marketing', 'Review', 'Notification', 'General', 'Auth', 'Log', 'POS', 'Sales', 'Supplier', 'Inventory', ''];
            foreach ($controllerNamespaces as $ns) {
                $class = $ns ? "App\\Http\\Controllers\\Api\\V1\\{$ns}\\{$modelName}Controller" : "App\\Http\\Controllers\\Api\\V1\\{$modelName}Controller";
                if (class_exists($class)) {
                    $controllerFound = true;
                    break;
                }
            }
            if (!$controllerFound && !$isPivot) {
                $missingControllers[] = "{$modelName}Controller";
            }

            // 3. Resource Check
            $resourceFound = false;
            foreach ($modelNamespaces as $ns) {
                $class = $ns ? "App\\Http\\Resources\\{$ns}\\{$modelName}Resource" : "App\\Http\\Resources\\{$modelName}Resource";
                if (class_exists($class)) {
                    $resourceFound = true;
                    break;
                }
            }
            if (!$resourceFound && !$isPivot) {
                $missingResources[] = "{$modelName}Resource";
            }

            // 4. Route Check
            if (!$isPivot) {
                $routePattern = Str::kebab(Str::plural($modelName));
                if ($modelName === 'Faq') $routePattern = 'faqs';
                
                $hasRoute = $routeList->contains(function ($r) use ($routePattern) {
                    return Str::contains($r['uri'], $routePattern);
                });
                if (!$hasRoute) {
                    $missingRoutes[] = "/api/v1/{$routePattern}";
                }
            }

            // 5. Frontend Pages Check (relative to root React project directory)
            if (!$isPivot) {
                $pagePathPatterns = [
                    base_path("../admin-dashboard/src/pages/{$table}"),
                    base_path("../admin-dashboard/src/pages/" . Str::kebab($modelName)),
                    base_path("../admin-dashboard/src/pages/" . Str::plural(Str::kebab($modelName))),
                ];
                
                // Some pages might be integrated under tabs or shared files
                $pageFound = false;
                foreach ($pagePathPatterns as $pattern) {
                    if (is_dir($pattern) || file_exists($pattern . ".tsx")) {
                        $pageFound = true;
                        break;
                    }
                }
                
                // Tabs or nested pages mapping check
                    // Check if it's handled in subtabs/consolidated pages
                    $consolidatedPages = [
                        'attendance' => 'EmployeesPage', 'payrolls' => 'EmployeesPage', 'departments' => 'EmployeesPage', 'positions' => 'EmployeesPage', 'employees' => 'EmployeesPage',
                        'blogs' => 'CMSPage', 'blog_categories' => 'CMSPage', 'blog_tags' => 'CMSPage', 'pages' => 'CMSPage', 'faqs' => 'CMSPage',
                        'shipping_methods' => 'ShippingPage', 'shipping_zones' => 'ShippingPage', 'shipping_rates' => 'ShippingPage', 'shipments' => 'ShippingPage',
                        'countries' => 'SettingsPage', 'provinces' => 'SettingsPage', 'cities' => 'SettingsPage', 'taxes' => 'SettingsPage', 'units' => 'SettingsPage', 'currencies' => 'SettingsPage', 'languages' => 'SettingsPage', 'settings' => 'SettingsPage',
                        'products' => 'ProductsPage', 'product_images' => 'ProductsPage', 'product_prices' => 'ProductsPage', 'product_variants' => 'ProductsPage', 'product_variant_values' => 'ProductsPage', 'attribute_values' => 'ProductsPage',
                        'activity_log' => 'ActivityLogsPage', 'audit_logs' => 'ActivityLogsPage', 'login_histories' => 'ActivityLogsPage', 'notification_logs' => 'ActivityLogsPage',
                        'banners' => 'BannersPage', 'coupons' => 'CouponsPage', 'flash_sales' => 'FlashSalesPage', 'promotions' => 'PromotionsPage',
                        'branches' => 'BranchesPage', 'stores' => 'StoresPage', 'warehouses' => 'WarehousesPage', 'companies' => 'BranchesPage',
                        'customers' => 'CustomersPage', 'customer_groups' => 'CustomerGroupsPage', 'customer_addresses' => 'CustomersPage',
                        'expenses' => 'ExpensesPage', 'expense_categories' => 'ExpensesPage',
                        'payment_methods' => 'PaymentMethodsPage', 'transactions' => 'TransactionsPage',
                        'purchases' => 'PurchasesPage', 'purchase_items' => 'PurchasesPage', 'purchase_returns' => 'PurchaseReturnsPage', 'purchase_return_items' => 'PurchasesPage',
                        'sales' => 'SalesPage', 'sale_items' => 'SalesPage', 'sale_returns' => 'SalesPage', 'sale_return_items' => 'SalesPage',
                        'inventories' => 'InventoryPage', 'inventory_movements' => 'InventoryPage', 'stock_adjustments' => 'InventoryPage', 'stock_adjustment_items' => 'InventoryPage', 'stock_opnames' => 'InventoryPage', 'stock_opname_items' => 'InventoryPage', 'stock_transfers' => 'InventoryPage', 'stock_transfer_items' => 'InventoryPage',
                        'orders' => 'OrdersPage', 'order_items' => 'OrdersPage', 'order_status_histories' => 'OrdersPage',
                        'suppliers' => 'SuppliersPage', 'supplier_contacts' => 'SuppliersPage',
                        'cash_registers' => 'POSPage', 'cash_register_transactions' => 'POSPage',
                        'product_reviews' => 'ReviewsPage',
                        'carts' => 'CartPage', 'cart_items' => 'CartPage', 'wishlists' => 'WishlistPage',
                    ];
                    if (isset($consolidatedPages[$table])) {
                        $pageFound = true;
                    }

                if (!$pageFound) {
                    $missingPages[] = "{$modelName}Page (Path: pages/" . Str::kebab($modelName) . ")";
                }
            }

            // 6. Permissions Check
            if (!$isPivot) {
                $permissionActions = ['view', 'create', 'update', 'delete'];
                $permName = Str::snake($singular);
                foreach ($permissionActions as $action) {
                    $perm = "{$permName}.{$action}";
                    if (!in_array($perm, $existingPermissions)) {
                        $missingPermissions[] = $perm;
                    }
                }
            }
        }

        // Print Results
        $this->outputHeading("Missing Models (" . count($missingModels) . ")");
        $this->outputList($missingModels);

        $this->outputHeading("Missing Controllers (" . count($missingControllers) . ")");
        $this->outputList($missingControllers);

        $this->outputHeading("Missing Resources (" . count($missingResources) . ")");
        $this->outputList($missingResources);

        $this->outputHeading("Missing Routes (" . count($missingRoutes) . ")");
        $this->outputList($missingRoutes);

        $this->outputHeading("Missing Frontend Pages (" . count($missingPages) . ")");
        $this->outputList($missingPages);

        $this->outputHeading("Missing Permissions (" . count($missingPermissions) . ")");
        $this->outputList($missingPermissions);

        return 0;
    }

    private function outputHeading($title)
    {
        $this->line("");
        $this->line(str_repeat("=", 50));
        $this->info(" $title");
        $this->line(str_repeat("=", 50));
    }

    private function outputList($items)
    {
        if (empty($items)) {
            $this->comment("  None! (100% complete)");
        } else {
            foreach ($items as $item) {
                $this->line("  - {$item}");
            }
        }
    }
}
