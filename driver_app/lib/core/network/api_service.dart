import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_driver/core/constants/api_constants.dart';
import 'package:pharmaworld_driver/core/di/injection.dart';
import 'package:pharmaworld_driver/core/network/dio_client.dart';

final dioClientProvider = Provider<DioClient>((ref) {
  return Injection.dioClient;
});

final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService(dioClient: ref.watch(dioClientProvider));
});

class ApiService {
  final DioClient _dioClient;

  ApiService({required DioClient dioClient}) : _dioClient = dioClient;

  // ──────────────────────────────────────────────
  // AUTH
  // ──────────────────────────────────────────────

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

  Future<Map<String, dynamic>> logout() async {
    final response = await _dioClient.post(
      '${ApiConstants.profile}/logout',
    );
    return response.data;
  }

  Future<Map<String, dynamic>> getProfile() async {
    final response = await _dioClient.get(ApiConstants.profile);
    return response.data;
  }

  // ──────────────────────────────────────────────
  // DELIVERIES
  // ──────────────────────────────────────────────

  Future<Map<String, dynamic>> getDeliveryQueue() async {
    final response = await _dioClient.get(ApiConstants.deliveryQueue);
    return response.data;
  }

  Future<Map<String, dynamic>> acceptDelivery(String deliveryId) async {
    final response = await _dioClient.post(
      ApiConstants.acceptDelivery,
      data: {'deliveryId': deliveryId},
    );
    return response.data;
  }

  Future<Map<String, dynamic>> declineDelivery(String deliveryId) async {
    final response = await _dioClient.post(
      ApiConstants.declineDelivery,
      data: {'deliveryId': deliveryId},
    );
    return response.data;
  }

  Future<Map<String, dynamic>> getActiveDelivery() async {
    final response = await _dioClient.get(ApiConstants.activeDelivery);
    return response.data;
  }

  Future<Map<String, dynamic>> getCompletedDeliveries({
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _dioClient.get(
      ApiConstants.completedDeliveries,
      queryParameters: {'page': page, 'limit': limit},
    );
    return response.data;
  }

  Future<Map<String, dynamic>> getDeliveryById(String id) async {
    final response = await _dioClient.get('${ApiConstants.activeDelivery}/$id');
    return response.data;
  }

  Future<Map<String, dynamic>> updateDeliveryStatus(
    String deliveryId,
    String status,
  ) async {
    final response = await _dioClient.post(
      ApiConstants.updateStatus,
      data: {'deliveryId': deliveryId, 'status': status},
    );
    return response.data;
  }

  Future<Map<String, dynamic>> confirmDelivery(
    String deliveryId, {
    String? photoUrl,
    String? signatureUrl,
  }) async {
    final response = await _dioClient.post(
      ApiConstants.confirmDelivery,
      data: {
        'deliveryId': deliveryId,
        if (photoUrl != null) 'photoUrl': photoUrl,
        if (signatureUrl != null) 'signatureUrl': signatureUrl,
      },
    );
    return response.data;
  }

  Future<Map<String, dynamic>> failDelivery(
    String deliveryId,
    String reason,
  ) async {
    final response = await _dioClient.post(
      ApiConstants.failDelivery,
      data: {'deliveryId': deliveryId, 'reason': reason},
    );
    return response.data;
  }

  Future<Map<String, dynamic>> uploadPhoto(File file) async {
    final formData = FormData.fromMap({
      'photo': await MultipartFile.fromFile(file.path),
    });
    final response = await _dioClient.upload(ApiConstants.uploadPhoto, formData);
    return response.data;
  }

  // ──────────────────────────────────────────────
  // EARNINGS
  // ──────────────────────────────────────────────

  Future<Map<String, dynamic>> getEarnings() async {
    final response = await _dioClient.get(ApiConstants.earnings);
    return response.data;
  }

  Future<Map<String, dynamic>> getEarningsHistory({
    String period = 'daily',
    int page = 1,
  }) async {
    final response = await _dioClient.get(
      ApiConstants.earningsHistory,
      queryParameters: {'period': period, 'page': page},
    );
    return response.data;
  }

  Future<Map<String, dynamic>> withdraw(double amount, String method) async {
    final response = await _dioClient.post(
      ApiConstants.withdraw,
      data: {'amount': amount, 'method': method},
    );
    return response.data;
  }

  // ──────────────────────────────────────────────
  // HOME / DASHBOARD
  // ──────────────────────────────────────────────

  Future<Map<String, dynamic>> getDashboardStats() async {
    final response = await _dioClient.get(ApiConstants.activeDelivery);
    return response.data;
  }

  Future<Map<String, dynamic>> toggleOnline(bool isOnline) async {
    final response = await _dioClient.post(
      ApiConstants.toggleOnline,
      data: {'isOnline': isOnline},
    );
    return response.data;
  }

  // ──────────────────────────────────────────────
  // PROFILE
  // ──────────────────────────────────────────────

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final response = await _dioClient.put(
      ApiConstants.updateProfile,
      data: data,
    );
    return response.data;
  }

  Future<Map<String, dynamic>> getStatistics() async {
    final response = await _dioClient.get(ApiConstants.statistics);
    return response.data;
  }

  // ──────────────────────────────────────────────
  // LOCATION
  // ──────────────────────────────────────────────

  Future<Map<String, dynamic>> updateLocation({
    required double latitude,
    required double longitude,
  }) async {
    final response = await _dioClient.post(
      ApiConstants.toggleOnline,
      data: {'latitude': latitude, 'longitude': longitude},
    );
    return response.data;
  }

  // ──────────────────────────────────────────────
  // SETTINGS
  // ──────────────────────────────────────────────

  Future<Map<String, dynamic>> getSettings() async {
    final response = await _dioClient.get(ApiConstants.settings);
    return response.data;
  }

  Future<Map<String, dynamic>> updateSettings(
    Map<String, dynamic> data,
  ) async {
    final response = await _dioClient.put(
      ApiConstants.updateSettings,
      data: data,
    );
    return response.data;
  }

  // ──────────────────────────────────────────────
  // DOCUMENTS
  // ──────────────────────────────────────────────

  Future<Map<String, dynamic>> getDocuments() async {
    final response = await _dioClient.get(ApiConstants.documents);
    return response.data;
  }

  Future<Map<String, dynamic>> uploadDocument(Map<String, dynamic> data) async {
    final response = await _dioClient.post(
      ApiConstants.uploadDocument,
      data: data,
    );
    return response.data;
  }
}
