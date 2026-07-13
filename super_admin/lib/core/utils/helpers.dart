import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class Helpers {
  Helpers._();

  static void showSnackBar(BuildContext context, String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(message),
      backgroundColor: isError ? Colors.red : Colors.green,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      duration: const Duration(seconds: 3),
    ));
  }

  static void showSuccessSnackBar(BuildContext context, String message) {
    showSnackBar(context, message, isError: false);
  }

  static void showErrorSnackBar(BuildContext context, String message) {
    showSnackBar(context, message, isError: true);
  }

  static double parseDouble(dynamic value, [double fallback = 0]) {
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? fallback;
    return fallback;
  }

  static int parseInt(dynamic value, [int fallback = 0]) {
    if (value is int) return value;
    if (value is double) return value.toInt();
    if (value is String) return int.tryParse(value) ?? fallback;
    return fallback;
  }

  static String formatRelativeTime(DateTime dateTime) {
    final diff = DateTime.now().difference(dateTime);
    if (diff.inSeconds < 60) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return DateFormat('MMM dd, yyyy').format(dateTime);
  }

  static Color getRoleColor(String role) {
    switch (role.toLowerCase()) {
      case 'super_admin': return const Color(0xFFF44336);
      case 'admin': return const Color(0xFF9C27B0);
      case 'pharmacy_owner': return const Color(0xFF4CAF50);
      case 'pharmacy_manager': return const Color(0xFF8BC34A);
      case 'driver': return const Color(0xFFFF9800);
      case 'customer': return const Color(0xFF2196F3);
      default: return const Color(0xFF607D8B);
    }
  }

  static IconData getActionIcon(String action) {
    switch (action.toLowerCase()) {
      case 'create': return Icons.add_circle;
      case 'read': return Icons.visibility;
      case 'update': return Icons.edit;
      case 'delete': return Icons.delete;
      case 'login': return Icons.login;
      case 'logout': return Icons.logout;
      case 'toggle': return Icons.toggle_on;
      default: return Icons.info;
    }
  }

  static Color getHealthColor(double value, {bool inverse = false}) {
    final v = inverse ? (100 - value) : value;
    if (v >= 90) return const Color(0xFF4CAF50);
    if (v >= 70) return const Color(0xFFFFC107);
    if (v >= 50) return const Color(0xFFFF9800);
    return const Color(0xFFF44336);
  }

  static List<double> generateSmoothData(int count, {double min = 0, double max = 100, double variance = 20}) {
    final random = DateTime.now().microsecondsSinceEpoch;
    final data = <double>[];
    var current = (min + max) / 2;
    for (var i = 0; i < count; i++) {
      final step = (((random + i * 137) % 100) / 100 - 0.5) * variance;
      current = (current + step).clamp(min, max).toDouble();
      data.add(current);
    }
    return data;
  }
}
