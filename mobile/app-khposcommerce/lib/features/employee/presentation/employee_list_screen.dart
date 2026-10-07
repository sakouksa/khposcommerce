import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/enterprise_app_bar.dart';
import '../../../core/widgets/enterprise_drawer.dart';
import '../../../core/widgets/enterprise_card.dart';

class EmployeeListScreen extends StatelessWidget {
  const EmployeeListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final employees = [
      {'name': 'Super Admin', 'dept': 'Executive', 'position': 'Chief System Architect', 'status': 'ACTIVE', 'shift': '08:00 - 17:00'},
      {'name': 'Chan Dara', 'dept': 'Retail POS', 'position': 'Head Cashier', 'status': 'ACTIVE', 'shift': '08:00 - 17:00'},
      {'name': 'Keo Moni', 'dept': 'Warehouse', 'position': 'Inventory Supervisor', 'status': 'ON LEAVE', 'shift': '09:00 - 18:00'},
    ];

    return Scaffold(
      appBar: const EnterpriseAppBar(title: 'Employee Staff Directory'),
      drawer: const EnterpriseDrawer(),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: employees.length,
        itemBuilder: (context, index) {
          final e = employees[index];
          final isActive = e['status'] == 'ACTIVE';

          return EnterpriseCard(
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                  child: Text((e['name'] as String)[0], style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(e['name']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      Text('${e['position']} • ${e['dept']}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: isActive ? AppColors.success.withValues(alpha: 0.15) : AppColors.warning.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    e['status']!,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: isActive ? AppColors.success : AppColors.warning,
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
