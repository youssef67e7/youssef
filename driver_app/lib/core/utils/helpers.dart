import 'package:flutter/material.dart';
import 'package:pharmaworld_driver/core/localization/app_localizations.dart';

class Helpers {
  Helpers._();

  static AppLocalizations? l10n(BuildContext context) {
    return AppLocalizations.of(context);
  }

  static String getStatusText(BuildContext context, String status) {
    final l10n = AppLocalizations.of(context);
    switch (status) {
      case 'ASSIGNED':
        return 'Assigned';
      case 'ACCEPTED':
        return l10n?.accepted ?? 'Accepted';
      case 'PICKING_UP':
        return 'Picking Up';
      case 'PICKED_UP':
        return l10n?.pickedUp ?? 'Picked Up';
      case 'DELIVERING':
        return 'Out for Delivery';
      case 'DELIVERED':
        return l10n?.delivered ?? 'Delivered';
      case 'FAILED':
        return l10n?.failed ?? 'Failed';
      default:
        return status;
    }
  }

  static String getFailureReasonText(BuildContext context, String reason) {
    switch (reason) {
      case 'UNAVAILABLE':
        return 'Customer Unavailable';
      case 'WRONG_ADDRESS':
        return 'Wrong Address';
      case 'REFUSED':
        return 'Customer Refused';
      case 'OTHER':
        return 'Other';
      default:
        return reason;
    }
  }

  static IconData getStatusIcon(String status) {
    switch (status) {
      case 'ASSIGNED':
        return Icons.assignment;
      case 'ACCEPTED':
        return Icons.check_circle_outline;
      case 'PICKING_UP':
        return Icons.location_on_outlined;
      case 'PICKED_UP':
        return Icons.inventory_2;
      case 'DELIVERING':
        return Icons.local_shipping_outlined;
      case 'DELIVERED':
        return Icons.check_circle;
      case 'FAILED':
        return Icons.cancel_outlined;
      default:
        return Icons.help_outline;
    }
  }

  static IconData getEarningIcon(String type) {
    switch (type) {
      case 'BASE_FEE':
        return Icons.attach_money;
      case 'TIP':
        return Icons.volunteer_activism;
      case 'BONUS':
        return Icons.star;
      default:
        return Icons.payments;
    }
  }
}
