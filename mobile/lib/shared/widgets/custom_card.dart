import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import 'package:pharmaworld/core/constants/app_sizes.dart';

class CustomCard extends StatelessWidget {

  const CustomCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding,
    this.margin,
    this.elevation,
    this.color,
    this.borderRadius,
    this.border,
    this.showShadow = true,
  });
  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final double? elevation;
  final Color? color;
  final BorderRadius? borderRadius;
  final Border? border;
  final bool showShadow;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: margin ?? EdgeInsets.zero,
      child: Material(
        color: color ?? theme.colorScheme.surfaceContainerLow,
        borderRadius: borderRadius ?? BorderRadius.circular(12.r),
        elevation: showShadow ? (elevation ?? 1) : 0,
        shadowColor: theme.colorScheme.shadow.withOpacity(0.1),
        child: InkWell(
          onTap: onTap,
          borderRadius: borderRadius ?? BorderRadius.circular(12.r),
          child: Container(
            padding: padding ?? EdgeInsets.all(AppSizes.paddingMedium.r),
            decoration: border != null
                ? BoxDecoration(
                    borderRadius:
                        borderRadius ?? BorderRadius.circular(12.r),
                    border: border,
                  )
                : null,
            child: child,
          ),
        ),
      ),
    );
  }
}
