import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:pharmaworld_driver/core/constants/storage_keys.dart';
import 'package:pharmaworld_driver/features/auth/service/auth_service.dart';
import 'package:pharmaworld_driver/shared/models/user.dart';

class AuthRepository {
  final AuthService _authService;
  final FlutterSecureStorage _storage;

  AuthRepository({
    required AuthService authService,
    required FlutterSecureStorage storage,
  })  : _authService = authService,
        _storage = storage;

  Future<String> login(String phone) async {
    final response = await _authService.login(phone);
    return response['message'] ?? 'OTP sent successfully';
  }

  Future<User> verifyOtp(String phone, String otp) async {
    final response = await _authService.verifyOtp(phone, otp);
    final token = response['token'];
    final userData = response['user'];

    if (token != null) {
      await _storage.write(key: StorageKeys.token, value: token);
    }
    if (response['refreshToken'] != null) {
      await _storage.write(key: StorageKeys.refreshToken, value: response['refreshToken']);
    }

    return User.fromJson(userData);
  }

  Future<void> resendOtp(String phone) async {
    await _authService.resendOtp(phone);
  }

  Future<User> getProfile() async {
    final response = await _authService.getProfile();
    return User.fromJson(response['user']);
  }

  Future<User> updateProfile(Map<String, dynamic> data) async {
    final response = await _authService.updateProfile(data);
    return User.fromJson(response['user']);
  }

  Future<void> logout() async {
    await _storage.delete(key: StorageKeys.token);
    await _storage.delete(key: StorageKeys.refreshToken);
    await _storage.delete(key: StorageKeys.userId);
  }
}
