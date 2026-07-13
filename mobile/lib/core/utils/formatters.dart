import 'package:intl/intl.dart';

class AppFormatters {
  AppFormatters._();

  static String formatDate(DateTime date, {String format = 'MMM dd, yyyy'}) {
    return DateFormat(format).format(date);
  }

  static String formatDateTime(DateTime date,
      {String format = 'MMM dd, yyyy HH:mm'}) {
    return DateFormat(format).format(date);
  }

  static String formatTime(DateTime date, {String format = 'HH:mm'}) {
    return DateFormat(format).format(date);
  }

  static String formatRelative(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inSeconds < 60) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes} min ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else if (difference.inDays < 30) {
      return '${(difference.inDays / 7).floor()}w ago';
    } else if (difference.inDays < 365) {
      return '${(difference.inDays / 30).floor()}mo ago';
    } else {
      return formatDate(date);
    }
  }

  static String formatCurrency(double amount,
      {String currency = 'EGP', String locale = 'en'}) {
    return NumberFormat.currency(
      symbol: _getCurrencySymbol(currency),
      decimalDigits: 2,
      locale: locale,
    ).format(amount);
  }

  static String formatNumber(num number, {int decimals = 0, String locale = 'en'}) {
    return NumberFormat.decimalPattern(locale).format(
      decimals > 0
          ? number.toDouble().toStringAsFixed(decimals)
          : number.toInt(),
    );
  }

  static String formatCompactNumber(num number) {
    if (number >= 1000000) {
      return '${(number / 1000000).toStringAsFixed(1)}M';
    } else if (number >= 1000) {
      return '${(number / 1000).toStringAsFixed(1)}K';
    }
    return number.toString();
  }

  static String formatPhoneNumber(String phone, {String countryCode = '+20'}) {
    if (phone.startsWith(countryCode)) {
      final number = phone.substring(countryCode.length);
      return '$countryCode ${number.substring(0, min(3, number.length))} ${number.substring(min(3, number.length), min(7, number.length))} ${number.substring(min(7, number.length))}';
    }
    return phone;
  }

  static String formatCardNumber(String cardNumber) {
    final cleaned = cardNumber.replaceAll(RegExp(r'\s'), '');
    final buffer = StringBuffer();
    for (int i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 == 0) buffer.write(' ');
      buffer.write(cleaned[i]);
    }
    return buffer.toString();
  }

  static String formatExpiry(String expiry) {
    if (expiry.length == 4) {
      return '${expiry.substring(0, 2)}/${expiry.substring(2)}';
    }
    return expiry;
  }

  static String _getCurrencySymbol(String currency) {
    switch (currency) {
      case 'USD':
        return '\$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'EGP':
        return 'E£';
      case 'SAR':
        return 'SR';
      case 'AED':
        return 'AED';
      default:
        return currency;
    }
  }

  static int min(int a, int b) => a < b ? a : b;
}
