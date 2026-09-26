import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from '@/components/layout/AdminLayout'
import { ProtectedRoute } from './guards/ProtectedRoute'
import { PublicRoute } from './guards/PublicRoute'
import { PageFallback } from './components/PageFallback'

// ─── 1. Auth & Public Pages ──────────────────────────────────────────────────
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'))

// ─── 2. Dashboard & Point of Sale (POS) ──────────────────────────────────────
const DashboardPage = React.lazy(() => import('@/pages/dashboard/DashboardPage'))
const POSPage = React.lazy(() => import('@/pages/pos/POSPage'))

// ─── 3. Products & Catalog ───────────────────────────────────────────────────
const ProductsPage = React.lazy(() => import('@/pages/products/ProductsPage'))
const ProductFormPage = React.lazy(() => import('@/pages/products/ProductFormPage'))
const ProductDetailPage = React.lazy(() => import('@/pages/products/ProductDetailPage'))
const CategoriesPage = React.lazy(() => import('@/pages/categories/CategoriesPage'))
const BrandsPage = React.lazy(() => import('@/pages/brands/BrandsPage'))
const AttributesPage = React.lazy(() => import('@/pages/attributes/AttributesPage'))
const TaxesPage = React.lazy(() => import('@/pages/products/TaxesPage'))
const UnitsPage = React.lazy(() => import('@/pages/settings/UnitsPage'))

// ─── 4. Inventory & Warehouses ───────────────────────────────────────────────
const InventoryPage = React.lazy(() => import('@/pages/inventory/InventoryPage'))
const StockAdjustmentForm = React.lazy(() => import('@/pages/inventory/components/StockAdjustmentForm'))
const StockTransferForm = React.lazy(() => import('@/pages/inventory/components/StockTransferForm'))
const StockOpnameForm = React.lazy(() => import('@/pages/inventory/components/StockOpnameForm'))

// ─── 5. Sales, Orders & Returns ──────────────────────────────────────────────
const SalesPage = React.lazy(() => import('@/pages/sales/SalesPage'))
const SalesDetailPage = React.lazy(() => import('@/pages/sales/SalesDetailPage'))
const OrdersPage = React.lazy(() => import('@/pages/orders/OrdersPage'))
const OrderDetailPage = React.lazy(() => import('@/pages/orders/OrderDetailPage'))
const OrderReturnsPage = React.lazy(() => import('@/pages/orders/OrderReturnsPage'))
const OrderReturnDetailPage = React.lazy(() => import('@/pages/orders/OrderReturnDetailPage'))
const ReturnPoliciesPage = React.lazy(() => import('@/pages/orders/ReturnPoliciesPage'))
const ReturnPolicyFormPage = React.lazy(() => import('@/pages/orders/ReturnPolicyFormPage'))

// ─── 6. Purchases & Suppliers ────────────────────────────────────────────────
const PurchasesPage = React.lazy(() => import('@/pages/purchases/PurchasesPage'))
const PurchaseDetailPage = React.lazy(() => import('@/pages/purchases/PurchaseDetailPage'))
const PurchaseReturnsPage = React.lazy(() => import('@/pages/purchases/PurchaseReturnsPage'))
const PurchaseReturnDetailPage = React.lazy(() => import('@/pages/purchases/PurchaseReturnDetailPage'))
const PurchaseReturnFormPage = React.lazy(() => import('@/pages/purchases/PurchaseReturnFormPage'))
const SuppliersPage = React.lazy(() => import('@/pages/suppliers/SuppliersPage'))
const SupplierFormPage = React.lazy(() => import('@/pages/suppliers/SupplierFormPage'))
const SupplierDetailPage = React.lazy(() => import('@/pages/suppliers/SupplierDetailPage'))
const ShippingPage = React.lazy(() => import('@/pages/shipping/ShippingPage'))

// ─── 7. Customers ────────────────────────────────────────────────────────────
const CustomersPage = React.lazy(() => import('@/pages/customers/CustomersPage'))
const CustomerFormPage = React.lazy(() => import('@/pages/customers/CustomerFormPage'))
const CustomerDetailPage = React.lazy(() => import('@/pages/customers/CustomerDetailPage'))
const CustomerGroupsPage = React.lazy(() => import('@/pages/customers/CustomerGroupsPage'))

// ─── 8. HRM & Employees ──────────────────────────────────────────────────────
const EmployeesPage = React.lazy(() => import('@/pages/employees/EmployeesPage'))
const EmployeeFormPage = React.lazy(() => import('@/pages/employees/EmployeeFormPage'))

// ─── 9. Marketing & Promotions ───────────────────────────────────────────────
const PromotionsPage = React.lazy(() => import('@/pages/marketing/PromotionsPage'))
const CouponsPage = React.lazy(() => import('@/pages/marketing/CouponsPage'))
const FlashSalesPage = React.lazy(() => import('@/pages/marketing/FlashSalesPage'))
const BannersPage = React.lazy(() => import('@/pages/marketing/BannersPage'))
const BannerFormPage = React.lazy(() => import('@/pages/marketing/BannerFormPage'))

// ─── 10. CMS (Content Management) ────────────────────────────────────────────
const CMSPage = React.lazy(() => import('@/pages/cms/CMSPage'))
const BlogFormPage = React.lazy(() => import('@/pages/cms/BlogFormPage'))

// ─── 11. Finance & Accounting ────────────────────────────────────────────────
const FinancePage = React.lazy(() => import('@/pages/finance/FinancePage'))

// ─── 12. Reports & Analytics ─────────────────────────────────────────────────
const ReportsPage = React.lazy(() => import('@/pages/reports/ReportsPage'))
const SalesReportPage = React.lazy(() => import('@/pages/reports/SalesReportPage'))
const PurchaseReportPage = React.lazy(() => import('@/pages/reports/PurchaseReportPage'))

// ─── 13. Company & Store Structure ───────────────────────────────────────────
const CompanyPage = React.lazy(() => import('@/pages/company/CompanyPage'))

// ─── 14. Notifications & Chatbot ─────────────────────────────────────────────
const NotificationListPage = React.lazy(() => import('@/pages/notifications/NotificationListPage'))
const NotificationTemplateListPage = React.lazy(() => import('@/pages/notifications/NotificationTemplateListPage'))
const NotificationSettingsPage = React.lazy(() => import('@/pages/notifications/NotificationSettingsPage'))
const ChatbotManagementPage = React.lazy(() => import('@/pages/chatbot/ChatbotManagementPage'))

// ─── 15. Security & System Administration ────────────────────────────────────
const SecurityOverviewDashboard = React.lazy(() => import('@/pages/security/SecurityOverviewDashboard'))
const DeviceManagementPage = React.lazy(() => import('@/pages/security/DeviceManagementPage'))
const SecuritySettingsPage = React.lazy(() => import('@/pages/security/SecuritySettingsPage'))
const UsersPage = React.lazy(() => import('@/pages/users/UsersPage'))
const RolesPage = React.lazy(() => import('@/pages/roles/RolesPage'))
const PermissionsPage = React.lazy(() => import('@/pages/permissions/PermissionsPage'))
const ActivityLogsPage = React.lazy(() => import('@/pages/logs/ActivityLogsPage'))
const RecycleBinPage = React.lazy(() => import('@/pages/recycle-bin/RecycleBinPage'))
const SettingsPage = React.lazy(() => import('@/pages/settings/SettingsPage'))
const ReviewsPage = React.lazy(() => import('@/pages/reviews/ReviewsPage'))
const ProfilePage = React.lazy(() => import('@/pages/profile/ProfilePage'))

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* ── Public Auth Routes ────────────────────────────────────────────── */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ── Protected Admin Layout ────────────────────────────────────────── */}
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>

          {/* 1. Dashboard & POS */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pos" element={<ProtectedRoute permission={['pos.access', 'sale.create']}><POSPage /></ProtectedRoute>} />

          {/* 2. Products & Catalog */}
          <Route path="/products" element={<ProtectedRoute permission="product.view"><ProductsPage /></ProtectedRoute>} />
          <Route path="/products/create" element={<ProtectedRoute permission="product.create"><ProductFormPage /></ProtectedRoute>} />
          <Route path="/products/:id" element={<ProtectedRoute permission="product.view"><ProductDetailPage /></ProtectedRoute>} />
          <Route path="/products/:id/edit" element={<ProtectedRoute permission="product.update"><ProductFormPage /></ProtectedRoute>} />
          <Route path="/products/edit/:id" element={<ProtectedRoute permission="product.update"><ProductFormPage /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute permission="category.view"><CategoriesPage /></ProtectedRoute>} />
          <Route path="/brands" element={<ProtectedRoute permission="brand.view"><BrandsPage /></ProtectedRoute>} />
          <Route path="/units" element={<ProtectedRoute permission="unit.view"><UnitsPage /></ProtectedRoute>} />
          <Route path="/taxes" element={<ProtectedRoute permission="tax.view"><TaxesPage /></ProtectedRoute>} />
          <Route path="/attributes" element={<ProtectedRoute permission="attribute.view"><AttributesPage /></ProtectedRoute>} />

          {/* 3. Inventory & Warehouses */}
          <Route path="/inventory" element={<ProtectedRoute permission="inventory.view"><InventoryPage /></ProtectedRoute>} />
          <Route path="/inventory/adjustments" element={<ProtectedRoute permission="stock_adjustment.view"><InventoryPage tab="adjustments" /></ProtectedRoute>} />
          <Route path="/inventory/adjustments/create" element={<ProtectedRoute permission="stock_adjustment.create"><StockAdjustmentForm /></ProtectedRoute>} />
          <Route path="/inventory/adjustments/:id/edit" element={<ProtectedRoute permission="stock_adjustment.update"><StockAdjustmentForm /></ProtectedRoute>} />
          <Route path="/inventory/adjustments/edit/:id" element={<ProtectedRoute permission="stock_adjustment.update"><StockAdjustmentForm /></ProtectedRoute>} />
          <Route path="/inventory/transfers" element={<ProtectedRoute permission="stock_transfer.view"><InventoryPage tab="transfers" /></ProtectedRoute>} />
          <Route path="/inventory/transfers/create" element={<ProtectedRoute permission="stock_transfer.create"><StockTransferForm /></ProtectedRoute>} />
          <Route path="/inventory/transfers/:id/edit" element={<ProtectedRoute permission="stock_transfer.update"><StockTransferForm /></ProtectedRoute>} />
          <Route path="/inventory/transfers/edit/:id" element={<ProtectedRoute permission="stock_transfer.update"><StockTransferForm /></ProtectedRoute>} />
          <Route path="/inventory/opnames" element={<ProtectedRoute permission="stock_opname.view"><InventoryPage tab="opnames" /></ProtectedRoute>} />
          <Route path="/inventory/opnames/create" element={<ProtectedRoute permission="stock_opname.create"><StockOpnameForm /></ProtectedRoute>} />
          <Route path="/inventory/opnames/:id/edit" element={<ProtectedRoute permission="stock_opname.update"><StockOpnameForm /></ProtectedRoute>} />
          <Route path="/inventory/opnames/edit/:id" element={<ProtectedRoute permission="stock_opname.update"><StockOpnameForm /></ProtectedRoute>} />
          <Route path="/inventory/movements" element={<ProtectedRoute permission="inventory_movement.view"><InventoryPage tab="movements" /></ProtectedRoute>} />
          <Route path="/warehouses" element={<ProtectedRoute permission="warehouse.view"><CompanyPage activeTab="warehouses" /></ProtectedRoute>} />

          {/* 4. Sales, Orders & Returns */}
          <Route path="/sales" element={<ProtectedRoute permission="sale.view"><SalesPage /></ProtectedRoute>} />
          <Route path="/sales/:id" element={<ProtectedRoute permission="sale.view"><SalesDetailPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute permission="order.view"><OrdersPage /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute permission="order.view"><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/returns" element={<ProtectedRoute permission="sale_return.view"><OrderReturnsPage /></ProtectedRoute>} />
          <Route path="/returns/:id" element={<ProtectedRoute permission="sale_return.view"><OrderReturnDetailPage /></ProtectedRoute>} />
          <Route path="/return-policies" element={<ProtectedRoute permission="order.view"><ReturnPoliciesPage /></ProtectedRoute>} />
          <Route path="/return-policies/create" element={<ProtectedRoute permission="order.view"><ReturnPolicyFormPage /></ProtectedRoute>} />
          <Route path="/return-policies/:id/edit" element={<ProtectedRoute permission="order.view"><ReturnPolicyFormPage /></ProtectedRoute>} />

          {/* 5. Purchases & Suppliers */}
          <Route path="/purchases" element={<ProtectedRoute permission="purchase.view"><PurchasesPage /></ProtectedRoute>} />
          <Route path="/purchases/create" element={<ProtectedRoute permission="purchase.create"><PurchasesPage /></ProtectedRoute>} />
          <Route path="/purchases/:id/edit" element={<ProtectedRoute permission="purchase.update"><PurchasesPage /></ProtectedRoute>} />
          <Route path="/purchases/:id" element={<ProtectedRoute permission="purchase.view"><PurchaseDetailPage /></ProtectedRoute>} />
          <Route path="/purchases/returns" element={<ProtectedRoute permission="purchase_return.view"><PurchaseReturnsPage /></ProtectedRoute>} />
          <Route path="/purchases/returns/create" element={<ProtectedRoute permission="purchase_return.create"><PurchaseReturnFormPage /></ProtectedRoute>} />
          <Route path="/purchases/returns/:id/edit" element={<ProtectedRoute permission="purchase_return.update"><PurchaseReturnFormPage /></ProtectedRoute>} />
          <Route path="/purchases/returns/:id" element={<ProtectedRoute permission="purchase_return.view"><PurchaseReturnDetailPage /></ProtectedRoute>} />
          <Route path="/suppliers" element={<ProtectedRoute permission="supplier.view"><SuppliersPage /></ProtectedRoute>} />
          <Route path="/suppliers/create" element={<ProtectedRoute permission="supplier.create"><SupplierFormPage /></ProtectedRoute>} />
          <Route path="/suppliers/:id" element={<ProtectedRoute permission="supplier.view"><SupplierDetailPage /></ProtectedRoute>} />
          <Route path="/suppliers/:id/edit" element={<ProtectedRoute permission="supplier.update"><SupplierFormPage /></ProtectedRoute>} />
          <Route path="/suppliers/edit/:id" element={<ProtectedRoute permission="supplier.update"><SupplierFormPage /></ProtectedRoute>} />
          <Route path="/shipping" element={<ProtectedRoute permission={['shipment.view', 'shipping_method.view']}><ShippingPage /></ProtectedRoute>} />

          {/* 6. Customers */}
          <Route path="/customers" element={<ProtectedRoute permission="customer.view"><CustomersPage /></ProtectedRoute>} />
          <Route path="/customers/create" element={<ProtectedRoute permission="customer.create"><CustomerFormPage /></ProtectedRoute>} />
          <Route path="/customers/groups" element={<ProtectedRoute permission="customer_group.view"><CustomerGroupsPage /></ProtectedRoute>} />
          <Route path="/customers/:id" element={<ProtectedRoute permission="customer.view"><CustomerDetailPage /></ProtectedRoute>} />
          <Route path="/customers/:id/edit" element={<ProtectedRoute permission="customer.update"><CustomerFormPage /></ProtectedRoute>} />
          <Route path="/customers/edit/:id" element={<ProtectedRoute permission="customer.update"><CustomerFormPage /></ProtectedRoute>} />

          {/* 7. HRM & Employees */}
          <Route path="/employees" element={<ProtectedRoute permission="employee.view"><EmployeesPage /></ProtectedRoute>} />
          <Route path="/employees/create" element={<ProtectedRoute permission="employee.create"><EmployeeFormPage /></ProtectedRoute>} />
          <Route path="/employees/:id/edit" element={<ProtectedRoute permission="employee.update"><EmployeeFormPage /></ProtectedRoute>} />
          <Route path="/employees/edit/:id" element={<ProtectedRoute permission="employee.update"><EmployeeFormPage /></ProtectedRoute>} />

          {/* 8. Marketing & Promotions */}
          <Route path="/marketing" element={<ProtectedRoute permission="promotion.view"><PromotionsPage /></ProtectedRoute>} />
          <Route path="/marketing/promotions" element={<ProtectedRoute permission="promotion.view"><PromotionsPage /></ProtectedRoute>} />
          <Route path="/marketing/coupons" element={<ProtectedRoute permission="coupon.view"><CouponsPage /></ProtectedRoute>} />
          <Route path="/marketing/flash-sales" element={<ProtectedRoute permission="flash_sale.view"><FlashSalesPage /></ProtectedRoute>} />
          <Route path="/marketing/banners" element={<ProtectedRoute permission="banner.view"><BannersPage /></ProtectedRoute>} />
          <Route path="/marketing/banners/create" element={<ProtectedRoute permission="banner.create"><BannerFormPage /></ProtectedRoute>} />
          <Route path="/marketing/banners/:id/edit" element={<ProtectedRoute permission="banner.update"><BannerFormPage /></ProtectedRoute>} />
          <Route path="/marketing/banners/edit/:id" element={<ProtectedRoute permission="banner.update"><BannerFormPage /></ProtectedRoute>} />

          {/* 9. CMS (Content Management) */}
          <Route path="/cms" element={<ProtectedRoute permission={['blog.view', 'page.view']}><CMSPage /></ProtectedRoute>} />
          <Route path="/cms/create" element={<ProtectedRoute permission="blog.create"><BlogFormPage /></ProtectedRoute>} />
          <Route path="/cms/blogs/create" element={<ProtectedRoute permission="blog.create"><BlogFormPage /></ProtectedRoute>} />
          <Route path="/cms/blogs/:id/edit" element={<ProtectedRoute permission="blog.update"><BlogFormPage /></ProtectedRoute>} />
          <Route path="/cms/blogs/edit/:id" element={<ProtectedRoute permission="blog.update"><BlogFormPage /></ProtectedRoute>} />
          <Route path="/cms/banners/create" element={<ProtectedRoute permission="banner.create"><BannerFormPage /></ProtectedRoute>} />
          <Route path="/cms/banners/:id/edit" element={<ProtectedRoute permission="banner.update"><BannerFormPage /></ProtectedRoute>} />
          <Route path="/cms/banners/edit/:id" element={<ProtectedRoute permission="banner.update"><BannerFormPage /></ProtectedRoute>} />

          {/* 10. Finance & Accounts */}
          <Route path="/finance" element={<ProtectedRoute permission={['expense.view', 'transaction.view']}><FinancePage /></ProtectedRoute>} />
          <Route path="/finance/transactions" element={<ProtectedRoute permission="transaction.view"><FinancePage /></ProtectedRoute>} />
          <Route path="/finance/categories" element={<ProtectedRoute permission="expense_category.view"><FinancePage /></ProtectedRoute>} />
          <Route path="/finance/accounts" element={<ProtectedRoute permission="expense.view"><FinancePage /></ProtectedRoute>} />
          <Route path="/finance/expenses" element={<ProtectedRoute permission="expense.view"><FinancePage /></ProtectedRoute>} />

          {/* 11. Reports & Analytics */}
          <Route path="/reports" element={<ProtectedRoute permission="report.view"><ReportsPage type="sales" /></ProtectedRoute>} />
          <Route path="/reports/sales" element={<ProtectedRoute permission="report.view"><SalesReportPage /></ProtectedRoute>} />
          <Route path="/reports/purchase" element={<ProtectedRoute permission="report.view"><PurchaseReportPage /></ProtectedRoute>} />
          <Route path="/reports/purchases" element={<ProtectedRoute permission="report.view"><PurchaseReportPage /></ProtectedRoute>} />
          <Route path="/reports/inventory" element={<ProtectedRoute permission="report.view"><ReportsPage type="inventory" /></ProtectedRoute>} />
          <Route path="/reports/profit-loss" element={<ProtectedRoute permission="report.view"><ReportsPage type="profit-loss" /></ProtectedRoute>} />

          {/* 12. Company & Stores */}
          <Route path="/branches" element={<ProtectedRoute permission="branch.view"><CompanyPage activeTab="branches" /></ProtectedRoute>} />
          <Route path="/stores" element={<ProtectedRoute permission="store.view"><CompanyPage activeTab="stores" /></ProtectedRoute>} />
          <Route path="/company" element={<ProtectedRoute permission="company.view"><CompanyPage activeTab="companies" /></ProtectedRoute>} />

          {/* 13. Notifications & Chatbot */}
          <Route path="/notifications" element={<ProtectedRoute permission="notification.view"><NotificationListPage /></ProtectedRoute>} />
          <Route path="/notification-templates" element={<ProtectedRoute permission="notification.template.view"><NotificationTemplateListPage /></ProtectedRoute>} />
          <Route path="/notifications/settings" element={<ProtectedRoute permission="notification.view"><NotificationSettingsPage /></ProtectedRoute>} />
          <Route path="/chatbot" element={<ProtectedRoute><ChatbotManagementPage /></ProtectedRoute>} />

          {/* 14. Security & Access */}
          <Route path="/security" element={<ProtectedRoute permission="user.view"><SecurityOverviewDashboard /></ProtectedRoute>} />
          <Route path="/security/overview" element={<ProtectedRoute permission="user.view"><SecurityOverviewDashboard /></ProtectedRoute>} />
          <Route path="/security/devices" element={<ProtectedRoute permission="user.view"><DeviceManagementPage /></ProtectedRoute>} />
          <Route path="/security/settings" element={<ProtectedRoute permission="setting.view"><SecuritySettingsPage /></ProtectedRoute>} />

          {/* 15. User Management & System Settings */}
          <Route path="/users" element={<ProtectedRoute permission="user.view"><UsersPage /></ProtectedRoute>} />
          <Route path="/roles" element={<ProtectedRoute permission="role.view"><RolesPage /></ProtectedRoute>} />
          <Route path="/permissions" element={<ProtectedRoute permission="permission.view"><PermissionsPage /></ProtectedRoute>} />
          <Route path="/activity-logs" element={<ProtectedRoute permission="activity_log.view"><ActivityLogsPage /></ProtectedRoute>} />
          <Route path="/recycle-bin" element={<ProtectedRoute permission="activity_log.view"><RecycleBinPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute permission="setting.view"><SettingsPage /></ProtectedRoute>} />
          <Route path="/reviews" element={<ProtectedRoute permission="product_review.view"><ReviewsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* ── Wildcard Fallback ───────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
