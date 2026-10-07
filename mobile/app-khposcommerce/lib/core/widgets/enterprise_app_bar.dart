import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../theme/app_colors.dart';

class EnterpriseAppBar extends ConsumerWidget implements PreferredSizeWidget {
  final String title;
  final bool showCompanyPill;
  final List<Widget>? actions;

  const EnterpriseAppBar({
    super.key,
    required this.title,
    this.showCompanyPill = true,
    this.actions,
  });

  @override
  Size get preferredSize => const Size.fromHeight(60);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return AppBar(
      title: Row(
        children: [
          Expanded(
            child: Text(
              title,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
          ),
          if (showCompanyPill)
            GestureDetector(
              onTap: () {
                // Show Branch / Warehouse selector sheet
                _showBranchSelector(context);
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.storefront, size: 14, color: AppColors.primary),
                    SizedBox(width: 4),
                    Text(
                      'Main Branch',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                    Icon(Icons.arrow_drop_down, size: 16, color: AppColors.primary),
                  ],
                ),
              ),
            ),
        ],
      ),
      actions: actions ??
          [
            IconButton(
              icon: const Icon(Icons.notifications_outlined),
              onPressed: () => context.push('/notifications'),
            ),
            const SizedBox(width: 8),
          ],
    );
  }

  void _showBranchSelector(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Switch Active Branch', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(Icons.business, color: AppColors.primary),
                title: const Text('Phnom Penh Headquarter'),
                subtitle: const Text('Main Warehouse & POS'),
                trailing: const Icon(Icons.check_circle, color: AppColors.success),
                onTap: () => Navigator.pop(context),
              ),
              ListTile(
                leading: const Icon(Icons.store, color: AppColors.textSecondaryLight),
                title: const Text('Siem Reap Branch Store'),
                subtitle: const Text('Retail Store #2'),
                onTap: () => Navigator.pop(context),
              ),
            ],
          ),
        );
      },
    );
  }
}
