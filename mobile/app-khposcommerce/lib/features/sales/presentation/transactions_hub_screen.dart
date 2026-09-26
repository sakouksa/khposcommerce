import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/enterprise_app_bar.dart';
import '../../../core/widgets/enterprise_drawer.dart';

class TransactionsHubScreen extends ConsumerStatefulWidget {
  const TransactionsHubScreen({super.key});

  @override
  ConsumerState<TransactionsHubScreen> createState() => _TransactionsHubScreenState();
}

class _TransactionsHubScreenState extends ConsumerState<TransactionsHubScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  bool _isDarkMode(BuildContext context) {
    final themeMode = ref.watch(themeModeProvider);
    if (themeMode == ThemeMode.dark) return true;
    if (themeMode == ThemeMode.light) return false;
    return MediaQuery.of(context).platformBrightness == Brightness.dark;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = _isDarkMode(context);
    final bgColor = isDark ? AppColors.backgroundDark : AppColors.backgroundLight;
    final cardBg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final secondaryTextColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: const EnterpriseAppBar(title: 'Transactions'),
      drawer: const EnterpriseDrawer(),
      body: Stack(
        children: [
          SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Search & Filter Bar
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        style: TextStyle(color: textColor),
                        decoration: InputDecoration(
                          hintText: 'Search dishes, invoices, SKU...',
                          hintStyle: TextStyle(color: secondaryTextColor),
                          prefixIcon: const Icon(Icons.search, color: AppColors.primary),
                          suffixIcon: const Icon(Icons.qr_code_scanner_rounded, color: AppColors.primary),
                          filled: true,
                          fillColor: isDark ? Colors.white.withValues(alpha: 0.05) : AppColors.lightInputFill,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide(color: borderColor),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Date Filter Pill
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: borderColor),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.calendar_today_rounded, size: 14, color: AppColors.primary),
                          const SizedBox(width: 8),
                          Text('All Time', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: textColor)),
                          const SizedBox(width: 8),
                          Text('Change ▾', style: TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // 1. Sales Transactions Section
                Text('Sales Transactions', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: textColor)),
                const SizedBox(height: 12),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 4,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 0.95,
                  children: [
                    _buildActionCard(
                      icon: Icons.sell_outlined,
                      label: 'Sale',
                      color: AppColors.primary,
                      onTap: () => context.push('/pos'),
                      cardBg: cardBg,
                      borderColor: borderColor,
                      textColor: textColor,
                    ),
                    _buildActionCard(
                      icon: Icons.payments_outlined,
                      label: 'Payment In',
                      color: AppColors.success,
                      onTap: () {},
                      cardBg: cardBg,
                      borderColor: borderColor,
                      textColor: textColor,
                    ),
                    _buildActionCard(
                      icon: Icons.assignment_return_outlined,
                      label: 'Sale Return',
                      color: AppColors.danger,
                      onTap: () => context.push('/sales'),
                      cardBg: cardBg,
                      borderColor: borderColor,
                      textColor: textColor,
                    ),
                    _buildActionCard(
                      icon: Icons.description_outlined,
                      label: 'Quotation',
                      color: AppColors.accent,
                      onTap: () {},
                      cardBg: cardBg,
                      borderColor: borderColor,
                      textColor: textColor,
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // 2. Purchase Transactions Section
                Text('Purchase Transactions', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: textColor)),
                const SizedBox(height: 12),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 4,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 0.95,
                  children: [
                    _buildActionCard(
                      icon: Icons.shopping_cart_outlined,
                      label: 'Purchase',
                      color: AppColors.primary,
                      onTap: () => context.push('/purchases'),
                      cardBg: cardBg,
                      borderColor: borderColor,
                      textColor: textColor,
                    ),
                    _buildActionCard(
                      icon: Icons.price_check_outlined,
                      label: 'Payment-Out',
                      color: AppColors.warning,
                      onTap: () {},
                      cardBg: cardBg,
                      borderColor: borderColor,
                      textColor: textColor,
                    ),
                    _buildActionCard(
                      icon: Icons.request_quote_outlined,
                      label: 'Debit Note',
                      color: AppColors.accent,
                      onTap: () {},
                      cardBg: cardBg,
                      borderColor: borderColor,
                      textColor: textColor,
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // 3. Other Transactions Section
                Text('Other Transactions', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: textColor)),
                const SizedBox(height: 12),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 4,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 0.95,
                  children: [
                    _buildActionCard(
                      icon: Icons.account_balance_wallet_outlined,
                      label: 'Expenses',
                      color: AppColors.danger,
                      onTap: () => context.push('/finance'),
                      cardBg: cardBg,
                      borderColor: borderColor,
                      textColor: textColor,
                    ),
                    _buildActionCard(
                      icon: Icons.swap_horiz_rounded,
                      label: 'Stock Transfer',
                      color: AppColors.primary,
                      onTap: () => context.go('/inventory'),
                      cardBg: cardBg,
                      borderColor: borderColor,
                      textColor: textColor,
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // Transaction History List
                Text('Recent Transactions', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: textColor)),
                const SizedBox(height: 12),

                _buildTransactionItem('Sale #1', 'Cash Sale', '04 Feb 2026 • 1:42PM', '\$45.00', 'Paid', cardBg, borderColor, textColor, secondaryTextColor),
                _buildTransactionItem('Sale #2', 'KHQR Bakong', '04 Feb 2026 • 2:15PM', '\$129.00', 'Paid', cardBg, borderColor, textColor, secondaryTextColor),
                _buildTransactionItem('Purchase #18', 'Siem Reap WH', '04 Feb 2026 • 3:30PM', '\$850.00', 'Pending', cardBg, borderColor, textColor, secondaryTextColor),
              ],
            ),
          ),

          // Floating Bottom Action Launcher Bar (Exact layout matching the screenshot)
          Positioned(
            left: 20,
            right: 20,
            bottom: 20,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A), // Enterprise Dark Slate
                borderRadius: BorderRadius.circular(30),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.3),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1E293B),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                      onPressed: () {},
                      icon: const Icon(Icons.payment_rounded, size: 18),
                      label: const Text('Payment In', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Container(
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.add, color: Colors.white),
                      onPressed: () => context.push('/pos'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                      onPressed: () => context.push('/pos'),
                      icon: const Icon(Icons.shopping_bag_outlined, size: 18),
                      label: const Text('New Sale', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionCard({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
    required Color cardBg,
    required Color borderColor,
    required Color textColor,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: borderColor),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(height: 6),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: textColor),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTransactionItem(
    String id,
    String title,
    String date,
    String amount,
    String status,
    Color cardBg,
    Color borderColor,
    Color textColor,
    Color secondaryTextColor,
  ) {
    final isPaid = status == 'Paid';

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(id, style: const TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.bold)),
                Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: textColor)),
                Text(date, style: TextStyle(fontSize: 11, color: secondaryTextColor)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(amount, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: textColor)),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: isPaid ? AppColors.success.withValues(alpha: 0.12) : AppColors.warning.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  status,
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isPaid ? AppColors.success : AppColors.warning),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
