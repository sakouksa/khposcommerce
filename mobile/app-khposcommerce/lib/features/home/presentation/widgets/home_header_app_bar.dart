import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_theme.dart';

class HomeHeaderAppBar extends ConsumerWidget implements PreferredSizeWidget {
  final VoidCallback onOpenSearch;

  const HomeHeaderAppBar({
    super.key,
    required this.onOpenSearch,
  });

  @override
  Size get preferredSize => const Size.fromHeight(64);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final isDark = themeMode == ThemeMode.dark ||
        (themeMode == ThemeMode.system && MediaQuery.of(context).platformBrightness == Brightness.dark);

    final bg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;

    return AppBar(
      backgroundColor: bg,
      elevation: 0,
      scrolledUnderElevation: 2,
      automaticallyImplyLeading: false,
      titleSpacing: 16,
      title: Row(
        children: [
          // Drawer Menu Toggle & Company Emblem
          Builder(
            builder: (context) {
              return InkWell(
                onTap: () => Scaffold.of(context).openDrawer(),
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Icon(Icons.menu_rounded, color: Colors.white, size: 20),
                  ),
                ),
              );
            },
          ),

          const SizedBox(width: 12),

          // Company & Active Branch Switcher Pill
          Expanded(
            child: GestureDetector(
              onTap: () => _showBranchSelector(context, isDark),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: isDark ? Colors.white.withValues(alpha: 0.06) : AppColors.lightInputFill,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: borderColor),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: AppColors.success,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Flexible(
                      child: Text(
                        'Phnom Penh HQ Store',
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: textColor,
                        ),
                      ),
                    ),
                    Icon(Icons.keyboard_arrow_down, size: 16, color: textColor.withValues(alpha: 0.6)),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      actions: [
        // Global Search Action Button
        IconButton(
          icon: Icon(Icons.search_rounded, color: textColor, size: 22),
          onPressed: onOpenSearch,
          tooltip: 'Search System',
        ),

        // Notifications Live Counter Badge
        Stack(
          alignment: Alignment.center,
          children: [
            IconButton(
              icon: Icon(Icons.notifications_outlined, color: textColor, size: 22),
              onPressed: () => context.push('/notifications'),
              tooltip: 'Notifications',
            ),
            Positioned(
              top: 10,
              right: 10,
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: const BoxDecoration(
                  color: AppColors.danger,
                  shape: BoxShape.circle,
                ),
                child: const Text(
                  '3',
                  style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),

        // POS Quick Terminal Button
        IconButton(
          icon: const Icon(Icons.point_of_sale_rounded, color: AppColors.primary, size: 22),
          onPressed: () => context.go('/pos'),
          tooltip: 'POS Terminal',
        ),

        // Profile Avatar
        Padding(
          padding: const EdgeInsets.only(right: 16, left: 4),
          child: GestureDetector(
            onTap: () => context.push('/profile'),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: AppColors.primary.withValues(alpha: 0.15),
              child: const Icon(Icons.person, color: AppColors.primary, size: 18),
            ),
          ),
        ),
      ],
    );
  }

  void _showBranchSelector(BuildContext context, bool isDark) {
    final bg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final subtitleColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    showModalBottomSheet(
      context: context,
      backgroundColor: bg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Active Enterprise Branch',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textColor),
                  ),
                  IconButton(
                    icon: Icon(Icons.close, color: subtitleColor),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.business, color: AppColors.primary),
                ),
                title: Text('Phnom Penh HQ Store', style: TextStyle(fontWeight: FontWeight.bold, color: textColor)),
                subtitle: Text('Main Warehouse & POS Terminal #1', style: TextStyle(fontSize: 12, color: subtitleColor)),
                trailing: const Icon(Icons.check_circle_rounded, color: AppColors.success),
                onTap: () => Navigator.pop(context),
              ),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: subtitleColor.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.storefront, color: subtitleColor),
                ),
                title: Text('Siem Reap Retail Branch', style: TextStyle(fontWeight: FontWeight.bold, color: textColor)),
                subtitle: Text('Store #2 • 12 Active POS Registers', style: TextStyle(fontSize: 12, color: subtitleColor)),
                onTap: () => Navigator.pop(context),
              ),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: subtitleColor.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.warehouse, color: subtitleColor),
                ),
                title: Text('Battambang Central Hub', style: TextStyle(fontWeight: FontWeight.bold, color: textColor)),
                subtitle: Text('Primary Logistics Warehouse', style: TextStyle(fontSize: 12, color: subtitleColor)),
                onTap: () => Navigator.pop(context),
              ),
            ],
          ),
        );
      },
    );
  }
}
