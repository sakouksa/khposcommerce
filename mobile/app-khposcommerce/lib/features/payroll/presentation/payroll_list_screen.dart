import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/enterprise_app_bar.dart';
import '../../../core/widgets/enterprise_drawer.dart';
import '../../../core/widgets/enterprise_card.dart';

class PayrollListScreen extends StatelessWidget {
  const PayrollListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final payrolls = [
      {'period': 'July 2026', 'staff': '35 Employees', 'total_salary': '\$48,500.00', 'status': 'PAID'},
      {'period': 'June 2026', 'staff': '35 Employees', 'total_salary': '\$47,800.00', 'status': 'PAID'},
      {'period': 'August 2026 (Draft)', 'staff': '36 Employees', 'total_salary': '\$49,200.00', 'status': 'DRAFT'},
    ];

    return Scaffold(
      appBar: const EnterpriseAppBar(title: 'Payroll & Payslips'),
      drawer: const EnterpriseDrawer(),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: payrolls.length,
        itemBuilder: (context, index) {
          final p = payrolls[index];
          final isPaid = p['status'] == 'PAID';

          return EnterpriseCard(
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: AppColors.success.withValues(alpha: 0.1),
                  child: const Icon(Icons.request_quote, color: AppColors.success),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(p['period']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      Text(p['staff']!, style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(p['total_salary']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.primary)),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: isPaid ? AppColors.success.withValues(alpha: 0.15) : AppColors.warning.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        p['status']!,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: isPaid ? AppColors.success : AppColors.warning,
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
        icon: const Icon(Icons.note_add, color: Colors.white),
        label: const Text('GENERATE PAYSLIPS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
