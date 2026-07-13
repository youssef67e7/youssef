import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  static const Color primaryLight = Color(0xFF1B5E20);
  static const Color primaryDark = Color(0xFF66BB6A);
  static const Color secondaryLight = Color(0xFF0277BD);
  static const Color secondaryDark = Color(0xFF4FC3F7);
  static const Color accent = Color(0xFFFF6F00);
  static const Color success = Color(0xFF4CAF50);
  static const Color warning = Color(0xFFFFC107);
  static const Color error = Color(0xFFF44336);
  static const Color info = Color(0xFF2196F3);

  static const Color backgroundLight = Color(0xFFF5F5F5);
  static const Color backgroundDark = Color(0xFF121212);
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color surfaceDark = Color(0xFF1E1E1E);
  static const Color cardLight = Color(0xFFFFFFFF);
  static const Color cardDark = Color(0xFF2C2C2C);

  static const Color textPrimaryLight = Color(0xFF212121);
  static const Color textPrimaryDark = Color(0xFFE0E0E0);
  static const Color textSecondaryLight = Color(0xFF757575);
  static const Color textSecondaryDark = Color(0xFF9E9E9E);

  static const Color sidebarLight = Color(0xFF1B5E20);
  static const Color sidebarDark = Color(0xFF1A1A2E);
  static const Color sidebarItemHoverLight = Color(0xFF2E7D32);
  static const Color sidebarItemHoverDark = Color(0xFF16213E);
  static const Color sidebarItemActiveLight = Color(0xFF388E3C);
  static const Color sidebarItemActiveDark = Color(0xFF0F3460);

  static const Color chartColors = Color(0xFF4CAF50);
  static List<Color> chartPalette = const [
    Color(0xFF4CAF50),
    Color(0xFF2196F3),
    Color(0xFFFFC107),
    Color(0xFFF44336),
    Color(0xFF9C27B0),
    Color(0xFFFF9800),
    Color(0xFF00BCD4),
    Color(0xFFE91E63),
  ];

  static Color getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'active':
      case 'online':
      case 'healthy':
        return success;
      case 'inactive':
      case 'offline':
      case 'error':
        return error;
      case 'pending':
      case 'warning':
        return warning;
      default:
        return info;
    }
  }
}
