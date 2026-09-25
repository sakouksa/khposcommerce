import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';

class ProductModel {
  final int id;
  final String name;
  final String sku;
  final double salePrice;
  final double purchasePrice;
  final int totalStock;
  final String categoryName;
  final String brandName;
  final String status;
  final String? imageUrl;

  ProductModel({
    required this.id,
    required this.name,
    required this.sku,
    required this.salePrice,
    required this.purchasePrice,
    required this.totalStock,
    required this.categoryName,
    required this.brandName,
    required this.status,
    this.imageUrl,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    final category = json['category'];
    final categoryStr = category is Map ? (category['name'] ?? 'General') : (json['category_name'] ?? 'General');

    final brand = json['brand'];
    final brandStr = brand is Map ? (brand['name'] ?? 'Generic') : (json['brand_name'] ?? 'Generic');

    String? rawImage = json['primary_image'] ?? json['image_url'] ?? json['image'];
    if (rawImage != null && kIsWeb) {
      rawImage = rawImage.replaceAll('10.0.2.2', 'localhost');
    }

    final nameStr = (json['name'] ?? json['product_name'] ?? 'Unnamed Product').toString();
    String? fallbackImg;
    if (rawImage == null || rawImage.isEmpty) {
      final nameLower = nameStr.toLowerCase();
      if (nameLower.contains('samsung') || nameLower.contains('s24')) {
        fallbackImg = 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400';
      } else if (nameLower.contains('sony') || nameLower.contains('headphone')) {
        fallbackImg = 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400';
      } else if (nameLower.contains('macbook') || nameLower.contains('laptop')) {
        fallbackImg = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400';
      } else if (nameLower.contains('iphone')) {
        fallbackImg = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400';
      } else if (nameLower.contains('ipad')) {
        fallbackImg = 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400';
      } else if (nameLower.contains('airpod')) {
        fallbackImg = 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400';
      }
    }

    return ProductModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      name: nameStr,
      sku: json['sku'] ?? json['product_code'] ?? 'SKU-000',
      salePrice: (json['sale_price'] ?? json['price'] ?? json['unit_price'] ?? json['selling_price'] ?? 0.0) is num
          ? (json['sale_price'] ?? json['price'] ?? json['unit_price'] ?? json['selling_price'] ?? 0.0).toDouble()
          : double.tryParse((json['sale_price'] ?? json['price'] ?? json['unit_price'] ?? json['selling_price'] ?? 0.0).toString()) ?? 0.0,
      purchasePrice: (json['purchase_price'] ?? json['cost_price'] ?? 0.0) is num
          ? (json['purchase_price'] ?? json['cost_price'] ?? 0.0).toDouble()
          : double.tryParse((json['purchase_price'] ?? json['cost_price'] ?? 0.0).toString()) ?? 0.0,
      totalStock: (json['total_stock'] ?? json['stock'] ?? json['qty'] ?? 0) is int
          ? (json['total_stock'] ?? json['stock'] ?? json['qty'] ?? 0)
          : int.tryParse((json['total_stock'] ?? json['stock'] ?? json['qty'] ?? 0).toString()) ?? 0,
      categoryName: categoryStr.toString(),
      brandName: brandStr.toString(),
      status: json['status'] ?? 'active',
      imageUrl: (rawImage != null && rawImage.isNotEmpty) ? rawImage : fallbackImg,
    );
  }
}

final productRepositoryProvider = Provider<ProductRepository>((ref) {
  return ProductRepository(ref.read(dioProvider));
});

class ProductRepository {
  final Dio _dio;

  ProductRepository(this._dio);

  Future<List<ProductModel>> fetchProducts({String? search, String? categoryId}) async {
    try {
      final response = await _dio.get(
        '/products',
        queryParameters: {
          if (search != null && search.isNotEmpty) 'search': search,
          if (categoryId != null && categoryId.isNotEmpty && categoryId != 'All') 'category_id': categoryId,
          'per_page': 50,
        },
      );

      if (response.statusCode == 200 && response.data != null) {
        final rawData = response.data['data'] ?? response.data;
        if (rawData is List) {
          return rawData.map((item) => ProductModel.fromJson(item as Map<String, dynamic>)).toList();
        }
      }
    } catch (e) {
      rethrow;
    }
    return [];
  }
}
