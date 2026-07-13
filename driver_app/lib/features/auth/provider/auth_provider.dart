import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_driver/features/auth/repository/auth_repository.dart';
import 'package:pharmaworld_driver/features/auth/service/auth_service.dart';
import 'package:pharmaworld_driver/shared/models/user.dart';
import 'package:pharmaworld_driver/shared/providers/auth_provider.dart';
import 'package:pharmaworld_driver/core/di/injection.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(dioClient: Injection.dioClient);
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    authService: ref.read(authServiceProvider),
    storage: Injection.storage,
  );
});

final loginProvider = StateNotifierProvider<LoginNotifier, AsyncValue<String?>>((ref) {
  return LoginNotifier(ref);
});

class LoginNotifier extends StateNotifier<AsyncValue<String?>> {
  final Ref _ref;

  LoginNotifier(this._ref) : super(const AsyncValue.data(null));

  Future<void> login(String phone) async {
    state = const AsyncValue.loading();
    try {
      final message = await _ref.read(authRepositoryProvider).login(phone);
      state = AsyncValue.data(message);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  void reset() => state = const AsyncValue.data(null);
}

final otpProvider = StateNotifierProvider<OtpNotifier, AsyncValue<User?>>((ref) {
  return OtpNotifier(ref);
});

class OtpNotifier extends StateNotifier<AsyncValue<User?>> {
  final Ref _ref;

  OtpNotifier(this._ref) : super(const AsyncValue.data(null));

  Future<void> verifyOtp(String phone, String otp) async {
    state = const AsyncValue.loading();
    try {
      final user = await _ref.read(authRepositoryProvider).verifyOtp(phone, otp);
      await _ref.read(authStateProvider.notifier).login(user, '');
      state = AsyncValue.data(user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> resendOtp(String phone) async {
    try {
      await _ref.read(authRepositoryProvider).resendOtp(phone);
    } catch (e) {
      rethrow;
    }
  }

  void reset() => state = const AsyncValue.data(null);
}
