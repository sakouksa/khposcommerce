import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/enterprise_app_bar.dart';
import '../../../core/widgets/enterprise_drawer.dart';
import '../../../core/network/api_client.dart';

final customersListProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final dio = ref.read(dioProvider);
  try {
    final response = await dio.get('/customers', queryParameters: {'per_page': 50});
    if (response.statusCode == 200 && response.data != null) {
      final rawData = response.data['data'] ?? response.data;
      if (rawData is List) {
        return rawData.map((c) => Map<String, dynamic>.from(c as Map)).toList();
      }
    }
  } catch (e) {
    debugPrint('Customers API fetch error, fallback list');
  }
  return [
    {'id': 1, 'name': 'John Smith', 'group': 'VIP Enterprise', 'phone': '+855 12 345 678', 'points': 1420, 'credit': '\$5,000.00'},
    {'id': 2, 'name': 'Sokha Trading Corp', 'group': 'Wholesale Partner', 'phone': '+855 98 765 432', 'points': 8900, 'credit': '\$25,000.00'},
    {'id': 3, 'name': 'Channara Tech Ltd', 'group': 'Corporate Account', 'phone': '+855 77 112 233', 'points': 3450, 'credit': '\$12,000.00'},
  ];
});

class CustomerListScreen extends ConsumerStatefulWidget {
  const CustomerListScreen({super.key});

  @override
  ConsumerState<CustomerListScreen> createState() => _CustomerListScreenState();
}

class _CustomerListScreenState extends ConsumerState<CustomerListScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

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
    final customersAsync = ref.watch(customersListProvider);

    final bgColor = isDark ? AppColors.backgroundDark : AppColors.backgroundLight;
    final cardBg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final secondaryTextColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: const EnterpriseAppBar(title: 'Customers & CRM'),
      drawer: const EnterpriseDrawer(),
      body: RefreshIndicator(
        onRefresh: () async => ref.refresh(customersListProvider),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              // Search Input
              TextField(
                controller: _searchController,
                style: TextStyle(color: textColor),
                onChanged: (val) => setState(() => _searchQuery = val.trim().toLowerCase()),
                decoration: InputDecoration(
                  hintText: 'Search customer name, phone, or company...',
                  hintStyle: TextStyle(color: secondaryTextColor),
                  prefixIcon: const Icon(Icons.search, color: AppColors.primary),
                  filled: true,
                  fillColor: isDark ? Colors.white.withValues(alpha: 0.05) : AppColors.lightInputFill,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(color: borderColor),
                  ),
                ),
              ),

              const SizedBox(height: 16),

              Expanded(
                child: customersAsync.when(
                  data: (customers) {
                    final filtered = _searchQuery.isEmpty
                        ? customers
                        : customers.where((c) {
                            final name = (c['name'] ?? '').toString().toLowerCase();
                            final phone = (c['phone'] ?? '').toString().toLowerCase();
                            return name.contains(_searchQuery) || phone.contains(_searchQuery);
                          }).toList();

                    if (filtered.isEmpty) {
                      return Center(
                        child: Text('No customers found', style: TextStyle(color: secondaryTextColor)),
                      );
                    }

                    return ListView.separated(
                      physics: const BouncingScrollPhysics(),
                      itemCount: filtered.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final c = filtered[index];
                        final name = (c['name'] ?? 'Customer').toString();
                        final phone = (c['phone'] ?? 'N/A').toString();
                        final group = (c['group'] ?? c['customer_group'] ?? 'Regular').toString();
                        final points = c['points'] ?? 0;
                        final credit = (c['credit'] ?? '\$5,000.00').toString();

                        return Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: cardBg,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: borderColor),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 20,
                                backgroundColor: AppColors.primary.withValues(alpha: 0.15),
                                child: Text(
                                  name.isNotEmpty ? name[0].toUpperCase() : 'C',
                                  style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary, fontSize: 16),
                                ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(name, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: textColor)),
                                    const SizedBox(height: 2),
                                    Text('$group • $phone', style: TextStyle(fontSize: 11, color: secondaryTextColor)),
                                  ],
                                ),
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: AppColors.primary.withValues(alpha: 0.12),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      '$points PTS',
                                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primary),
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text('Credit: $credit', style: TextStyle(fontSize: 10, color: secondaryTextColor)),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    );
                  },
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (_, __) => Center(child: Text('Error loading customers API data', style: TextStyle(color: secondaryTextColor))),
                ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Add Customer Modal triggered'),
              backgroundColor: AppColors.primary,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          );
        },
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.person_add_rounded, color: Colors.white),
        label: const Text('ADD CUSTOMER', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
