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
use App\Http\Controllers\Api\V1\Admin\Marketing\PromotionCampaignController;
use App\Http\Controllers\Api\V1\Admin\Marketing\PricingEngineController;

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

Route::middleware(['auth.jwt', 'tenant.scope'])->group(function () {

    // ─── Dashboard ──────────────────────────────────────────────────────────
    Route::middleware('permission:dashboard.view')->prefix('dashboard')->group(function () {
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
    Route::get('companies',               [CompanyController::class, 'index'])->middleware('permission:company.view');
    Route::get('companies/{id}',          [CompanyController::class, 'show'])->middleware('permission:company.view');
    Route::post('companies',              [CompanyController::class, 'store'])->middleware('permission:company.create');
    Route::match(['put', 'patch'], 'companies/{id}', [CompanyController::class, 'update'])->middleware('permission:company.update');
    Route::delete('companies/{id}',       [CompanyController::class, 'destroy'])->middleware('permission:company.delete');

    Route::get('branches',                [BranchController::class, 'index'])->middleware('permission:branch.view');
    Route::get('branches/{id}',           [BranchController::class, 'show'])->middleware('permission:branch.view');
    Route::post('branches',               [BranchController::class, 'store'])->middleware('permission:branch.create');
    Route::match(['put', 'patch'], 'branches/{id}', [BranchController::class, 'update'])->middleware('permission:branch.update');
    Route::delete('branches/{id}',        [BranchController::class, 'destroy'])->middleware('permission:branch.delete');
    Route::post('branches/{id}/restore',  [BranchController::class, 'restore'])->middleware('permission:branch.update');
    Route::delete('branches/{id}/force',  [BranchController::class, 'forceDelete'])->middleware('permission:branch.delete');

    Route::get('stores',                  [StoreController::class, 'index'])->middleware('permission:store.view');
    Route::get('stores/{id}',             [StoreController::class, 'show'])->middleware('permission:store.view');
    Route::post('stores',                 [StoreController::class, 'store'])->middleware('permission:store.create');
    Route::match(['put', 'patch'], 'stores/{id}', [StoreController::class, 'update'])->middleware('permission:store.update');
    Route::delete('stores/{id}',          [StoreController::class, 'destroy'])->middleware('permission:store.delete');
    Route::post('stores/{id}/restore',    [StoreController::class, 'restore'])->middleware('permission:store.update');
    Route::delete('stores/{id}/force',    [StoreController::class, 'forceDelete'])->middleware('permission:store.delete');

    Route::get('warehouses',              [WarehouseController::class, 'index'])->middleware('permission:warehouse.view');
    Route::get('warehouses/{id}',         [WarehouseController::class, 'show'])->middleware('permission:warehouse.view');
    Route::post('warehouses',             [WarehouseController::class, 'store'])->middleware('permission:warehouse.create');
    Route::match(['put', 'patch'], 'warehouses/{id}', [WarehouseController::class, 'update'])->middleware('permission:warehouse.update');
    Route::delete('warehouses/{id}',      [WarehouseController::class, 'destroy'])->middleware('permission:warehouse.delete');
    Route::post('warehouses/{id}/restore',[WarehouseController::class, 'restore'])->middleware('permission:warehouse.update');
    Route::delete('warehouses/{id}/force',[WarehouseController::class, 'forceDelete'])->middleware('permission:warehouse.delete');

    // ─── Products & Catalog ──────────────────────────────────────────────────
    Route::get('products/stats',                [ProductController::class, 'stats'])->middleware('permission:product.view');
    Route::get('products/dashboard-statistics', [ProductController::class, 'stats'])->middleware('permission:product.view');
    Route::post('products/bulk-delete',         [ProductController::class, 'bulkDelete'])->middleware('permission:product.delete');
    Route::post('products/bulk-restore',        [ProductController::class, 'bulkRestore'])->middleware('permission:product.update');
    Route::get('products/export',               [ProductController::class, 'export'])->middleware('permission:product.view|product.export');
    Route::post('products/import',              [ProductController::class, 'import'])->middleware('permission:product.create');
    Route::post('products/{id}/restore',        [ProductController::class, 'restore'])->middleware('permission:product.update');
    Route::delete('products/{id}/force',        [ProductController::class, 'forceDelete'])->middleware('permission:product.delete');
    Route::post('products/{product}/images',    [ProductController::class, 'uploadImages'])->middleware('permission:product.update');
    Route::delete('products/{product}/images/{image}', [ProductController::class, 'deleteImage'])->middleware('permission:product.update');
    Route::get('products/{product}/variants',   [ProductController::class, 'variants'])->middleware('permission:product.view');
    Route::get('products',                      [ProductController::class, 'index'])->middleware('permission:product.view');
    Route::get('products/{id}',                 [ProductController::class, 'show'])->middleware('permission:product.view');
    Route::post('products',                     [ProductController::class, 'store'])->middleware('permission:product.create');
    Route::match(['put', 'patch'], 'products/{id}', [ProductController::class, 'update'])->middleware('permission:product.update');
    Route::delete('products/{id}',              [ProductController::class, 'destroy'])->middleware('permission:product.delete');

    Route::post('categories/bulk-delete',       [CategoryController::class, 'bulkDelete'])->middleware('permission:category.delete');
    Route::post('categories/bulk-restore',      [CategoryController::class, 'bulkRestore'])->middleware('permission:category.update');
    Route::get('categories/export',             [CategoryController::class, 'export'])->middleware('permission:category.view|category.export');
    Route::post('categories/import',            [CategoryController::class, 'import'])->middleware('permission:category.create');
    Route::post('categories/{id}/restore',      [CategoryController::class, 'restore'])->middleware('permission:category.update');
    Route::delete('categories/{id}/force',      [CategoryController::class, 'forceDelete'])->middleware('permission:category.delete');
    Route::get('categories',                    [CategoryController::class, 'index'])->middleware('permission:category.view');
    Route::get('categories/{id}',               [CategoryController::class, 'show'])->middleware('permission:category.view');
    Route::post('categories',                   [CategoryController::class, 'store'])->middleware('permission:category.create');
    Route::match(['put', 'patch'], 'categories/{id}', [CategoryController::class, 'update'])->middleware('permission:category.update');
    Route::delete('categories/{id}',            [CategoryController::class, 'destroy'])->middleware('permission:category.delete');

    Route::post('brands/bulk-delete',           [BrandController::class, 'bulkDelete'])->middleware('permission:brand.delete');
    Route::post('brands/bulk-restore',          [BrandController::class, 'bulkRestore'])->middleware('permission:brand.update');
    Route::get('brands/export',                 [BrandController::class, 'export'])->middleware('permission:brand.view|brand.export');
    Route::post('brands/import',                [BrandController::class, 'import'])->middleware('permission:brand.create');
    Route::post('brands/{id}/restore',          [BrandController::class, 'restore'])->middleware('permission:brand.update');
    Route::delete('brands/{id}/force',          [BrandController::class, 'forceDelete'])->middleware('permission:brand.delete');
    Route::get('brands',                        [BrandController::class, 'index'])->middleware('permission:brand.view');
    Route::get('brands/{id}',                   [BrandController::class, 'show'])->middleware('permission:brand.view');
    Route::post('brands',                       [BrandController::class, 'store'])->middleware('permission:brand.create');
    Route::match(['put', 'patch'], 'brands/{id}', [BrandController::class, 'update'])->middleware('permission:brand.update');
    Route::delete('brands/{id}',                [BrandController::class, 'destroy'])->middleware('permission:brand.delete');

    Route::post('taxes/bulk-delete',            [TaxController::class, 'bulkDelete'])->middleware('permission:tax.delete');
    Route::post('taxes/bulk-restore',           [TaxController::class, 'bulkRestore'])->middleware('permission:tax.update');
    Route::get('taxes/export',                  [TaxController::class, 'export'])->middleware('permission:tax.view|tax.export');
    Route::post('taxes/import',                 [TaxController::class, 'import'])->middleware('permission:tax.create');
    Route::post('taxes/{id}/restore',           [TaxController::class, 'restore'])->middleware('permission:tax.update');
    Route::delete('taxes/{id}/force',           [TaxController::class, 'forceDelete'])->middleware('permission:tax.delete');
    Route::get('taxes',                         [TaxController::class, 'index'])->middleware('permission:tax.view');
    Route::get('taxes/{id}',                    [TaxController::class, 'show'])->middleware('permission:tax.view');
    Route::post('taxes',                        [TaxController::class, 'store'])->middleware('permission:tax.create');
    Route::match(['put', 'patch'], 'taxes/{id}', [TaxController::class, 'update'])->middleware('permission:tax.update');
    Route::delete('taxes/{id}',                 [TaxController::class, 'destroy'])->middleware('permission:tax.delete');

    Route::post('units/bulk-delete',            [UnitController::class, 'bulkDelete'])->middleware('permission:unit.delete');
    Route::post('units/bulk-restore',           [UnitController::class, 'bulkRestore'])->middleware('permission:unit.update');
    Route::get('units/export',                  [UnitController::class, 'export'])->middleware('permission:unit.view|unit.export');
    Route::post('units/import',                 [UnitController::class, 'import'])->middleware('permission:unit.create');
    Route::post('units/{id}/restore',           [UnitController::class, 'restore'])->middleware('permission:unit.update');
    Route::delete('units/{id}/force',           [UnitController::class, 'forceDelete'])->middleware('permission:unit.delete');
    Route::get('units',                         [UnitController::class, 'index'])->middleware('permission:unit.view');
    Route::get('units/{id}',                    [UnitController::class, 'show'])->middleware('permission:unit.view');
    Route::post('units',                        [UnitController::class, 'store'])->middleware('permission:unit.create');
    Route::match(['put', 'patch'], 'units/{id}', [UnitController::class, 'update'])->middleware('permission:unit.update');
    Route::delete('units/{id}',                 [UnitController::class, 'destroy'])->middleware('permission:unit.delete');

    Route::post('attributes/bulk-delete',       [AttributeController::class, 'bulkDelete'])->middleware('permission:attribute.delete');
    Route::post('attributes/bulk-restore',      [AttributeController::class, 'bulkRestore'])->middleware('permission:attribute.update');
    Route::get('attributes/export',             [AttributeController::class, 'export'])->middleware('permission:attribute.view|attribute.export');
    Route::post('attributes/import',            [AttributeController::class, 'import'])->middleware('permission:attribute.create');
    Route::post('attributes/{id}/restore',      [AttributeController::class, 'restore'])->middleware('permission:attribute.update');
    Route::delete('attributes/{id}/force',      [AttributeController::class, 'forceDelete'])->middleware('permission:attribute.delete');
    Route::get('attributes',                    [AttributeController::class, 'index'])->middleware('permission:attribute.view');
    Route::get('attributes/{id}',               [AttributeController::class, 'show'])->middleware('permission:attribute.view');
    Route::post('attributes',                   [AttributeController::class, 'store'])->middleware('permission:attribute.create');
    Route::match(['put', 'patch'], 'attributes/{id}', [AttributeController::class, 'update'])->middleware('permission:attribute.update');
    Route::delete('attributes/{id}',            [AttributeController::class, 'destroy'])->middleware('permission:attribute.delete');

    // ─── Inventory Management ────────────────────────────────────────────────
    Route::get('inventory/stats',               [InventoryController::class, 'stats'])->middleware('permission:inventory.view');
    Route::get('inventory/dashboard',           [InventoryController::class, 'stats'])->middleware('permission:inventory.view');
    Route::get('inventory/export',              [InventoryController::class, 'export'])->middleware('permission:inventory.view|inventory.export');
    Route::post('inventory/import',             [InventoryController::class, 'import'])->middleware('permission:inventory.adjust|inventory.create');
    Route::get('inventory',                     [InventoryController::class, 'index'])->middleware('permission:inventory.view');
    Route::get('inventory/low-stock',           [InventoryController::class, 'lowStock'])->middleware('permission:inventory.view');
    Route::get('inventory/product/{pid}',       [InventoryController::class, 'byProduct'])->middleware('permission:inventory.view');
    Route::get('inventory/{id}',                [InventoryController::class, 'show'])->middleware('permission:inventory.view');

    Route::post('stock-adjustments/bulk-delete', [StockAdjustmentController::class, 'bulkDelete'])->middleware('permission:stock_adjustment.delete');
    Route::post('stock-adjustments/bulk-restore', [StockAdjustmentController::class, 'bulkRestore'])->middleware('permission:stock_adjustment.update');
    Route::get('stock-adjustments/export',      [StockAdjustmentController::class, 'export'])->middleware('permission:stock_adjustment.view|stock_adjustment.export');
    Route::post('stock-adjustments/import',     [StockAdjustmentController::class, 'import'])->middleware('permission:stock_adjustment.create|stock_adjustment.adjust');
    Route::post('stock-adjustments/{id}/restore', [StockAdjustmentController::class, 'restore'])->middleware('permission:stock_adjustment.update');
    Route::delete('stock-adjustments/{id}/force', [StockAdjustmentController::class, 'forceDelete'])->middleware('permission:stock_adjustment.delete');
    Route::post('stock-adjustments/{id}/approve', [StockAdjustmentController::class, 'approve'])->middleware('permission:stock_adjustment.approve|stock_adjustment.update');
    Route::get('stock-adjustments',             [StockAdjustmentController::class, 'index'])->middleware('permission:stock_adjustment.view');
    Route::get('stock-adjustments/{id}',        [StockAdjustmentController::class, 'show'])->middleware('permission:stock_adjustment.view');
    Route::post('stock-adjustments',            [StockAdjustmentController::class, 'store'])->middleware('permission:stock_adjustment.create|stock_adjustment.adjust');
    Route::match(['put', 'patch'], 'stock-adjustments/{id}', [StockAdjustmentController::class, 'update'])->middleware('permission:stock_adjustment.update|stock_adjustment.adjust');
    Route::delete('stock-adjustments/{id}',     [StockAdjustmentController::class, 'destroy'])->middleware('permission:stock_adjustment.delete');

    Route::post('stock-transfers/bulk-delete',  [StockTransferController::class, 'bulkDelete'])->middleware('permission:stock_transfer.delete');
    Route::post('stock-transfers/bulk-restore', [StockTransferController::class, 'bulkRestore'])->middleware('permission:stock_transfer.update');
    Route::get('stock-transfers/export',       [StockTransferController::class, 'export'])->middleware('permission:stock_transfer.view|stock_transfer.export');
    Route::post('stock-transfers/import',      [StockTransferController::class, 'import'])->middleware('permission:stock_transfer.create|stock_transfer.transfer');
    Route::post('stock-transfers/{id}/restore', [StockTransferController::class, 'restore'])->middleware('permission:stock_transfer.update');
    Route::delete('stock-transfers/{id}/force', [StockTransferController::class, 'forceDelete'])->middleware('permission:stock_transfer.delete');
    Route::post('stock-transfers/{id}/ship',    [StockTransferController::class, 'ship'])->middleware('permission:stock_transfer.transfer|stock_transfer.update');
    Route::post('stock-transfers/{id}/receive', [StockTransferController::class, 'receive'])->middleware('permission:stock_transfer.transfer|stock_transfer.update');
    Route::get('stock-transfers',               [StockTransferController::class, 'index'])->middleware('permission:stock_transfer.view');
    Route::get('stock-transfers/{id}',          [StockTransferController::class, 'show'])->middleware('permission:stock_transfer.view');
    Route::post('stock-transfers',              [StockTransferController::class, 'store'])->middleware('permission:stock_transfer.create|stock_transfer.transfer');
    Route::match(['put', 'patch'], 'stock-transfers/{id}', [StockTransferController::class, 'update'])->middleware('permission:stock_transfer.update|stock_transfer.transfer');
    Route::delete('stock-transfers/{id}',       [StockTransferController::class, 'destroy'])->middleware('permission:stock_transfer.delete');

    Route::post('stock-opnames/bulk-delete',   [StockOpnameController::class, 'bulkDelete'])->middleware('permission:stock_opname.delete');
    Route::post('stock-opnames/bulk-restore',  [StockOpnameController::class, 'bulkRestore'])->middleware('permission:stock_opname.update');
    Route::get('stock-opnames/export',         [StockOpnameController::class, 'export'])->middleware('permission:stock_opname.view|stock_opname.export');
    Route::post('stock-opnames/import',        [StockOpnameController::class, 'import'])->middleware('permission:stock_opname.create|stock_opname.opname');
    Route::post('stock-opnames/{id}/restore',  [StockOpnameController::class, 'restore'])->middleware('permission:stock_opname.update');
    Route::delete('stock-opnames/{id}/force',  [StockOpnameController::class, 'forceDelete'])->middleware('permission:stock_opname.delete');
    Route::post('stock-opnames/{id}/complete', [StockOpnameController::class, 'complete'])->middleware('permission:stock_opname.approve|stock_opname.opname');
    Route::get('stock-opnames',                [StockOpnameController::class, 'index'])->middleware('permission:stock_opname.view');
    Route::get('stock-opnames/{id}',           [StockOpnameController::class, 'show'])->middleware('permission:stock_opname.view');
    Route::post('stock-opnames',               [StockOpnameController::class, 'store'])->middleware('permission:stock_opname.create|stock_opname.opname');
    Route::match(['put', 'patch'], 'stock-opnames/{id}', [StockOpnameController::class, 'update'])->middleware('permission:stock_opname.update|stock_opname.opname');
    Route::delete('stock-opnames/{id}',        [StockOpnameController::class, 'destroy'])->middleware('permission:stock_opname.delete');

    // ─── Suppliers & Purchases ───────────────────────────────────────────────
    Route::post('suppliers/bulk-delete',        [SupplierController::class, 'bulkDelete'])->middleware('permission:supplier.delete');
    Route::get('suppliers',                     [SupplierController::class, 'index'])->middleware('permission:supplier.view');
    Route::get('suppliers/{id}',                [SupplierController::class, 'show'])->middleware('permission:supplier.view');
    Route::post('suppliers',                    [SupplierController::class, 'store'])->middleware('permission:supplier.create');
    Route::match(['put', 'patch'], 'suppliers/{id}', [SupplierController::class, 'update'])->middleware('permission:supplier.update');
    Route::delete('suppliers/{id}',             [SupplierController::class, 'destroy'])->middleware('permission:supplier.delete');
    Route::post('suppliers/{id}/restore',       [SupplierController::class, 'restore'])->middleware('permission:supplier.update');
    Route::delete('suppliers/{id}/force',       [SupplierController::class, 'forceDelete'])->middleware('permission:supplier.delete');

    Route::get('purchases/returns',             [PurchaseReturnController::class, 'index'])->middleware('permission:purchase_return.view|purchase.view');
    Route::get('purchases',                     [PurchaseController::class, 'index'])->middleware('permission:purchase.view');
    Route::get('purchases/{id}',                [PurchaseController::class, 'show'])->middleware('permission:purchase.view');
    Route::post('purchases',                    [PurchaseController::class, 'store'])->middleware('permission:purchase.create');
    Route::match(['put', 'patch'], 'purchases/{id}', [PurchaseController::class, 'update'])->middleware('permission:purchase.update');
    Route::delete('purchases/{id}',             [PurchaseController::class, 'destroy'])->middleware('permission:purchase.delete');
    Route::post('purchases/{id}/receive',       [PurchaseController::class, 'receive'])->middleware('permission:purchase.approve|purchase.update');
    Route::post('purchases/{id}/cancel',        [PurchaseController::class, 'cancel'])->middleware('permission:purchase.update|purchase.delete');
    Route::post('purchases/{id}/record-payment', [PurchaseController::class, 'recordPayment'])->middleware('permission:purchase.update|payment.process');

    Route::post('purchase-returns/bulk-delete', [PurchaseReturnController::class, 'bulkDelete'])->middleware('permission:purchase_return.delete');
    Route::get('purchase-returns',              [PurchaseReturnController::class, 'index'])->middleware('permission:purchase_return.view');
    Route::get('purchase-returns/{id}',         [PurchaseReturnController::class, 'show'])->middleware('permission:purchase_return.view');
    Route::post('purchase-returns',             [PurchaseReturnController::class, 'store'])->middleware('permission:purchase_return.create');
    Route::match(['put', 'patch'], 'purchase-returns/{id}', [PurchaseReturnController::class, 'update'])->middleware('permission:purchase_return.update');
    Route::delete('purchase-returns/{id}',      [PurchaseReturnController::class, 'destroy'])->middleware('permission:purchase_return.delete');
    Route::post('purchase-returns/{id}/approve', [PurchaseReturnController::class, 'approve'])->middleware('permission:purchase.approve|purchase_return.update');
    Route::post('purchase-returns/{id}/ship',    [PurchaseReturnController::class, 'ship'])->middleware('permission:purchase_return.update');
    Route::post('purchase-returns/{id}/settle',  [PurchaseReturnController::class, 'settle'])->middleware('permission:purchase_return.update');
    Route::post('purchase-returns/{id}/cancel',  [PurchaseReturnController::class, 'cancel'])->middleware('permission:purchase_return.update');
    Route::prefix('purchases/{purchase}')->group(function () {
        Route::apiResource('returns',           PurchaseReturnController::class)->middleware('permission:purchase_return.view');
    });

    Route::get('purchase-report',               [PurchaseReportController::class, 'index'])->middleware('permission:report.view');

    // ─── Customers ───────────────────────────────────────────────────────────
    Route::get('customers/stats',               [CustomerController::class, 'stats'])->middleware('permission:customer.view');
    Route::get('customers/export',              [CustomerController::class, 'export'])->middleware('permission:customer.view|customer.export');
    Route::post('customers/import',             [CustomerController::class, 'import'])->middleware('permission:customer.create');
    Route::post('customers/bulk-delete',        [CustomerController::class, 'bulkDelete'])->middleware('permission:customer.delete');
    Route::post('customers/bulk-restore',       [CustomerController::class, 'bulkRestore'])->middleware('permission:customer.update');
    Route::post('customers/bulk-activate',      [CustomerController::class, 'bulkActivate'])->middleware('permission:customer.update');
    Route::post('customers/bulk-deactivate',    [CustomerController::class, 'bulkDeactivate'])->middleware('permission:customer.update');
    Route::post('customers/bulk-assign-group',  [CustomerController::class, 'bulkAssignGroup'])->middleware('permission:customer.update');
    Route::post('customers/bulk-toggle-credit-hold', [CustomerController::class, 'bulkToggleCreditHold'])->middleware('permission:customer.update');
    Route::post('customers/merge',              [CustomerController::class, 'mergeCustomers'])->middleware('permission:customer.update');
    Route::get('customers',                     [CustomerController::class, 'index'])->middleware('permission:customer.view');
    Route::get('customers/{id}',                [CustomerController::class, 'show'])->middleware('permission:customer.view');
    Route::post('customers',                    [CustomerController::class, 'store'])->middleware('permission:customer.create');
    Route::match(['put', 'patch'], 'customers/{id}', [CustomerController::class, 'update'])->middleware('permission:customer.update');
    Route::delete('customers/{id}',             [CustomerController::class, 'destroy'])->middleware('permission:customer.delete');
    Route::post('customers/{id}/restore',       [CustomerController::class, 'restore'])->middleware('permission:customer.update');
    Route::delete('customers/{id}/force',       [CustomerController::class, 'forceDelete'])->middleware('permission:customer.delete');
    Route::get('customers/{id}/orders',         [CustomerController::class, 'orders'])->middleware('permission:customer.view|order.view');
    Route::post('customers/{id}/settle-debt',   [CustomerController::class, 'settleDebt'])->middleware('permission:customer.update|payment.process');
    Route::post('customers/{id}/wallet-transactions', [CustomerController::class, 'addWalletTransaction'])->middleware('permission:customer.update');
    Route::post('customers/{id}/loyalty-points', [CustomerController::class, 'adjustLoyaltyPoints'])->middleware('permission:customer.update');
    Route::post('customers/{id}/interactions',  [CustomerController::class, 'recordInteraction'])->middleware('permission:customer.update');
    Route::post('customers/{id}/toggle-credit-hold', [CustomerController::class, 'toggleCreditHold'])->middleware('permission:customer.update');
    Route::post('customers/{id}/contacts',      [CustomerController::class, 'addContact'])->middleware('permission:customer.update');
    Route::delete('customers/{id}/contacts/{contactId}', [CustomerController::class, 'deleteContact'])->middleware('permission:customer.update');
    Route::post('customers/{id}/kyc-documents', [CustomerController::class, 'addKycDocument'])->middleware('permission:customer.update');
    Route::post('customers/{id}/pricing-contracts', [CustomerController::class, 'addPricingContract'])->middleware('permission:customer.update');
    Route::post('customers/{id}/support-tickets', [CustomerController::class, 'addSupportTicket'])->middleware('permission:customer.update');

    Route::get('customer-groups/export',        [CustomerGroupController::class, 'export'])->middleware('permission:customer_group.view|customer_group.export');
    Route::post('customer-groups/import',       [CustomerGroupController::class, 'import'])->middleware('permission:customer_group.create');
    Route::post('customer-groups/bulk-delete',  [CustomerGroupController::class, 'bulkDelete'])->middleware('permission:customer_group.delete');
    Route::post('customer-groups/bulk-restore', [CustomerGroupController::class, 'bulkRestore'])->middleware('permission:customer_group.update');
    Route::get('customer-groups',               [CustomerGroupController::class, 'index'])->middleware('permission:customer_group.view');
    Route::get('customer-groups/{id}',          [CustomerGroupController::class, 'show'])->middleware('permission:customer_group.view');
    Route::post('customer-groups',              [CustomerGroupController::class, 'store'])->middleware('permission:customer_group.create');
    Route::match(['put', 'patch'], 'customer-groups/{id}', [CustomerGroupController::class, 'update'])->middleware('permission:customer_group.update');
    Route::delete('customer-groups/{id}',       [CustomerGroupController::class, 'destroy'])->middleware('permission:customer_group.delete');
    Route::post('customer-groups/{id}/restore', [CustomerGroupController::class, 'restore'])->middleware('permission:customer_group.update');
    Route::delete('customer-groups/{id}/force', [CustomerGroupController::class, 'forceDelete'])->middleware('permission:customer_group.delete');

    // ─── POS & Terminals ─────────────────────────────────────────────────────
    Route::middleware('permission:pos.access|sale.create|sale.view')->prefix('pos')->group(function () {
        Route::post('sales',                   [POSController::class, 'sale'])->middleware('permission:sale.create');
        Route::get('sales',                    [POSController::class, 'index'])->middleware('permission:sale.view');
        Route::get('sales/{id}',               [POSController::class, 'show'])->middleware('permission:sale.view');
        Route::post('sales/{id}/return',       [POSController::class, 'processReturn'])->middleware('permission:sale.return|sale.refund');
        Route::get('product-search',           [POSController::class, 'productSearch'])->middleware('permission:product.view');
        Route::get('products/barcode/{code}',  [POSController::class, 'barcodeLookup'])->middleware('permission:product.view');
        Route::post('voice-search',            [POSController::class, 'voiceSearch'])->middleware('permission:product.view');
        Route::post('vision-search',           [POSController::class, 'visionSearch'])->middleware('permission:product.view');
        Route::post('apply-coupon',            [POSController::class, 'applyCoupon'])->middleware('permission:coupon.view');
        Route::post('khqr/generate',           [BakongController::class, 'generate'])->middleware('permission:sale.create|payment.process');
        Route::post('khqr/check',              [BakongController::class, 'check'])->middleware('permission:sale.create|payment.process');
        Route::get('khqr/config',              [BakongController::class, 'config']);
        Route::get('cash-registers',           [CashRegisterController::class, 'index'])->middleware('permission:cash_register.view');
        Route::get('cash-registers/{id}',      [CashRegisterController::class, 'show'])->middleware('permission:cash_register.view');
        Route::post('cash-registers',          [CashRegisterController::class, 'store'])->middleware('permission:cash_register.create|cash_register.manage');
        Route::match(['put', 'patch'], 'cash-registers/{id}', [CashRegisterController::class, 'update'])->middleware('permission:cash_register.update|cash_register.manage');
        Route::delete('cash-registers/{id}',   [CashRegisterController::class, 'destroy'])->middleware('permission:cash_register.delete');
        Route::post('cash-registers/{id}/open',  [CashRegisterController::class, 'open'])->middleware('permission:cash_register.manage');
        Route::post('cash-registers/{id}/close', [CashRegisterController::class, 'close'])->middleware('permission:cash_register.manage');
    });

    // ─── Sales ───────────────────────────────────────────────────────────────
    Route::get('sales',                         [SaleController::class, 'index'])->middleware('permission:sale.view');
    Route::get('sales/{id}',                    [SaleController::class, 'show'])->middleware('permission:sale.view');
    Route::post('sales',                        [SaleController::class, 'store'])->middleware('permission:sale.create');
    Route::match(['put', 'patch'], 'sales/{id}', [SaleController::class, 'update'])->middleware('permission:sale.update');
    Route::delete('sales/{id}',                 [SaleController::class, 'destroy'])->middleware('permission:sale.delete');

    // ─── Orders (Back-Office View) ───────────────────────────────────────────
    Route::get('orders',                        [OrderController::class, 'index'])->middleware('permission:order.view');
    Route::get('orders/{id}',                   [OrderController::class, 'show'])->middleware('permission:order.view');
    Route::post('orders',                       [OrderController::class, 'store'])->middleware('permission:order.create');
    Route::match(['put', 'patch'], 'orders/{id}', [OrderController::class, 'update'])->middleware('permission:order.update');
    Route::delete('orders/{id}',                [OrderController::class, 'destroy'])->middleware('permission:order.delete');
    Route::put('orders/{id}/status',            [OrderController::class, 'updateStatus'])->middleware('permission:order.update|order.manage');
    Route::post('orders/{id}/confirm',          [OrderController::class, 'confirm'])->middleware('permission:order.update|order.manage');
    Route::post('orders/{id}/ship',             [OrderController::class, 'ship'])->middleware('permission:order.update|order.manage');
    Route::post('orders/{id}/deliver',          [OrderController::class, 'deliver'])->middleware('permission:order.update|order.manage');
    Route::post('orders/{id}/complete',         [OrderController::class, 'complete'])->middleware('permission:order.update|order.manage');
    Route::post('orders/{id}/cancel',           [OrderController::class, 'cancel'])->middleware('permission:order.update|order.manage');
    Route::post('orders/{id}/refund',           [OrderController::class, 'refund'])->middleware('permission:order.refund|order.update');
    Route::get('orders/{id}/tracking',          [OrderController::class, 'tracking'])->middleware('permission:order.view');
    Route::get('orders/{id}/invoice',           [OrderController::class, 'invoice'])->middleware('permission:order.view');

    // ─── Reverse Logistics: Returns, Exchanges & Policies ────────────────────
    Route::post('return-policies/seed-defaults', [ReturnPolicyController::class, 'seedDefaults'])->middleware('permission:order.manage');
    Route::get('return-policies',               [ReturnPolicyController::class, 'index'])->middleware('permission:order.view');
    Route::get('return-policies/{id}',          [ReturnPolicyController::class, 'show'])->middleware('permission:order.view');
    Route::post('return-policies',              [ReturnPolicyController::class, 'store'])->middleware('permission:order.manage');
    Route::match(['put', 'patch'], 'return-policies/{id}', [ReturnPolicyController::class, 'update'])->middleware('permission:order.manage');
    Route::delete('return-policies/{id}',       [ReturnPolicyController::class, 'destroy'])->middleware('permission:order.manage');

    Route::get('order-returns',                 [OrderReturnController::class, 'index'])->middleware('permission:order.return|order.view');
    Route::get('order-returns/{id}',            [OrderReturnController::class, 'show'])->middleware('permission:order.return|order.view');
    Route::post('order-returns',                [OrderReturnController::class, 'store'])->middleware('permission:order.return|order.create');
    Route::match(['put', 'patch'], 'order-returns/{id}', [OrderReturnController::class, 'update'])->middleware('permission:order.return|order.update');
    Route::delete('order-returns/{id}',         [OrderReturnController::class, 'destroy'])->middleware('permission:order.delete');
    Route::post('order-returns/{id}/approve',   [OrderReturnController::class, 'approve'])->middleware('permission:order.refund|order.manage');
    Route::post('order-returns/{id}/reject',    [OrderReturnController::class, 'reject'])->middleware('permission:order.manage');
    Route::post('order-returns/{id}/ship',      [OrderReturnController::class, 'ship'])->middleware('permission:order.manage');
    Route::post('order-returns/{id}/receive',   [OrderReturnController::class, 'receive'])->middleware('permission:order.manage');
    Route::post('order-returns/{id}/inspect',   [OrderReturnController::class, 'inspect'])->middleware('permission:order.manage');
    Route::post('order-returns/{id}/settle',    [OrderReturnController::class, 'settle'])->middleware('permission:order.refund|order.manage');
    Route::post('order-returns/{id}/exchange',  [OrderReturnController::class, 'exchange'])->middleware('permission:order.manage');

    // ─── Payments & Financial Transactions ───────────────────────────────────
    Route::get('payment-methods',               [PaymentMethodController::class, 'index'])->middleware('permission:payment.view');
    Route::get('payment-methods/{id}',          [PaymentMethodController::class, 'show'])->middleware('permission:payment.view');
    Route::post('payment-methods',              [PaymentMethodController::class, 'store'])->middleware('permission:payment.create|payment.process');
    Route::match(['put', 'patch'], 'payment-methods/{id}', [PaymentMethodController::class, 'update'])->middleware('permission:payment.update');
    Route::delete('payment-methods/{id}',       [PaymentMethodController::class, 'destroy'])->middleware('permission:payment.delete');
    Route::get('payments',                      [PaymentController::class, 'index'])->middleware('permission:payment.view');
    Route::get('payments/{id}',                 [PaymentController::class, 'show'])->middleware('permission:payment.view');
    Route::post('payments/process',             [PaymentController::class, 'process'])->middleware('permission:payment.process');
    Route::get('transactions',                  [TransactionController::class, 'index'])->middleware('permission:transaction.view');
    Route::get('transactions/{id}',             [TransactionController::class, 'show'])->middleware('permission:transaction.view');
    Route::post('transactions',                 [TransactionController::class, 'store'])->middleware('permission:transaction.create');
    Route::match(['put', 'patch'], 'transactions/{id}', [TransactionController::class, 'update'])->middleware('permission:transaction.update');
    Route::delete('transactions/{id}',          [TransactionController::class, 'destroy'])->middleware('permission:transaction.delete');

    // ─── Enterprise Reports ──────────────────────────────────────────────────
    Route::middleware('permission:report.view')->prefix('reports')->group(function () {
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
            Route::get('export',          [SalesReportController::class, 'export'])->middleware('permission:report.export');
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
            Route::get('export',          [PurchaseReportController::class, 'export'])->middleware('permission:report.export');
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
            Route::get('export',            [InventoryReportController::class, 'export'])->middleware('permission:report.export');
        });

        Route::get('sales',        [SalesReportController::class, 'dashboard']);
        Route::get('purchases',    [ReportController::class, 'purchases']);
        Route::get('inventory',    [InventoryReportController::class, 'overview']);
        Route::get('products',     [ReportController::class, 'products']);
        Route::get('customers',    [ReportController::class, 'customers']);
        Route::get('expenses',     [ReportController::class, 'expenses']);
        Route::get('profit-loss',  [ReportController::class, 'profitLoss']);
        Route::get('export-sales', [SalesReportController::class, 'export'])->middleware('permission:report.export');
        Route::get('export-inventory', [InventoryReportController::class, 'export'])->middleware('permission:report.export');
    });

    // ─── Recycle Bin ─────────────────────────────────────────────────────────
    Route::get('recycle-bin/stats',     [RecycleBinController::class, 'stats']);
    Route::get('recycle-bin/dashboard', [RecycleBinController::class, 'stats']);

    // ─── Settings & Global Configuration ─────────────────────────────────────
    Route::get('settings',              [SettingController::class, 'index'])->middleware('permission:setting.view');
    Route::post('settings',             [SettingController::class, 'bulkUpdate'])->middleware('permission:setting.update|setting.manage');
    Route::post('settings/logo',        [SettingController::class, 'uploadLogo'])->middleware('permission:setting.update');
    Route::delete('settings/logo',      [SettingController::class, 'removeLogo'])->middleware('permission:setting.update');
    Route::get('settings/{key}',        [SettingController::class, 'show'])->middleware('permission:setting.view');
    Route::put('settings/{key}',        [SettingController::class, 'update'])->middleware('permission:setting.update');
    Route::get('currencies',            [CurrencyController::class, 'index'])->middleware('permission:setting.view');
    Route::get('currencies/{id}',       [CurrencyController::class, 'show'])->middleware('permission:setting.view');
    Route::post('currencies',           [CurrencyController::class, 'store'])->middleware('permission:setting.update');
    Route::match(['put', 'patch'], 'currencies/{id}', [CurrencyController::class, 'update'])->middleware('permission:setting.update');
    Route::delete('currencies/{id}',    [CurrencyController::class, 'destroy'])->middleware('permission:setting.update');
    Route::get('languages',             [LanguageController::class, 'index'])->middleware('permission:setting.view');
    Route::get('languages/{id}',        [LanguageController::class, 'show'])->middleware('permission:setting.view');
    Route::post('languages',            [LanguageController::class, 'store'])->middleware('permission:setting.update');
    Route::match(['put', 'patch'], 'languages/{id}', [LanguageController::class, 'update'])->middleware('permission:setting.update');
    Route::delete('languages/{id}',     [LanguageController::class, 'destroy'])->middleware('permission:setting.update');

    // ─── Roles, Permissions & User Access ────────────────────────────────────
    Route::prefix('roles')->group(function () {
        Route::get('stats',               [RoleController::class, 'stats'])->middleware('permission:role.view');
        Route::get('dashboard',           [RoleController::class, 'stats'])->middleware('permission:role.view');
        Route::get('{id}/permissions',    [RoleController::class, 'permissions'])->middleware('permission:role.view');
        Route::post('{id}/permissions',   [RoleController::class, 'assignPermissions'])->middleware('permission:role.update');
    });
    Route::get('roles',                   [RoleController::class, 'index'])->middleware('permission:role.view');
    Route::get('roles/{id}',              [RoleController::class, 'show'])->middleware('permission:role.view');
    Route::post('roles',                  [RoleController::class, 'store'])->middleware('permission:role.create');
    Route::match(['put', 'patch'], 'roles/{id}', [RoleController::class, 'update'])->middleware('permission:role.update');
    Route::delete('roles/{id}',           [RoleController::class, 'destroy'])->middleware('permission:role.delete');

    Route::prefix('permissions')->group(function () {
        Route::get('stats',               [PermissionController::class, 'stats'])->middleware('permission:permission.view');
        Route::get('dashboard',           [PermissionController::class, 'stats'])->middleware('permission:permission.view');
        Route::get('modules',             [PermissionController::class, 'modules'])->middleware('permission:permission.view');
    });
    Route::get('permissions',            [PermissionController::class, 'index'])->middleware('permission:permission.view');
    Route::get('permissions/{id}',       [PermissionController::class, 'show'])->middleware('permission:permission.view');
    Route::post('permissions',           [PermissionController::class, 'store'])->middleware('permission:permission.create');
    Route::match(['put', 'patch'], 'permissions/{id}', [PermissionController::class, 'update'])->middleware('permission:permission.update');
    Route::delete('permissions/{id}',    [PermissionController::class, 'destroy'])->middleware('permission:permission.delete');

    Route::post('users/{id}/assign-role', [UserRoleController::class, 'assign'])->middleware('permission:role.update');
    Route::post('users/{id}/remove-role', [UserRoleController::class, 'remove'])->middleware('permission:role.update');

    Route::prefix('users')->group(function () {
        Route::get('stats',               [UserController::class, 'stats'])->middleware('permission:user.view');
        Route::get('dashboard',           [UserController::class, 'stats'])->middleware('permission:user.view');
        Route::post('upload-avatar',      [UserController::class, 'uploadAvatar'])->middleware('permission:user.update');
    });
    Route::get('users',                   [UserController::class, 'index'])->middleware('permission:user.view');
    Route::get('users/{id}',              [UserController::class, 'show'])->middleware('permission:user.view');
    Route::post('users',                  [UserController::class, 'store'])->middleware('permission:user.create');
    Route::match(['put', 'patch'], 'users/{id}', [UserController::class, 'update'])->middleware('permission:user.update');
    Route::delete('users/{id}',           [UserController::class, 'destroy'])->middleware('permission:user.delete');

    // ─── Marketing & Promotions ──────────────────────────────────────────────
    Route::post('banners/bulk-delete',      [BannerController::class, 'bulkDelete'])->middleware('permission:banner.delete');
    Route::get('banners',                   [BannerController::class, 'index'])->middleware('permission:banner.view');
    Route::get('banners/{id}',              [BannerController::class, 'show'])->middleware('permission:banner.view');
    Route::post('banners',                  [BannerController::class, 'store'])->middleware('permission:banner.create');
    Route::match(['put', 'patch'], 'banners/{id}', [BannerController::class, 'update'])->middleware('permission:banner.update');
    Route::delete('banners/{id}',           [BannerController::class, 'destroy'])->middleware('permission:banner.delete');

    Route::get('coupons/generate-code',     [CouponController::class, 'generateCode'])->middleware('permission:coupon.create');
    Route::post('coupons/validate',         [CouponController::class, 'validateCoupon'])->middleware('permission:coupon.view');
    Route::get('coupons',                   [CouponController::class, 'index'])->middleware('permission:coupon.view');
    Route::get('coupons/{id}',              [CouponController::class, 'show'])->middleware('permission:coupon.view');
    Route::post('coupons',                  [CouponController::class, 'store'])->middleware('permission:coupon.create');
    Route::match(['put', 'patch'], 'coupons/{id}', [CouponController::class, 'update'])->middleware('permission:coupon.update');
    Route::delete('coupons/{id}',           [CouponController::class, 'destroy'])->middleware('permission:coupon.delete');

    Route::get('flash-sales',               [FlashSaleController::class, 'index'])->middleware('permission:flash_sale.view');
    Route::get('flash-sales/{id}',          [FlashSaleController::class, 'show'])->middleware('permission:flash_sale.view');
    Route::post('flash-sales',              [FlashSaleController::class, 'store'])->middleware('permission:flash_sale.create');
    Route::match(['put', 'patch'], 'flash-sales/{id}', [FlashSaleController::class, 'update'])->middleware('permission:flash_sale.update');
    Route::delete('flash-sales/{id}',       [FlashSaleController::class, 'destroy'])->middleware('permission:flash_sale.delete');

    Route::get('promotions',                [PromotionController::class, 'index'])->middleware('permission:promotion.view');
    Route::get('promotions/{id}',           [PromotionController::class, 'show'])->middleware('permission:promotion.view');
    Route::post('promotions',               [PromotionController::class, 'store'])->middleware('permission:promotion.create');
    Route::match(['put', 'patch'], 'promotions/{id}', [PromotionController::class, 'update'])->middleware('permission:promotion.update');
    Route::delete('promotions/{id}',        [PromotionController::class, 'destroy'])->middleware('permission:promotion.delete');

    // Promotion Campaigns & Discount Rules Engine
    Route::get('promotion-campaigns',               [PromotionCampaignController::class, 'index'])->middleware('permission:promotion.view');
    Route::get('promotion-campaigns/{id}',          [PromotionCampaignController::class, 'show'])->middleware('permission:promotion.view');
    Route::get('promotion-campaigns/{id}/usages',   [PromotionCampaignController::class, 'usages'])->middleware('permission:promotion.view');
    Route::post('promotion-campaigns',              [PromotionCampaignController::class, 'store'])->middleware('permission:promotion.create');
    Route::match(['put', 'patch'], 'promotion-campaigns/{id}', [PromotionCampaignController::class, 'update'])->middleware('permission:promotion.update');
    Route::delete('promotion-campaigns/{id}',       [PromotionCampaignController::class, 'destroy'])->middleware('permission:promotion.delete');

    // Central Pricing Engine
    Route::post('pricing/calculate',                [PricingEngineController::class, 'calculate']);
    Route::post('pricing/validate-coupon',          [PricingEngineController::class, 'validateCoupon']);

    // ─── Reviews Moderation ──────────────────────────────────────────────────
    Route::get('reviews',                   [ReviewController::class, 'index']);
    Route::post('reviews/{id}/approve',     [ReviewController::class, 'approve']);
    Route::post('reviews/{id}/reject',      [ReviewController::class, 'reject']);
    Route::delete('reviews/{id}',           [ReviewController::class, 'destroy']);

    // ─── Activity & Security Logs ────────────────────────────────────────────
    Route::get('activity-logs/dashboard',   [ActivityLogController::class, 'dashboard'])->middleware('permission:activity_log.view|audit_log.view');
    Route::get('activity-logs',             [ActivityLogController::class, 'index'])->middleware('permission:activity_log.view|audit_log.view');
    Route::get('activity-logs/{id}',        [ActivityLogController::class, 'show'])->middleware('permission:activity_log.view|audit_log.view');
    Route::delete('activity-logs/{id}',     [ActivityLogController::class, 'destroy'])->middleware('permission:activity_log.delete|audit_log.delete');

    // ─── HR & Employee Management ────────────────────────────────────────────
    Route::post('departments/bulk-delete',  [DepartmentController::class, 'bulkDelete'])->middleware('permission:department.delete');
    Route::post('departments/bulk-restore', [DepartmentController::class, 'bulkRestore'])->middleware('permission:department.update');
    Route::get('departments/export',        [DepartmentController::class, 'export'])->middleware('permission:department.view|department.export');
    Route::post('departments/import',       [DepartmentController::class, 'import'])->middleware('permission:department.create');
    Route::post('departments/{id}/restore', [DepartmentController::class, 'restore'])->middleware('permission:department.update');
    Route::delete('departments/{id}/force', [DepartmentController::class, 'forceDelete'])->middleware('permission:department.delete');
    Route::get('departments',               [DepartmentController::class, 'index'])->middleware('permission:department.view');
    Route::get('departments/{id}',          [DepartmentController::class, 'show'])->middleware('permission:department.view');
    Route::post('departments',              [DepartmentController::class, 'store'])->middleware('permission:department.create');
    Route::match(['put', 'patch'], 'departments/{id}', [DepartmentController::class, 'update'])->middleware('permission:department.update');
    Route::delete('departments/{id}',       [DepartmentController::class, 'destroy'])->middleware('permission:department.delete');

    Route::post('positions/bulk-delete',    [PositionController::class, 'bulkDelete'])->middleware('permission:position.delete');
    Route::post('positions/bulk-restore',   [PositionController::class, 'bulkRestore'])->middleware('permission:position.update');
    Route::get('positions/export',          [PositionController::class, 'export'])->middleware('permission:position.view|position.export');
    Route::post('positions/import',         [PositionController::class, 'import'])->middleware('permission:position.create');
    Route::post('positions/{id}/restore',   [PositionController::class, 'restore'])->middleware('permission:position.update');
    Route::delete('positions/{id}/force',   [PositionController::class, 'forceDelete'])->middleware('permission:position.delete');
    Route::get('positions',                 [PositionController::class, 'index'])->middleware('permission:position.view');
    Route::get('positions/{id}',            [PositionController::class, 'show'])->middleware('permission:position.view');
    Route::post('positions',                [PositionController::class, 'store'])->middleware('permission:position.create');
    Route::match(['put', 'patch'], 'positions/{id}', [PositionController::class, 'update'])->middleware('permission:position.update');
    Route::delete('positions/{id}',         [PositionController::class, 'destroy'])->middleware('permission:position.delete');

    Route::get('employees/stats',           [EmployeeController::class, 'stats'])->middleware('permission:employee.view');
    Route::post('employees/upload-photo',   [EmployeeController::class, 'uploadPhoto'])->middleware('permission:employee.update');
    Route::post('employees/bulk-delete',    [EmployeeController::class, 'bulkDelete'])->middleware('permission:employee.delete');
    Route::post('employees/bulk-restore',   [EmployeeController::class, 'bulkRestore'])->middleware('permission:employee.update');
    Route::get('employees/export',          [EmployeeController::class, 'export'])->middleware('permission:employee.view|employee.export');
    Route::post('employees/import',         [EmployeeController::class, 'import'])->middleware('permission:employee.create');
    Route::post('employees/{id}/restore',   [EmployeeController::class, 'restore'])->middleware('permission:employee.update');
    Route::delete('employees/{id}/force',   [EmployeeController::class, 'forceDelete'])->middleware('permission:employee.delete');
    Route::get('employees',                 [EmployeeController::class, 'index'])->middleware('permission:employee.view');
    Route::get('employees/{id}',            [EmployeeController::class, 'show'])->middleware('permission:employee.view');
    Route::post('employees',                [EmployeeController::class, 'store'])->middleware('permission:employee.create');
    Route::match(['put', 'patch'], 'employees/{id}', [EmployeeController::class, 'update'])->middleware('permission:employee.update');
    Route::delete('employees/{id}',         [EmployeeController::class, 'destroy'])->middleware('permission:employee.delete');

    Route::get('shifts',                    [ShiftController::class, 'index'])->middleware('permission:shift.view|attendance.view');
    Route::get('shifts/{id}',               [ShiftController::class, 'show'])->middleware('permission:shift.view|attendance.view');
    Route::post('shifts',                   [ShiftController::class, 'store'])->middleware('permission:shift.create|attendance.create');
    Route::match(['put', 'patch'], 'shifts/{id}', [ShiftController::class, 'update'])->middleware('permission:shift.update|attendance.update');
    Route::delete('shifts/{id}',            [ShiftController::class, 'destroy'])->middleware('permission:shift.delete|attendance.delete');

    Route::get('attendances/entrance-qr',    [AttendanceController::class, 'getEntranceQr'])->middleware('permission:attendance.view');
    Route::post('attendances/generate-qr',   [AttendanceController::class, 'generateQr'])->middleware('permission:attendance.update');
    Route::post('attendances/revoke-entrance-qr', [AttendanceController::class, 'revokeEntranceQr'])->middleware('permission:attendance.update');
    Route::post('attendances/scan-qr',       [AttendanceController::class, 'scanQr'])->middleware('permission:attendance.create');
    Route::get('attendances/dashboard-stats', [AttendanceController::class, 'dashboardStats'])->middleware('permission:attendance.view');
    Route::get('attendances/monthly-summary', [AttendanceController::class, 'monthlySummary'])->middleware('permission:attendance.view');
    Route::post('attendances/bulk-delete',   [AttendanceController::class, 'bulkDelete'])->middleware('permission:attendance.delete');
    Route::get('attendances/export',         [AttendanceController::class, 'export'])->middleware('permission:attendance.view|attendance.export');
    Route::post('attendances/import',        [AttendanceController::class, 'import'])->middleware('permission:attendance.create');
    Route::get('attendances',                [AttendanceController::class, 'index'])->middleware('permission:attendance.view');
    Route::get('attendances/{id}',           [AttendanceController::class, 'show'])->middleware('permission:attendance.view');
    Route::post('attendances',               [AttendanceController::class, 'store'])->middleware('permission:attendance.create');
    Route::match(['put', 'patch'], 'attendances/{id}', [AttendanceController::class, 'update'])->middleware('permission:attendance.update');
    Route::delete('attendances/{id}',        [AttendanceController::class, 'destroy'])->middleware('permission:attendance.delete');

    Route::post('payrolls/auto-generate',   [PayrollController::class, 'autoGenerate'])->middleware('permission:payroll.create');
    Route::get('payrolls/aba-preview',       [PayrollController::class, 'abaPreview'])->middleware('permission:payroll.view');
    Route::get('payrolls/export-aba-bulk',   [PayrollController::class, 'exportAbaBulk'])->middleware('permission:payroll.export|payroll.view');
    Route::get('payrolls/{id}/payslip',      [PayrollController::class, 'getPayslip'])->middleware('permission:payroll.view');
    Route::post('payrolls/bulk-delete',      [PayrollController::class, 'bulkDelete'])->middleware('permission:payroll.delete');
    Route::get('payrolls/export',            [PayrollController::class, 'export'])->middleware('permission:payroll.view|payroll.export');
    Route::post('payrolls/import',           [PayrollController::class, 'import'])->middleware('permission:payroll.create');
    Route::get('payrolls',                   [PayrollController::class, 'index'])->middleware('permission:payroll.view');
    Route::get('payrolls/{id}',              [PayrollController::class, 'show'])->middleware('permission:payroll.view');
    Route::post('payrolls',                  [PayrollController::class, 'store'])->middleware('permission:payroll.create');
    Route::match(['put', 'patch'], 'payrolls/{id}', [PayrollController::class, 'update'])->middleware('permission:payroll.update');
    Route::delete('payrolls/{id}',           [PayrollController::class, 'destroy'])->middleware('permission:payroll.delete');

    // ─── Leave Management ───────────────────────────────────────────────────
    Route::post('leave-requests/bulk-delete', [LeaveRequestController::class, 'bulkDelete'])->middleware('permission:leave_request.delete');
    Route::post('leaves/bulk-delete',         [LeaveRequestController::class, 'bulkDelete'])->middleware('permission:leave_request.delete');
    Route::post('leave-requests/{id}/approve', [LeaveRequestController::class, 'approve'])->middleware('permission:leave_request.approve|leave_request.update');
    Route::post('leave-requests/{id}/reject',  [LeaveRequestController::class, 'reject'])->middleware('permission:leave_request.approve|leave_request.update');
    Route::get('leave-balances/{employeeId}',  [LeaveRequestController::class, 'getBalance'])->middleware('permission:leave_request.view');
    Route::get('leave-requests',               [LeaveRequestController::class, 'index'])->middleware('permission:leave_request.view');
    Route::get('leave-requests/{id}',          [LeaveRequestController::class, 'show'])->middleware('permission:leave_request.view');
    Route::post('leave-requests',              [LeaveRequestController::class, 'store'])->middleware('permission:leave_request.create');
    Route::match(['put', 'patch'], 'leave-requests/{id}', [LeaveRequestController::class, 'update'])->middleware('permission:leave_request.update');
    Route::delete('leave-requests/{id}',       [LeaveRequestController::class, 'destroy'])->middleware('permission:leave_request.delete');

    // ─── Holiday Management ──────────────────────────────────────────────────
    Route::post('holidays/sync-live-api', [HolidayController::class, 'syncLiveApi'])->middleware('permission:holiday.create|holiday.update');
    Route::post('holidays/bulk-delete',  [HolidayController::class, 'bulkDelete'])->middleware('permission:holiday.delete');
    Route::post('holidays/bulk-import',  [HolidayController::class, 'bulkImport'])->middleware('permission:holiday.create');
    Route::get('holidays',               [HolidayController::class, 'index'])->middleware('permission:holiday.view');
    Route::get('holidays/{id}',          [HolidayController::class, 'show'])->middleware('permission:holiday.view');
    Route::post('holidays',              [HolidayController::class, 'store'])->middleware('permission:holiday.create');
    Route::match(['put', 'patch'], 'holidays/{id}', [HolidayController::class, 'update'])->middleware('permission:holiday.update');
    Route::delete('holidays/{id}',       [HolidayController::class, 'destroy'])->middleware('permission:holiday.delete');

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
    Route::get('finance/analytics',          [FinanceAnalyticsController::class, 'analytics'])->middleware('permission:expense.view');
    Route::post('expense-categories/bulk-delete', [ExpenseCategoryController::class, 'bulkDelete'])->middleware('permission:expense_category.delete');
    Route::get('expense-categories',         [ExpenseCategoryController::class, 'index'])->middleware('permission:expense_category.view');
    Route::get('expense-categories/{id}',    [ExpenseCategoryController::class, 'show'])->middleware('permission:expense_category.view');
    Route::post('expense-categories',        [ExpenseCategoryController::class, 'store'])->middleware('permission:expense_category.create');
    Route::match(['put', 'patch'], 'expense-categories/{id}', [ExpenseCategoryController::class, 'update'])->middleware('permission:expense_category.update');
    Route::delete('expense-categories/{id}', [ExpenseCategoryController::class, 'destroy'])->middleware('permission:expense_category.delete');
    Route::get('expenses/stats',             [ExpenseController::class, 'stats'])->middleware('permission:expense.view');
    Route::post('expenses/bulk-delete',      [ExpenseController::class, 'bulkDelete'])->middleware('permission:expense.delete');
    Route::post('expenses/bulk-restore',     [ExpenseController::class, 'bulkRestore'])->middleware('permission:expense.update');
    Route::get('expenses',                   [ExpenseController::class, 'index'])->middleware('permission:expense.view');
    Route::get('expenses/{id}',              [ExpenseController::class, 'show'])->middleware('permission:expense.view');
    Route::post('expenses',                  [ExpenseController::class, 'store'])->middleware('permission:expense.create');
    Route::match(['put', 'patch'], 'expenses/{id}', [ExpenseController::class, 'update'])->middleware('permission:expense.update');
    Route::delete('expenses/{id}',           [ExpenseController::class, 'destroy'])->middleware('permission:expense.delete');
    Route::post('expenses/{id}/restore',     [ExpenseController::class, 'restore'])->middleware('permission:expense.update');
    Route::delete('expenses/{id}/force',     [ExpenseController::class, 'forceDelete'])->middleware('permission:expense.delete');

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
        Route::post('send-stock-alert',  [NotificationSettingController::class, 'sendStockAlert']);
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
