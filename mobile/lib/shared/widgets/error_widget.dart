import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../core/utils/snackbar_helper.dart';
import 'custom_button.dart';

class AppErrorWidget extends StatelessWidget {
  final String? message;
  final String? title;
  final VoidCallback? onRetry;
  final bool showRetryButton;
  final IconData? icon;

  const AppErrorWidget({
    super.key,
    this.message,
    this.title,
    this.onRetry,
    this.showRetryButton = true,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: EdgeInsets.all(24.r),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon ?? Icons.error_outline,
              size: 64.r,
              color: theme.colorScheme.error.withOpacity(0.7),
            ),
            SizedBox(height: 16.h),
            Text(
              title ?? 'Oops!',
              style: theme.textTheme.headlineSmall?.copyWith(
                color: theme.colorScheme.onSurface,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 8.h),
            Text(
              message ?? 'Something went wrong. Please try again.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            if (showRetryButton && onRetry != null) ...[
              SizedBox(height: 24.h),
              CustomButton(
                text: 'Retry',
                onPressed: onRetry,
                icon: Icons.refresh,
                isExpanded: false,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class ErrorSnackBar {
  static void show(BuildContext context, String message, {String? title}) {
    SnackbarHelper.showError(context, message, title: title);
  }
}
