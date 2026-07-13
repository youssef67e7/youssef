import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../constants/storage.dart';

class AuthInterceptor extends Interceptor {
  final Dio _dio;
  bool _isRefreshing = false;

  AuthInterceptor(this._dio);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(StorageKeys.token);
    if (token != null && !options.path.contains('auth/login')) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401 && !_isRefreshing) {
      _isRefreshing = true;
      final prefs = await SharedPreferences.getInstance();
      try {
        final refreshToken = prefs.getString(StorageKeys.refreshToken);
        if (refreshToken != null) {
          final response = await _dio.post('/v1/super-admin/auth/refresh',
              data: {'refreshToken': refreshToken});
          final newToken = response.data['token'];
          await prefs.setString(StorageKeys.token, newToken);
          err.requestOptions.headers['Authorization'] = 'Bearer $newToken';
          final retryResponse = await _dio.fetch(err.requestOptions);
          _isRefreshing = false;
          handler.resolve(retryResponse);
          return;
        }
      } catch (_) {
        await prefs.remove(StorageKeys.token);
        await prefs.remove(StorageKeys.refreshToken);
      }
      _isRefreshing = false;
    }
    handler.next(err);
  }
}
