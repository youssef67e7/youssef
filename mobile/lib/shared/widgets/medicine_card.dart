import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_sizes.dart';
import '../../core/utils/formatters.dart';
import 'custom_badge.dart';
import 'star_rating.dart';

class MedicineCard extends StatelessWidget {
  final String id;
  final String name;
  final String imageUrl;
  final double price;
  final double? originalPrice;
  final double? rating;
  final int? reviewCount;
  final bool isInStock;
  final bool isWishlisted;
  final VoidCallback? onTap;
  final VoidCallback? onAddToCart;
  final VoidCallback? onToggleWishlist;
  final bool showDiscount;

  const MedicineCard({
    super.key,
    required this.id,
    required this.name,
    required this.imageUrl,
    required this.price,
    this.originalPrice,
    this.rating,
    this.reviewCount,
    this.isInStock = true,
    this.isWishlisted = false,
    this.onTap,
    this.onAddToCart,
    this.onToggleWishlist,
    this.showDiscount = true,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final discount = originalPrice != null && originalPrice! > price
        ? ((originalPrice! - price) / originalPrice! * 100).round()
        : 0;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: theme.colorScheme.surfaceContainerLow,
          borderRadius: BorderRadius.circular(12.r),
          boxShadow: [
            BoxShadow(
              color: theme.colorScheme.shadow.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                Container(
                  height: 130.h,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.vertical(
                      top: Radius.circular(12.r),
                    ),
                    color: theme.colorScheme.surfaceContainerHigh,
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.vertical(
                      top: Radius.circular(12.r),
                    ),
                    child: CachedNetworkImage(
                      imageUrl: imageUrl,
                      fit: BoxFit.contain,
                      placeholder: (context, url) => Center(
                        child: Icon(
                          Icons.medication_outlined,
                          size: 48.r,
                          color: theme.colorScheme.primary.withOpacity(0.3),
                        ),
                      ),
                      errorWidget: (context, url, error) => Center(
                        child: Icon(
                          Icons.medication_outlined,
                          size: 48.r,
                          color: theme.colorScheme.primary.withOpacity(0.3),
                        ),
                      ),
                    ),
                  ),
                ),
                if (discount > 0 && showDiscount)
                  Positioned(
                    top: 8.r,
                    left: 8.r,
                    child: CustomBadge(
                      count: '-$discount%',
                      badgeColor: AppColors.discountColor,
                      showBadge: true,
                      child: const SizedBox.shrink(),
                    ),
                  ),
                Positioned(
                  top: 8.r,
                  right: 8.r,
                  child: GestureDetector(
                    onTap: onToggleWishlist,
                    child: Container(
                      padding: EdgeInsets.all(4.r),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surface.withOpacity(0.8),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        isWishlisted
                            ? Icons.favorite
                            : Icons.favorite_border,
                        size: 18.r,
                        color: isWishlisted
                            ? AppColors.errorLight
                            : theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            Padding(
              padding: EdgeInsets.all(8.r),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: 4.h),
                  if (rating != null)
                    Row(
                      children: [
                        StarRating(
                          rating: rating!,
                          size: 12,
                        ),
                        if (reviewCount != null) ...[
                          SizedBox(width: 4.w),
                          Text(
                            '($reviewCount)',
                            style: theme.textTheme.labelSmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ],
                    ),
                  SizedBox(height: 4.h),
                  Row(
                    children: [
                      Text(
                        AppFormatters.formatCurrency(price),
                        style: theme.textTheme.titleSmall?.copyWith(
                          color: AppColors.priceColor,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      if (originalPrice != null && originalPrice! > price) ...[
                        SizedBox(width: 6.w),
                        Text(
                          AppFormatters.formatCurrency(originalPrice!),
                          style: theme.textTheme.bodySmall?.copyWith(
                            decoration: TextDecoration.lineThrough,
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ],
                  ),
                  SizedBox(height: 6.h),
                  if (isInStock)
                    SizedBox(
                      width: double.infinity,
                      height: 32.h,
                      child: ElevatedButton(
                        onPressed: onAddToCart,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: theme.colorScheme.primary,
                          foregroundColor: theme.colorScheme.onPrimary,
                          padding: EdgeInsets.zero,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8.r),
                          ),
                        ),
                        child: Text(
                          'Add to Cart',
                          style: TextStyle(fontSize: 11.sp),
                        ),
                      ),
                    )
                  else
                    Container(
                      width: double.infinity,
                      height: 32.h,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: theme.colorScheme.errorContainer,
                        borderRadius: BorderRadius.circular(8.r),
                      ),
                      child: Text(
                        'Out of Stock',
                        style: TextStyle(
                          fontSize: 11.sp,
                          color: theme.colorScheme.error,
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
