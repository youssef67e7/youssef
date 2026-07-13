import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/constants/storage.dart';
import '../../core/network/api_service.dart';
import '../../core/network/dio_client.dart';
import '../../core/utils/logger.dart';

class AuthState {
  final bool isLoggedIn;
  final bool isLoading;
  final String? token;
  final String? userId;
  final String? email;
  final String? name;
  final String? error;

  const AuthState({
    this.isLoggedIn = false,
    this.isLoading = false,
    this.token,
    this.userId,
    this.email,
    this.name,
    this.error,
  });

  AuthState copyWith({
    bool? isLoggedIn,
    bool? isLoading,
    String? token,
    String? userId,
    String? email,
    String? name,
    String? error,
  }) {
    return AuthState(
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      isLoading: isLoading ?? this.isLoading,
      token: token ?? this.token,
      userId: userId ?? this.userId,
      email: email ?? this.email,
      name: name ?? this.name,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiService _apiService;
  final DioClient _dioClient;

  AuthNotifier(this._apiService, this._dioClient) : super(const AuthState()) {
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(StorageKeys.token);
    final userJson = prefs.getString(StorageKeys.user);
    if (token != null) {
      state = AuthState(
        isLoggedIn: true,
        token: token,
        userId: prefs.getString('user_id'),
        email: prefs.getString('user_email'),
        name: prefs.getString('user_name'),
      );
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.login(email, password);
      final data = response.data;
      final token = data['token'] as String?;
      final sessionToken = data['sessionToken'] as String?;
      if (sessionToken != null) {
        state = state.copyWith(isLoading: false, error: null);
        return false;
      }
      if (token != null) {
        await _saveAuthData(token, data);
        return true;
      }
      state = state.copyWith(isLoading: false, error: 'Invalid response');
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> verifyMfa(String code, String sessionToken) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.verifyMfa(code, sessionToken);
      final data = response.data;
      final token = data['token'] as String;
      await _saveAuthData(token, data);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<void> _saveAuthData(String token, Map<String, dynamic> data) async {
    await _dioClient.setToken(token);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(StorageKeys.token, token);
    if (data.containsKey('refreshToken')) {
      await prefs.setString(StorageKeys.refreshToken, data['refreshToken']);
    }
    final user = data['user'] as Map<String, dynamic>?;
    if (user != null) {
      await prefs.setString('user_id', user['id'] ?? '');
      await prefs.setString('user_email', user['email'] ?? '');
      await prefs.setString('user_name', user['name'] ?? '');
    }
    state = AuthState(
      isLoggedIn: true,
      token: token,
      userId: user?['id'],
      email: user?['email'],
      name: user?['name'],
    );
  }

  Future<void> logout() async {
    try {
      await _apiService.logout();
    } catch (_) {}
    await _dioClient.clearToken();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(StorageKeys.token);
    await prefs.remove(StorageKeys.refreshToken);
    await prefs.remove(StorageKeys.user);
    state = const AuthState();
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

final authStateProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final apiService = ref.read(apiServiceProvider);
  final dioClient = ref.read(dioClientProvider);
  return AuthNotifier(apiService, dioClient);
});
