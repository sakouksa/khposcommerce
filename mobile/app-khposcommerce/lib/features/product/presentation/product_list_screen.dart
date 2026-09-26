import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/enterprise_app_bar.dart';
import '../../../core/widgets/enterprise_drawer.dart';
import '../data/product_repository.dart';
import 'providers/product_provider.dart';

class ProductListScreen extends ConsumerStatefulWidget {
  const ProductListScreen({super.key});

  @override
  ConsumerState<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends ConsumerState<ProductListScreen> {
  bool _isGridView = true;
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
    final productsAsync = ref.watch(productsListProvider);
    final selectedCategory = ref.watch(selectedCategoryFilterProvider);

    final bgColor = isDark ? AppColors.backgroundDark : AppColors.backgroundLight;
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final secondaryTextColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;

    final width = MediaQuery.of(context).size.width;
    final crossAxisCount = width > 900 ? 6 : (width > 600 ? 4 : 2);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: const EnterpriseAppBar(title: 'Products & Catalog'),
      drawer: const EnterpriseDrawer(),
      body: RefreshIndicator(
        onRefresh: () async => ref.refresh(productsListProvider),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              // Search & Filter Bar
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      style: TextStyle(color: textColor),
                      onChanged: (val) {
                        ref.read(productSearchQueryProvider.notifier).state = val.trim();
                      },
                      decoration: InputDecoration(
                        hintText: 'Search products by name, SKU, category...',
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
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: Icon(_isGridView ? Icons.table_chart_rounded : Icons.grid_view_rounded, color: AppColors.primary),
                    onPressed: () => setState(() => _isGridView = !_isGridView),
                  ),
                  IconButton(
                    icon: const Icon(Icons.filter_list_rounded, color: AppColors.primary),
                    onPressed: () => _showFilterSheet(context, isDark, selectedCategory),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Async API Products List / Grid
              Expanded(
                child: productsAsync.when(
                  data: (products) {
                    if (products.isEmpty) {
                      return Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.inventory_2_outlined, size: 64, color: secondaryTextColor),
                            const SizedBox(height: 12),
                            Text(
                              'No products found in catalog',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: textColor),
                            ),
                            const SizedBox(height: 4),
                            Text('Try searching or adjusting your category filter', style: TextStyle(color: secondaryTextColor, fontSize: 12)),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              onPressed: () => ref.refresh(productsListProvider),
                              icon: const Icon(Icons.refresh, color: Colors.white),
                              label: const Text('REFRESH', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                      );
                    }
                    return _isGridView
                        ? _buildGrid(products, crossAxisCount, isDark)
                        : _buildTable(products, isDark);
                  },
                  loading: () => const Center(
                    child: CircularProgressIndicator(),
                  ),
                  error: (err, stack) => Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline_rounded, size: 48, color: AppColors.danger),
                        const SizedBox(height: 12),
                        Text('Failed to load products API data', style: TextStyle(fontWeight: FontWeight.bold, color: textColor)),
                        const SizedBox(height: 12),
                        ElevatedButton.icon(
                          onPressed: () => ref.refresh(productsListProvider),
                          icon: const Icon(Icons.refresh),
                          label: const Text('RETRY API REQUEST'),
                        ),
                      ],
                    ),
                  ),
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
              content: const Text('Add New Product Modal triggered'),
              backgroundColor: AppColors.primary,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          );
        },
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('ADD PRODUCT', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildGrid(List<ProductModel> products, int crossAxisCount, bool isDark) {
    final cardBg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final secondaryTextColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;

    return GridView.builder(
      physics: const BouncingScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.82,
      ),
      itemCount: products.length,
      itemBuilder: (context, index) {
        final p = products[index];
        final isLow = p.totalStock > 0 && p.totalStock <= 10;
        final isOut = p.totalStock == 0;

        return Container(
          padding: const EdgeInsets.all(12),
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
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 80,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: p.imageUrl != null && p.imageUrl!.isNotEmpty
                      ? Image.network(
                          p.imageUrl!,
                          width: double.infinity,
                          height: 80,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => const Center(
                            child: Icon(Icons.inventory_2_rounded, size: 36, color: AppColors.primary),
                          ),
                          loadingBuilder: (context, child, loadingProgress) {
                            if (loadingProgress == null) return child;
                            return const Center(
                              child: SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                              ),
                            );
                          },
                        )
                      : const Center(
                          child: Icon(Icons.inventory_2_rounded, size: 36, color: AppColors.primary),
                        ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                p.name,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: textColor),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Text(
                '${p.categoryName} • ${p.brandName}',
                style: TextStyle(fontSize: 10, color: secondaryTextColor),
              ),
              const Spacer(),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '\$${p.salePrice.toStringAsFixed(2)}',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.primary),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: isOut
                          ? AppColors.danger.withValues(alpha: 0.12)
                          : isLow
                              ? AppColors.warning.withValues(alpha: 0.12)
                              : AppColors.success.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      'Qty: ${p.totalStock}',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: isOut
                            ? AppColors.danger
                            : isLow
                                ? AppColors.warning
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
    );
  }

  Widget _buildTable(List<ProductModel> products, bool isDark) {
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: DataTable(
        columns: const [
          DataColumn(label: Text('Image')),
          DataColumn(label: Text('Product Name')),
          DataColumn(label: Text('Category')),
          DataColumn(label: Text('SKU')),
          DataColumn(label: Text('Sale Price')),
          DataColumn(label: Text('Stock')),
          DataColumn(label: Text('Status')),
        ],
        rows: products.map((p) {
          return DataRow(cells: [
            DataCell(
              p.imageUrl != null && p.imageUrl!.isNotEmpty
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: Image.network(p.imageUrl!, width: 32, height: 32, fit: BoxFit.cover),
                    )
                  : const Icon(Icons.inventory_2_rounded, size: 24, color: AppColors.primary),
            ),
            DataCell(Text(p.name, style: TextStyle(fontWeight: FontWeight.bold, color: textColor))),
            DataCell(Text(p.categoryName, style: TextStyle(color: textColor))),
            DataCell(Text(p.sku, style: TextStyle(color: textColor))),
            DataCell(Text('\$${p.salePrice.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary))),
            DataCell(Text('${p.totalStock}', style: TextStyle(color: textColor))),
            DataCell(Text(p.status.toUpperCase(), style: TextStyle(color: p.totalStock > 0 ? AppColors.success : AppColors.danger, fontWeight: FontWeight.bold))),
          ]);
        }).toList(),
      ),
    );
  }

  void _showFilterSheet(BuildContext context, bool isDark, String activeCategory) {
    final bg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;

    showModalBottomSheet(
      context: context,
      backgroundColor: bg,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Filter Product Catalog', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textColor)),
            const SizedBox(height: 16),
            Text('Category:', style: TextStyle(fontWeight: FontWeight.bold, color: textColor)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: ['All', 'Laptops', 'Smartphones', 'Audio'].map((c) {
                final isSelected = activeCategory == c;
                return ChoiceChip(
                  label: Text(c),
                  selected: isSelected,
                  selectedColor: AppColors.primary,
                  onSelected: (val) {
                    ref.read(selectedCategoryFilterProvider.notifier).state = c;
                    Navigator.pop(context);
                  },
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}
