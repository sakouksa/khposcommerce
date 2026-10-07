import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../theme/app_colors.dart';
import '../network/api_client.dart';

class EnterpriseDrawer extends ConsumerWidget {
  const EnterpriseDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Drawer(
      backgroundColor: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
      child: Column(
        children: [
          UserAccountsDrawerHeader(
            decoration: const BoxDecoration(
              gradient: AppColors.heroGradient,
            ),
            currentAccountPicture: const CircleAvatar(
              backgroundColor: Colors.white,
              child: Icon(Icons.person, size: 36, color: AppColors.primary),
            ),
            accountName: const Text(
              'Super Admin',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            accountEmail: const Text('admin@enterprise-pos.com'),
          ),
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                _drawerItem(
                  context,
                  icon: Icons.dashboard_outlined,
                  title: 'Dashboard',
                  route: '/home',
                ),
                _drawerItem(
                  context,
                  icon: Icons.inventory_2_outlined,
                  title: 'Products',
                  route: '/products',
                ),
                _drawerItem(
                  context,
                  icon: Icons.warehouse_outlined,
                  title: 'Inventory',
                  route: '/inventory',
                ),
                _drawerItem(
                  context,
                  icon: Icons.shopping_bag_outlined,
                  title: 'Purchase',
                  route: '/purchases',
                ),
                _drawerItem(
                  context,
                  icon: Icons.receipt_long_outlined,
                  title: 'Sales',
                  route: '/sales',
                ),
                _drawerItem(
                  context,
                  icon: Icons.analytics_outlined,
                  title: 'Reports',
                  route: '/reports',
                ),
                _drawerItem(
                  context,
                  icon: Icons.account_balance_wallet_outlined,
                  title: 'Finance',
                  route: '/finance',
                ),
                _drawerItem(
                  context,
                  icon: Icons.people_outline,
                  title: 'CRM & Customers',
                  route: '/customers',
                ),
                _drawerItem(
                  context,
                  icon: Icons.badge_outlined,
                  title: 'Employees & HR',
                  route: '/employees',
                ),
                _drawerItem(
                  context,
                  icon: Icons.fingerprint,
                  title: 'Attendance',
                  route: '/attendance',
                ),
                _drawerItem(
                  context,
                  icon: Icons.request_quote_outlined,
                  title: 'Payroll',
                  route: '/payroll',
                ),
                _drawerItem(
                  context,
                  icon: Icons.local_shipping_outlined,
                  title: 'Suppliers',
                  route: '/suppliers',
                ),
                const Divider(),
                _drawerItem(
                  context,
                  icon: Icons.settings_outlined,
                  title: 'Settings',
                  route: '/settings',
                ),
                _drawerItem(
                  context,
                  icon: Icons.help_outline,
                  title: 'Help Center',
                  route: '/help-center',
                ),
              ],
            ),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: AppColors.danger),
            title: const Text(
              'Logout',
              style: TextStyle(color: AppColors.danger, fontWeight: FontWeight.bold),
            ),
            onTap: () async {
              final storage = ref.read(secureStorageProvider);
              await storage.clearTokens();
              if (context.mounted) {
                context.go('/login');
              }
            },
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _drawerItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String route,
  }) {
    final String currentRoute = GoRouterState.of(context).uri.toString();
    final bool isSelected = currentRoute == route;

    return ListTile(
      leading: Icon(
        icon,
        color: isSelected ? AppColors.primary : AppColors.textSecondaryLight,
      ),
      title: Text(
        title,
        style: TextStyle(
          color: isSelected ? AppColors.primary : null,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
      ),
      selected: isSelected,
      onTap: () {
        Navigator.pop(context); // Close drawer
        context.go(route);
      },
    );
  }
}
