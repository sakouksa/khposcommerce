import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import 'enterprise_card.dart';

class SalesAreaChartWidget extends StatelessWidget {
  final List<double> weeklySalesData;
  const SalesAreaChartWidget({super.key, required this.weeklySalesData});

  @override
  Widget build(BuildContext context) {
    final spots = weeklySalesData.asMap().entries.map((e) {
      return FlSpot(e.key.toDouble(), e.value);
    }).toList();

    return EnterpriseCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Weekly Sales Trend',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 16),
              ),
              const Icon(Icons.show_chart, color: AppColors.primary),
            ],
          ),
          const SizedBox(height: 20),
          AspectRatio(
            aspectRatio: 1.8,
            child: LineChart(
              LineChartData(
                gridData: const FlGridData(show: false),
                titlesData: const FlTitlesData(
                  topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                borderData: FlBorderData(show: false),
                lineBarsData: [
                  LineChartBarData(
                    spots: spots.isEmpty ? [const FlSpot(0, 0)] : spots,
                    isCurved: true,
                    color: AppColors.primary,
                    barWidth: 3,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: true),
                    belowBarData: BarAreaData(
                      show: true,
                      color: AppColors.primary.withValues(alpha: 0.15),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class PurchaseBarChartWidget extends StatelessWidget {
  final List<double> purchaseTrendData;
  const PurchaseBarChartWidget({super.key, required this.purchaseTrendData});

  @override
  Widget build(BuildContext context) {
    final barGroups = purchaseTrendData.asMap().entries.map((e) {
      return BarChartGroupData(
        x: e.key,
        barRods: [
          BarChartRodData(
            toY: e.value,
            color: AppColors.accent,
            width: 14,
            borderRadius: BorderRadius.circular(6),
          ),
        ],
      );
    }).toList();

    return EnterpriseCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Purchase Trend',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 16),
              ),
              const Icon(Icons.bar_chart, color: AppColors.accent),
            ],
          ),
          const SizedBox(height: 20),
          AspectRatio(
            aspectRatio: 1.8,
            child: BarChart(
              BarChartData(
                gridData: const FlGridData(show: false),
                titlesData: const FlTitlesData(
                  topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                borderData: FlBorderData(show: false),
                barGroups: barGroups.isEmpty
                    ? [
                        BarChartGroupData(x: 0, barRods: [BarChartRodData(toY: 0)])
                      ]
                    : barGroups,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
