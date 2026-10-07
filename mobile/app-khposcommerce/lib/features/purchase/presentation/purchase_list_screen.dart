import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/enterprise_app_bar.dart';
import '../../../core/widgets/enterprise_drawer.dart';
import '../../../core/widgets/enterprise_card.dart';

class PurchaseListScreen extends StatelessWidget {
  const PurchaseListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final purchases = [
      {'po_no': 'PO-2026-0891', 'supplier': 'Apple Distribution Asia', 'amount': '\$45,200.00', 'status': 'RECEIVED'},
      {'po_no': 'PO-2026-0892', 'supplier': 'Samsung Global Supply', 'amount': '\$28,500.00', 'status': 'PARTIAL RECEIVE'},
      {'po_no': 'PO-2026-0893', 'supplier': 'Dell Technologies Ltd', 'amount': '\$18,900.00', 'status': 'PENDING APPROVAL'},
    ];

    return Scaffold(
      appBar: const EnterpriseAppBar(title: 'Purchases & Orders'),
      drawer: const EnterpriseDrawer(),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: purchases.length,
        itemBuilder: (context, index) {
          final p = purchases[index];
          final isPending = p['status'] == 'PENDING APPROVAL';
          final isPartial = p['status'] == 'PARTIAL RECEIVE';

          return EnterpriseCard(
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: AppColors.accent.withValues(alpha: 0.1),
                  child: const Icon(Icons.local_shipping, color: AppColors.accent),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(p['po_no']!, style: const TextStyle(fontWeight: FontWeight.bold)),
                      Text('Supplier: ${p['supplier']}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(p['amount']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.primary)),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: isPending
                            ? AppColors.warning.withValues(alpha: 0.15)
                            : isPartial
                                ? AppColors.accent.withValues(alpha: 0.15)
                                : AppColors.success.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        p['status']!,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: isPending
                              ? AppColors.warning
                              : isPartial
                                  ? AppColors.accent
                                  : AppColors.success,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('CREATE PURCHASE ORDER', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
