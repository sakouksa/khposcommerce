import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class SkeletonLoaderWidget extends StatelessWidget {
  final double height;
  final double width;
  final double borderRadius;

  const SkeletonLoaderWidget({
    super.key,
    this.height = 20,
    this.width = double.infinity,
    this.borderRadius = 12,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      height: height,
      width: width,
      decoration: BoxDecoration(
        color: isDark ? AppColors.borderDark.withValues(alpha: 0.5) : AppColors.borderLight,
        borderRadius: BorderRadius.circular(borderRadius),
      ),
    );
  }
}

class EmptyStateWidget extends StatelessWidget {
  final String title;
  final String message;
  final IconData icon;
  final VoidCallback? onAction;
  final String? actionLabel;

  const EmptyStateWidget({
    super.key,
    this.title = 'No Records Found',
    this.message = 'There is no data available to display right now.',
    this.icon = Icons.inbox_outlined,
    this.onAction,
    this.actionLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 48, color: AppColors.primary),
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            if (onAction != null && actionLabel != null) ...[
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: onAction,
                icon: const Icon(Icons.add),
                label: Text(actionLabel!),
              ),
            ]
          ],
        ),
      ),
    );
  }
}

class ErrorStateWidget extends StatelessWidget {
  final String errorMessage;
  final VoidCallback onRetry;

  const ErrorStateWidget({
    super.key,
    required this.errorMessage,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.danger.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.error_outline, size: 48, color: AppColors.danger),
            ),
            const SizedBox(height: 24),
            const Text(
              'Connection Error',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.danger),
            ),
            const SizedBox(height: 8),
            Text(
              errorMessage,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Try Again'),
            ),
          ],
        ),
      ),
    );
  }
}

class OfflineStatusBar extends StatelessWidget {
  final int pendingCount;
  final VoidCallback onSyncNow;

  const OfflineStatusBar({
    super.key,
    required this.pendingCount,
    required this.onSyncNow,
  });

  @override
  Widget build(BuildContext context) {
    if (pendingCount == 0) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: AppColors.warning,
      child: Row(
        children: [
          const Icon(Icons.wifi_off, color: Colors.black, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Offline: $pendingCount transactions pending sync',
              style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13),
            ),
          ),
          TextButton(
            onPressed: onSyncNow,
            child: const Text('SYNC NOW', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
