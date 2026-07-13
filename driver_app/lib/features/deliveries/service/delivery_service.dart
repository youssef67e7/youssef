import 'dart:io';
import 'package:dio/dio.dart';
import 'package:pharmaworld_driver/core/network/dio_client.dart';
import 'package:pharmaworld_driver/core/constants/api_constants.dart';

class DeliveryService {
  final DioClient _dioClient;

  DeliveryService({required DioClient dioClient}) : _dioClient = dioClient;

  Future<Map<String, dynamic>> getActiveDelivery() async {
    final response = await _dioClient.get(ApiConstants.activeDelivery);
    return response.data;
  }

  Future<Map<String, dynamic>> getDeliveryQueue() async {
    final response = await _dioClient.get(ApiConstants.deliveryQueue);
    return response.data;
  }

  Future<Map<String, dynamic>> getCompletedDeliveries({int page = 1, int limit = 20}) async {
    final response = await _dioClient.get(
      ApiConstants.completedDeliveries,
      queryParameters: {'page': page, 'limit': limit},
    );
    return response.data;
  }

  Future<Map<String, dynamic>> getDeliveryDetail(String id) async {
    final response = await _dioClient.get('${ApiConstants.activeDelivery}/$id');
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

  Future<Map<String, dynamic>> updateStatus(String deliveryId, String status) async {
    final response = await _dioClient.post(
      ApiConstants.updateStatus,
      data: {'deliveryId': deliveryId, 'status': status},
    );
    return response.data;
  }

  Future<Map<String, dynamic>> confirmDelivery(String deliveryId, {String? photoUrl, String? signatureUrl}) async {
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

  Future<Map<String, dynamic>> failDelivery(String deliveryId, String reason) async {
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
}
