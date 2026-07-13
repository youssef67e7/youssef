import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import 'package:pharmaworld/core/constants/app_sizes.dart';

class StarRating extends StatelessWidget {

  const StarRating({
    super.key,
    required this.rating,
    this.maxRating = 5,
    this.size = 16,
    this.activeColor,
    this.inactiveColor,
    this.allowHalfRating = true,
  });
  final double rating;
  final int maxRating;
  final double size;
  final Color activeColor;
  final Color inactiveColor;
  final bool allowHalfRating;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectiveActiveColor = activeColor ?? Colors.amber;
    final effectiveInactiveColor =
        inactiveColor ?? theme.colorScheme.surfaceContainerHigh;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(maxRating, (index) {
        return _buildStar(index, effectiveActiveColor, effectiveInactiveColor);
      }),
    );
  }

  Widget _buildStar(int index, Color activeColor, Color inactiveColor) {
    final starValue = index + 1;

    if (allowHalfRating) {
      if (starValue <= rating) {
        return Icon(Icons.star, size: size.r, color: activeColor);
      } else if (starValue - 0.5 <= rating) {
        return Icon(Icons.star_half, size: size.r, color: activeColor);
      }
    } else {
      if (starValue <= rating) {
        return Icon(Icons.star, size: size.r, color: activeColor);
      }
    }

    return Icon(Icons.star_border, size: size.r, color: inactiveColor);
  }
}
