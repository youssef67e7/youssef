import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../constants/app_colors.dart';
import '../constants/app_sizes.dart';

class AppHelpers {
  AppHelpers._();

  static String formatDate(DateTime date) {
    return DateFormat('MMM dd, yyyy').format(date);
  }

  static String formatDateTime(DateTime date) {
    return DateFormat('MMM dd, yyyy HH:mm').format(date);
  }

  static String formatCurrency(double amount, {String currency = 'EGP'}) {
    final formatter = NumberFormat.currency(
      symbol: currency == 'EGP' ? 'E£' : currency,
      decimalDigits: 2,
    );
    return formatter.format(amount);
  }

  static double calculateDiscount(double originalPrice, double salePrice) {
    if (originalPrice <= 0) return 0;
    return ((originalPrice - salePrice) / originalPrice) * 100;
  }

  static Color getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return AppColors.pendingColor;
      case 'confirmed':
        return AppColors.confirmedColor;
      case 'processing':
        return AppColors.processingColor;
      case 'shipped':
      case 'out_for_delivery':
        return AppColors.shippedColor;
      case 'delivered':
        return AppColors.deliveredColor;
      case 'cancelled':
        return AppColors.cancelledColor;
      default:
        return AppColors.textSecondaryLight;
    }
  }

  static IconData getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return Icons.access_time;
      case 'confirmed':
        return Icons.check_circle_outline;
      case 'processing':
        return Icons.inventory_2_outlined;
      case 'shipped':
      case 'out_for_delivery':
        return Icons.local_shipping_outlined;
      case 'delivered':
        return Icons.check_circle;
      case 'cancelled':
        return Icons.cancel;
      default:
        return Icons.help_outline;
    }
  }

  static String getTranslatedStatus(String status, BuildContext context) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      case 'returned':
        return 'Returned';
      default:
        return status;
    }
  }

  static void hideKeyboard(BuildContext context) {
    FocusScope.of(context).unfocus();
  }

  static String generateOrderId() {
    final now = DateTime.now();
    return 'PW${now.year}${now.month.toString().padLeft(2, '0')}${now.day.toString().padLeft(2, '0')}${now.hour.toString().padLeft(2, '0')}${now.minute.toString().padLeft(2, '0')}${now.second.toString().padLeft(2, '0')}';
  }

  static double calculateTotal({
    required double subtotal,
    double discount = 0,
    double deliveryFee = 0,
    double taxRate = 0.14,
  }) {
    final tax = (subtotal - discount) * taxRate;
    return subtotal - discount + deliveryFee + tax;
  }

  static String getInitials(String name) {
    if (name.isEmpty) return '';
    final parts = name.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  static String maskEmail(String email) {
    if (email.isEmpty) return email;
    final parts = email.split('@');
    if (parts.length != 2) return email;
    final name = parts[0];
    if (name.length <= 2) return '${name[0]}***@${parts[1]}';
    return '${name.substring(0, 2)}***@${parts[1]}';
  }

  static String maskPhone(String phone) {
    if (phone.length <= 4) return phone;
    return '${phone.substring(0, 3)}****${phone.substring(phone.length - 3)}';
  }

  static int? parseInt(String? value) {
    if (value == null) return null;
    return int.tryParse(value);
  }

  static double? parseDouble(String? value) {
    if (value == null) return null;
    return double.tryParse(value);
  }
}
