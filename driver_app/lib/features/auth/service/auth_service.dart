import 'package:pharmaworld_driver/core/constants/api_constants.dart';
import 'package:pharmaworld_driver/core/network/dio_client.dart';

class AuthService {
  final DioClient _dioClient;

  AuthService({required DioClient dioClient}) : _dioClient = dioClient;

  Future<Map<String, dynamic>> login(String phone) async {
    final response = await _dioClient.post(
      ApiConstants.login,
      data: {'phone': phone},
    );
    return response.data;
  }

  Future<Map<String, dynamic>> verifyOtp(String phone, String otp) async {
    final response = await _dioClient.post(
      ApiConstants.verifyOtp,
      data: {'phone': phone, 'otp': otp},
    );
    return response.data;
  }

  Future<Map<String, dynamic>> resendOtp(String phone) async {
    final response = await _dioClient.post(
      ApiConstants.resendOtp,
      data: {'phone': phone},
    );
    return response.data;
  }

  Future<Map<String, dynamic>> getProfile() async {
    final response = await _dioClient.get(ApiConstants.profile);
    return response.data;
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final response = await _dioClient.put(
      ApiConstants.updateProfile,
      data: data,
    );
    return response.data;
  }
}
