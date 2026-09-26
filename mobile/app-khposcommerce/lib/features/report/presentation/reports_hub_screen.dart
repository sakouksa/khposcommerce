import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/enterprise_app_bar.dart';
import '../../../core/widgets/enterprise_drawer.dart';
import '../../../core/widgets/chart_widgets.dart';

class ReportsHubScreen extends ConsumerStatefulWidget {
  const ReportsHubScreen({super.key});

  @override
  ConsumerState<ReportsHubScreen> createState() => _ReportsHubScreenState();
}

class _ReportsHubScreenState extends ConsumerState<ReportsHubScreen> {
  bool _isDarkMode(BuildContext context) {
    final themeMode = ref.watch(themeModeProvider);
    if (themeMode == ThemeMode.dark) return true;
    if (themeMode == ThemeMode.light) return false;
    return MediaQuery.of(context).platformBrightness == Brightness.dark;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = _isDarkMode(context);
    final bgColor = isDark ? AppColors.backgroundDark : AppColors.backgroundLight;
    final cardBg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final secondaryTextColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: const EnterpriseAppBar(title: 'Sales Report'),
      drawer: const EnterpriseDrawer(),
      body: Stack(
        children: [
          SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Date Filter Header Pill (Matching Screenshot)
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: borderColor),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.calendar_today_rounded, size: 14, color: AppColors.primary),
                          const SizedBox(width: 8),
                          Text('All Time', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: textColor)),
                          const SizedBox(width: 8),
                          Text('Change ▾', style: TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.tune_rounded, color: AppColors.primary),
                      onPressed: () {},
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // 2x2 Metric Cards Grid (Matching Screenshot Layout)
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.5,
                  children: [
                    _buildMetricCard(
                      title: 'Total Entries',
                      value: '5 Entries',
                      subtitle: 'vs last month',
                      icon: Icons.receipt_long_rounded,
                      cardBg: cardBg,
                      borderColor: borderColor,
                      textColor: textColor,
                      secondaryTextColor: secondaryTextColor,
                    ),
                    _buildMetricCard(
                      title: 'Total Amount',
                      value: '\$1,280',
                      subtitle: 'vs last month',
                      icon: Icons.attach_money_rounded,
                      cardBg: cardBg,
                      borderColor: borderColor,
                      textColor: textColor,
                      secondaryTextColor: secondaryTextColor,
                    ),
                    _buildMetricCard(
                      title: 'Received Amount',
                      value: '\$1,250',
                      subtitle: 'vs last month',
                      icon: Icons.check_circle_outline_rounded,
                      cardBg: cardBg,
                      borderColor: borderColor,
                      textColor: textColor,
                      secondaryTextColor: secondaryTextColor,
                    ),
                    _buildMetricCard(
                      title: 'Unpaid Amount',
                      value: '\$550',
                      subtitle: 'vs last month',
                      icon: Icons.pending_actions_rounded,
                      cardBg: cardBg,
                      borderColor: borderColor,
                      textColor: textColor,
                      secondaryTextColor: secondaryTextColor,
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // Interactive Sales Area Chart
                Text('Sales Performance Trend', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: textColor)),
                const SizedBox(height: 12),
                const SalesAreaChartWidget(weeklySalesData: [4500, 7200, 6800, 9400, 11200, 10800, 14500]),

                const SizedBox(height: 20),

                // Transaction Lists
                Text('Transaction Lists', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: textColor)),
                const SizedBox(height: 12),

                _buildTransactionTile('M A Rouf', '28 Feb 2026', '\$45.00', 'Unpaid', cardBg, borderColor, textColor, secondaryTextColor),
                _buildTransactionTile('M A Rouf', '28 Feb 2026', '\$45.00', 'Unpaid', cardBg, borderColor, textColor, secondaryTextColor),
                _buildTransactionTile('John Smith', '27 Feb 2026', '\$1,200.00', 'Paid', cardBg, borderColor, textColor, secondaryTextColor),
              ],
            ),
          ),

          // Bottom Action Export Toolbar Pills (Exact matching the screenshot)
          Positioned(
            left: 16,
            right: 16,
            bottom: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(30),
                border: Border.all(color: borderColor),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.08),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildExportPill(Icons.download_rounded, 'Download', textColor),
                  _buildExportPill(Icons.print_rounded, 'Print PDF', textColor),
                  _buildExportPill(Icons.table_chart_rounded, 'Excel', textColor),
                  _buildExportPill(Icons.share_rounded, 'Share', textColor),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required Color cardBg,
    required Color borderColor,
    required Color textColor,
    required Color secondaryTextColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 16, color: AppColors.primary),
              ),
              Text(title, style: TextStyle(fontSize: 11, color: secondaryTextColor, fontWeight: FontWeight.w600)),
            ],
          ),
          Text(value, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: textColor)),
          Text(subtitle, style: TextStyle(fontSize: 10, color: secondaryTextColor)),
        ],
      ),
    );
  }

  Widget _buildTransactionTile(
    String name,
    String date,
    String amount,
    String status,
    Color cardBg,
    Color borderColor,
    Color textColor,
    Color secondaryTextColor,
  ) {
    final isUnpaid = status == 'Unpaid';

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: AppColors.primary.withValues(alpha: 0.12),
            child: Text(name.substring(0, 1), style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: textColor)),
                Text(date, style: TextStyle(fontSize: 11, color: secondaryTextColor)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(amount, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: textColor)),
              Text(
                status,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: isUnpaid ? AppColors.danger : AppColors.success,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildExportPill(IconData icon, String label, Color textColor) {
    return InkWell(
      onTap: () {},
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 20, color: AppColors.primary),
            const SizedBox(height: 2),
            Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: textColor)),
          ],
        ),
      ),
    );
  }
}
