import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../core/constants/app_colors.dart';

class LoadingIndicator extends StatelessWidget {
  final double? size;
  final double? strokeWidth;
  final Color? color;
  final LoadingType type;

  const LoadingIndicator({
    super.key,
    this.size,
    this.strokeWidth,
    this.color,
    this.type = LoadingType.circular,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectiveColor = color ?? theme.colorScheme.primary;

    switch (type) {
      case LoadingType.circular:
        return Center(
          child: SizedBox(
            width: size?.r ?? 40.r,
            height: size?.r ?? 40.r,
            child: CircularProgressIndicator(
              strokeWidth: strokeWidth?.r ?? 3.r,
              valueColor: AlwaysStoppedAnimation<Color>(effectiveColor),
            ),
          ),
        );
      case LoadingType.linear:
        return LinearProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(effectiveColor),
          backgroundColor: effectiveColor.withOpacity(0.2),
        );
      case LoadingType.dots:
        return Center(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(3, (index) {
              return Container(
                margin: EdgeInsets.symmetric(horizontal: 4.w),
                width: (size?.r ?? 8.r),
                height: (size?.r ?? 8.r),
                decoration: BoxDecoration(
                  color: effectiveColor,
                  shape: BoxShape.circle,
                ),
              );
            }),
          ),
        );
    }
  }
}

enum LoadingType { circular, linear, dots }

class ShimmerLoading extends StatelessWidget {
  final double width;
  final double height;
  final double borderRadius;

  const ShimmerLoading({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius = 8,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width.w,
      height: height.h,
      decoration: BoxDecoration(
        color: Colors.grey[300],
        borderRadius: BorderRadius.circular(borderRadius.r),
      ),
    );
  }

  static Widget listTile() {
    return Padding(
      padding: EdgeInsets.all(16.r),
      child: Row(
        children: [
          ShimmerLoading(width: 50, height: 50, borderRadius: 25),
          SizedBox(width: 16.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ShimmerLoading(width: double.infinity, height: 14),
                SizedBox(height: 8.h),
                ShimmerLoading(width: 200, height: 12),
                SizedBox(height: 8.h),
                ShimmerLoading(width: 150, height: 12),
              ],
            ),
          ),
        ],
      ),
    );
  }

  static Widget gridCard() {
    return Padding(
      padding: EdgeInsets.all(8.r),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ShimmerLoading(
            width: double.infinity,
            height: 120,
            borderRadius: 8,
          ),
          SizedBox(height: 8.h),
          ShimmerLoading(width: double.infinity, height: 14),
          SizedBox(height: 8.h),
          ShimmerLoading(width: 100, height: 12),
          SizedBox(height: 8.h),
          ShimmerLoading(width: 80, height: 14),
        ],
      ),
    );
  }
}
