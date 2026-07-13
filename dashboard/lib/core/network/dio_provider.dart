import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/core/constants/app_constants.dart';
import 'package:pharmaworld_dashboard/core/network/dio_client.dart';
import 'package:pharmaworld_dashboard/core/network/auth_interceptor.dart';
import 'package:pharmaworld_dashboard/core/network/logging_interceptor.dart';
import 'package:shared_preferences/shared_preferences.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = DioClient.createDio();
  dio.interceptors.addAll([
    AuthInterceptor(ref: ref),
    LoggingInterceptor(),
  ]);
  return dio;
});

final sharedPreferencesProvider = FutureProvider<SharedPreferences>((ref) async {
  return await SharedPreferences.getInstance();
});

class DioClient {
  static Dio createDio() {
    final dio = Dio(
      BaseOptions(
        baseUrl: '${AppConstants.baseUrl}${AppConstants.apiVersion}',
        connectTimeout: AppConstants.timeout,
        receiveTimeout: AppConstants.timeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );
    return dio;
  }
}
