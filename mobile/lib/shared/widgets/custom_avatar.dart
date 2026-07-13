import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../core/constants/app_sizes.dart';

class CustomAvatar extends StatelessWidget {
  final String? imageUrl;
  final String? name;
  final double radius;
  final double? fontSize;
  final Color? backgroundColor;
  final Color? textColor;
  final VoidCallback? onTap;
  final Widget? child;

  const CustomAvatar({
    super.key,
    this.imageUrl,
    this.name,
    this.radius = 24,
    this.fontSize,
    this.backgroundColor,
    this.textColor,
    this.onTap,
    this.child,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectiveRadius = radius.r;
    final effectiveFontSize = (fontSize ?? radius * 0.7).r;

    Widget avatar;

    if (child != null) {
      avatar = SizedBox(
        width: effectiveRadius * 2,
        height: effectiveRadius * 2,
        child: child,
      );
    } else if (imageUrl != null && imageUrl!.isNotEmpty) {
      avatar = CachedNetworkImage(
        imageUrl: imageUrl!,
        imageBuilder: (context, imageProvider) => Container(
          width: effectiveRadius * 2,
          height: effectiveRadius * 2,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            image: DecorationImage(
              image: imageProvider,
              fit: BoxFit.cover,
            ),
          ),
        ),
        placeholder: (context, url) => _buildPlaceholder(theme, effectiveRadius, effectiveFontSize),
        errorWidget: (context, url, error) => _buildPlaceholder(theme, effectiveRadius, effectiveFontSize),
      );
    } else {
      avatar = _buildPlaceholder(theme, effectiveRadius, effectiveFontSize);
    }

    if (onTap != null) {
      return GestureDetector(onTap: onTap, child: avatar);
    }

    return avatar;
  }

  Widget _buildPlaceholder(ThemeData theme, double effectiveRadius, double effectiveFontSize) {
    final initials = _getInitials();
    return Container(
      width: effectiveRadius * 2,
      height: effectiveRadius * 2,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: backgroundColor ?? theme.colorScheme.primaryContainer,
      ),
      alignment: Alignment.center,
      child: Text(
        initials,
        style: TextStyle(
          fontSize: effectiveFontSize,
          fontWeight: FontWeight.w600,
          color: textColor ?? theme.colorScheme.onPrimaryContainer,
        ),
      ),
    );
  }

  String _getInitials() {
    if (name == null || name!.isEmpty) return '?';
    final parts = name!.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
}
