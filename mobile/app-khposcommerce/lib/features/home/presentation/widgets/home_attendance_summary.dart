import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';

class HomeAttendanceSummary extends StatelessWidget {
  final bool isDark;

  const HomeAttendanceSummary({
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'HR & Staff Attendance Summary',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: textColor,
                ),
              ),
              TextButton(
                onPressed: () => context.push('/attendance'),
                child: const Text('Manage HR', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),

          const SizedBox(height: 12),

          Row(
            children: [
              Expanded(
                child: _buildAttendanceCard(
                  label: 'Present',
                  count: '32 Staff',
                  color: AppColors.success,
                  isDark: isDark,
                  borderColor: borderColor,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildAttendanceCard(
                  label: 'Late',
                  count: '2 Staff',
                  color: AppColors.warning,
                  isDark: isDark,
                  borderColor: borderColor,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildAttendanceCard(
                  label: 'Absent',
                  count: '1 Staff',
                  color: AppColors.danger,
                  isDark: isDark,
                  borderColor: borderColor,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAttendanceCard({
    required String label,
    required String count,
    required Color color,
    required bool isDark,
    required Color borderColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        children: [
          Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color)),
          const SizedBox(height: 4),
          Text(count, style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight)),
        ],
      ),
    );
  }
}
