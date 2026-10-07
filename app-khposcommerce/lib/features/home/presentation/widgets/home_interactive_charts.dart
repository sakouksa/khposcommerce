import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/chart_widgets.dart';

class HomeInteractiveCharts extends StatefulWidget {
  final bool isDark;

  const HomeInteractiveCharts({
    super.key,
    required this.isDark,
  });

  @override
  State<HomeInteractiveCharts> createState() => _HomeInteractiveChartsState();
}

class _HomeInteractiveChartsState extends State<HomeInteractiveCharts> {
  String _timeRange = 'Weekly';
  String _selectedMetric = 'Revenue';

  final Map<String, List<double>> _chartData = {
    'Daily': [1420, 2100, 1850, 3100, 2950, 4100, 4800],
    'Weekly': [12800, 18400, 15200, 22100, 28900, 26400, 34500],
    'Monthly': [45000, 62000, 58000, 74000, 89000, 94500],
    'Yearly': [420000, 580000, 710000, 945000],
  };

  @override
  Widget build(BuildContext context) {
    final bg = widget.isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final textColor = widget.isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final secondaryTextColor = widget.isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final borderColor = widget.isDark ? AppColors.borderDark : AppColors.borderLight;

    final currentData = _chartData[_timeRange] ?? [1200, 2400, 1800, 3200, 4100, 3800, 5200];

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row: Title & Export Action
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Revenue & Performance Trends',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: textColor,
                    ),
                  ),
                  Text(
                    'Compare realtime analytics across branch registers',
                    style: TextStyle(fontSize: 11, color: secondaryTextColor),
                  ),
                ],
              ),

              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  side: BorderSide(color: borderColor),
                ),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Text('Exporting Financial Report (PDF/Excel)...'),
                      backgroundColor: AppColors.primary,
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  );
                },
                icon: const Icon(Icons.download_rounded, size: 14, color: AppColors.primary),
                label: const Text('Export', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary)),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Filters Row (Metric Selector & Time Range Selector)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Metric Selector Pills
              Row(
                children: ['Revenue', 'Profit', 'Expense', 'Orders'].map((metric) {
                  final isSelected = _selectedMetric == metric;
                  return Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: ChoiceChip(
                      label: Text(
                        metric,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          color: isSelected ? Colors.white : textColor,
                        ),
                      ),
                      selected: isSelected,
                      selectedColor: AppColors.primary,
                      backgroundColor: widget.isDark ? Colors.white.withValues(alpha: 0.06) : AppColors.lightInputFill,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      onSelected: (val) => setState(() => _selectedMetric = metric),
                    ),
                  );
                }).toList(),
              ),

              // Time Range Selector Dropdown
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: borderColor),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _timeRange,
                    icon: Icon(Icons.arrow_drop_down, color: textColor, size: 18),
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: textColor),
                    onChanged: (val) {
                      if (val != null) setState(() => _timeRange = val);
                    },
                    items: const [
                      DropdownMenuItem(value: 'Daily', child: Text('Daily')),
                      DropdownMenuItem(value: 'Weekly', child: Text('Weekly')),
                      DropdownMenuItem(value: 'Monthly', child: Text('Monthly')),
                      DropdownMenuItem(value: 'Yearly', child: Text('Yearly')),
                    ],
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Chart Display Component
          SalesAreaChartWidget(weeklySalesData: currentData),
        ],
      ),
    );
  }
}
