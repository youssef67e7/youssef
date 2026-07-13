import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_sizes.dart';

enum ButtonVariant { primary, secondary, outline, text, danger }

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final bool isLoading;
  final bool isExpanded;
  final IconData? icon;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry? padding;
  final Color? color;
  final Color? textColor;
  final double? borderRadius;
  final bool isDisabled;

  const CustomButton({
    super.key,
    required this.text,
    this.onPressed,
    this.variant = ButtonVariant.primary,
    this.isLoading = false,
    this.isExpanded = true,
    this.icon,
    this.width,
    this.height,
    this.padding,
    this.color,
    this.textColor,
    this.borderRadius,
    this.isDisabled = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectiveOnPressed = isLoading || isDisabled ? null : onPressed;

    Widget button;

    switch (variant) {
      case ButtonVariant.primary:
        button = ElevatedButton(
          onPressed: effectiveOnPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: color ?? theme.colorScheme.primary,
            foregroundColor: textColor ?? theme.colorScheme.onPrimary,
            minimumSize: Size(width ?? 0, height ?? AppSizes.buttonHeight),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(borderRadius ?? 12.r),
            ),
            padding: padding ??
                EdgeInsets.symmetric(horizontal: 24.w, vertical: 12.h),
          ),
          child: _buildChild(theme),
        );
        break;
      case ButtonVariant.secondary:
        button = ElevatedButton(
          onPressed: effectiveOnPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: color ?? theme.colorScheme.secondaryContainer,
            foregroundColor: textColor ?? theme.colorScheme.onSecondaryContainer,
            minimumSize: Size(width ?? 0, height ?? AppSizes.buttonHeight),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(borderRadius ?? 12.r),
            ),
            padding: padding ??
                EdgeInsets.symmetric(horizontal: 24.w, vertical: 12.h),
          ),
          child: _buildChild(theme),
        );
        break;
      case ButtonVariant.outline:
        button = OutlinedButton(
          onPressed: effectiveOnPressed,
          style: OutlinedButton.styleFrom(
            foregroundColor: textColor ?? theme.colorScheme.primary,
            minimumSize: Size(width ?? 0, height ?? AppSizes.buttonHeight),
            side: BorderSide(
              color: color ?? theme.colorScheme.outline,
              width: 1.5,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(borderRadius ?? 12.r),
            ),
            padding: padding ??
                EdgeInsets.symmetric(horizontal: 24.w, vertical: 12.h),
          ),
          child: _buildChild(theme),
        );
        break;
      case ButtonVariant.text:
        button = TextButton(
          onPressed: effectiveOnPressed,
          style: TextButton.styleFrom(
            foregroundColor: textColor ?? theme.colorScheme.primary,
            minimumSize: Size(width ?? 0, height ?? AppSizes.buttonHeight),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(borderRadius ?? 12.r),
            ),
            padding: padding ??
                EdgeInsets.symmetric(horizontal: 24.w, vertical: 12.h),
          ),
          child: _buildChild(theme),
        );
        break;
      case ButtonVariant.danger:
        button = ElevatedButton(
          onPressed: effectiveOnPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: color ?? AppColors.errorLight,
            foregroundColor: textColor ?? Colors.white,
            minimumSize: Size(width ?? 0, height ?? AppSizes.buttonHeight),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(borderRadius ?? 12.r),
            ),
            padding: padding ??
                EdgeInsets.symmetric(horizontal: 24.w, vertical: 12.h),
          ),
          child: _buildChild(theme),
        );
        break;
    }

    if (isExpanded) {
      return SizedBox(width: double.infinity, child: button);
    }
    return button;
  }

  Widget _buildChild(ThemeData theme) {
    if (isLoading) {
      return SizedBox(
        width: 20.r,
        height: 20.r,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(
            textColor ?? theme.colorScheme.onPrimary,
          ),
        ),
      );
    }

    if (icon != null) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 20.r),
          SizedBox(width: 8.w),
          Text(text),
        ],
      );
    }

    return Text(text);
  }
}
