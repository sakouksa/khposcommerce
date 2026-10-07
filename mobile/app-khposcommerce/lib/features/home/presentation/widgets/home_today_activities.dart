import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

class HomeTodayActivities extends StatelessWidget {
  final bool isDark;

  const HomeTodayActivities({
    super.key,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final secondaryTextColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final cardBg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;

    final List<Map<String, dynamic>> activities = [
      {
        'title': 'POS Sale #INV-2026-1042 Completed',
        'subtitle': 'Total \$320.50 • Cash Payment • Cashier: Admin',
        'time': '08:24 AM',
        'icon': Icons.receipt_long_rounded,
        'color': AppColors.success,
      },
      {
        'title': 'Stock Purchase Order Received (#PO-892)',
        'subtitle': '40x MacBook Pro M3 added to HQ Warehouse',
        'time': '08:15 AM',
        'icon': Icons.inventory_2_rounded,
        'color': AppColors.primary,
      },
      {
        'title': 'New Customer Account Registered',
        'subtitle': 'Channara Tech Ltd (VIP Enterprise Tier)',
        'time': '08:08 AM',
        'icon': Icons.person_add_rounded,
        'color': AppColors.accent,
      },
      {
        'title': 'Staff Checked In for Morning Shift',
        'subtitle': 'Sothea V. (POS Operator) • Register #2',
        'time': '08:02 AM',
        'icon': Icons.how_to_reg_rounded,
        'color': AppColors.warning,
      },
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
                'Today\'s Realtime Operational Feed',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: textColor,
                ),
              ),
              Icon(Icons.history_rounded, color: AppColors.primary, size: 20),
            ],
          ),

          const SizedBox(height: 14),

          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: activities.length,
            separatorBuilder: (context, index) => Padding(
              padding: const EdgeInsets.only(left: 36),
              child: Divider(color: borderColor.withValues(alpha: 0.5), height: 16),
            ),
            itemBuilder: (context, index) {
              final act = activities[index];
              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: (act['color'] as Color).withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(act['icon'] as IconData, color: act['color'] as Color, size: 16),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          act['title'] as String,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: textColor,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          act['subtitle'] as String,
                          style: TextStyle(fontSize: 11, color: secondaryTextColor),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    act['time'] as String,
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: secondaryTextColor),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}
