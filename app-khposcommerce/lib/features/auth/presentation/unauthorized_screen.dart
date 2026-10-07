import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';

class UnauthorizedScreen extends StatelessWidget {
  const UnauthorizedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.lock_outline, size: 80, color: AppColors.danger),
              const SizedBox(height: 24),
              const Text('Access Denied', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              const Text('You do not have permission to view this module. Contact your system administrator.',
                  textAlign: TextAlign.center, style: TextStyle(color: AppColors.textSecondaryLight)),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => context.go('/home'),
                child: const Text('RETURN TO DASHBOARD'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
