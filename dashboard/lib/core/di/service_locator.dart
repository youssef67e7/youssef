import 'package:dio/dio.dart';
import 'package:pharmaworld_dashboard/core/network/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:pharmaworld_dashboard/core/network/dio_provider.dart';

Dio? _dio;
ApiService? _apiService;
SharedPreferences? _prefs;

Dio get getDio => _dio ??= DioClient.createDio();
ApiService get getApiService => _apiService ??= ApiService(getDio);
SharedPreferences get getPrefs => _prefs!;

Future<void> setupServiceLocator() async {
  _dio = DioClient.createDio();
  _apiService = ApiService(_dio!);
  _prefs = await SharedPreferences.getInstance();
}
