import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/dio_client.dart';
import '../models/auth_models.dart';

abstract class AuthRemoteDataSource {
  Future<AuthResponseModel> login(String email, String password);
  Future<AuthResponseModel> register(RegisterRequestModel request);
  Future<void> forgotPassword(String email);
  Future<void> resetPassword(String token, String password, String passwordConfirmation);
  Future<void> verifyEmail(String token);
  Future<void> verifyPhone(String phone);
  Future<AuthResponseModel> verifyOtp(String otp);
  Future<void> resendOtp(String phone);
  Future<void> resendVerificationEmail();
  Future<AuthResponseModel> socialLogin(String provider, String token);
  Future<void> updateFcmToken(String token);
  Future<void> logout();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final DioClient _dioClient;

  AuthRemoteDataSourceImpl({required DioClient dioClient})
      : _dioClient = dioClient;

  @override
  Future<AuthResponseModel> login(String email, String password) async {
    final response = await _dioClient.post(
      ApiConstants.login,
      data: {
        'email': email,
        'password': password,
      },
    );
    return AuthResponseModel.fromJson(response.data);
  }

  @override
  Future<AuthResponseModel> register(RegisterRequestModel request) async {
    final response = await _dioClient.post(
      ApiConstants.register,
      data: request.toJson(),
    );
    return AuthResponseModel.fromJson(response.data);
  }

  @override
  Future<void> forgotPassword(String email) async {
    await _dioClient.post(
      ApiConstants.forgotPassword,
      data: {'email': email},
    );
  }

  @override
  Future<void> resetPassword(
    String token,
    String password,
    String passwordConfirmation,
  ) async {
    await _dioClient.post(
      ApiConstants.resetPassword,
      data: {
        'token': token,
        'password': password,
        'password_confirmation': passwordConfirmation,
      },
    );
  }

  @override
  Future<void> verifyEmail(String token) async {
    await _dioClient.post(
      ApiConstants.verifyEmail,
      data: {'token': token},
    );
  }

  @override
  Future<void> verifyPhone(String phone) async {
    await _dioClient.post(
      ApiConstants.verifyPhone,
      data: {'phone': phone},
    );
  }

  @override
  Future<AuthResponseModel> verifyOtp(String otp) async {
    final response = await _dioClient.post(
      ApiConstants.verifyOtp,
      data: {'otp': otp},
    );
    return AuthResponseModel.fromJson(response.data);
  }

  @override
  Future<void> resendOtp(String phone) async {
    await _dioClient.post(
      ApiConstants.resendOtp,
      data: {'phone': phone},
    );
  }

  @override
  Future<void> resendVerificationEmail() async {
    await _dioClient.post(ApiConstants.verifyEmail);
  }

  @override
  Future<AuthResponseModel> socialLogin(String provider, String token) async {
    final response = await _dioClient.post(
      ApiConstants.socialLogin,
      data: {
        'provider': provider,
        'token': token,
      },
    );
    return AuthResponseModel.fromJson(response.data);
  }

  @override
  Future<void> updateFcmToken(String token) async {
    await _dioClient.post(
      ApiConstants.updateFcmToken,
      data: {'fcm_token': token},
    );
  }

  @override
  Future<void> logout() async {
    await _dioClient.post(ApiConstants.logout);
  }
}
