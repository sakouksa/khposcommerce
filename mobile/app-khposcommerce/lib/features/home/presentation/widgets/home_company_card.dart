import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';

class HomeCompanyCard extends StatelessWidget {
  final Map<String, dynamic> stats;
  final bool isDark;

  const HomeCompanyCard({
    super.key,
    required this.stats,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final revenue = (stats['todays_sales'] ?? 12845.50) as double;
    final profit = (stats['profit'] ?? 4120.00) as double;
    final orders = stats['orders_count'] ?? 142;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: isDark ? AppColors.heroDarkGradient : AppColors.heroGradient,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: isDark ? 0.4 : 0.25),
            blurRadius: 20,
            spreadRadius: 1,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row: Company Title & Store Live Status Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.storefront, color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 10),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Project-Enterprise-E-Commerce',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          letterSpacing: -0.3,
                        ),
                      ),
                      Text(
                        'HQ Branch • Warehouse #01 • Cash Register A',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ],
              ),

              // Store Online Status Pill
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.25),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.success.withValues(alpha: 0.5)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.wifi, color: Colors.white, size: 12),
                    SizedBox(width: 4),
                    Text(
                      'ONLINE',
                      style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Core Financial Metrics Row (Revenue, Orders, Profit)
          Row(
            children: [
              Expanded(
                child: _buildMetricItem(
                  label: "Today's Revenue",
                  value: '\$${revenue.toStringAsFixed(2)}',
                  subText: '+14.2% vs yesterday',
                  icon: Icons.account_balance_wallet_rounded,
                ),
              ),
              Container(width: 1, height: 40, color: Colors.white.withValues(alpha: 0.2)),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(left: 12),
                  child: _buildMetricItem(
                    label: "Today's Orders",
                    value: '$orders Orders',
                    subText: '18 Active POS Staff',
                    icon: Icons.shopping_bag_rounded,
                  ),
                ),
              ),
              Container(width: 1, height: 40, color: Colors.white.withValues(alpha: 0.2)),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(left: 12),
                  child: _buildMetricItem(
                    label: "Today's Profit",
                    value: '\$${profit.toStringAsFixed(2)}',
                    subText: 'Net Margin 32.1%',
                    icon: Icons.trending_up_rounded,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Action Row (Open POS Terminal & Catalog Search)
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppColors.primary,
                    elevation: 4,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: () => context.go('/pos'),
                  icon: const Icon(Icons.point_of_sale_rounded, size: 18),
                  label: const Text(
                    'LAUNCH POS TERMINAL',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.white,
                  side: BorderSide(color: Colors.white.withValues(alpha: 0.6)),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: () => context.push('/products'),
                icon: const Icon(Icons.inventory_2_outlined, size: 18),
                label: const Text('CATALOG', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricItem({
    required String label,
    required String value,
    required String subText,
    required IconData icon,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: Colors.white70, size: 13),
            const SizedBox(width: 4),
            Text(
              label,
              style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w500),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
            letterSpacing: -0.4,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          subText,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.75),
            fontSize: 10,
          ),
        ),
      ],
    );
  }
}
