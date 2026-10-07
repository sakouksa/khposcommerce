import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static const _keyAccessToken = 'access_token';
  static const _keyRefreshToken = 'refresh_token';
  static const _keyUser = 'user_data';
  static const _keyCompanyId = 'company_id';
  static const _keyBranchId = 'branch_id';
  static const _keyPin = 'security_pin';
  static const _keyBiometrics = 'biometrics_enabled';
  static const _keyDeviceId = 'mobile_device_id';

  Future<String> getOrCreateDeviceId() async {
    var id = await _storage.read(key: _keyDeviceId);
    if (id == null || id.isEmpty) {
      id = 'mob_${DateTime.now().millisecondsSinceEpoch}';
      await _storage.write(key: _keyDeviceId, value: id);
    }
    return id;
  }

  Future<void> saveTokens({required String accessToken, String? refreshToken}) async {
    await _storage.write(key: _keyAccessToken, value: accessToken);
    if (refreshToken != null) {
      await _storage.write(key: _keyRefreshToken, value: refreshToken);
    }
  }

  Future<String?> getAccessToken() async => await _storage.read(key: _keyAccessToken);
  Future<String?> getRefreshToken() async => await _storage.read(key: _keyRefreshToken);

  Future<void> saveUser(Map<String, dynamic> userMap) async {
    await _storage.write(key: _keyUser, value: jsonEncode(userMap));
  }

  Future<Map<String, dynamic>?> getUser() async {
    final str = await _storage.read(key: _keyUser);
    if (str == null) return null;
    try {
      return jsonDecode(str) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  Future<void> setCompanyBranch({String? companyId, String? branchId}) async {
    if (companyId != null) await _storage.write(key: _keyCompanyId, value: companyId);
    if (branchId != null) await _storage.write(key: _keyBranchId, value: branchId);
  }

  Future<String?> getCompanyId() async => await _storage.read(key: _keyCompanyId);
  Future<String?> getBranchId() async => await _storage.read(key: _keyBranchId);

  Future<void> setPin(String pin) async => await _storage.write(key: _keyPin, value: pin);
  Future<String?> getPin() async => await _storage.read(key: _keyPin);

  Future<void> setBiometricsEnabled(bool enabled) async {
    await _storage.write(key: _keyBiometrics, value: enabled.toString());
  }

  Future<bool> isBiometricsEnabled() async {
    final val = await _storage.read(key: _keyBiometrics);
    return val == 'true';
  }

  Future<void> clearTokens() async {
    await _storage.delete(key: _keyAccessToken);
    await _storage.delete(key: _keyRefreshToken);
    await _storage.delete(key: _keyUser);
  }
}
