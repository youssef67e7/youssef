import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../core/utils/helpers.dart';

class OrderStatusChip extends StatelessWidget {
  final String status;
  final bool showIcon;
  final bool isCompact;

  const OrderStatusChip({
    super.key,
    required this.status,
    this.showIcon = true,
    this.isCompact = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = AppHelpers.getStatusColor(status);
    final icon = AppHelpers.getStatusIcon(status);
    final label = AppHelpers.getTranslatedStatus(status, context);

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isCompact ? 8.w : 12.w,
        vertical: isCompact ? 4.h : 6.h,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showIcon) ...[
            Icon(icon, size: isCompact ? 14.r : 16.r, color: color),
            SizedBox(width: 4.w),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: (isCompact ? 10 : 12).sp,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
