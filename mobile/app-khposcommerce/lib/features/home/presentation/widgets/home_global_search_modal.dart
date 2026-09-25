import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';

class HomeGlobalSearchModal extends StatefulWidget {
  final bool isDark;

  const HomeGlobalSearchModal({
    super.key,
    required this.isDark,
  });

  @override
  State<HomeGlobalSearchModal> createState() => _HomeGlobalSearchModalState();
}

class _HomeGlobalSearchModalState extends State<HomeGlobalSearchModal> {
  final _searchController = TextEditingController();
  String _query = '';

  final List<Map<String, dynamic>> _allItems = [
    {'title': 'MacBook Pro M3 Max 16"', 'category': 'Product Catalog', 'icon': Icons.laptop_mac_rounded, 'route': '/products'},
    {'title': 'iPhone 15 Pro Max 256GB', 'category': 'Product Catalog', 'icon': Icons.smartphone_rounded, 'route': '/products'},
    {'title': 'Channara Tech Ltd', 'category': 'Customer CRM', 'icon': Icons.person_rounded, 'route': '/customer'},
    {'title': 'Invoice #INV-2026-1042', 'category': 'POS Sale Transaction', 'icon': Icons.receipt_rounded, 'route': '/sales'},
    {'title': 'Purchase Order #PO-892', 'category': 'Inventory Purchase', 'icon': Icons.shopping_bag_rounded, 'route': '/purchases'},
    {'title': 'Sothea V. (POS Manager)', 'category': 'Employee Directory', 'icon': Icons.badge_rounded, 'route': '/payroll'},
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bg = widget.isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final textColor = widget.isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final secondaryTextColor = widget.isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final borderColor = widget.isDark ? AppColors.borderDark : AppColors.borderLight;

    final filtered = _query.isEmpty
        ? _allItems
        : _allItems.where((item) {
            return (item['title'] as String).toLowerCase().contains(_query.toLowerCase()) ||
                (item['category'] as String).toLowerCase().contains(_query.toLowerCase());
          }).toList();

    return Container(
      height: MediaQuery.of(context).size.height * 0.8,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        children: [
          // Drag handle & Close
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Enterprise Global Search',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textColor),
              ),
              IconButton(
                icon: Icon(Icons.close, color: secondaryTextColor),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Search TextField
          TextField(
            controller: _searchController,
            autofocus: true,
            style: TextStyle(color: textColor),
            onChanged: (val) => setState(() => _query = val),
            decoration: InputDecoration(
              hintText: 'Search products, customers, invoices, orders...',
              hintStyle: TextStyle(color: secondaryTextColor),
              prefixIcon: const Icon(Icons.search_rounded, color: AppColors.primary),
              suffixIcon: _query.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, size: 18),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _query = '');
                      },
                    )
                  : null,
              filled: true,
              fillColor: widget.isDark ? Colors.white.withValues(alpha: 0.05) : AppColors.lightInputFill,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: borderColor),
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Search Results List
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Text('No results found for "$_query"', style: TextStyle(color: secondaryTextColor)),
                  )
                : ListView.separated(
                    itemCount: filtered.length,
                    separatorBuilder: (context, index) => Divider(color: borderColor.withValues(alpha: 0.5)),
                    itemBuilder: (context, index) {
                      final item = filtered[index];
                      return ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(item['icon'] as IconData, color: AppColors.primary),
                        ),
                        title: Text(item['title'] as String, style: TextStyle(fontWeight: FontWeight.bold, color: textColor)),
                        subtitle: Text(item['category'] as String, style: TextStyle(fontSize: 12, color: secondaryTextColor)),
                        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.primary),
                        onTap: () {
                          Navigator.pop(context);
                          context.push(item['route'] as String);
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
