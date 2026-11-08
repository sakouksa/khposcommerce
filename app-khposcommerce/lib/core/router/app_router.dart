import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../network/api_client.dart';
import '../widgets/enterprise_bottom_nav.dart';

// Import Screens
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/biometric_pin_screen.dart';
import '../../features/auth/presentation/forgot_password_screen.dart';
import '../../features/auth/presentation/unauthorized_screen.dart';
import '../../features/auth/presentation/network_error_screen.dart';

import '../../features/home/presentation/home_screen.dart';
import '../../features/pos/presentation/pos_screen.dart';
import '../../features/inventory/presentation/inventory_screen.dart';
import '../../features/notification/presentation/notification_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';

import '../../features/product/presentation/product_list_screen.dart';
import '../../features/purchase/presentation/purchase_list_screen.dart';
import '../../features/sales/presentation/sales_list_screen.dart';
import '../../features/sales/presentation/transactions_hub_screen.dart';
import '../../features/customer/presentation/customer_list_screen.dart';
import '../../features/supplier/presentation/supplier_list_screen.dart';
import '../../features/employee/presentation/employee_list_screen.dart';
import '../../features/attendance/presentation/attendance_screen.dart';
import '../../features/payroll/presentation/payroll_list_screen.dart';
import '../../features/finance/presentation/finance_screen.dart';
import '../../features/report/presentation/reports_hub_screen.dart';
import '../../features/settings/presentation/settings_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final storage = ref.read(secureStorageProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/login',
    redirect: (context, state) async {
      final token = await storage.getAccessToken();
      final isLoggingIn = state.uri.toString() == '/login' || state.uri.toString() == '/forgot-password';

      if (token == null || token.isEmpty) {
        return isLoggingIn ? null : '/login';
      }

      if (isLoggingIn) {
        return '/home';
      }

      return null;
    },
    routes: [
      // Auth routes
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/pin-lock',
        builder: (context, state) => const BiometricPinScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: '/unauthorized',
        builder: (context, state) => const UnauthorizedScreen(),
      ),
      GoRoute(
        path: '/network-error',
        builder: (context, state) => const NetworkErrorScreen(),
      ),

      // Stateful Shell Route for Bottom Navigation (Home, POS, Inventory, Notifications, Profile)
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return Scaffold(
            body: navigationShell,
            bottomNavigationBar: EnterpriseBottomNav(navigationShell: navigationShell),
          );
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/home',
                builder: (context, state) => const HomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/pos',
                builder: (context, state) => const POSScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/inventory',
                builder: (context, state) => const InventoryScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/notifications',
                builder: (context, state) => const NotificationScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),

      // Direct Drawer / Module Routes
      GoRoute(
        path: '/products',
        builder: (context, state) => const ProductListScreen(),
      ),
      GoRoute(
        path: '/purchases',
        builder: (context, state) => const PurchaseListScreen(),
      ),
      GoRoute(
        path: '/sales',
        builder: (context, state) => const SalesListScreen(),
      ),
      GoRoute(
        path: '/transactions',
        builder: (context, state) => const TransactionsHubScreen(),
      ),
      GoRoute(
        path: '/customers',
        builder: (context, state) => const CustomerListScreen(),
      ),
      GoRoute(
        path: '/suppliers',
        builder: (context, state) => const SupplierListScreen(),
      ),
      GoRoute(
        path: '/employees',
        builder: (context, state) => const EmployeeListScreen(),
      ),
      GoRoute(
        path: '/attendance',
        builder: (context, state) => const AttendanceScreen(),
      ),
      GoRoute(
        path: '/payroll',
        builder: (context, state) => const PayrollListScreen(),
      ),
      GoRoute(
        path: '/finance',
        builder: (context, state) => const FinanceScreen(),
      ),
      GoRoute(
        path: '/reports',
        builder: (context, state) => const ReportsHubScreen(),
      ),
      GoRoute(
        path: '/settings',
        builder: (context, state) => const SettingsScreen(),
      ),
    ],
  );
});
