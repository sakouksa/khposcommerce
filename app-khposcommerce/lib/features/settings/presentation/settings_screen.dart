import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/enterprise_app_bar.dart';
import '../../../core/widgets/enterprise_drawer.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _privacyMode = true;
  bool _appLock = false;

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
      appBar: const EnterpriseAppBar(title: 'App Settings'),
      drawer: const EnterpriseDrawer(),
      body: ListView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: borderColor),
            ),
            child: Column(
              children: [
                _buildSettingTile(
                  icon: Icons.contrast_rounded,
                  title: 'Theme',
                  subtitle: isDark ? 'Dark Mode' : 'Light Mode',
                  trailing: Icon(Icons.arrow_forward_ios_rounded, size: 14, color: secondaryTextColor),
                  textColor: textColor,
                  secondaryTextColor: secondaryTextColor,
                  onTap: () {
                    ref.read(themeModeProvider.notifier).state = isDark ? ThemeMode.light : ThemeMode.dark;
                  },
                ),
                Divider(color: borderColor.withValues(alpha: 0.5), height: 1),
                _buildSettingTile(
                  icon: Icons.text_fields_rounded,
                  title: 'Text Size',
                  subtitle: 'Normal',
                  trailing: Icon(Icons.arrow_forward_ios_rounded, size: 14, color: secondaryTextColor),
                  textColor: textColor,
                  secondaryTextColor: secondaryTextColor,
                  onTap: () {},
                ),
                Divider(color: borderColor.withValues(alpha: 0.5), height: 1),
                _buildSettingTile(
                  icon: Icons.translate_rounded,
                  title: 'Choose Language',
                  subtitle: 'English (US)',
                  trailing: Icon(Icons.arrow_forward_ios_rounded, size: 14, color: secondaryTextColor),
                  textColor: textColor,
                  secondaryTextColor: secondaryTextColor,
                  onTap: () {},
                ),
                Divider(color: borderColor.withValues(alpha: 0.5), height: 1),
                _buildSettingTile(
                  icon: Icons.monetization_on_outlined,
                  title: 'Currency Settings',
                  subtitle: 'USD (\$)',
                  trailing: Icon(Icons.arrow_forward_ios_rounded, size: 14, color: secondaryTextColor),
                  textColor: textColor,
                  secondaryTextColor: secondaryTextColor,
                  onTap: () {},
                ),
                Divider(color: borderColor.withValues(alpha: 0.5), height: 1),
                _buildSettingTile(
                  icon: Icons.date_range_rounded,
                  title: 'Date Format',
                  subtitle: '26 Feb 2026',
                  trailing: Icon(Icons.arrow_forward_ios_rounded, size: 14, color: secondaryTextColor),
                  textColor: textColor,
                  secondaryTextColor: secondaryTextColor,
                  onTap: () {},
                ),
                Divider(color: borderColor.withValues(alpha: 0.5), height: 1),
                _buildSettingTile(
                  icon: Icons.access_time_rounded,
                  title: 'Time Format',
                  subtitle: '4:20 PM',
                  trailing: Icon(Icons.arrow_forward_ios_rounded, size: 14, color: secondaryTextColor),
                  textColor: textColor,
                  secondaryTextColor: secondaryTextColor,
                  onTap: () {},
                ),
                Divider(color: borderColor.withValues(alpha: 0.5), height: 1),
                SwitchListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                  secondary: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), shape: BoxShape.circle),
                    child: const Icon(Icons.visibility_off_outlined, color: AppColors.primary, size: 20),
                  ),
                  title: Text('Privacy Mode', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: textColor)),
                  value: _privacyMode,
                  activeThumbColor: AppColors.primary,
                  onChanged: (val) => setState(() => _privacyMode = val),
                ),
                Divider(color: borderColor.withValues(alpha: 0.5), height: 1),
                SwitchListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                  secondary: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), shape: BoxShape.circle),
                    child: const Icon(Icons.lock_outline_rounded, color: AppColors.primary, size: 20),
                  ),
                  title: Text('App Lock (Biometrics & PIN)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: textColor)),
                  value: _appLock,
                  activeThumbColor: AppColors.primary,
                  onChanged: (val) => setState(() => _appLock = val),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required Widget trailing,
    required Color textColor,
    required Color secondaryTextColor,
    required VoidCallback onTap,
  }) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: 0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: AppColors.primary, size: 20),
      ),
      title: Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: textColor)),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(subtitle, style: TextStyle(fontSize: 12, color: secondaryTextColor)),
          const SizedBox(width: 6),
          trailing,
        ],
      ),
      onTap: onTap,
    );
  }
}
