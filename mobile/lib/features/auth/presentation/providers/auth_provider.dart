import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';
import '../../../shared/providers/auth_provider.dart';
import '../../data/datasources/auth_remote_datasource.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/register_usecase.dart';

final authRemoteDataSourceProvider = Provider<AuthRemoteDataSource>((ref) {
  return AuthRemoteDataSourceImpl(dioClient: ref.watch(dioClientProvider));
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(
    remoteDataSource: ref.watch(authRemoteDataSourceProvider),
    dioClient: ref.watch(dioClientProvider),
  );
});

final loginUseCaseProvider = Provider<LoginUseCase>((ref) {
  return LoginUseCase(ref.watch(authRepositoryProvider));
});

final registerUseCaseProvider = Provider<RegisterUseCase>((ref) {
  return RegisterUseCase(ref.watch(authRepositoryProvider));
});

final loginProvider =
    StateNotifierProvider<LoginNotifier, AsyncValue<dynamic>>((ref) {
  return LoginNotifier(
    loginUseCase: ref.watch(loginUseCaseProvider),
    authStateNotifier: ref.watch(authStateProvider.notifier),
  );
});

final registerProvider =
    StateNotifierProvider<RegisterNotifier, AsyncValue<dynamic>>((ref) {
  return RegisterNotifier(
    registerUseCase: ref.watch(registerUseCaseProvider),
  );
});

final forgotPasswordProvider =
    StateNotifierProvider<ForgotPasswordNotifier, AsyncValue<bool?>>((ref) {
  return ForgotPasswordNotifier(
    authRepository: ref.watch(authRepositoryProvider),
  );
});

final resetPasswordProvider =
    StateNotifierProvider<ResetPasswordNotifier, AsyncValue<bool?>>((ref) {
  return ResetPasswordNotifier(
    authRepository: ref.watch(authRepositoryProvider),
  );
});

class LoginNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final LoginUseCase _loginUseCase;
  final AuthStateNotifier _authStateNotifier;

  LoginNotifier({
    required LoginUseCase loginUseCase,
    required AuthStateNotifier authStateNotifier,
  })  : _loginUseCase = loginUseCase,
        _authStateNotifier = authStateNotifier,
        super(const AsyncValue.data(null));

  Future<void> login({
    required String email,
    required String password,
  }) async {
    state = const AsyncValue.loading();
    try {
      final result = await _loginUseCase(
        LoginParams(email: email, password: password),
      );
      if (result != null) {
        await _authStateNotifier.login(
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: UserData(
            id: result.user?.id ?? '',
            name: result.user?.name ?? '',
            email: result.user?.email ?? '',
            phone: result.user?.phone,
            avatar: result.user?.avatar,
          ),
        );
      }
      state = AsyncValue.data(result);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> signInWithGoogle() async {
    state = const AsyncValue.loading();
    try {
      final result = await _loginUseCase.signInWithGoogle();
      if (result != null) {
        await _authStateNotifier.login(
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: UserData(
            id: result.user?.id ?? '',
            name: result.user?.name ?? '',
            email: result.user?.email ?? '',
            phone: result.user?.phone,
            avatar: result.user?.avatar,
          ),
        );
      }
      state = AsyncValue.data(result);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> verifyOtp({required String otp}) async {
    state = const AsyncValue.loading();
    try {
      final result = await _loginUseCase.verifyOtp(otp: otp);
      if (result != null) {
        await _authStateNotifier.login(
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: UserData(
            id: result.user?.id ?? '',
            name: result.user?.name ?? '',
            email: result.user?.email ?? '',
          ),
        );
      }
      state = AsyncValue.data(result);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> resendVerificationEmail() async {
    try {
      await _loginUseCase.resendVerificationEmail();
    } catch (e) {
      rethrow;
    }
  }
}

class RegisterNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final RegisterUseCase _registerUseCase;

  RegisterNotifier({required RegisterUseCase registerUseCase})
      : _registerUseCase = registerUseCase,
        super(const AsyncValue.data(null));

  Future<void> register({
    required String name,
    required String email,
    required String phone,
    required String password,
    required String passwordConfirmation,
  }) async {
    state = const AsyncValue.loading();
    try {
      final result = await _registerUseCase(
        RegisterParams(
          name: name,
          email: email,
          phone: phone,
          password: password,
          passwordConfirmation: passwordConfirmation,
        ),
      );
      state = AsyncValue.data(result);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

class ForgotPasswordNotifier extends StateNotifier<AsyncValue<bool?>> {
  final AuthRepository _authRepository;

  ForgotPasswordNotifier({required AuthRepository authRepository})
      : _authRepository = authRepository,
        super(const AsyncValue.data(null));

  Future<void> forgotPassword({required String email}) async {
    state = const AsyncValue.loading();
    try {
      await _authRepository.forgotPassword(email: email);
      state = const AsyncValue.data(true);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

class ResetPasswordNotifier extends StateNotifier<AsyncValue<bool?>> {
  final AuthRepository _authRepository;

  ResetPasswordNotifier({required AuthRepository authRepository})
      : _authRepository = authRepository,
        super(const AsyncValue.data(null));

  Future<void> resetPassword({
    required String token,
    required String password,
    required String passwordConfirmation,
  }) async {
    state = const AsyncValue.loading();
    try {
      await _authRepository.resetPassword(
        token: token,
        password: password,
        passwordConfirmation: passwordConfirmation,
      );
      state = const AsyncValue.data(true);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}
