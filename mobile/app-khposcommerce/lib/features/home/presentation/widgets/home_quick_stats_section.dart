import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/stat_card.dart';

class HomeQuickStatsSection extends StatelessWidget {
  final Map<String, dynamic> stats;
  final bool isDark;

  const HomeQuickStatsSection({
    super.key,
    required this.stats,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final todaysSales = (stats['todays_sales'] ?? 12845.50) as double;
    final todaysPurchase = (stats['todays_purchase'] ?? 4520.00) as double;
    final revenue = (stats['revenue'] ?? 94500.00) as double;
    final profit = (stats['profit'] ?? 28400.00) as double;
    final ordersCount = stats['orders_count'] ?? 142;
    final lowStock = stats['low_stock_count'] ?? 8;
    final outOfStock = stats['out_of_stock_count'] ?? 2;
    final attendance = stats['attendance_count'] ?? 32;

    final width = MediaQuery.of(context).size.width;
    final isDesktop = width > 600;

    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: isDesktop ? 4 : 2,
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: isDesktop ? 1.35 : 1.15,
      children: [
        StatCard(
          title: "Today's Sales",
          value: "\$${todaysSales.toStringAsFixed(2)}",
          trendText: "+14.2%",
          isPositive: true,
          icon: Icons.attach_money_rounded,
          color: AppColors.primary,
          onTap: () => context.push('/sales'),
        ),
        StatCard(
          title: "Today's Purchase",
          value: "\$${todaysPurchase.toStringAsFixed(2)}",
          trendText: "-5.1%",
          isPositive: false,
          icon: Icons.shopping_bag_outlined,
          color: AppColors.accent,
          onTap: () => context.push('/purchases'),
        ),
        StatCard(
          title: "Total Revenue",
          value: "\$${revenue.toStringAsFixed(2)}",
          trendText: "+8.4%",
          isPositive: true,
          icon: Icons.account_balance_wallet_outlined,
          color: AppColors.success,
          onTap: () => context.push('/finance'),
        ),
        StatCard(
          title: "Net Profit",
          value: "\$${profit.toStringAsFixed(2)}",
          trendText: "+12.0%",
          isPositive: true,
          icon: Icons.trending_up_rounded,
          color: AppColors.warning,
          onTap: () => context.push('/reports'),
        ),
        StatCard(
          title: "Total Orders",
          value: "$ordersCount Orders",
          trendText: "18 POS • 4 Web",
          isPositive: true,
          icon: Icons.receipt_long_rounded,
          color: AppColors.primary,
          onTap: () => context.push('/sales'),
        ),
        StatCard(
          title: "Low Stock Alert",
          value: "$lowStock Items",
          trendText: "Action Needed",
          isPositive: false,
          icon: Icons.warning_amber_rounded,
          color: AppColors.warning,
          onTap: () => context.go('/inventory'),
        ),
        StatCard(
          title: "Out of Stock",
          value: "$outOfStock Items",
          trendText: "Critical",
          isPositive: false,
          icon: Icons.remove_shopping_cart_rounded,
          color: AppColors.danger,
          onTap: () => context.go('/inventory'),
        ),
        StatCard(
          title: "Staff Attendance",
          value: "$attendance / 35 Active",
          trendText: "91.4% Present",
          isPositive: true,
          icon: Icons.people_outline_rounded,
          color: AppColors.accent,
          onTap: () => context.push('/attendance'),
        ),
      ],
    );
  }
}
