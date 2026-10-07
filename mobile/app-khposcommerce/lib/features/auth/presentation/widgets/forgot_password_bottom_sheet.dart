import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/localization/app_localization.dart';

class ForgotPasswordBottomSheet extends ConsumerStatefulWidget {
  const ForgotPasswordBottomSheet({super.key});

  @override
  ConsumerState<ForgotPasswordBottomSheet> createState() => _ForgotPasswordBottomSheetState();
}

class _ForgotPasswordBottomSheetState extends ConsumerState<ForgotPasswordBottomSheet> {
  int _step = 1; // Step 1: Input username/phone, Step 2: OTP, Step 3: New Password
  final _inputController = TextEditingController();
  final _otpController = TextEditingController();
  final _newPasswordController = TextEditingController();
  bool _isLoading = false;

  void _nextStep() async {
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 800));
    setState(() {
      _isLoading = false;
      if (_step < 3) {
        _step += 1;
      } else {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(context.tr(ref, 'reset_success')),
            backgroundColor: AppColors.success,
          ),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final themeMode = ref.watch(themeModeProvider);
    final isDark = themeMode == ThemeMode.dark ||
        (themeMode == ThemeMode.system && MediaQuery.of(context).platformBrightness == Brightness.dark);

    final bg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final secondaryTextColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    return Container(
      decoration: BoxDecoration(
        color: bg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
        left: 24,
        right: 24,
        top: 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                context.tr(ref, 'forgot_password_sheet_title'),
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textColor),
              ),
              IconButton(
                icon: Icon(Icons.close, color: secondaryTextColor),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 16),

          if (_step == 1) ...[
            Text(context.tr(ref, 'phone_or_username'), style: TextStyle(color: secondaryTextColor, fontSize: 13)),
            const SizedBox(height: 12),
            TextField(
              controller: _inputController,
              style: TextStyle(color: textColor),
              decoration: InputDecoration(
                hintText: context.tr(ref, 'enter_username'),
                prefixIcon: Icon(Icons.person_outline, color: secondaryTextColor),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _nextStep,
                child: _isLoading ? const CircularProgressIndicator(color: Colors.white) : Text(context.tr(ref, 'send_otp')),
              ),
            ),
          ] else if (_step == 2) ...[
            Text(context.tr(ref, 'enter_otp'), style: TextStyle(color: secondaryTextColor, fontSize: 13)),
            const SizedBox(height: 12),
            TextField(
              controller: _otpController,
              keyboardType: TextInputType.number,
              maxLength: 6,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 24, letterSpacing: 8, fontWeight: FontWeight.bold, color: textColor),
              decoration: const InputDecoration(hintText: '• • • • • •'),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _nextStep,
                child: _isLoading ? const CircularProgressIndicator(color: Colors.white) : const Text('VERIFY OTP'),
              ),
            ),
          ] else ...[
            Text(context.tr(ref, 'new_password'), style: TextStyle(color: secondaryTextColor, fontSize: 13)),
            const SizedBox(height: 12),
            TextField(
              controller: _newPasswordController,
              obscureText: true,
              style: TextStyle(color: textColor),
              decoration: InputDecoration(
                hintText: context.tr(ref, 'new_password'),
                prefixIcon: Icon(Icons.lock_outline, color: secondaryTextColor),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _nextStep,
                child: _isLoading ? const CircularProgressIndicator(color: Colors.white) : const Text('RESET PASSWORD'),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
