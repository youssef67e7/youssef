import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';
import 'package:pharmaworld_dashboard/core/network/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:pharmaworld_dashboard/core/network/dio_provider.dart';

final getIt = GetIt.instance;

void setupServiceLocator() {
  getIt.registerLazySingletonAsync<Dio>(() async {
    final dio = DioClient.createDio();
    return dio;
  });

  getIt.registerLazySingletonAsync<ApiService>(() async {
    final dio = await getIt.getAsync<Dio>();
    return ApiService(dio);
  });

  getIt.registerLazySingletonAsync<SharedPreferences>(
      () => SharedPreferences.getInstance());
}
