import 'package:flutter/foundation.dart';

class ApiEndpoints {
  // Support compile-time environment injection (e.g., flutter build apk --dart-define=API_BASE_URL=https://api.example.com/api/v1)
  static const String _envBaseUrl = String.fromEnvironment('API_BASE_URL');

  // Dynamic Host resolution: Production environment variable > Web > Android emulator (10.0.2.2) > Desktop/iOS localhost
  static String get baseUrl {
    if (_envBaseUrl.isNotEmpty) {
      return _envBaseUrl;
    }
    if (kIsWeb) {
      return 'http://localhost:8000/api/v1';
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return 'http://10.0.2.2:8000/api/v1';
      case TargetPlatform.windows:
      case TargetPlatform.macOS:
      case TargetPlatform.linux:
      case TargetPlatform.iOS:
      default:
        return 'http://127.0.0.1:8000/api/v1';
    }
  }

  static const String liveBaseUrl = _envBaseUrl != '' ? _envBaseUrl : 'http://127.0.0.1:8000/api/v1';

  // Auth
  static const String login = '/auth/login';
  static const String logout = '/auth/logout';
  static const String refreshToken = '/auth/refresh';
  static const String profile = '/auth/profile';
  static const String changePassword = '/auth/change-password';

  // Dashboard
  static const String dashboardStats = '/dashboard/stats';
  static const String dashboardSalesChart = '/dashboard/sales-chart';
  static const String dashboardTopProducts = '/dashboard/top-products';
  static const String dashboardRecentOrders = '/dashboard/recent-orders';
  static const String dashboardLowStock = '/dashboard/low-stock';

  // Company
  static const String companies = '/companies';
  static const String branches = '/branches';
  static const String stores = '/stores';
  static const String warehouses = '/warehouses';

  // Products
  static const String products = '/products';
  static const String productStats = '/products/stats';
  static const String categories = '/categories';
  static const String brands = '/brands';
  static const String units = '/units';
  static const String taxes = '/taxes';

  // Inventory
  static const String inventory = '/inventory';
  static const String inventoryStats = '/inventory/stats';
  static const String stockAdjustments = '/stock-adjustments';
  static const String stockTransfers = '/stock-transfers';
  static const String stockOpnames = '/stock-opnames';

  // Purchases & Suppliers
  static const String suppliers = '/suppliers';
  static const String purchases = '/purchases';
  static const String purchaseReturns = '/purchase-returns';

  // POS & Sales
  static const String posSale = '/pos/sales';
  static const String posSearch = '/pos/product-search';
  static const String cashRegisters = '/pos/cash-registers';
  static const String sales = '/sales';
  static const String orders = '/orders';
  static const String payments = '/payments';

  // Customers
  static const String customers = '/customers';
  static const String customerGroups = '/customer-groups';

  // Employees & HR
  static const String employees = '/employees';
  static const String departments = '/departments';
  static const String positions = '/positions';
  static const String attendances = '/attendances';
  static const String attendanceScanQr = '/attendances/scan-qr';
  static const String payrolls = '/payrolls';

  // Finance & Expenses
  static const String expenses = '/expenses';
  static const String expenseCategories = '/expense-categories';

  // Reports
  static const String salesReportOverview = '/reports/sales/overview';
  static const String salesReportDashboard = '/reports/sales/dashboard';
  static const String purchaseReportOverview = '/reports/purchase/overview';
  static const String inventoryReportOverview = '/reports/inventory/overview';

  // Notifications
  static const String notifications = '/notifications';
  static const String notificationsUnread = '/notifications/unread';

  // Settings
  static const String settings = '/settings';
  static const String currencies = '/currencies';
  static const String languages = '/languages';
}
