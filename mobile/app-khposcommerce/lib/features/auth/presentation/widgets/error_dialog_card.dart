import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

class ErrorDialogCard extends StatelessWidget {
  final String title;
  final String description;
  final IconData icon;
  final VoidCallback onRetry;

  const ErrorDialogCard({
    super.key,
    required this.title,
    required this.description,
    this.icon = Icons.error_outline,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.danger.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 48, color: AppColors.danger),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.danger),
            ),
            const SizedBox(height: 8),
            Text(
              description,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('DISMISS'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
                    onPressed: () {
                      Navigator.pop(context);
                      onRetry();
                    },
                    child: const Text('RETRY'),
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
