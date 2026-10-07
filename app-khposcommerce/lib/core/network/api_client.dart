import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../storage/secure_storage.dart';
import 'api_endpoints.dart';

final secureStorageProvider = Provider<SecureStorageService>((ref) {
  return SecureStorageService();
});

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: ApiEndpoints.baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    ),
  );

  final storage = ref.read(secureStorageProvider);

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Enforce dynamic base URL
        options.baseUrl = ApiEndpoints.baseUrl;

        final token = await storage.getAccessToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        final deviceId = await storage.getOrCreateDeviceId();
        options.headers['X-Device-Id'] = deviceId;
        options.headers['X-Device-Name'] = 'Flutter Mobile POS';
        options.headers['X-Device-Type'] = 'mobile';
        options.headers['X-Platform'] = 'Mobile';

        final companyId = await storage.getCompanyId();
        if (companyId != null) {
          options.headers['X-Company-ID'] = companyId;
        }
        final branchId = await storage.getBranchId();
        if (branchId != null) {
          options.headers['X-Branch-ID'] = branchId;
        }
        return handler.next(options);
      },
      onError: (DioException error, handler) async {
        if (error.response?.statusCode == 401 && !error.requestOptions.path.contains('/auth/login')) {
          final refreshToken = await storage.getRefreshToken();
          if (refreshToken != null && refreshToken.isNotEmpty) {
            try {
              final tokenDio = Dio(BaseOptions(baseUrl: ApiEndpoints.baseUrl));
              final response = await tokenDio.post(
                ApiEndpoints.refreshToken,
                options: Options(headers: {'Authorization': 'Bearer $refreshToken'}),
              );

              if (response.statusCode == 200 && response.data['data'] != null) {
                final newAccess = response.data['data']['access_token'] ?? response.data['data']['token'];
                final newRefresh = response.data['data']['refresh_token'] ?? refreshToken;
                await storage.saveTokens(accessToken: newAccess, refreshToken: newRefresh);

                // Retry original request with new token
                final opts = error.requestOptions;
                opts.headers['Authorization'] = 'Bearer $newAccess';
                final cloneReq = await dio.fetch(opts);
                return handler.resolve(cloneReq);
              }
            } catch (refreshErr) {
              await storage.clearTokens();
            }
          }
        }
        return handler.next(error);
      },
    ),
  );

  return dio;
});
