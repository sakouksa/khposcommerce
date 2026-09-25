<?php

use Illuminate\Support\Facades\Route;

// Admin Domain Controllers
use App\Http\Controllers\Api\V1\Admin\Product\ProductController;
use App\Http\Controllers\Api\V1\Admin\Product\CategoryController;
use App\Http\Controllers\Api\V1\Admin\Product\BrandController;
use App\Http\Controllers\Api\V1\Admin\Product\AttributeController;
use App\Http\Controllers\Api\V1\Admin\Product\TaxController;
use App\Http\Controllers\Api\V1\Admin\Product\UnitController;
use App\Http\Controllers\Api\V1\Admin\Product\ProductVariantController;
use App\Http\Controllers\Api\V1\Admin\Product\ProductImageController;
use App\Http\Controllers\Api\V1\Admin\Product\ProductPriceController;
use App\Http\Controllers\Api\V1\Admin\Product\AttributeValueController;
use App\Http\Controllers\Api\V1\Admin\Product\ProductVariantValueController;

use App\Http\Controllers\Api\V1\Admin\Inventory\InventoryController;
use App\Http\Controllers\Api\V1\Admin\Inventory\StockTransferController;
use App\Http\Controllers\Api\V1\Admin\Inventory\StockAdjustmentController;
use App\Http\Controllers\Api\V1\Admin\Inventory\StockOpnameController;
use App\Http\Controllers\Api\V1\Admin\Inventory\InventoryMovementController;
use App\Http\Controllers\Api\V1\Admin\Inventory\StockAdjustmentItemController;
use App\Http\Controllers\Api\V1\Admin\Inventory\StockOpnameItemController;

use App\Http\Controllers\Api\V1\Admin\Purchase\SupplierController;
use App\Http\Controllers\Api\V1\Admin\Purchase\PurchaseController;
use App\Http\Controllers\Api\V1\Admin\Purchase\PurchaseReturnController;
use App\Http\Controllers\Api\V1\Admin\Purchase\PurchaseItemController;
use App\Http\Controllers\Api\V1\Admin\Purchase\PurchaseReturnItemController;
use App\Http\Controllers\Api\V1\Admin\Supplier\SupplierContactController;

use App\Http\Controllers\Api\V1\Admin\Customer\CustomerController;
use App\Http\Controllers\Api\V1\Admin\Customer\CustomerGroupController;
use App\Http\Controllers\Api\V1\Admin\Customer\CustomerAddressController;

use App\Http\Controllers\Api\V1\Admin\POS\POSController;
use App\Http\Controllers\Api\V1\Admin\POS\BakongController;
use App\Http\Controllers\Api\V1\Admin\POS\CashRegisterController;
use App\Http\Controllers\Api\V1\Admin\POS\CashRegisterTransactionController;

use App\Http\Controllers\Api\V1\Admin\Sales\SaleController;
use App\Http\Controllers\Api\V1\Admin\Sales\SaleItemController;
use App\Http\Controllers\Api\V1\Admin\Sales\SaleReturnController;
use App\Http\Controllers\Api\V1\Admin\Sales\SaleReturnItemController;

use App\Http\Controllers\Api\V1\Admin\Order\OrderController;
use App\Http\Controllers\Api\V1\Admin\Order\OrderItemController;
use App\Http\Controllers\Api\V1\Admin\Order\OrderStatusHistoryController;
use App\Http\Controllers\Api\V1\Admin\Order\ShipmentController;
use App\Http\Controllers\Api\V1\Admin\Order\OrderReturnController;
use App\Http\Controllers\Api\V1\Admin\Order\ReturnPolicyController;
use App\Http\Controllers\Api\V1\Admin\Order\CartController;
use App\Http\Controllers\Api\V1\Admin\Order\CartItemController;
use App\Http\Controllers\Api\V1\Admin\Order\ReviewController;

use App\Http\Controllers\Api\V1\Admin\Payment\PaymentController;
use App\Http\Controllers\Api\V1\Admin\Payment\PaymentMethodController;
use App\Http\Controllers\Api\V1\Admin\Payment\TransactionController;

use App\Http\Controllers\Api\V1\Admin\Company\CompanyController;
use App\Http\Controllers\Api\V1\Admin\Company\BranchController;
use App\Http\Controllers\Api\V1\Admin\Company\StoreController;
use App\Http\Controllers\Api\V1\Admin\Company\WarehouseController;

use App\Http\Controllers\Api\V1\Admin\Setting\SettingController;
use App\Http\Controllers\Api\V1\Admin\Setting\CurrencyController;
use App\Http\Controllers\Api\V1\Admin\Setting\LanguageController;
use App\Http\Controllers\Api\V1\Admin\Setting\BannerController;
use App\Http\Controllers\Api\V1\Admin\Setting\CountryController;
use App\Http\Controllers\Api\V1\Admin\Setting\ProvinceController;
use App\Http\Controllers\Api\V1\Admin\Setting\CityController;

use App\Http\Controllers\Api\V1\Admin\Marketing\CouponController;
use App\Http\Controllers\Api\V1\Admin\Marketing\FlashSaleController;
use App\Http\Controllers\Api\V1\Admin\Marketing\PromotionController;

use App\Http\Controllers\Api\V1\Admin\Report\ReportController;
use App\Http\Controllers\Api\V1\Admin\Report\SalesReportController;
use App\Http\Controllers\Api\V1\Admin\Report\PurchaseReportController;
use App\Http\Controllers\Api\V1\Admin\Report\InventoryReportController;
use App\Http\Controllers\Api\V1\Admin\Report\DashboardController;

use App\Http\Controllers\Api\V1\Admin\Employee\DepartmentController;
use App\Http\Controllers\Api\V1\Admin\Employee\PositionController;
use App\Http\Controllers\Api\V1\Admin\Employee\EmployeeController;
use App\Http\Controllers\Api\V1\Admin\Employee\ShiftController;
use App\Http\Controllers\Api\V1\Admin\Employee\AttendanceController;
use App\Http\Controllers\Api\V1\Admin\Employee\PayrollController;
use App\Http\Controllers\Api\V1\Admin\Employee\LeaveRequestController;
use App\Http\Controllers\Api\V1\Admin\Employee\HolidayController;

use App\Http\Controllers\Api\V1\Admin\CMS\BlogCategoryController;
use App\Http\Controllers\Api\V1\Admin\CMS\BlogTagController;
use App\Http\Controllers\Api\V1\Admin\CMS\BlogController;
use App\Http\Controllers\Api\V1\Admin\CMS\PageController;
use App\Http\Controllers\Api\V1\Admin\CMS\FaqController;
use App\Http\Controllers\Api\V1\Admin\CMS\AnnouncementController;

use App\Http\Controllers\Api\V1\Admin\Expense\ExpenseCategoryController;
use App\Http\Controllers\Api\V1\Admin\Expense\ExpenseController;
use App\Http\Controllers\Api\V1\Admin\Expense\FinanceAnalyticsController;

use App\Http\Controllers\Api\V1\Admin\Shipping\ShippingMethodController;
use App\Http\Controllers\Api\V1\Admin\Shipping\ShippingZoneController;
use App\Http\Controllers\Api\V1\Admin\Shipping\ShippingRateController;

use App\Http\Controllers\Api\V1\Auth\RoleController;
use App\Http\Controllers\Api\V1\Auth\PermissionController;
use App\Http\Controllers\Api\V1\Auth\UserController;
use App\Http\Controllers\Api\V1\Auth\UserRoleController;

use App\Http\Controllers\Api\V1\Admin\Log\ActivityLogController;
use App\Http\Controllers\Api\V1\Admin\Log\AuditLogController;
use App\Http\Controllers\Api\V1\Admin\Log\LoginHistoryController;
use App\Http\Controllers\Api\V1\Admin\Chatbot\AdminChatbotController;

use App\Http\Controllers\Api\V1\Admin\Notification\NotificationController;
use App\Http\Controllers\Api\V1\Admin\Notification\NotificationTemplateController;
use App\Http\Controllers\Api\V1\Admin\Notification\NotificationSettingController;
use App\Http\Controllers\Api\V1\Admin\Notification\NotificationLogController;

use App\Http\Controllers\Api\V1\Admin\System\RecycleBinController;
use App\Http\Controllers\Api\V1\Admin\Review\ProductReviewController;

/*
|--------------------------------------------------------------------------
| Admin & Back-Office ERP Routes (/api/v1/admin & /api/v1/*)
|--------------------------------------------------------------------------
*/

Route::middleware('auth.jwt')->group(function () {

    // ─── Dashboard ──────────────────────────────────────────────────────────
    Route::prefix('dashboard')->group(function () {
        Route::get('stats',            [DashboardController::class, 'stats']);
        Route::get('charts',           [DashboardController::class, 'charts']);
        Route::get('operation-panels', [DashboardController::class, 'operationPanels']);
        Route::get('alerts',           [DashboardController::class, 'alerts']);
        Route::get('system-health',    [DashboardController::class, 'systemHealth']);
        Route::get('sales-chart',      [DashboardController::class, 'salesChart']);
        Route::get('top-products',     [DashboardController::class, 'topProducts']);
        Route::get('recent-orders',    [DashboardController::class, 'recentOrders']);
        Route::get('low-stock',        [DashboardController::class, 'lowStock']);
    });

    // ─── Company & Organizational Structure ──────────────────────────────────
    Route::apiResource('companies',  CompanyController::class);
    Route::apiResource('branches',   BranchController::class);
    Route::post('branches/{id}/restore', [BranchController::class, 'restore']);
    Route::delete('branches/{id}/force', [BranchController::class, 'forceDelete']);
    Route::apiResource('stores',     StoreController::class);
    Route::post('stores/{id}/restore', [StoreController::class, 'restore']);
    Route::delete('stores/{id}/force', [StoreController::class, 'forceDelete']);
    Route::apiResource('warehouses', WarehouseController::class);
    Route::post('warehouses/{id}/restore', [WarehouseController::class, 'restore']);
    Route::delete('warehouses/{id}/force', [WarehouseController::class, 'forceDelete']);

    // ─── Products & Catalog ──────────────────────────────────────────────────
    Route::get('products/stats',                [ProductController::class, 'stats']);
    Route::get('products/dashboard-statistics', [ProductController::class, 'stats']);
    Route::post('products/bulk-delete',         [ProductController::class, 'bulkDelete']);
    Route::post('products/bulk-restore',        [ProductController::class, 'bulkRestore']);
    Route::get('products/export',               [ProductController::class, 'export']);
    Route::post('products/import',              [ProductController::class, 'import']);
    Route::post('products/{id}/restore',        [ProductController::class, 'restore']);
    Route::delete('products/{id}/force',        [ProductController::class, 'forceDelete']);
    Route::post('products/{product}/images',    [ProductController::class, 'uploadImages']);
    Route::delete('products/{product}/images/{image}', [ProductController::class, 'deleteImage']);
    Route::get('products/{product}/variants',   [ProductController::class, 'variants']);
    Route::apiResource('products',              ProductController::class);

    Route::post('categories/bulk-delete',       [CategoryController::class, 'bulkDelete']);
    Route::post('categories/bulk-restore',      [CategoryController::class, 'bulkRestore']);
    Route::get('categories/export',             [CategoryController::class, 'export']);
    Route::post('categories/import',            [CategoryController::class, 'import']);
    Route::post('categories/{id}/restore',      [CategoryController::class, 'restore']);
    Route::delete('categories/{id}/force',      [CategoryController::class, 'forceDelete']);
    Route::apiResource('categories',            CategoryController::class);

    Route::post('brands/bulk-delete',           [BrandController::class, 'bulkDelete']);
    Route::post('brands/bulk-restore',          [BrandController::class, 'bulkRestore']);
    Route::get('brands/export',                 [BrandController::class, 'export']);
    Route::post('brands/import',                [BrandController::class, 'import']);
    Route::post('brands/{id}/restore',          [BrandController::class, 'restore']);
    Route::delete('brands/{id}/force',          [BrandController::class, 'forceDelete']);
    Route::apiResource('brands',                BrandController::class);

    Route::post('taxes/bulk-delete',            [TaxController::class, 'bulkDelete']);
    Route::post('taxes/bulk-restore',           [TaxController::class, 'bulkRestore']);
    Route::get('taxes/export',                  [TaxController::class, 'export']);
    Route::post('taxes/import',                 [TaxController::class, 'import']);
    Route::post('taxes/{id}/restore',           [TaxController::class, 'restore']);
    Route::delete('taxes/{id}/force',           [TaxController::class, 'forceDelete']);
    Route::apiResource('taxes',                 TaxController::class);

    Route::post('units/bulk-delete',            [UnitController::class, 'bulkDelete']);
    Route::post('units/bulk-restore',           [UnitController::class, 'bulkRestore']);
    Route::get('units/export',                  [UnitController::class, 'export']);
    Route::post('units/import',                 [UnitController::class, 'import']);
    Route::post('units/{id}/restore',           [UnitController::class, 'restore']);
    Route::delete('units/{id}/force',           [UnitController::class, 'forceDelete']);
    Route::apiResource('units',                 UnitController::class);

    Route::post('attributes/bulk-delete',       [AttributeController::class, 'bulkDelete']);
    Route::post('attributes/bulk-restore',      [AttributeController::class, 'bulkRestore']);
    Route::get('attributes/export',             [AttributeController::class, 'export']);
    Route::post('attributes/import',            [AttributeController::class, 'import']);
    Route::post('attributes/{id}/restore',      [AttributeController::class, 'restore']);
    Route::delete('attributes/{id}/force',      [AttributeController::class, 'forceDelete']);
    Route::apiResource('attributes',            AttributeController::class);

    // ─── Inventory Management ────────────────────────────────────────────────
    Route::get('inventory/stats',               [InventoryController::class, 'stats']);
    Route::get('inventory/dashboard',           [InventoryController::class, 'stats']);
    Route::get('inventory/export',              [InventoryController::class, 'export']);
    Route::post('inventory/import',             [InventoryController::class, 'import']);
    Route::get('inventory',                     [InventoryController::class, 'index']);
    Route::get('inventory/low-stock',           [InventoryController::class, 'lowStock']);
    Route::get('inventory/product/{pid}',       [InventoryController::class, 'byProduct']);
    Route::get('inventory/{id}',                [InventoryController::class, 'show']);

    Route::post('stock-adjustments/bulk-delete', [StockAdjustmentController::class, 'bulkDelete']);
    Route::post('stock-adjustments/bulk-restore', [StockAdjustmentController::class, 'bulkRestore']);
    Route::get('stock-adjustments/export',      [StockAdjustmentController::class, 'export']);
    Route::post('stock-adjustments/import',     [StockAdjustmentController::class, 'import']);
    Route::post('stock-adjustments/{id}/restore', [StockAdjustmentController::class, 'restore']);
    Route::delete('stock-adjustments/{id}/force', [StockAdjustmentController::class, 'forceDelete']);
    Route::post('stock-adjustments/{id}/approve', [StockAdjustmentController::class, 'approve']);
    Route::apiResource('stock-adjustments',     StockAdjustmentController::class);

    Route::post('stock-transfers/bulk-delete',  [StockTransferController::class, 'bulkDelete']);
    Route::post('stock-transfers/bulk-restore', [StockTransferController::class, 'bulkRestore']);
    Route::get('stock-transfers/export',       [StockTransferController::class, 'export']);
    Route::post('stock-transfers/import',      [StockTransferController::class, 'import']);
    Route::post('stock-transfers/{id}/restore', [StockTransferController::class, 'restore']);
    Route::delete('stock-transfers/{id}/force', [StockTransferController::class, 'forceDelete']);
    Route::post('stock-transfers/{id}/ship',    [StockTransferController::class, 'ship']);
    Route::post('stock-transfers/{id}/receive', [StockTransferController::class, 'receive']);
    Route::apiResource('stock-transfers',       StockTransferController::class);

    Route::post('stock-opnames/bulk-delete',   [StockOpnameController::class, 'bulkDelete']);
    Route::post('stock-opnames/bulk-restore',  [StockOpnameController::class, 'bulkRestore']);
    Route::get('stock-opnames/export',         [StockOpnameController::class, 'export']);
    Route::post('stock-opnames/import',        [StockOpnameController::class, 'import']);
    Route::post('stock-opnames/{id}/restore',  [StockOpnameController::class, 'restore']);
    Route::delete('stock-opnames/{id}/force',  [StockOpnameController::class, 'forceDelete']);
    Route::post('stock-opnames/{id}/complete', [StockOpnameController::class, 'complete']);
    Route::apiResource('stock-opnames',         StockOpnameController::class);

    // ─── Suppliers & Purchases ───────────────────────────────────────────────
    Route::post('suppliers/bulk-delete',        [SupplierController::class, 'bulkDelete']);
    Route::apiResource('suppliers',             SupplierController::class);
    Route::post('suppliers/{id}/restore',       [SupplierController::class, 'restore']);
    Route::delete('suppliers/{id}/force',       [SupplierController::class, 'forceDelete']);

    Route::get('purchases/returns',             [PurchaseReturnController::class, 'index']);
    Route::apiResource('purchases',             PurchaseController::class);
    Route::post('purchases/{id}/receive',       [PurchaseController::class, 'receive']);
    Route::post('purchases/{id}/cancel',        [PurchaseController::class, 'cancel']);
    Route::post('purchases/{id}/record-payment', [PurchaseController::class, 'recordPayment']);

    Route::post('purchase-returns/bulk-delete', [PurchaseReturnController::class, 'bulkDelete']);
    Route::apiResource('purchase-returns',       PurchaseReturnController::class);
    Route::post('purchase-returns/{id}/approve', [PurchaseReturnController::class, 'approve']);
    Route::post('purchase-returns/{id}/ship',    [PurchaseReturnController::class, 'ship']);
    Route::post('purchase-returns/{id}/settle',  [PurchaseReturnController::class, 'settle']);
    Route::post('purchase-returns/{id}/cancel',  [PurchaseReturnController::class, 'cancel']);
    Route::prefix('purchases/{purchase}')->group(function () {
        Route::apiResource('returns',           PurchaseReturnController::class);
    });

    Route::get('purchase-report',               [PurchaseReportController::class, 'index']);

    // ─── Customers ───────────────────────────────────────────────────────────
    Route::get('customers/stats',               [CustomerController::class, 'stats']);
    Route::get('customers/export',              [CustomerController::class, 'export']);
    Route::post('customers/import',             [CustomerController::class, 'import']);
    Route::post('customers/bulk-delete',        [CustomerController::class, 'bulkDelete']);
    Route::post('customers/bulk-restore',       [CustomerController::class, 'bulkRestore']);
    Route::post('customers/bulk-activate',               [CustomerController::class, 'bulkActivate']);
    Route::post('customers/bulk-deactivate',             [CustomerController::class, 'bulkDeactivate']);
    Route::post('customers/bulk-assign-group',           [CustomerController::class, 'bulkAssignGroup']);
    Route::post('customers/bulk-toggle-credit-hold',     [CustomerController::class, 'bulkToggleCreditHold']);
    Route::post('customers/merge',                       [CustomerController::class, 'mergeCustomers']);
    Route::apiResource('customers',                      CustomerController::class);
    Route::post('customers/{id}/restore',                [CustomerController::class, 'restore']);
    Route::delete('customers/{id}/force',                [CustomerController::class, 'forceDelete']);
    Route::get('customers/{id}/orders',                  [CustomerController::class, 'orders']);
    Route::post('customers/{id}/settle-debt',            [CustomerController::class, 'settleDebt']);
    Route::post('customers/{id}/wallet-transactions',    [CustomerController::class, 'addWalletTransaction']);
    Route::post('customers/{id}/loyalty-points',         [CustomerController::class, 'adjustLoyaltyPoints']);
    Route::post('customers/{id}/interactions',           [CustomerController::class, 'recordInteraction']);
    Route::post('customers/{id}/toggle-credit-hold',     [CustomerController::class, 'toggleCreditHold']);
    Route::post('customers/{id}/contacts',               [CustomerController::class, 'addContact']);
    Route::delete('customers/{id}/contacts/{contactId}', [CustomerController::class, 'deleteContact']);
    Route::post('customers/{id}/kyc-documents',          [CustomerController::class, 'addKycDocument']);
    Route::post('customers/{id}/pricing-contracts',      [CustomerController::class, 'addPricingContract']);
    Route::post('customers/{id}/support-tickets',        [CustomerController::class, 'addSupportTicket']);

    Route::get('customer-groups/export',        [CustomerGroupController::class, 'export']);
    Route::post('customer-groups/import',       [CustomerGroupController::class, 'import']);
    Route::post('customer-groups/bulk-delete',  [CustomerGroupController::class, 'bulkDelete']);
    Route::post('customer-groups/bulk-restore', [CustomerGroupController::class, 'bulkRestore']);
    Route::apiResource('customer-groups',       CustomerGroupController::class);
    Route::post('customer-groups/{id}/restore', [CustomerGroupController::class, 'restore']);
    Route::delete('customer-groups/{id}/force', [CustomerGroupController::class, 'forceDelete']);

    // ─── POS & Terminals ─────────────────────────────────────────────────────
    Route::prefix('pos')->group(function () {
        Route::post('sales',                   [POSController::class, 'sale']);
        Route::get('sales',                    [POSController::class, 'index']);
        Route::get('sales/{id}',               [POSController::class, 'show']);
        Route::post('sales/{id}/return',       [POSController::class, 'processReturn']);
        Route::get('product-search',           [POSController::class, 'productSearch']);
        Route::get('products/barcode/{code}',  [POSController::class, 'barcodeLookup']);
        Route::post('voice-search',            [POSController::class, 'voiceSearch']);
        Route::post('vision-search',           [POSController::class, 'visionSearch']);
        Route::post('apply-coupon',            [POSController::class, 'applyCoupon']);
        Route::post('khqr/generate',           [BakongController::class, 'generate']);
        Route::post('khqr/check',              [BakongController::class, 'check']);
        Route::get('khqr/config',              [BakongController::class, 'config']);
        Route::apiResource('cash-registers',   CashRegisterController::class);
        Route::post('cash-registers/{id}/open',  [CashRegisterController::class, 'open']);
        Route::post('cash-registers/{id}/close', [CashRegisterController::class, 'close']);
    });

    // ─── Sales ───────────────────────────────────────────────────────────────
    Route::apiResource('sales',                 SaleController::class);

    // ─── Orders (Back-Office View) ───────────────────────────────────────────
    Route::apiResource('orders',                OrderController::class);
    Route::put('orders/{id}/status',            [OrderController::class, 'updateStatus']);
    Route::post('orders/{id}/confirm',          [OrderController::class, 'confirm']);
    Route::post('orders/{id}/ship',             [OrderController::class, 'ship']);
    Route::post('orders/{id}/deliver',          [OrderController::class, 'deliver']);
    Route::post('orders/{id}/complete',         [OrderController::class, 'complete']);
    Route::post('orders/{id}/cancel',           [OrderController::class, 'cancel']);
    Route::post('orders/{id}/refund',           [OrderController::class, 'refund']);
    Route::get('orders/{id}/tracking',          [OrderController::class, 'tracking']);
    Route::get('orders/{id}/invoice',           [OrderController::class, 'invoice']);

    // ─── Reverse Logistics: Returns, Exchanges & Policies ────────────────────
    Route::post('return-policies/seed-defaults', [ReturnPolicyController::class, 'seedDefaults']);
    Route::apiResource('return-policies',       ReturnPolicyController::class);
    Route::apiResource('order-returns',         OrderReturnController::class);
    Route::post('order-returns/{id}/approve',   [OrderReturnController::class, 'approve']);
    Route::post('order-returns/{id}/reject',    [OrderReturnController::class, 'reject']);
    Route::post('order-returns/{id}/ship',      [OrderReturnController::class, 'ship']);
    Route::post('order-returns/{id}/receive',   [OrderReturnController::class, 'receive']);
    Route::post('order-returns/{id}/inspect',   [OrderReturnController::class, 'inspect']);
    Route::post('order-returns/{id}/settle',    [OrderReturnController::class, 'settle']);
    Route::post('order-returns/{id}/exchange',  [OrderReturnController::class, 'exchange']);

    // ─── Payments & Financial Transactions ───────────────────────────────────
    Route::apiResource('payment-methods',       PaymentMethodController::class);
    Route::get('payments',                      [PaymentController::class, 'index']);
    Route::get('payments/{id}',                 [PaymentController::class, 'show']);
    Route::post('payments/process',             [PaymentController::class, 'process']);
    Route::apiResource('transactions',          TransactionController::class);

    // ─── Enterprise Reports ──────────────────────────────────────────────────
    Route::prefix('reports')->group(function () {
        // Sales Reports
        Route::prefix('sales')->group(function () {
            Route::get('overview',        [SalesReportController::class, 'overview']);
            Route::get('dashboard',       [SalesReportController::class, 'dashboard']);
            Route::get('trend',           [SalesReportController::class, 'trend']);
            Route::get('categories',      [SalesReportController::class, 'categories']);
            Route::get('brands',          [SalesReportController::class, 'brands']);
            Route::get('payment-methods', [SalesReportController::class, 'paymentMethods']);
            Route::get('top-products',    [SalesReportController::class, 'topProducts']);
            Route::get('top-customers',   [SalesReportController::class, 'topCustomers']);
            Route::get('list',            [SalesReportController::class, 'list']);
            Route::get('export',          [SalesReportController::class, 'export']);
        });

        // Purchase Reports
        Route::prefix('purchase')->group(function () {
            Route::get('overview',        [PurchaseReportController::class, 'overview']);
            Route::get('dashboard',       [PurchaseReportController::class, 'dashboard']);
            Route::get('trend',           [PurchaseReportController::class, 'trend']);
            Route::get('suppliers',       [PurchaseReportController::class, 'suppliers']);
            Route::get('categories',      [PurchaseReportController::class, 'categories']);
            Route::get('brands',          [PurchaseReportController::class, 'brands']);
            Route::get('warehouses',      [PurchaseReportController::class, 'warehouses']);
            Route::get('products',        [PurchaseReportController::class, 'products']);
            Route::get('status',          [PurchaseReportController::class, 'status']);
            Route::get('payment-status',  [PurchaseReportController::class, 'paymentStatus']);
            Route::get('returns',         [PurchaseReportController::class, 'returns']);
            Route::get('table',           [PurchaseReportController::class, 'table']);
            Route::get('returns-table',   [PurchaseReportController::class, 'returnsTable']);
            Route::get('export',          [PurchaseReportController::class, 'export']);
        });

        // Inventory Reports
        Route::prefix('inventory')->group(function () {
            Route::get('overview',          [InventoryReportController::class, 'overview']);
            Route::get('dashboard',         [InventoryReportController::class, 'overview']);
            Route::get('value-trend',       [InventoryReportController::class, 'overview']);
            Route::get('movement-trend',    [InventoryReportController::class, 'overview']);
            Route::get('categories',        [InventoryReportController::class, 'overview']);
            Route::get('brands',            [InventoryReportController::class, 'overview']);
            Route::get('warehouses',        [InventoryReportController::class, 'overview']);
            Route::get('status',            [InventoryReportController::class, 'overview']);
            Route::get('valuation',         [InventoryReportController::class, 'valuation']);
            Route::get('movements',         [InventoryReportController::class, 'movements']);
            Route::get('low-stock',         [InventoryReportController::class, 'valuation']);
            Route::get('turnover',          [InventoryReportController::class, 'valuation']);
            Route::get('warehouse-summary', [InventoryReportController::class, 'overview']);
            Route::get('aging',             [InventoryReportController::class, 'overview']);
            Route::get('export',            [InventoryReportController::class, 'export']);
        });

        Route::get('sales',        [SalesReportController::class, 'dashboard']);
        Route::get('purchases',    [ReportController::class, 'purchases']);
        Route::get('inventory',    [InventoryReportController::class, 'overview']);
        Route::get('products',     [ReportController::class, 'products']);
        Route::get('customers',    [ReportController::class, 'customers']);
        Route::get('expenses',     [ReportController::class, 'expenses']);
        Route::get('profit-loss',  [ReportController::class, 'profitLoss']);
        Route::get('export-sales', [SalesReportController::class, 'export']);
        Route::get('export-inventory', [InventoryReportController::class, 'export']);
    });

    // ─── Recycle Bin ─────────────────────────────────────────────────────────
    Route::get('recycle-bin/stats',     [RecycleBinController::class, 'stats']);
    Route::get('recycle-bin/dashboard', [RecycleBinController::class, 'stats']);

    // ─── Settings & Global Configuration ─────────────────────────────────────
    Route::get('settings',              [SettingController::class, 'index']);
    Route::post('settings',             [SettingController::class, 'bulkUpdate']);
    Route::post('settings/logo',        [SettingController::class, 'uploadLogo']);
    Route::delete('settings/logo',      [SettingController::class, 'removeLogo']);
    Route::get('settings/{key}',        [SettingController::class, 'show']);
    Route::put('settings/{key}',        [SettingController::class, 'update']);
    Route::apiResource('currencies',    CurrencyController::class);
    Route::apiResource('languages',     LanguageController::class);

    // ─── Roles, Permissions & User Access ────────────────────────────────────
    Route::get('roles/stats',               [RoleController::class, 'stats']);
    Route::get('roles/dashboard',           [RoleController::class, 'stats']);
    Route::apiResource('roles',             RoleController::class);
    Route::get('permissions/stats',         [PermissionController::class, 'stats']);
    Route::get('permissions/dashboard',     [PermissionController::class, 'stats']);
    Route::apiResource('permissions',       PermissionController::class);
    Route::post('users/{id}/assign-role',   [UserRoleController::class, 'assign']);
    Route::post('users/{id}/remove-role',   [UserRoleController::class, 'remove']);

    Route::get('users/stats',               [UserController::class, 'stats']);
    Route::get('users/dashboard',           [UserController::class, 'stats']);
    Route::post('users/upload-avatar',      [UserController::class, 'uploadAvatar']);
    Route::apiResource('users',             UserController::class);

    // ─── Marketing & Promotions ──────────────────────────────────────────────
    Route::post('banners/bulk-delete',      [BannerController::class, 'bulkDelete']);
    Route::apiResource('banners',           BannerController::class);

    Route::get('coupons/generate-code',     [CouponController::class, 'generateCode']);
    Route::post('coupons/validate',         [CouponController::class, 'validateCoupon']);
    Route::apiResource('coupons',           CouponController::class);

    Route::apiResource('flash-sales',       FlashSaleController::class);
    Route::apiResource('promotions',        PromotionController::class);

    // ─── Reviews Moderation ──────────────────────────────────────────────────
    Route::get('reviews',                   [ReviewController::class, 'index']);
    Route::post('reviews/{id}/approve',     [ReviewController::class, 'approve']);
    Route::post('reviews/{id}/reject',      [ReviewController::class, 'reject']);
    Route::delete('reviews/{id}',           [ReviewController::class, 'destroy']);

    // ─── Activity & Security Logs ────────────────────────────────────────────
    Route::get('activity-logs/dashboard',   [ActivityLogController::class, 'dashboard']);
    Route::get('activity-logs',             [ActivityLogController::class, 'index']);
    Route::get('activity-logs/{id}',        [ActivityLogController::class, 'show']);
    Route::delete('activity-logs/{id}',     [ActivityLogController::class, 'destroy']);

    // ─── HR & Employee Management ────────────────────────────────────────────
    Route::post('departments/bulk-delete',  [DepartmentController::class, 'bulkDelete']);
    Route::post('departments/bulk-restore', [DepartmentController::class, 'bulkRestore']);
    Route::get('departments/export',        [DepartmentController::class, 'export']);
    Route::post('departments/import',       [DepartmentController::class, 'import']);
    Route::post('departments/{id}/restore', [DepartmentController::class, 'restore']);
    Route::delete('departments/{id}/force', [DepartmentController::class, 'forceDelete']);
    Route::apiResource('departments',       DepartmentController::class);

    Route::post('positions/bulk-delete',    [PositionController::class, 'bulkDelete']);
    Route::post('positions/bulk-restore',   [PositionController::class, 'bulkRestore']);
    Route::get('positions/export',          [PositionController::class, 'export']);
    Route::post('positions/import',         [PositionController::class, 'import']);
    Route::post('positions/{id}/restore',   [PositionController::class, 'restore']);
    Route::delete('positions/{id}/force',   [PositionController::class, 'forceDelete']);
    Route::apiResource('positions',         PositionController::class);

    Route::get('employees/stats',           [EmployeeController::class, 'stats']);
    Route::post('employees/upload-photo',   [EmployeeController::class, 'uploadPhoto']);
    Route::post('employees/bulk-delete',    [EmployeeController::class, 'bulkDelete']);
    Route::post('employees/bulk-restore',   [EmployeeController::class, 'bulkRestore']);
    Route::get('employees/export',          [EmployeeController::class, 'export']);
    Route::post('employees/import',         [EmployeeController::class, 'import']);
    Route::post('employees/{id}/restore',   [EmployeeController::class, 'restore']);
    Route::delete('employees/{id}/force',   [EmployeeController::class, 'forceDelete']);
    Route::apiResource('employees',         EmployeeController::class);

    Route::apiResource('shifts',            ShiftController::class);

    Route::get('attendances/entrance-qr',    [AttendanceController::class, 'getEntranceQr']);
    Route::post('attendances/generate-qr',   [AttendanceController::class, 'generateQr']);
    Route::post('attendances/revoke-entrance-qr', [AttendanceController::class, 'revokeEntranceQr']);
    Route::post('attendances/scan-qr',       [AttendanceController::class, 'scanQr']);
    Route::get('attendances/dashboard-stats', [AttendanceController::class, 'dashboardStats']);
    Route::get('attendances/monthly-summary', [AttendanceController::class, 'monthlySummary']);
    Route::post('attendances/bulk-delete',   [AttendanceController::class, 'bulkDelete']);
    Route::get('attendances/export',         [AttendanceController::class, 'export']);
    Route::post('attendances/import',        [AttendanceController::class, 'import']);
    Route::apiResource('attendances',        AttendanceController::class);

    Route::get('attendance/entrance-qr',     [AttendanceController::class, 'getEntranceQr']);
    Route::post('attendance/generate-qr',    [AttendanceController::class, 'generateQr']);
    Route::post('attendance/revoke-entrance-qr', [AttendanceController::class, 'revokeEntranceQr']);
    Route::post('attendance/scan-qr',        [AttendanceController::class, 'scanQr']);
    Route::get('attendance/dashboard-stats', [AttendanceController::class, 'dashboardStats']);
    Route::get('attendance/monthly-summary', [AttendanceController::class, 'monthlySummary']);
    Route::post('attendance/bulk-delete',    [AttendanceController::class, 'bulkDelete']);
    Route::get('attendance/export',          [AttendanceController::class, 'export']);
    Route::post('attendance/import',         [AttendanceController::class, 'import']);
    Route::apiResource('attendance',         AttendanceController::class);

    Route::post('payrolls/auto-generate',   [PayrollController::class, 'autoGenerate']);
    Route::get('payrolls/aba-preview',       [PayrollController::class, 'abaPreview']);
    Route::get('payrolls/export-aba-bulk',   [PayrollController::class, 'exportAbaBulk']);
    Route::get('payrolls/{id}/payslip',      [PayrollController::class, 'getPayslip']);
    Route::post('payrolls/bulk-delete',      [PayrollController::class, 'bulkDelete']);
    Route::get('payrolls/export',            [PayrollController::class, 'export']);
    Route::post('payrolls/import',           [PayrollController::class, 'import']);
    Route::apiResource('payrolls',           PayrollController::class);

    // ─── Leave Management ───────────────────────────────────────────────────
    Route::post('leave-requests/bulk-delete', [LeaveRequestController::class, 'bulkDelete']);
    Route::post('leaves/bulk-delete',         [LeaveRequestController::class, 'bulkDelete']);
    Route::post('leave-requests/{id}/approve', [LeaveRequestController::class, 'approve']);
    Route::post('leave-requests/{id}/reject',  [LeaveRequestController::class, 'reject']);
    Route::get('leave-balances/{employeeId}',  [LeaveRequestController::class, 'getBalance']);
    Route::apiResource('leave-requests',       LeaveRequestController::class);

    // ─── Holiday Management ──────────────────────────────────────────────────
    Route::post('holidays/bulk-delete',  [HolidayController::class, 'bulkDelete']);
    Route::post('holidays/bulk-import',  [HolidayController::class, 'bulkImport']);
    Route::apiResource('holidays',       HolidayController::class);

    // ─── Content Management (CMS) ────────────────────────────────────────────
    Route::get('cms/stats',                  [BlogController::class, 'stats']);
    Route::post('blog-categories/bulk-delete', [BlogCategoryController::class, 'bulkDelete']);
    Route::apiResource('blog-categories',    BlogCategoryController::class);
    Route::post('blog-tags/bulk-delete',      [BlogTagController::class, 'bulkDelete']);
    Route::apiResource('blog-tags',          BlogTagController::class);
    Route::post('blogs/bulk-delete',          [BlogController::class, 'bulkDelete']);
    Route::apiResource('blogs',              BlogController::class);
    Route::post('blogs/{id}/restore',        [BlogController::class, 'restore']);
    Route::delete('blogs/{id}/force',        [BlogController::class, 'forceDelete']);
    Route::post('pages/bulk-delete',          [PageController::class, 'bulkDelete']);
    Route::apiResource('pages',              PageController::class);
    Route::post('faqs/bulk-delete',           [FaqController::class, 'bulkDelete']);
    Route::apiResource('faqs',               FaqController::class);
    Route::post('announcements/bulk-delete', [AnnouncementController::class, 'bulkDelete']);
    Route::post('announcements/{id}/toggle-active', [AnnouncementController::class, 'toggleActive']);
    Route::apiResource('announcements',      AnnouncementController::class);

    // ─── Expenses & Finance Analytics ────────────────────────────────────────
    Route::get('finance/analytics',          [FinanceAnalyticsController::class, 'analytics']);
    Route::post('expense-categories/bulk-delete', [ExpenseCategoryController::class, 'bulkDelete']);
    Route::apiResource('expense-categories', ExpenseCategoryController::class);
    Route::get('expenses/stats',             [ExpenseController::class, 'stats']);
    Route::post('expenses/bulk-delete',      [ExpenseController::class, 'bulkDelete']);
    Route::post('expenses/bulk-restore',     [ExpenseController::class, 'bulkRestore']);
    Route::apiResource('expenses',           ExpenseController::class);
    Route::post('expenses/{id}/restore',     [ExpenseController::class, 'restore']);
    Route::delete('expenses/{id}/force',     [ExpenseController::class, 'forceDelete']);

    // ─── Shipping & Geographic Locations ─────────────────────────────────────
    Route::apiResource('shipping-methods',   ShippingMethodController::class);
    Route::apiResource('shipping-zones',     ShippingZoneController::class);
    Route::apiResource('shipping-rates',     ShippingRateController::class);
    Route::apiResource('shipments',          ShipmentController::class);
    Route::post('countries/bulk-delete',     [CountryController::class, 'bulkDelete']);
    Route::post('provinces/bulk-delete',     [ProvinceController::class, 'bulkDelete']);
    Route::post('cities/bulk-delete',        [CityController::class, 'bulkDelete']);
    Route::apiResource('countries',          CountryController::class);
    Route::apiResource('provinces',          ProvinceController::class);
    Route::apiResource('cities',             CityController::class);

    // ─── Sub-Tables & Utility Resources ──────────────────────────────────────
    Route::apiResource('attribute-values',   AttributeValueController::class);
    Route::apiResource('audit-logs',         AuditLogController::class);
    Route::apiResource('cart-items',         CartItemController::class);
    Route::apiResource('carts',              CartController::class);
    Route::apiResource('cash-register-transactions', CashRegisterTransactionController::class);
    Route::get('customer-addresses/export',  [CustomerAddressController::class, 'export']);
    Route::post('customer-addresses/import', [CustomerAddressController::class, 'import']);
    Route::post('customer-addresses/bulk-delete', [CustomerAddressController::class, 'bulkDelete']);
    Route::apiResource('customer-addresses', CustomerAddressController::class);
    Route::apiResource('inventories',        InventoryController::class);
    Route::apiResource('inventory-movements', InventoryMovementController::class);
    Route::apiResource('login-histories',    LoginHistoryController::class);
    Route::apiResource('notification-logs',  NotificationLogController::class);
    Route::apiResource('order-items',        OrderItemController::class);
    Route::apiResource('order-status-histories', OrderStatusHistoryController::class);
    Route::apiResource('product-images',     ProductImageController::class);
    Route::apiResource('product-prices',     ProductPriceController::class);
    Route::apiResource('product-reviews',    ProductReviewController::class);
    Route::apiResource('product-variant-values', ProductVariantValueController::class);
    Route::post('product-variants/bulk-delete', [ProductVariantController::class, 'bulkDelete']);
    Route::apiResource('product-variants',   ProductVariantController::class);
    Route::apiResource('purchase-items',     PurchaseItemController::class);
    Route::apiResource('purchase-return-items', PurchaseReturnItemController::class);
    Route::apiResource('sale-items',         SaleItemController::class);
    Route::apiResource('sale-return-items',  SaleReturnItemController::class);
    Route::apiResource('sale-returns',       SaleReturnController::class);
    Route::apiResource('stock-adjustment-items', StockAdjustmentItemController::class);
    Route::apiResource('stock-opname-items', StockOpnameItemController::class);

    // ─── Notifications & Communication ───────────────────────────────────────
    Route::prefix('notifications')->group(function () {
        Route::get('stats',              [NotificationController::class, 'stats']);
        Route::get('unread',             [NotificationController::class, 'unread']);
        Route::get('export',             [NotificationController::class, 'export']);
        Route::put('read-all',           [NotificationController::class, 'markAllAsRead']);
        Route::post('bulk',              [NotificationController::class, 'bulk']);
        Route::delete('clear',           [NotificationController::class, 'clear']);
        Route::get('{id}/logs',          [NotificationController::class, 'logs']);
        Route::post('{id}/duplicate',    [NotificationController::class, 'duplicate']);
        Route::put('{id}/read',          [NotificationController::class, 'markAsRead']);
    });
    Route::apiResource('notifications', NotificationController::class);

    Route::get('notification-templates/export',              [NotificationTemplateController::class, 'export']);
    Route::post('notification-templates/import',             [NotificationTemplateController::class, 'import']);
    Route::post('notification-templates/{id}/duplicate',     [NotificationTemplateController::class, 'duplicate']);
    Route::put('notification-templates/{id}/toggle-status',  [NotificationTemplateController::class, 'toggleStatus']);
    Route::apiResource('notification-templates', NotificationTemplateController::class);

    Route::prefix('notification-settings')->group(function () {
        Route::get('/',                  [NotificationSettingController::class, 'show']);
        Route::put('/',                  [NotificationSettingController::class, 'update']);
        Route::post('test-email',        [NotificationSettingController::class, 'testEmail']);
        Route::post('test-telegram',     [NotificationSettingController::class, 'testTelegram']);
        Route::post('test-sms',          [NotificationSettingController::class, 'testSms']);
        Route::post('test-push',         [NotificationSettingController::class, 'testPush']);
        Route::post('test-channel',      [NotificationSettingController::class, 'testChannel']);
    });

    // ─── AI Chatbot & Telegram Bot Management ────────────────────────────────
    Route::prefix('chatbot')->group(function () {
        Route::get('dashboard',                 [AdminChatbotController::class, 'dashboard']);
        Route::get('sessions',                  [AdminChatbotController::class, 'sessions']);
        Route::get('sessions/{id}',             [AdminChatbotController::class, 'showSession']);
        Route::get('support-requests',          [AdminChatbotController::class, 'supportRequests']);
        Route::put('support-requests/{id}',      [AdminChatbotController::class, 'updateSupportRequest']);
        Route::get('telegram-users',            [AdminChatbotController::class, 'telegramUsers']);
        Route::post('test-notification',        [AdminChatbotController::class, 'testNotification']);
    });

    // ─── Telegram CMS Broadcast ──────────────────────────────────────────────
    Route::post('telegram/broadcast',           [\App\Http\Controllers\Api\V1\Admin\CMS\BlogController::class, 'broadcastToTelegram']);

    // ─── Global Media Storage Management ─────────────────────────────────────
    Route::post('media/delete-file',            [\App\Http\Controllers\Api\V1\Admin\Media\MediaController::class, 'deleteFile']);
});
