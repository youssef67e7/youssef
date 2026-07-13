import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class CustomBadge extends StatelessWidget {
  final Widget child;
  final String? count;
  final bool showBadge;
  final Color? badgeColor;
  final Color? textColor;
  final double? minWidth;
  final EdgeInsetsGeometry? padding;

  const CustomBadge({
    super.key,
    required this.child,
    this.count,
    this.showBadge = true,
    this.badgeColor,
    this.textColor,
    this.minWidth,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (!showBadge || (count == null && !showBadge)) {
      return child;
    }

    return Stack(
      clipBehavior: Clip.none,
      children: [
        child,
        if (showBadge)
          Positioned(
            top: -6.r,
            right: -6.r,
            child: Container(
              constraints: BoxConstraints(
                minWidth: minWidth ?? 18.r,
                minHeight: 18.r,
              ),
              padding: padding ??
                  EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
              decoration: BoxDecoration(
                color: badgeColor ?? theme.colorScheme.error,
                borderRadius: BorderRadius.circular(9.r),
                border: Border.all(
                  color: theme.colorScheme.surface,
                  width: 1.5,
                ),
              ),
              child: Center(
                child: Text(
                  count ?? '',
                  style: TextStyle(
                    color: textColor ?? Colors.white,
                    fontSize: 10.sp,
                    fontWeight: FontWeight.w600,
                    height: 1.2,
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
