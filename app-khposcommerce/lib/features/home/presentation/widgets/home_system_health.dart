import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

class HomeSystemHealth extends StatelessWidget {
  final bool isDark;

  const HomeSystemHealth({
    super.key,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final cardBg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;

    final List<Map<String, dynamic>> healthItems = [
      {'name': 'Laravel API', 'status': '24ms', 'isOnline': true},
      {'name': 'PostgreSQL DB', 'status': '111 Tables', 'isOnline': true},
      {'name': 'Redis Cache', 'status': 'Active', 'isOnline': true},
      {'name': 'Queue Worker', 'status': 'Running', 'isOnline': true},
      {'name': 'Stripe Gateway', 'status': 'Live', 'isOnline': true},
      {'name': 'Telegram Bot', 'status': 'Synced', 'isOnline': true},
      {'name': 'Firebase Push', 'status': 'Ready', 'isOnline': true},
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
                'Infrastructure & System Health',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: textColor,
                ),
              ),
              const Row(
                children: [
                  Icon(Icons.check_circle_rounded, color: AppColors.success, size: 16),
                  SizedBox(width: 4),
                  Text('All Systems Operational', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.success)),
                ],
              ),
            ],
          ),

          const SizedBox(height: 12),

          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: healthItems.map((item) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.success.withValues(alpha: 0.25)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: AppColors.success,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      '${item['name']}: ${item['status']}',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: textColor,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
