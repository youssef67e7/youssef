class Logger {
  Logger._();

  static void debug(String message) {
    // ignore: avoid_print
    print('[DEBUG] $message');
  }

  static void info(String message) {
    // ignore: avoid_print
    print('[INFO] $message');
  }

  static void warning(String message) {
    // ignore: avoid_print
    print('[WARNING] $message');
  }

  static void error(String message) {
    // ignore: avoid_print
    print('[ERROR] $message');
  }
}
