extension StringExtension on String {
  String get capitalize {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }

  String get capitalizeAll {
    if (isEmpty) return this;
    return split(' ').map((word) => word.capitalize).join(' ');
  }

  String get trimAll => replaceAll(RegExp(r'\s+'), ' ').trim();

  bool get isValidEmail {
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    return emailRegex.hasMatch(trim());
  }

  bool get isValidPhone {
    final phoneRegex = RegExp(r'^[+]?[0-9]{10,15}$');
    return phoneRegex.hasMatch(replaceAll(RegExp(r'[\s\-()]'), ''));
  }

  bool get isNumeric {
    return double.tryParse(this) != null;
  }

  String get removeHtml {
    return replaceAll(RegExp(r'<[^>]*>'), '');
  }

  String truncate(int maxLength, {String suffix = '...'}) {
    if (length <= maxLength) return this;
    return '${substring(0, maxLength)}$suffix';
  }

  String get toArabicNumbers {
    return replaceAll('0', '٠')
        .replaceAll('1', '١')
        .replaceAll('2', '٢')
        .replaceAll('3', '٣')
        .replaceAll('4', '٤')
        .replaceAll('5', '٥')
        .replaceAll('6', '٦')
        .replaceAll('7', '٧')
        .replaceAll('8', '٨')
        .replaceAll('9', '٩');
  }

  String get toEnglishNumbers {
    return replaceAll('٠', '0')
        .replaceAll('١', '1')
        .replaceAll('٢', '2')
        .replaceAll('٣', '3')
        .replaceAll('٤', '4')
        .replaceAll('٥', '5')
        .replaceAll('٦', '6')
        .replaceAll('٧', '7')
        .replaceAll('٨', '8')
        .replaceAll('٩', '9');
  }

  bool get isSvg {
    return toLowerCase().endsWith('.svg');
  }

  bool get isImageUrl {
    final imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    return imageExtensions.any((ext) => toLowerCase().endsWith(ext));
  }
}

extension DateTimeExtension on DateTime {
  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(this);

    if (difference.inSeconds < 60) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else if (difference.inDays < 30) {
      return '${(difference.inDays / 7).floor()}w ago';
    } else if (difference.inDays < 365) {
      return '${(difference.inDays / 30).floor()}mo ago';
    } else {
      return '${(difference.inDays / 365).floor()}y ago';
    }
  }

  bool get isToday {
    final now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }

  bool get isYesterday {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return year == yesterday.year &&
        month == yesterday.month &&
        day == yesterday.day;
  }

  bool get isThisWeek {
    final now = DateTime.now();
    final startOfWeek = now.subtract(Duration(days: now.weekday - 1));
    return isAfter(startOfWeek);
  }

  bool get isThisMonth {
    final now = DateTime.now();
    return year == now.year && month == now.month;
  }

  bool get isThisYear {
    return year == DateTime.now().year;
  }

  DateTime get startOfDay => DateTime(year, month, day);
  DateTime get endOfDay => DateTime(year, month, day, 23, 59, 59, 999);

  bool get isExpired => isBefore(DateTime.now());
}

extension DoubleExtension on double {
  String get toFixed2 => toStringAsFixed(2);
  String get toFixed1 => toStringAsFixed(1);

  String get toPrice => 'E£${toStringAsFixed(2)}';

  bool get isWholeNumber => this == truncateToDouble();

  double get abs => this < 0 ? -this : this;

  double clampValue(double min, double max) {
    if (this < min) return min;
    if (this > max) return max;
    return this;
  }
}

extension NumExtension on num {
  String get toFixed2 => toStringAsFixed(2);
  String get toFixed1 => toStringAsFixed(1);

  bool get isNegative => this < 0;
  bool get isPositive => this > 0;
  bool get isZero => this == 0;
}

extension ListExtension<T> on List<T> {
  T? get firstOrNull => isEmpty ? null : first;
  T? get lastOrNull => isEmpty ? null : last;

  List<T> separatedBy(T separator) {
    if (isEmpty) return [];
    final result = <T>[];
    for (int i = 0; i < length; i++) {
      result.add(this[i]);
      if (i < length - 1) {
        result.add(separator);
      }
    }
    return result;
  }

  List<List<T>> chunked(int size) {
    final chunks = <List<T>>[];
    for (int i = 0; i < length; i += size) {
      chunks.add(sublist(i, (i + size).clamp(0, length)));
    }
    return chunks;
  }
}

extension MapExtension<K, V> on Map<K, V> {
  Map<K, V> get nonNullValues =>
      Map<K, V>.fromEntries(entries.where((e) => e.value != null));
}
