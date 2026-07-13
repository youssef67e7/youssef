import 'package:pharmaworld_driver/core/network/dio_client.dart';
import 'package:pharmaworld_driver/core/constants/api_constants.dart';

class HomeService {
  final DioClient _dioClient;

  HomeService({required DioClient dioClient}) : _dioClient = dioClient;

  Future<Map<String, dynamic>> getActiveDelivery() async {
    final response = await _dioClient.get(ApiConstants.activeDelivery);
    return response.data;
  }

  Future<Map<String, dynamic>> getDashboard() async {
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

  Future<Map<String, dynamic>> getStatistics() async {
    final response = await _dioClient.get(ApiConstants.statistics);
    return response.data;
  }
}
