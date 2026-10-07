import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

class PasswordStrengthIndicator extends StatelessWidget {
  final String password;
  final bool isDark;

  const PasswordStrengthIndicator({
    super.key,
    required this.password,
    this.isDark = false,
  });

  int _calculateStrength() {
    if (password.isEmpty) return 0;
    int score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (RegExp(r'[A-Z]').hasMatch(password)) score++;
    if (RegExp(r'[0-9!@#\$%^&*(),.?":{}|<>]').hasMatch(password)) score++;
    return score;
  }

  Color _getStrengthColor(int strength) {
    switch (strength) {
      case 1:
        return AppColors.danger;
      case 2:
        return AppColors.warning;
      case 3:
        return AppColors.accent;
      case 4:
        return AppColors.success;
      default:
        return Colors.transparent;
    }
  }

  String _getStrengthLabel(int strength) {
    switch (strength) {
      case 1:
        return 'Weak Password';
      case 2:
        return 'Fair';
      case 3:
        return 'Good Security';
      case 4:
        return 'Enterprise Strong';
      default:
        return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    if (password.isEmpty) return const SizedBox.shrink();

    final strength = _calculateStrength();
    final activeColor = _getStrengthColor(strength);
    final label = _getStrengthLabel(strength);
    final inactiveColor = isDark ? Colors.white.withValues(alpha: 0.12) : Colors.black.withValues(alpha: 0.08);

    return Padding(
      padding: const EdgeInsets.only(top: 8, bottom: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              ...List.generate(4, (index) {
                final isSegmentActive = index < strength;
                return Expanded(
                  child: Container(
                    height: 4,
                    margin: EdgeInsets.only(right: index == 3 ? 0 : 6),
                    decoration: BoxDecoration(
                      color: isSegmentActive ? activeColor : inactiveColor,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                );
              }),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Security Level',
                style: TextStyle(
                  fontSize: 11,
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                ),
              ),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: activeColor,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
