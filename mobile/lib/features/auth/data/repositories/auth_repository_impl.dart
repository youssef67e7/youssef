import '../../../core/network/dio_client.dart';
import '../datasources/auth_remote_datasource.dart';
import '../models/auth_models.dart';
import 'auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remoteDataSource;
  final DioClient _dioClient;

  AuthRepositoryImpl({
    required AuthRemoteDataSource remoteDataSource,
    required DioClient dioClient,
  })  : _remoteDataSource = remoteDataSource,
        _dioClient = dioClient;

  @override
  Future<AuthResponseModel> login(String email, String password) async {
    final result = await _remoteDataSource.login(email, password);
    if (result.success && result.data?.accessToken != null) {
      await _dioClient.saveTokens(
        accessToken: result.data!.accessToken!,
        refreshToken: result.data!.refreshToken ?? '',
      );
    }
    return result;
  }

  @override
  Future<AuthResponseModel> register(RegisterRequestModel request) async {
    return await _remoteDataSource.register(request);
  }

  @override
  Future<void> forgotPassword({required String email}) async {
    await _remoteDataSource.forgotPassword(email);
  }

  @override
  Future<void> resetPassword({
    required String token,
    required String password,
    required String passwordConfirmation,
  }) async {
    await _remoteDataSource.resetPassword(token, password, passwordConfirmation);
  }

  @override
  Future<void> verifyEmail(String token) async {
    await _remoteDataSource.verifyEmail(token);
  }

  @override
  Future<void> verifyPhone(String phone) async {
    await _remoteDataSource.verifyPhone(phone);
  }

  @override
  Future<AuthResponseModel> verifyOtp(String otp) async {
    final result = await _remoteDataSource.verifyOtp(otp);
    if (result.success && result.data?.accessToken != null) {
      await _dioClient.saveTokens(
        accessToken: result.data!.accessToken!,
        refreshToken: result.data!.refreshToken ?? '',
      );
    }
    return result;
  }

  @override
  Future<void> resendOtp(String phone) async {
    await _remoteDataSource.resendOtp(phone);
  }

  @override
  Future<void> resendVerificationEmail() async {
    await _remoteDataSource.resendVerificationEmail();
  }

  @override
  Future<AuthResponseModel> socialLogin(String provider, String token) async {
    final result = await _remoteDataSource.socialLogin(provider, token);
    if (result.success && result.data?.accessToken != null) {
      await _dioClient.saveTokens(
        accessToken: result.data!.accessToken!,
        refreshToken: result.data!.refreshToken ?? '',
      );
    }
    return result;
  }

  @override
  Future<void> logout() async {
    try {
      await _remoteDataSource.logout();
    } finally {
      await _dioClient.clearAllTokens();
    }
  }
}
