import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:pharmaworld/core/network/dio_client.dart';
import 'package:pharmaworld/core/services/firebase_auth_service.dart';
import 'package:pharmaworld/shared/providers/auth_provider.dart';
import 'package:pharmaworld/features/auth/data/datasources/auth_remote_datasource.dart';
import 'package:pharmaworld/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:pharmaworld/features/auth/domain/repositories/auth_repository.dart';
import 'package:pharmaworld/features/auth/domain/usecases/login_usecase.dart';
import 'package:pharmaworld/features/auth/domain/usecases/register_usecase.dart';

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
    firebaseAuthService: ref.watch(firebaseAuthServiceProvider),
  );
});

final registerProvider =
    StateNotifierProvider<RegisterNotifier, AsyncValue<dynamic>>((ref) {
  return RegisterNotifier(
    registerUseCase: ref.watch(registerUseCaseProvider),
    firebaseAuthService: ref.watch(firebaseAuthServiceProvider),
  );
});

final forgotPasswordProvider =
    StateNotifierProvider<ForgotPasswordNotifier, AsyncValue<bool?>>((ref) {
  return ForgotPasswordNotifier(
    authRepository: ref.watch(authRepositoryProvider),
    firebaseAuthService: ref.watch(firebaseAuthServiceProvider),
  );
});

final resetPasswordProvider =
    StateNotifierProvider<ResetPasswordNotifier, AsyncValue<bool?>>((ref) {
  return ResetPasswordNotifier(
    authRepository: ref.watch(authRepositoryProvider),
  );
});

class LoginNotifier extends StateNotifier<AsyncValue<dynamic>> {

  LoginNotifier({
    required LoginUseCase loginUseCase,
    required AuthStateNotifier authStateNotifier,
    required FirebaseAuthService firebaseAuthService,
  })  : _loginUseCase = loginUseCase,
        _authStateNotifier = authStateNotifier,
        _firebaseAuthService = firebaseAuthService,
        super(const AsyncValue.data(null));
  final LoginUseCase _loginUseCase;
  final AuthStateNotifier _authStateNotifier;
  final FirebaseAuthService _firebaseAuthService;

  Future<void> login({
    required String email,
    required String password,
  }) async {
    state = const AsyncValue.loading();
    try {
      final userCredential = await _firebaseAuthService.loginWithEmail(
        email: email,
        password: password,
      );

      final firebaseUser = userCredential.user;
      if (firebaseUser != null) {
        final idToken = await firebaseUser.getIdToken();
        final result = await _loginUseCase(
          LoginParams(email: email, password: password),
        );
        if (result != null && result.data != null) {
          await _authStateNotifier.login(
            accessToken: result.data!.accessToken ?? '',
            refreshToken: result.data!.refreshToken ?? '',
            user: UserData(
              id: result.data!.user?.id ?? firebaseUser.uid,
              name: result.data!.user?.name ?? firebaseUser.displayName ?? '',
              email: result.data!.user?.email ?? firebaseUser.email ?? '',
              phone: result.data!.user?.phone ?? firebaseUser.phoneNumber,
              avatar: result.data!.user?.avatar ?? firebaseUser.photoURL,
            ),
          );
        }
        state = AsyncValue.data(result);
      }
    } on FirebaseAuthException catch (e) {
      state = AsyncValue.error(_mapFirebaseError(e), StackTrace.current);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> signInWithGoogle() async {
    state = const AsyncValue.loading();
    try {
      final result = await _loginUseCase.signInWithGoogle();
      if (result != null && result.data != null) {
        await _authStateNotifier.login(
          accessToken: result.data!.accessToken ?? '',
          refreshToken: result.data!.refreshToken ?? '',
          user: UserData(
            id: result.data!.user?.id ?? '',
            name: result.data!.user?.name ?? '',
            email: result.data!.user?.email ?? '',
            phone: result.data!.user?.phone,
            avatar: result.data!.user?.avatar,
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
      if (result != null && result.data != null) {
        await _authStateNotifier.login(
          accessToken: result.data!.accessToken ?? '',
          refreshToken: result.data!.refreshToken ?? '',
          user: UserData(
            id: result.data!.user?.id ?? '',
            name: result.data!.user?.name ?? '',
            email: result.data!.user?.email ?? '',
          ),
        );
      }
      state = AsyncValue.data(result);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> verifyPhoneOtp({
    required String verificationId,
    required String smsCode,
  }) async {
    state = const AsyncValue.loading();
    try {
      final userCredential = await _firebaseAuthService.verifySmsCode(
        verificationId: verificationId,
        smsCode: smsCode,
      );
      final firebaseUser = userCredential.user;
      if (firebaseUser != null) {
        final idToken = await firebaseUser.getIdToken();
        final result = await _loginUseCase(
          LoginParams(
            email: firebaseUser.email ?? '',
            password: '',
          ),
        );
        if (result != null && result.data != null) {
          await _authStateNotifier.login(
            accessToken: result.data!.accessToken ?? '',
            refreshToken: result.data!.refreshToken ?? '',
            user: UserData(
              id: result.data!.user?.id ?? firebaseUser.uid,
              name: result.data!.user?.name ?? firebaseUser.displayName ?? '',
              email: result.data!.user?.email ?? firebaseUser.email ?? '',
              phone: result.data!.user?.phone ?? firebaseUser.phoneNumber,
            ),
          );
        }
        state = AsyncValue.data(result);
      }
    } on FirebaseAuthException catch (e) {
      state = AsyncValue.error(_mapFirebaseError(e), StackTrace.current);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> sendPhoneVerification({
    required String phoneNumber,
    required void Function(String verificationId) onCodeSent,
    required void Function(String error) onError,
  }) async {
    await _firebaseAuthService.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      verificationCompleted: (credential) async {
        try {
          await _firebaseAuthService.verifySmsCode(
            verificationId: '',
            smsCode: credential.smsCode ?? '',
          );
        } catch (_) {}
      },
      verificationFailed: (e) {
        onError(_mapFirebaseError(e));
      },
      codeSent: (verificationId, _) {
        onCodeSent(verificationId);
      },
      codeAutoRetrievalTimeout: (_) {},
    );
  }

  Future<void> resendVerificationEmail() async {
    try {
      await _firebaseAuthService.sendEmailVerification();
    } catch (e) {
      rethrow;
    }
  }

  String _mapFirebaseError(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return 'No user found with this email.';
      case 'wrong-password':
        return 'Incorrect password.';
      case 'email-already-in-use':
        return 'An account already exists with this email.';
      case 'invalid-email':
        return 'Invalid email address.';
      case 'weak-password':
        return 'Password is too weak.';
      case 'invalid-phone-number':
        return 'Invalid phone number.';
      case 'too-many-requests':
        return 'Too many requests. Please try again later.';
      case 'operation-not-allowed':
        return 'This sign-in method is not enabled.';
      case 'session-expired':
        return 'Session expired. Please try again.';
      case 'invalid-verification-code':
        return 'Invalid verification code.';
      default:
        return e.message ?? 'Authentication failed.';
    }
  }
}

class RegisterNotifier extends StateNotifier<AsyncValue<dynamic>> {

  RegisterNotifier({
    required RegisterUseCase registerUseCase,
    required FirebaseAuthService firebaseAuthService,
  })  : _registerUseCase = registerUseCase,
        _firebaseAuthService = firebaseAuthService,
        super(const AsyncValue.data(null));
  final RegisterUseCase _registerUseCase;
  final FirebaseAuthService _firebaseAuthService;

  Future<void> register({
    required String name,
    required String email,
    required String phone,
    required String password,
    required String passwordConfirmation,
  }) async {
    state = const AsyncValue.loading();
    try {
      final userCredential = await _firebaseAuthService.registerWithEmail(
        email: email,
        password: password,
      );

      await _firebaseAuthService.updateDisplayName(name);
      await _firebaseAuthService.sendEmailVerification();

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
    } on FirebaseAuthException catch (e) {
      String message;
      switch (e.code) {
        case 'email-already-in-use':
          message = 'An account already exists with this email.';
          break;
        case 'weak-password':
          message = 'Password is too weak.';
          break;
        case 'invalid-email':
          message = 'Invalid email address.';
          break;
        default:
          message = e.message ?? 'Registration failed.';
      }
      state = AsyncValue.error(message, StackTrace.current);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

class ForgotPasswordNotifier extends StateNotifier<AsyncValue<bool?>> {

  ForgotPasswordNotifier({
    required AuthRepository authRepository,
    required FirebaseAuthService firebaseAuthService,
  })  : _authRepository = authRepository,
        _firebaseAuthService = firebaseAuthService,
        super(const AsyncValue.data(null));
  final AuthRepository _authRepository;
  final FirebaseAuthService _firebaseAuthService;

  Future<void> forgotPassword({required String email}) async {
    state = const AsyncValue.loading();
    try {
      await _firebaseAuthService.sendPasswordResetEmail(email);
      await _authRepository.forgotPassword(email: email);
      state = const AsyncValue.data(true);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

class ResetPasswordNotifier extends StateNotifier<AsyncValue<bool?>> {

  ResetPasswordNotifier({required AuthRepository authRepository})
      : _authRepository = authRepository,
        super(const AsyncValue.data(null));
  final AuthRepository _authRepository;

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
