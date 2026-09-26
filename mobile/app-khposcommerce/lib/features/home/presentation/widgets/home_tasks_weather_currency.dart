import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

class HomeTasksWeatherCurrency extends StatelessWidget {
  final bool isDark;

  const HomeTasksWeatherCurrency({
    super.key,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final secondaryTextColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final cardBg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;

    return Row(
      children: [
        // Weather Widget
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: borderColor),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.accent.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.wb_sunny_rounded, color: AppColors.accent, size: 20),
                ),
                const SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Phnom Penh 31°C', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: textColor)),
                    Text('Sunny • Delivery Good', style: TextStyle(fontSize: 10, color: secondaryTextColor)),
                  ],
                ),
              ],
            ),
          ),
        ),

        const SizedBox(width: 10),

        // Currency Exchange Rates
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: borderColor),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.currency_exchange_rounded, color: AppColors.success, size: 20),
                ),
                const SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('1 USD = 4,120 KHR', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: textColor)),
                    Text('Updated Live NBC', style: TextStyle(fontSize: 10, color: secondaryTextColor)),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
