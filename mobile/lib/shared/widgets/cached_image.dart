import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class CachedImage extends StatelessWidget {

  const CachedImage({
    super.key,
    required this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.borderRadius,
    this.placeholderColor,
    this.placeholder,
    this.errorWidget,
  });
  final String imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final BorderRadius? borderRadius;
  final Color? placeholderColor;
  final Widget? placeholder;
  final Widget? errorWidget;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final Widget image = ClipRRect(
      borderRadius: borderRadius ?? BorderRadius.zero,
      child: CachedNetworkImage(
        imageUrl: imageUrl,
        width: width,
        height: height,
        fit: fit,
        placeholder: (context, url) =>
            placeholder ??
            Container(
              width: width,
              height: height,
              color: placeholderColor ?? theme.colorScheme.surfaceContainerHigh,
              child: Icon(
                Icons.image_outlined,
                size: 32.r,
                color: theme.colorScheme.onSurfaceVariant.withOpacity(0.5),
              ),
            ),
        errorWidget: (context, url, error) =>
            errorWidget ??
            Container(
              width: width,
              height: height,
              color: placeholderColor ?? theme.colorScheme.surfaceContainerHigh,
              child: Icon(
                Icons.broken_image_outlined,
                size: 32.r,
                color: theme.colorScheme.onSurfaceVariant.withOpacity(0.5),
              ),
            ),
      ),
    );

    return image;
  }
}
