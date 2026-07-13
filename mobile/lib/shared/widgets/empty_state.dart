import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:lottie/lottie.dart';

import '../../core/constants/app_sizes.dart';
import 'custom_button.dart';

class EmptyState extends StatelessWidget {
  final String? title;
  final String? subtitle;
  final String? buttonText;
  final VoidCallback? onButtonPressed;
  final EmptyStateType type;
  final Widget? customIcon;

  const EmptyState({
    super.key,
    this.title,
    this.subtitle,
    this.buttonText,
    this.onButtonPressed,
    this.type = EmptyStateType.noData,
    this.customIcon,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: EdgeInsets.all(AppSizes.paddingLarge.r),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            customIcon ?? _buildIcon(theme),
            SizedBox(height: AppSizes.spacingLarge.h),
            Text(
              title ?? _getDefaultTitle(),
              style: theme.textTheme.headlineSmall,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: AppSizes.spacingSmall.h),
            if (subtitle != null)
              Text(
                subtitle!,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
            if (buttonText != null && onButtonPressed != null) ...[
              SizedBox(height: AppSizes.spacingLarge.h),
              CustomButton(
                text: buttonText!,
                onPressed: onButtonPressed,
                isExpanded: false,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildIcon(ThemeData theme) {
    IconData iconData;
    switch (type) {
      case EmptyStateType.noData:
        iconData = Icons.inbox_outlined;
        break;
      case EmptyStateType.noConnection:
        iconData = Icons.cloud_off_outlined;
        break;
      case EmptyStateType.error:
        iconData = Icons.error_outline;
        break;
      case EmptyStateType.emptyCart:
        iconData = Icons.shopping_cart_outlined;
        break;
      case EmptyStateType.emptyWishlist:
        iconData = Icons.favorite_border;
        break;
      case EmptyStateType.emptyOrders:
        iconData = Icons.receipt_long_outlined;
        break;
      case EmptyStateType.noSearchResults:
        iconData = Icons.search_off_outlined;
        break;
      case EmptyStateType.noNotifications:
        iconData = Icons.notifications_none_outlined;
        break;
    }

    return Container(
      width: 120.r,
      height: 120.r,
      decoration: BoxDecoration(
        color: theme.colorScheme.primaryContainer.withOpacity(0.3),
        shape: BoxShape.circle,
      ),
      child: Icon(
        iconData,
        size: 64.r,
        color: theme.colorScheme.primary.withOpacity(0.5),
      ),
    );
  }

  String _getDefaultTitle() {
    switch (type) {
      case EmptyStateType.noData:
        return 'No data available';
      case EmptyStateType.noConnection:
        return 'No internet connection';
      case EmptyStateType.error:
        return 'Something went wrong';
      case EmptyStateType.emptyCart:
        return 'Your cart is empty';
      case EmptyStateType.emptyWishlist:
        return 'Your wishlist is empty';
      case EmptyStateType.emptyOrders:
        return 'You have no orders yet';
      case EmptyStateType.noSearchResults:
        return 'No results found';
      case EmptyStateType.noNotifications:
        return 'No notifications';
    }
  }
}

enum EmptyStateType {
  noData,
  noConnection,
  error,
  emptyCart,
  emptyWishlist,
  emptyOrders,
  noSearchResults,
  noNotifications,
}
