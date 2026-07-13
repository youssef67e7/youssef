import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  static const Color primaryLight = Color(0xFF1B5E20);
  static const Color primaryDark = Color(0xFF66BB6A);
  static const Color secondaryLight = Color(0xFFFF8F00);
  static const Color secondaryDark = Color(0xFFFFB74D);

  static const Color success = Color(0xFF4CAF50);
  static const Color warning = Color(0xFFFF9800);
  static const Color error = Color(0xFFF44336);
  static const Color info = Color(0xFF2196F3);

  static const Color online = Color(0xFF4CAF50);
  static const Color offline = Color(0xFF9E9E9E);

  static const Color assigned = Color(0xFF2196F3);
  static const Color accepted = Color(0xFF4CAF50);
  static const Color pickingUp = Color(0xFFFF9800);
  static const Color pickedUp = Color(0xFF9C27B0);
  static const Color delivering = Color(0xFF00BCD4);
  static const Color delivered = Color(0xFF4CAF50);
  static const Color failed = Color(0xFFF44336);

  static Color getStatusColor(String status) {
    switch (status) {
      case 'ASSIGNED':
        return assigned;
      case 'ACCEPTED':
        return accepted;
      case 'PICKING_UP':
        return pickingUp;
      case 'PICKED_UP':
        return pickedUp;
      case 'DELIVERING':
        return delivering;
      case 'DELIVERED':
        return delivered;
      case 'FAILED':
        return failed;
      default:
        return offline;
    }
  }
}
