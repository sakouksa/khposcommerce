import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';

class HomeQuickActions extends StatelessWidget {
  final bool isDark;

  const HomeQuickActions({
    super.key,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final cardBg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;

    final List<Map<String, dynamic>> actions = [
      {'title': 'New Sale POS', 'icon': Icons.point_of_sale_rounded, 'color': AppColors.primary, 'route': '/pos'},
      {'title': 'New Purchase', 'icon': Icons.add_shopping_cart_rounded, 'color': AppColors.accent, 'route': '/purchases'},
      {'title': 'Receive Stock', 'icon': Icons.inventory_rounded, 'color': AppColors.success, 'route': '/inventory'},
      {'title': 'Stock Transfer', 'icon': Icons.swap_horiz_rounded, 'color': AppColors.warning, 'route': '/inventory'},
      {'title': 'New Customer', 'icon': Icons.person_add_alt_1_rounded, 'color': AppColors.info, 'route': '/customer'},
      {'title': 'Staff Check-In', 'icon': Icons.how_to_reg_rounded, 'color': AppColors.secondary, 'route': '/attendance'},
      {'title': 'Create Invoice', 'icon': Icons.receipt_long_rounded, 'color': AppColors.primary, 'route': '/sales'},
      {'title': 'Print / Reports', 'icon': Icons.print_rounded, 'color': AppColors.accent, 'route': '/reports'},
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
              Text(
                'Express Quick Actions',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: textColor,
                ),
              ),
              Icon(Icons.flash_on_rounded, color: AppColors.warning, size: 20),
            ],
          ),
          const SizedBox(height: 14),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: MediaQuery.of(context).size.width > 600 ? 8 : 4,
              crossAxisSpacing: 10,
              mainAxisSpacing: 12,
              childAspectRatio: 0.9,
            ),
            itemCount: actions.length,
            itemBuilder: (context, index) {
              final action = actions[index];
              return InkWell(
                onTap: () => context.push(action['route'] as String),
                borderRadius: BorderRadius.circular(16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: (action['color'] as Color).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: (action['color'] as Color).withValues(alpha: 0.3),
                        ),
                      ),
                      child: Icon(
                        action['icon'] as IconData,
                        color: action['color'] as Color,
                        size: 22,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      action['title'] as String,
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
              );
            },
          ),
        ],
      ),
    );
  }
}
