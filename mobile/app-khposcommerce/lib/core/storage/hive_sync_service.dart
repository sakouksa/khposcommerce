import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';

class HiveSyncService {
  static const String boxProducts = 'offline_products';
  static const String boxSalesQueue = 'offline_sales_queue';
  static const String boxCustomers = 'offline_customers';
  static const String boxSettings = 'offline_settings';

  static Future<void> init() async {
    await Hive.initFlutter();
    await Hive.openBox(boxProducts);
    await Hive.openBox(boxSalesQueue);
    await Hive.openBox(boxCustomers);
    await Hive.openBox(boxSettings);
  }

  // Cache products locally
  static Future<void> cacheProducts(List<dynamic> productsList) async {
    final box = Hive.box(boxProducts);
    await box.clear();
    for (var p in productsList) {
      final id = p['id']?.toString() ?? UniqueKey().toString();
      await box.put(id, jsonEncode(p));
    }
  }

  static List<Map<String, dynamic>> getCachedProducts() {
    final box = Hive.box(boxProducts);
    final List<Map<String, dynamic>> result = [];
    for (var key in box.keys) {
      final str = box.get(key);
      if (str != null) {
        result.add(jsonDecode(str) as Map<String, dynamic>);
      }
    }
    return result;
  }

  // Queue offline sale/POS transaction
  static Future<void> queueOfflineSale(Map<String, dynamic> salePayload) async {
    final box = Hive.box(boxSalesQueue);
    final id = DateTime.now().millisecondsSinceEpoch.toString();
    await box.put(id, jsonEncode(salePayload));
  }

  static Future<int> getPendingOfflineSalesCount() async {
    final box = Hive.box(boxSalesQueue);
    return box.length;
  }

  // Auto sync offline queue when back online
  static Future<void> syncOfflineQueue(Dio dio) async {
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity.contains(ConnectivityResult.none)) return;

    final box = Hive.box(boxSalesQueue);
    if (box.isEmpty) return;

    final keys = List.from(box.keys);
    for (var key in keys) {
      final payloadStr = box.get(key);
      if (payloadStr != null) {
        try {
          final payload = jsonDecode(payloadStr);
          final res = await dio.post('/pos/sales', data: payload);
          if (res.statusCode == 200 || res.statusCode == 201) {
            await box.delete(key);
          }
        } catch (e) {
          debugPrint('Failed to sync offline sale key $key: $e');
        }
      }
    }
  }
}
