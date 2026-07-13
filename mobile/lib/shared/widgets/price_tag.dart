import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import 'package:pharmaworld/core/constants/app_colors.dart';
import 'package:pharmaworld/core/utils/formatters.dart';

class PriceTag extends StatelessWidget {

  const PriceTag({
    super.key,
    required this.price,
    this.originalPrice,
    this.fontSize,
    this.showDiscount = true,
    this.isLarge = false,
  });
  final double price;
  final double? originalPrice;
  final double? fontSize;
  final bool showDiscount;
  final bool isLarge;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final discount = originalPrice != null && originalPrice! > price
        ? ((originalPrice! - price) / originalPrice! * 100).round()
        : 0;

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
          AppFormatters.formatCurrency(price),
          style: TextStyle(
            fontSize: (fontSize ?? (isLarge ? 20 : 14)).sp,
            fontWeight: FontWeight.w700,
            color: AppColors.priceColor,
          ),
        ),
        if (originalPrice != null && originalPrice! > price && showDiscount) ...[
          SizedBox(width: 6.w),
          Text(
            AppFormatters.formatCurrency(originalPrice!),
            style: TextStyle(
              fontSize: ((fontSize ?? (isLarge ? 16 : 12)) - 2).sp,
              decoration: TextDecoration.lineThrough,
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          SizedBox(width: 4.w),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
            decoration: BoxDecoration(
              color: AppColors.discountColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(4.r),
            ),
            child: Text(
              '-$discount%',
              style: TextStyle(
                fontSize: 10.sp,
                fontWeight: FontWeight.w600,
                color: AppColors.discountColor,
              ),
            ),
          ),
        ],
      ],
    );
  }
}
