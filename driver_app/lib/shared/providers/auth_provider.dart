import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:pharmaworld_driver/core/constants/storage_keys.dart';
import 'package:pharmaworld_driver/shared/models/user.dart';

final authStateProvider = StateNotifierProvider<AuthStateNotifier, AsyncValue<User?>>((ref) {
  return AuthStateNotifier();
});

class AuthStateNotifier extends StateNotifier<AsyncValue<User?>> {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  AuthStateNotifier() : super(const AsyncValue.loading()) {
    _loadUser();
  }

  Future<void> _loadUser() async {
    try {
      final token = await _storage.read(key: StorageKeys.token);
      if (token != null) {
        final userData = await _storage.read(key: StorageKeys.userId);
        if (userData != null) {
          state = AsyncValue.data(User.fromJson({'id': userData, 'name': '', 'email': '', 'phone': ''}));
        } else {
          state = const AsyncValue.data(null);
        }
      } else {
        state = const AsyncValue.data(null);
      }
    } catch (e) {
      state = AsyncValue.data(null);
    }
  }

  Future<void> login(User user, String token) async {
    await _storage.write(key: StorageKeys.token, value: token);
    await _storage.write(key: StorageKeys.userId, value: user.id);
    state = AsyncValue.data(user);
  }

  Future<void> logout() async {
    await _storage.delete(key: StorageKeys.token);
    await _storage.delete(key: StorageKeys.refreshToken);
    await _storage.delete(key: StorageKeys.userId);
    state = const AsyncValue.data(null);
  }

  Future<void> updateUser(User user) async {
    state = AsyncValue.data(user);
  }

  Future<String?> getToken() async {
    return await _storage.read(key: StorageKeys.token);
  }
}

final isOnlineProvider = StateNotifierProvider<IsOnlineNotifier, bool>((ref) {
  return IsOnlineNotifier();
});

class IsOnlineNotifier extends StateNotifier<bool> {
  IsOnlineNotifier() : super(false);

  void goOnline() => state = true;
  void goOffline() => state = false;
  void toggle() => state = !state;
}

final currentLocationProvider = StateProvider<({double lat, double lng})?>((ref) => null);
