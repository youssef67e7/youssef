import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Primary
  static const Color primaryLight = Color(0xFF1B5E20);
  static const Color primaryDark = Color(0xFF66BB6A);
  static const Color primary = Color(0xFF2E7D32);

  // Secondary
  static const Color secondaryLight = Color(0xFF00695C);
  static const Color secondaryDark = Color(0xFF4DB6AC);

  // Background
  static const Color backgroundLight = Color(0xFFF5F5F5);
  static const Color backgroundDark = Color(0xFF121212);
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color surfaceDark = Color(0xFF1E1E1E);

  // Error
  static const Color errorLight = Color(0xFFD32F2F);
  static const Color errorDark = Color(0xFFEF5350);

  // Success
  static const Color successLight = Color(0xFF388E3C);
  static const Color successDark = Color(0xFF66BB6A);

  // Warning
  static const Color warningLight = Color(0xFFF57C00);
  static const Color warningDark = Color(0xFFFFB74D);

  // Info
  static const Color infoLight = Color(0xFF1976D2);
  static const Color infoDark = Color(0xFF64B5F6);

  // Chart Colors
  static const List<Color> chartColors = [
    Color(0xFF2E7D32),
    Color(0xFF1565C0),
    Color(0xFFF57C00),
    Color(0xFFD32F2F),
    Color(0xFF7B1FA2),
    Color(0xFF00838F),
    Color(0xFF5D4037),
    Color(0xFF455A64),
  ];

  // Status Colors
  static const Map<String, Color> orderStatusColors = {
    'pending': Color(0xFFFFA726),
    'confirmed': Color(0xFF42A5F5),
    'preparing': Color(0xFFAB47BC),
    'ready': Color(0xFF66BB6A),
    'out_for_delivery': Color(0xFF26C6DA),
    'delivered': Color(0xFF388E3C),
    'cancelled': Color(0xFFEF5350),
    'returned': Color(0xFF8D6E63),
  };

  // Sidebar
  static const Color sidebarLight = Color(0xFFFFFFFF);
  static const Color sidebarDark = Color(0xFF1A1A2E);
  static const Color sidebarSelectedLight = Color(0xFFE8F5E9);
  static const Color sidebarSelectedDark = Color(0xFF2E7D32);
  static const Color sidebarHoverLight = Color(0xFFF5F5F5);
  static const Color sidebarHoverDark = Color(0xFF2A2A3E);

  // Table
  static const Color tableHeaderLight = Color(0xFFF5F5F5);
  static const Color tableHeaderDark = Color(0xFF2A2A2A);
  static const Color tableRowEvenLight = Color(0xFFFFFFFF);
  static const Color tableRowEvenDark = Color(0xFF1E1E1E);
  static const Color tableRowOddLight = Color(0xFFFAFAFA);
  static const Color tableRowOddDark = Color(0xFF252525);
}
