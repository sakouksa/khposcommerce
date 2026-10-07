import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';

class NetworkErrorScreen extends StatelessWidget {
  const NetworkErrorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.wifi_off, size: 80, color: AppColors.warning),
              const SizedBox(height: 24),
              const Text('Network Disconnected', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              const Text('Cannot connect to Laravel API backend. Please check network connection or switch to Offline Mode.',
                  textAlign: TextAlign.center, style: TextStyle(color: AppColors.textSecondaryLight)),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () => context.go('/home'),
                icon: const Icon(Icons.refresh),
                label: const Text('RETRY CONNECTION'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
