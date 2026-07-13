import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:pharmaworld/core/constants/storage_keys.dart';

final authStateProvider =
    StateNotifierProvider<AuthStateNotifier, AsyncValue<bool>>((ref) {
  return AuthStateNotifier();
});

final currentUserProvider = StateProvider<UserData?>((ref) => null);

class UserData {

  const UserData({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.avatar,
    this.city,
    this.createdAt,
  });
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String? avatar;
  final String? city;
  final DateTime? createdAt;

  UserData copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    String? avatar,
    String? city,
    DateTime? createdAt,
  }) {
    return UserData(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      avatar: avatar ?? this.avatar,
      city: city ?? this.city,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}

class AuthStateNotifier extends StateNotifier<AsyncValue<bool>> {
  AuthStateNotifier() : super(const AsyncValue.loading());

  Future<void> checkAuthStatus() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final isLoggedIn = prefs.getBool(StorageKeys.isLoggedIn) ?? false;
      state = AsyncValue.data(isLoggedIn);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> login({
    required String accessToken,
    required String refreshToken,
    required UserData user,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(StorageKeys.isLoggedIn, true);
    await prefs.setString(StorageKeys.accessToken, accessToken);
    await prefs.setString(StorageKeys.refreshToken, refreshToken);
    await prefs.setString(StorageKeys.userId, user.id);
    await prefs.setString(StorageKeys.userEmail, user.email);
    await prefs.setString(StorageKeys.userName, user.name);
    if (user.phone != null) {
      await prefs.setString(StorageKeys.userPhone, user.phone!);
    }
    if (user.avatar != null) {
      await prefs.setString(StorageKeys.userAvatar, user.avatar!);
    }
    state = const AsyncValue.data(true);
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(StorageKeys.isLoggedIn);
    await prefs.remove(StorageKeys.accessToken);
    await prefs.remove(StorageKeys.refreshToken);
    await prefs.remove(StorageKeys.userId);
    await prefs.remove(StorageKeys.userEmail);
    await prefs.remove(StorageKeys.userName);
    await prefs.remove(StorageKeys.userPhone);
    await prefs.remove(StorageKeys.userAvatar);
    state = const AsyncValue.data(false);
  }
}
