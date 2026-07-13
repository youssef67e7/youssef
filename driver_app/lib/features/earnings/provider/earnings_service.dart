import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_driver/core/di/injection.dart';
import 'package:pharmaworld_driver/core/network/dio_client.dart';
import 'package:pharmaworld_driver/core/constants/api_constants.dart';

final earningsServiceProvider = Provider((ref) {
  return EarningsService(dioClient: ref.watch(dioClientProvider));
});

final dioClientProvider = Provider((ref) {
  return Injection.dioClient;
});

class EarningsService {
  final DioClient _dioClient;

  EarningsService({required DioClient dioClient}) : _dioClient = dioClient;

  Future<Map<String, dynamic>> getEarnings() async {
    final response = await _dioClient.get(ApiConstants.earnings);
    return response.data;
  }

  Future<Map<String, dynamic>> getEarningsHistory({String period = 'daily', int page = 1}) async {
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
}
