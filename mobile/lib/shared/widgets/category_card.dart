import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class CategoryCard extends StatelessWidget {
  final String name;
  final String? imageUrl;
  final Color? color;
  final VoidCallback? onTap;

  const CategoryCard({
    super.key,
    required this.name,
    this.imageUrl,
    this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(12.r),
        decoration: BoxDecoration(
          color: theme.colorScheme.surfaceContainerLow,
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(
            color: theme.colorScheme.outline.withOpacity(0.2),
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 56.r,
              height: 56.r,
              decoration: BoxDecoration(
                color: (color ?? theme.colorScheme.primary).withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: imageUrl != null && imageUrl!.isNotEmpty
                  ? ClipOval(
                      child: CachedNetworkImage(
                        imageUrl: imageUrl!,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Icon(
                          Icons.category_outlined,
                          size: 28.r,
                          color: color ?? theme.colorScheme.primary,
                        ),
                        errorWidget: (context, url, error) => Icon(
                          Icons.category_outlined,
                          size: 28.r,
                          color: color ?? theme.colorScheme.primary,
                        ),
                      ),
                    )
                  : Icon(
                      Icons.category_outlined,
                      size: 28.r,
                      color: color ?? theme.colorScheme.primary,
                    ),
            ),
            SizedBox(height: 8.h),
            Text(
              name,
              style: theme.textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
