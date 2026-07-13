import 'package:dio/dio.dart';

class ApiException implements Exception {
  final int? statusCode;
  final String message;
  final String? details;
  final dynamic data;

  ApiException({
    this.statusCode,
    required this.message,
    this.details,
    this.data,
  });

  factory ApiException.fromDioError(DioException dioError) {
    switch (dioError.type) {
      case DioExceptionType.connectionTimeout:
        return ApiException(
          message: 'Connection timeout. Please check your internet connection.',
          statusCode: 408,
        );
      case DioExceptionType.sendTimeout:
        return ApiException(
          message: 'Send timeout. Please try again.',
          statusCode: 408,
        );
      case DioExceptionType.receiveTimeout:
        return ApiException(
          message: 'Receive timeout. Please try again.',
          statusCode: 408,
        );
      case DioExceptionType.badResponse:
        return _handleBadResponse(dioError);
      case DioExceptionType.cancel:
        return ApiException(
          message: 'Request was cancelled.',
          statusCode: 499,
        );
      case DioExceptionType.connectionError:
        return ApiException(
          message: 'No internet connection. Please check your network.',
          statusCode: 503,
        );
      case DioExceptionType.badCertificate:
        return ApiException(
          message: 'Certificate verification failed.',
          statusCode: 495,
        );
      case DioExceptionType.unknown:
        return ApiException(
          message: 'An unexpected error occurred. Please try again.',
          details: dioError.message,
        );
    }
  }

  static ApiException _handleBadResponse(DioException dioError) {
    final statusCode = dioError.response?.statusCode;
    final data = dioError.response?.data;

    String message;

    switch (statusCode) {
      case 400:
        message = data?['message'] ?? 'Bad request. Please check your input.';
        break;
      case 401:
        message = 'Authentication failed. Please login again.';
        break;
      case 403:
        message = 'You don\'t have permission to perform this action.';
        break;
      case 404:
        message = data?['message'] ?? 'Resource not found.';
        break;
      case 409:
        message = data?['message'] ?? 'Conflict occurred.';
        break;
      case 422:
        message = data?['message'] ?? 'Validation error. Please check your input.';
        break;
      case 429:
        message = 'Too many requests. Please try again later.';
        break;
      case 500:
        message = 'Internal server error. Please try again later.';
        break;
      case 502:
        message = 'Bad gateway. Please try again later.';
        break;
      case 503:
        message = 'Service unavailable. Please try again later.';
        break;
      default:
        message = data?['message'] ?? 'An error occurred ($statusCode).';
    }

    return ApiException(
      statusCode: statusCode,
      message: message,
      data: data,
    );
  }

  @override
  String toString() {
    return 'ApiException(statusCode: $statusCode, message: $message)';
  }
}
