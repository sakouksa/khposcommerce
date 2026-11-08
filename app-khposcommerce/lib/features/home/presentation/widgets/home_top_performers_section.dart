import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

class HomeTopPerformersSection extends StatelessWidget {
  final bool isDark;

  const HomeTopPerformersSection({
    super.key,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final cardBg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;

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
          Text(
            'Top Selling Products & Fast-Moving Items',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          ),
          const SizedBox(height: 12),
          _buildItemRow(title: 'MacBook Pro M3 Max (16")', sales: '42 Units Sold', revenue: '\$104,950', isDark: isDark, borderColor: borderColor),
          const SizedBox(height: 8),
          _buildItemRow(title: 'iPhone 15 Pro Max (256GB)', sales: '38 Units Sold', revenue: '\$45,560', isDark: isDark, borderColor: borderColor),
          const SizedBox(height: 8),
          _buildItemRow(title: 'iPad Air M2 11-inch', sales: '29 Units Sold', revenue: '\$17,370', isDark: isDark, borderColor: borderColor),
        ],
      ),
    );
  }

  Widget _buildItemRow({
    required String title,
    required String sales,
    required String revenue,
    required bool isDark,
    required Color borderColor,
  }) {
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final secondaryTextColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withValues(alpha: 0.03) : AppColors.lightInputFill,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor.withValues(alpha: 0.5)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: textColor)),
              const SizedBox(height: 2),
              Text(sales, style: TextStyle(fontSize: 10, color: secondaryTextColor)),
            ],
          ),
          Text(revenue, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.primary)),
        ],
      ),
    );
  }
}
