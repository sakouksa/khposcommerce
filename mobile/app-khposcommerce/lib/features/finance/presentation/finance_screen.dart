import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/enterprise_app_bar.dart';
import '../../../core/widgets/enterprise_drawer.dart';
import '../../../core/widgets/enterprise_card.dart';

class FinanceScreen extends StatefulWidget {
  const FinanceScreen({super.key});

  @override
  State<FinanceScreen> createState() => _FinanceScreenState();
}

class _FinanceScreenState extends State<FinanceScreen> {
  bool _isRegisterOpen = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const EnterpriseAppBar(title: 'Finance & Cash Register'),
      drawer: const EnterpriseDrawer(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Cash Register Session Card
            EnterpriseCard(
              backgroundColor: _isRegisterOpen ? AppColors.primary.withValues(alpha: 0.06) : AppColors.danger.withValues(alpha: 0.06),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: _isRegisterOpen ? AppColors.primary : AppColors.danger,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.point_of_sale, color: Colors.white),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Active Cash Register Session', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            Text(_isRegisterOpen ? 'Opened at 08:00 AM • Opening Float: \$200.00' : 'Register Session Closed',
                                style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                          ],
                        ),
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _isRegisterOpen ? AppColors.danger : AppColors.success,
                        ),
                        onPressed: () {
                          setState(() => _isRegisterOpen = !_isRegisterOpen);
                        },
                        child: Text(_isRegisterOpen ? 'CLOSE REGISTER' : 'OPEN REGISTER'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Financial Summary Metrics
            const Text('Profit & Loss Summary', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: EnterpriseCard(
                    padding: const EdgeInsets.all(16),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Total Income', style: TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                        SizedBox(height: 4),
                        Text('\$128,450.00', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.success)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: EnterpriseCard(
                    padding: const EdgeInsets.all(16),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Total Expenses', style: TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                        SizedBox(height: 4),
                        Text('\$34,200.00', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.danger)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Expense Logs
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Recent Operating Expenses', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                TextButton(
                  onPressed: () {},
                  child: const Text('+ Add Expense'),
                ),
              ],
            ),
            const SizedBox(height: 8),
            _buildExpenseTile('Electricity & Utilities', 'HQ Branch • Electricity Bill', '\$850.00', 'Jul 22'),
            _buildExpenseTile('Office Supplies', 'Paper rolls for receipt printers', '\$120.00', 'Jul 21'),
            _buildExpenseTile('Store Logistics', 'Delivery truck fuel & maintenance', '\$450.00', 'Jul 19'),
          ],
        ),
      ),
    );
  }

  Widget _buildExpenseTile(String title, String desc, String amount, String date) {
    return EnterpriseCard(
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          const Icon(Icons.money_off, color: AppColors.danger),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
                Text('$desc • $date', style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
              ],
            ),
          ),
          Text(amount, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.danger)),
        ],
      ),
    );
  }
}
