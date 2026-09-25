import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

enum LoginStateType {
  wrongCredentials,
  userDisabled,
  accountLocked,
  passwordExpired,
  tooManyAttempts,
  unauthorized,
  serverMaintenance,
  offlineMode,
  sessionExpired,
}

class LoginStateDialog extends StatelessWidget {
  final LoginStateType stateType;
  final String title;
  final String message;
  final VoidCallback onPrimaryAction;
  final String primaryButtonText;
  final VoidCallback? onSecondaryAction;
  final String? secondaryButtonText;
  final bool isDark;

  const LoginStateDialog({
    super.key,
    required this.stateType,
    required this.title,
    required this.message,
    required this.onPrimaryAction,
    this.primaryButtonText = 'Understand & Retry',
    this.onSecondaryAction,
    this.secondaryButtonText,
    this.isDark = false,
  });

  IconData get _stateIcon {
    switch (stateType) {
      case LoginStateType.wrongCredentials:
        return Icons.lock_person_rounded;
      case LoginStateType.userDisabled:
        return Icons.block_rounded;
      case LoginStateType.accountLocked:
        return Icons.no_accounts_rounded;
      case LoginStateType.passwordExpired:
        return Icons.history_toggle_off_rounded;
      case LoginStateType.tooManyAttempts:
        return Icons.timer_rounded;
      case LoginStateType.unauthorized:
        return Icons.gpp_bad_rounded;
      case LoginStateType.serverMaintenance:
        return Icons.build_rounded;
      case LoginStateType.offlineMode:
        return Icons.wifi_off_rounded;
      case LoginStateType.sessionExpired:
        return Icons.access_time_filled_rounded;
    }
  }

  Color get _stateColor {
    switch (stateType) {
      case LoginStateType.wrongCredentials:
      case LoginStateType.userDisabled:
      case LoginStateType.accountLocked:
      case LoginStateType.unauthorized:
        return AppColors.danger;
      case LoginStateType.passwordExpired:
      case LoginStateType.tooManyAttempts:
      case LoginStateType.serverMaintenance:
      case LoginStateType.sessionExpired:
        return AppColors.warning;
      case LoginStateType.offlineMode:
        return AppColors.info;
    }
  }

  @override
  Widget build(BuildContext context) {
    final dialogBg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final subtitleColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final iconColor = _stateColor;

    return Dialog(
      backgroundColor: dialogBg,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(28),
        side: BorderSide(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      elevation: 20,
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icon Badge
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Icon(_stateIcon, size: 32, color: iconColor),
              ),
            ),
            const SizedBox(height: 20),

            // Title
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: textColor,
              ),
            ),
            const SizedBox(height: 10),

            // Message Body
            Text(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: subtitleColor,
                height: 1.45,
              ),
            ),
            const SizedBox(height: 24),

            // Buttons Row
            Row(
              children: [
                if (onSecondaryAction != null && secondaryButtonText != null) ...[
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        side: BorderSide(
                          color: isDark ? AppColors.borderDark : AppColors.borderLight,
                        ),
                      ),
                      onPressed: () {
                        Navigator.pop(context);
                        onSecondaryAction!();
                      },
                      child: Text(
                        secondaryButtonText!,
                        style: TextStyle(color: textColor, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                ],
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: iconColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 2,
                    ),
                    onPressed: () {
                      Navigator.pop(context);
                      onPrimaryAction();
                    },
                    child: Text(
                      primaryButtonText,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
