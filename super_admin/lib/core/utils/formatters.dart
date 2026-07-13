import 'package:intl/intl.dart';

class Formatters {
  Formatters._();

  static final _currencyFormat = NumberFormat.currency(symbol: '\$', decimalDigits: 2);
  static final _compactFormat = NumberFormat.compact();
  static final _percentFormat = NumberFormat.percentPattern();
  static final _dateFormat = DateFormat('MMM dd, yyyy');
  static final _dateTimeFormat = DateFormat('MMM dd, yyyy HH:mm');
  static final _timeFormat = DateFormat('HH:mm:ss');

  static String currency(double value) => _currencyFormat.format(value);
  static String compact(double value) => _compactFormat.format(value);
  static String percent(double value) => _percentFormat.format(value / 100);
  static String date(DateTime date) => _dateFormat.format(date);
  static String dateTime(DateTime date) => _dateTimeFormat.format(date);
  static String time(DateTime date) => _timeFormat.format(date);

  static String fileSize(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    if (bytes < 1024 * 1024 * 1024) {
      return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
    return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
  }

  static String duration(Duration d) {
    if (d.inHours > 0) return '${d.inHours}h ${d.inMinutes % 60}m';
    if (d.inMinutes > 0) return '${d.inMinutes}m ${d.inSeconds % 60}s';
    return '${d.inSeconds}s';
  }

  static String responseTime(double ms) {
    if (ms < 1000) return '${ms.toStringAsFixed(0)}ms';
    return '${(ms / 1000).toStringAsFixed(2)}s';
  }

  static String truncate(String text, int maxLength) {
    if (text.length <= maxLength) return text;
    return '${text.substring(0, maxLength)}...';
  }

  static String maskEmail(String email) {
    final parts = email.split('@');
    if (parts.length != 2) return email;
    final name = parts[0];
    final masked = name.length > 2
        ? '${name[0]}${'*' * (name.length - 2)}${name[name.length - 1]}'
        : name;
    return '$masked@${parts[1]}';
  }
}
