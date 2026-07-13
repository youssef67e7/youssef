import 'package:dio/dio.dart';
import 'package:pharmaworld_dashboard/core/utils/logger.dart';

class LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    Logger.debug('--> ${options.method} ${options.uri}');
    Logger.debug('Headers: ${options.headers}');
    if (options.data != null) {
      Logger.debug('Body: ${options.data}');
    }
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    Logger.debug(
        '<-- ${response.statusCode} ${response.requestOptions.uri}');
    Logger.debug('Response: ${response.data}');
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    Logger.error(
        '<-- ERROR ${err.response?.statusCode} ${err.requestOptions.uri}');
    Logger.error('Error: ${err.message}');
    handler.next(err);
  }
}
