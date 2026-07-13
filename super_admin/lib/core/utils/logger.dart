import 'package:flutter/foundation.dart';

class Log {
  Log._();

  static void d(String message) {
    if (kDebugMode) {
      debugPrint('[DEBUG] $message');
    }
  }

  static void i(String message) {
    if (kDebugMode) {
      debugPrint('[INFO] $message');
    }
  }

  static void w(String message) {
    if (kDebugMode) {
      debugPrint('[WARN] $message');
    }
  }

  static void e(String message, [dynamic error, StackTrace? stackTrace]) {
    if (kDebugMode) {
      debugPrint('[ERROR] $message');
      if (error != null) debugPrint('  Error: $error');
      if (stackTrace != null) debugPrint('  Stack: $stackTrace');
    }
  }

  static void network(String method, String url, {dynamic data, int? statusCode}) {
    if (kDebugMode) {
      debugPrint('[NET] $method $url ${statusCode != null ? '($statusCode)' : ''}');
    }
  }
}
