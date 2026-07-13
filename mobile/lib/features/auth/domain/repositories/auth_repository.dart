import '../datasources/auth_remote_datasource.dart';
import '../models/auth_models.dart';

abstract class AuthRepository {
  Future<AuthResponseModel> login(String email, String password);
  Future<AuthResponseModel> register(RegisterRequestModel request);
  Future<void> forgotPassword({required String email});
  Future<void> resetPassword({
    required String token,
    required String password,
    required String passwordConfirmation,
  });
  Future<void> verifyEmail(String token);
  Future<void> verifyPhone(String phone);
  Future<AuthResponseModel> verifyOtp(String otp);
  Future<void> resendOtp(String phone);
  Future<void> resendVerificationEmail();
  Future<AuthResponseModel> socialLogin(String provider, String token);
  Future<void> logout();
}
