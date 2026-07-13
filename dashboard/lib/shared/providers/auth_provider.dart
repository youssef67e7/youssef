import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/models/user_model.dart';
import 'package:pharmaworld_dashboard/core/network/api_service.dart';
import 'package:pharmaworld_dashboard/core/constants/app_constants.dart';
import 'package:pharmaworld_dashboard/core/utils/logger.dart';
import 'package:pharmaworld_dashboard/core/network/dio_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final User? user;
  final String? error;

  AuthState({
    this.isAuthenticated = false,
    this.isLoading = false,
    this.user,
    this.error,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    User? user,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      user: user ?? this.user,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiService _apiService;

  AuthNotifier(this._apiService) : super(AuthState()) {
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(AppConstants.tokenKey);
    if (token != null && token.isNotEmpty) {
      try {
        final response = await _apiService.getProfile();
        final user = User.fromJson(response.data['data']);
        state = state.copyWith(isAuthenticated: true, user: user);
      } catch (e) {
        Logger.error('Auth check failed: $e');
        await prefs.remove(AppConstants.tokenKey);
        state = AuthState();
      }
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.login({
        'email': email,
        'password': password,
      });
      final data = response.data['data'];
      final token = data['token'];
      final refreshToken = data['refreshToken'];
      final user = User.fromJson(data['user']);

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConstants.tokenKey, token);
      if (refreshToken != null) {
        await prefs.setString(AppConstants.refreshTokenKey, refreshToken);
      }

      state = state.copyWith(
        isAuthenticated: true,
        isLoading: false,
        user: user,
      );
      return true;
    } catch (e) {
      Logger.error('Login failed: $e');
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _apiService.logout();
    } catch (e) {
      Logger.error('Logout API failed: $e');
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.tokenKey);
    await prefs.remove(AppConstants.refreshTokenKey);
    state = AuthState();
  }
}

final apiServiceProvider = Provider<ApiService>((ref) {
  final dio = ref.watch(dioProvider);
  return ApiService(dio);
});

final authProvider =
    StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return AuthNotifier(apiService);
});
