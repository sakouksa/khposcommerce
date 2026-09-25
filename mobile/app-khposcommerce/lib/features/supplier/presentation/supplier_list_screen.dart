import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/enterprise_app_bar.dart';
import '../../../core/widgets/enterprise_drawer.dart';
import '../../../core/widgets/enterprise_card.dart';

class SupplierListScreen extends StatelessWidget {
  const SupplierListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final suppliers = [
      {'company': 'Apple Distribution Asia', 'contact': 'Chen Wei', 'phone': '+852 9876 5432', 'balance': '\$12,400.00'},
      {'company': 'Samsung Global Electronics', 'contact': 'Park Ji-sung', 'phone': '+82 2 3456 7890', 'balance': '\$0.00'},
      {'company': 'Dell Technologies SEA', 'contact': 'Alex Tan', 'phone': '+65 6789 0123', 'balance': '\$5,800.00'},
    ];

    return Scaffold(
      appBar: const EnterpriseAppBar(title: 'Suppliers Directory'),
      drawer: const EnterpriseDrawer(),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: suppliers.length,
        itemBuilder: (context, index) {
          final s = suppliers[index];
          final hasBalance = s['balance'] != '\$0.00';

          return EnterpriseCard(
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: AppColors.accent.withValues(alpha: 0.1),
                  child: const Icon(Icons.business, color: AppColors.accent),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(s['company']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      Text('Contact: ${s['contact']} • ${s['phone']}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(s['balance']!, style: TextStyle(fontWeight: FontWeight.bold, color: hasBalance ? AppColors.danger : AppColors.success)),
                    const Text('Outstanding', style: TextStyle(fontSize: 10, color: AppColors.textSecondaryLight)),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
