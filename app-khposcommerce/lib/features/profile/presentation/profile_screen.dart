import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/enterprise_app_bar.dart';
import '../../../core/widgets/enterprise_drawer.dart';
import '../../../core/security/biometric_service.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _biometricsActive = true;
  final BiometricService _biometricService = BiometricService();

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
      appBar: const EnterpriseAppBar(title: 'User Profile & Settings'),
      drawer: const EnterpriseDrawer(),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Top User Profile Hero Card (Instacart Inspired Layout)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: borderColor),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.04),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 36,
                    backgroundColor: AppColors.primary.withValues(alpha: 0.15),
                    child: const Icon(Icons.person, size: 40, color: AppColors.primary),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'John Doe',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: textColor,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'admin@enterprise-pos.com',
                          style: TextStyle(fontSize: 12, color: secondaryTextColor),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text(
                            'SUPER ADMIN ROLE',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Quick Action Buttons Row (Instacart Inspired Pills)
            Row(
              children: [
                Expanded(
                  child: _buildActionPill(
                    icon: Icons.receipt_long_rounded,
                    label: 'Sales Orders',
                    onTap: () => context.push('/sales'),
                    cardBg: cardBg,
                    borderColor: borderColor,
                    textColor: textColor,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildActionPill(
                    icon: Icons.storefront_rounded,
                    label: 'POS Register',
                    onTap: () => context.go('/pos'),
                    cardBg: cardBg,
                    borderColor: borderColor,
                    textColor: textColor,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildActionPill(
                    icon: Icons.security_rounded,
                    label: 'Security',
                    onTap: () {},
                    cardBg: cardBg,
                    borderColor: borderColor,
                    textColor: textColor,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Enterprise Scoping Card
            Container(
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
                    'Company & Scope Assignments',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: textColor),
                  ),
                  const SizedBox(height: 12),
                  _buildListTile(Icons.business_rounded, 'Company Name', 'Enterprise Global Group Ltd', textColor, secondaryTextColor),
                  Divider(color: borderColor.withValues(alpha: 0.5)),
                  _buildListTile(Icons.store_rounded, 'Assigned Branch', 'Phnom Penh HQ Store', textColor, secondaryTextColor),
                  Divider(color: borderColor.withValues(alpha: 0.5)),
                  _buildListTile(Icons.warehouse_rounded, 'Default Warehouse', 'Phnom Penh Main WH-01', textColor, secondaryTextColor),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Security & Authentication Settings Card
            Container(
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
                    'Security & Biometrics',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: textColor),
                  ),
                  const SizedBox(height: 12),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    secondary: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.fingerprint_rounded, color: AppColors.primary, size: 20),
                    ),
                    title: Text('Biometric Authentication', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: textColor)),
                    subtitle: Text('Require FaceID / Fingerprint to open POS terminal', style: TextStyle(fontSize: 11, color: secondaryTextColor)),
                    value: _biometricsActive,
                    activeThumbColor: AppColors.primary,
                    onChanged: (val) async {
                      if (val) {
                        final messenger = ScaffoldMessenger.of(context);
                        final canAuth = await _biometricService.isBiometricAvailable();
                        if (!canAuth) {
                          messenger.showSnackBar(
                            const SnackBar(content: Text('Biometrics hardware not available on this device.')),
                          );
                          return;
                        }
                      }
                      if (mounted) {
                        setState(() => _biometricsActive = val);
                      }
                    },
                  ),
                  Divider(color: borderColor.withValues(alpha: 0.5)),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.lock_outline_rounded, color: AppColors.primary, size: 20),
                    ),
                    title: Text('Change Password', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: textColor)),
                    trailing: Icon(Icons.arrow_forward_ios_rounded, size: 14, color: secondaryTextColor),
                    onTap: () {},
                  ),
                  Divider(color: borderColor.withValues(alpha: 0.5)),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.danger.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.logout_rounded, color: AppColors.danger, size: 20),
                    ),
                    title: const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.danger)),
                    onTap: () => context.go('/login'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionPill({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    required Color cardBg,
    required Color borderColor,
    required Color textColor,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: borderColor),
        ),
        child: Column(
          children: [
            Icon(icon, color: AppColors.primary, size: 22),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: textColor),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildListTile(IconData icon, String title, String value, Color textColor, Color secondaryTextColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primary, size: 18),
          const SizedBox(width: 10),
          Text(title, style: TextStyle(color: secondaryTextColor, fontSize: 12)),
          const Spacer(),
          Text(value, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: textColor)),
        ],
      ),
    );
  }
}
