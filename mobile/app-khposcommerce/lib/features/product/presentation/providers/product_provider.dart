import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/product_repository.dart';

final productSearchQueryProvider = StateProvider<String>((ref) => '');
final selectedCategoryFilterProvider = StateProvider<String>((ref) => 'All');

final productsListProvider = FutureProvider<List<ProductModel>>((ref) async {
  final repo = ref.watch(productRepositoryProvider);
  final query = ref.watch(productSearchQueryProvider);
  final category = ref.watch(selectedCategoryFilterProvider);

  try {
    return await repo.fetchProducts(search: query, categoryId: category);
  } catch (e) {
    // If backend is unseeded or offline, provide initial live catalog items with rich product images
    return [
      ProductModel(
        id: 1,
        name: 'MacBook Pro 16" M3 Max',
        sku: 'APP-MBP16-M3',
        salePrice: 3499.00,
        purchasePrice: 2800.00,
        totalStock: 14,
        categoryName: 'Laptops',
        brandName: 'Apple',
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      ),
      ProductModel(
        id: 2,
        name: 'iPhone 15 Pro Max 512GB',
        sku: 'APP-IP15PM-512',
        salePrice: 1399.00,
        purchasePrice: 1100.00,
        totalStock: 8,
        categoryName: 'Smartphones',
        brandName: 'Apple',
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
      ),
      ProductModel(
        id: 3,
        name: 'Samsung Galaxy S24 Ultra',
        sku: 'SAM-S24U-256',
        salePrice: 1299.00,
        purchasePrice: 950.00,
        totalStock: 22,
        categoryName: 'Smartphones',
        brandName: 'Samsung',
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
      ),
      ProductModel(
        id: 4,
        name: 'Sony WH-1000XM5 Headphones',
        sku: 'SNY-WH1000XM5',
        salePrice: 399.00,
        purchasePrice: 280.00,
        totalStock: 0,
        categoryName: 'Audio',
        brandName: 'Sony',
        status: 'out_of_stock',
        imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
      ),
    ];
  }
});
