import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';

class HomeModulesGrid extends StatelessWidget {
  final bool isDark;

  const HomeModulesGrid({
    super.key,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final secondaryTextColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final cardBg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;

    final List<Map<String, dynamic>> modules = [
      {'name': 'Inventory', 'icon': Icons.inventory_2_rounded, 'route': '/inventory', 'color': AppColors.primary},
      {'name': 'POS Sales', 'icon': Icons.point_of_sale_rounded, 'route': '/pos', 'color': AppColors.success},
      {'name': 'Purchases', 'icon': Icons.shopping_bag_rounded, 'route': '/purchases', 'color': AppColors.accent},
      {'name': 'CRM Customers', 'icon': Icons.people_alt_rounded, 'route': '/customer', 'color': AppColors.info},
      {'name': 'Suppliers', 'icon': Icons.local_shipping_rounded, 'route': '/supplier', 'color': AppColors.secondary},
      {'name': 'Finance & Acct', 'icon': Icons.account_balance_rounded, 'route': '/finance', 'color': AppColors.warning},
      {'name': 'HR & Payroll', 'icon': Icons.badge_rounded, 'route': '/payroll', 'color': AppColors.primary},
      {'name': 'Attendance', 'icon': Icons.access_time_filled_rounded, 'route': '/attendance', 'color': AppColors.success},
      {'name': 'Products Catalog', 'icon': Icons.category_rounded, 'route': '/products', 'color': AppColors.accent},
      {'name': 'Reports & BI', 'icon': Icons.analytics_rounded, 'route': '/reports', 'color': AppColors.warning},
      {'name': 'Notifications', 'icon': Icons.notifications_rounded, 'route': '/notifications', 'color': AppColors.danger},
      {'name': 'System Settings', 'icon': Icons.settings_rounded, 'route': '/settings', 'color': AppColors.secondary},
    ];

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Enterprise Module Catalog',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: textColor,
                    ),
                  ),
                  Text(
                    '111 PostgreSQL DB tables & modules integrated',
                    style: TextStyle(fontSize: 11, color: secondaryTextColor),
                  ),
                ],
              ),
              Icon(Icons.widgets_rounded, color: AppColors.primary, size: 20),
            ],
          ),

          const SizedBox(height: 16),

          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: MediaQuery.of(context).size.width > 600 ? 6 : 4,
              crossAxisSpacing: 10,
              mainAxisSpacing: 12,
              childAspectRatio: 0.9,
            ),
            itemCount: modules.length,
            itemBuilder: (context, index) {
              final mod = modules[index];
              return InkWell(
                onTap: () => context.push(mod['route'] as String),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white.withValues(alpha: 0.04) : AppColors.lightInputFill,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: borderColor.withValues(alpha: 0.6)),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        mod['icon'] as IconData,
                        color: mod['color'] as Color,
                        size: 24,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        mod['name'] as String,
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: textColor,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
