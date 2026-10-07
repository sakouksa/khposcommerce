import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';

class HomeRecentSalesTable extends StatelessWidget {
  final bool isDark;

  const HomeRecentSalesTable({
    super.key,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final secondaryTextColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final cardBg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;

    final List<Map<String, dynamic>> sales = [
      {'inv': 'INV-2026-1042', 'customer': 'Walk-in Customer', 'items': '3 Items', 'method': 'Cash', 'total': 320.50, 'status': 'COMPLETED', 'time': '08:24 AM'},
      {'inv': 'INV-2026-1041', 'customer': 'Vannak Trading Ltd', 'items': '12 Items', 'method': 'Bakong KHQR', 'total': 1850.00, 'status': 'COMPLETED', 'time': '08:18 AM'},
      {'inv': 'INV-2026-1040', 'customer': 'Srey Leak', 'items': '1 Item', 'method': 'Credit Card', 'total': 45.00, 'status': 'COMPLETED', 'time': '08:10 AM'},
      {'inv': 'INV-2026-1039', 'customer': 'Borey Real Estate', 'items': '5 Items', 'method': 'Bank Transfer', 'total': 920.00, 'status': 'COMPLETED', 'time': '07:55 AM'},
    ];

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Recent Sales & POS Transactions',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: textColor,
                ),
              ),
              TextButton(
                onPressed: () => context.push('/sales'),
                child: const Text('View All', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),

          const SizedBox(height: 10),

          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: sales.length,
            separatorBuilder: (context, index) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final sale = sales[index];
              final total = (sale['total'] as double).toStringAsFixed(2);

              return InkWell(
                onTap: () => _showSaleDetails(context, sale, isDark),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white.withValues(alpha: 0.03) : AppColors.lightInputFill,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: borderColor.withValues(alpha: 0.5)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.receipt_rounded, color: AppColors.primary, size: 18),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              sale['inv'] as String,
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: textColor),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${sale['customer']} • ${sale['method']}',
                              style: TextStyle(fontSize: 11, color: secondaryTextColor),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '\$$total',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.success),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            sale['time'] as String,
                            style: TextStyle(fontSize: 10, color: secondaryTextColor),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  void _showSaleDetails(BuildContext context, Map<String, dynamic> sale, bool isDark) {
    final bg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;

    showModalBottomSheet(
      context: context,
      backgroundColor: bg,
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
              Text('Invoice ${sale['inv']}', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textColor)),
              const SizedBox(height: 12),
              Text('Customer: ${sale['customer']}', style: TextStyle(color: textColor)),
              Text('Payment Method: ${sale['method']}', style: TextStyle(color: textColor)),
              Text('Total Paid: \$${(sale['total'] as double).toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.success)),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Close'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
