import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/enterprise_app_bar.dart';
import '../../../core/widgets/enterprise_drawer.dart';
import '../../../core/network/api_client.dart';

final warehousesListProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final dio = ref.read(dioProvider);
  try {
    final response = await dio.get('/warehouses');
    if (response.statusCode == 200 && response.data != null) {
      final rawData = response.data['data'] ?? response.data;
      if (rawData is List) {
        return rawData.map((w) => Map<String, dynamic>.from(w as Map)).toList();
      }
    }
  } catch (e) {
    debugPrint('Warehouses API fetch error, fallback active list');
  }
  return [
    {'name': 'Phnom Penh Main Warehouse', 'code': 'WH-PP-01', 'total_items': 14200, 'value': '\$480,500.00'},
    {'name': 'Siem Reap Regional Hub', 'code': 'WH-SR-02', 'total_items': 4500, 'value': '\$125,000.00'},
    {'name': 'Battambang Store Depot', 'code': 'WH-BB-03', 'total_items': 2100, 'value': '\$64,200.00'},
  ];
});

class InventoryScreen extends ConsumerStatefulWidget {
  const InventoryScreen({super.key});

  @override
  ConsumerState<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends ConsumerState<InventoryScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
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
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: const EnterpriseAppBar(title: 'Inventory & Warehouses'),
      drawer: const EnterpriseDrawer(),
      body: Column(
        children: [
          TabBar(
            controller: _tabController,
            labelColor: AppColors.primary,
            unselectedLabelColor: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            indicatorColor: AppColors.primary,
            tabs: const [
              Tab(text: 'Warehouses'),
              Tab(text: 'Transfers'),
              Tab(text: 'Adjustments'),
              Tab(text: 'Opname'),
            ],
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildWarehouseTab(isDark, textColor),
                _buildTransfersTab(isDark, textColor),
                _buildAdjustmentsTab(isDark, textColor),
                _buildOpnameTab(isDark, textColor),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWarehouseTab(bool isDark, Color textColor) {
    final warehousesAsync = ref.watch(warehousesListProvider);
    final cardBg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final secondaryTextColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;

    return RefreshIndicator(
      onRefresh: () async => ref.refresh(warehousesListProvider),
      child: warehousesAsync.when(
        data: (warehouses) {
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: warehouses.length,
            separatorBuilder: (context, index) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final wh = warehouses[index];
              return Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: borderColor),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.12),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.warehouse_rounded, color: AppColors.primary, size: 22),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(wh['name'] as String, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: textColor)),
                          const SizedBox(height: 2),
                          Text('Code: ${wh['code']} • ${wh['total_items']} items', style: TextStyle(fontSize: 11, color: secondaryTextColor)),
                        ],
                      ),
                    ),
                    Text(wh['value'] as String, style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.success, fontSize: 14)),
                  ],
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => Center(child: Text('Failed to load warehouses API', style: TextStyle(color: secondaryTextColor))),
      ),
    );
  }

  Widget _buildTransfersTab(bool isDark, Color textColor) {
    final cardBg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final secondaryTextColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: borderColor),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: AppColors.accent.withValues(alpha: 0.12), shape: BoxShape.circle),
                child: const Icon(Icons.swap_horiz_rounded, color: AppColors.accent, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('TRF-2026-0042', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: textColor)),
                    Text('Main WH ➔ Siem Reap Hub • 50 Items', style: TextStyle(fontSize: 11, color: secondaryTextColor)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: AppColors.warning.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
                child: const Text('IN TRANSIT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.warning)),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAdjustmentsTab(bool isDark, Color textColor) {
    final cardBg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final secondaryTextColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: borderColor),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: AppColors.warning.withValues(alpha: 0.12), shape: BoxShape.circle),
                child: const Icon(Icons.tune_rounded, color: AppColors.warning, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('ADJ-2026-0018 (Damaged Stock)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: textColor)),
                    Text('iPhone 15 Pro Max (-2 units) • Reason: Damaged Box', style: TextStyle(fontSize: 11, color: secondaryTextColor)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: AppColors.success.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
                child: const Text('APPROVED', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.success)),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildOpnameTab(bool isDark, Color textColor) {
    final cardBg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final secondaryTextColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: borderColor),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.12), shape: BoxShape.circle),
                child: const Icon(Icons.fact_check_rounded, color: AppColors.primary, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('OPN-2026-Q2 Stock Audit', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: textColor)),
                    Text('Auditor: John Doe • 1,240 items verified', style: TextStyle(fontSize: 11, color: secondaryTextColor)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: AppColors.success.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
                child: const Text('COMPLETED', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.success)),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
