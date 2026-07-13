import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class OrderTrackingPage extends ConsumerWidget {
  const OrderTrackingPage({super.key, required this.orderId});
  final String orderId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: Text('Track Order #$orderId')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.r),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 250.h,
              width: double.infinity,
              decoration: BoxDecoration(
                color: theme.colorScheme.surfaceContainerHigh,
                borderRadius: BorderRadius.circular(16.r),
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.map_outlined,
                      size: 64.r,
                      color: theme.colorScheme.primary.withOpacity(0.5),
                    ),
                    SizedBox(height: 8.h),
                    Text(
                      'Live Tracking Map',
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 16.h),
            Card(
              child: Padding(
                padding: EdgeInsets.all(16.r),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 48.r,
                          height: 48.r,
                          decoration: BoxDecoration(
                            color: theme.colorScheme.primaryContainer,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.local_shipping,
                            color: theme.colorScheme.primary,
                          ),
                        ),
                        SizedBox(width: 12.w),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Delivery Driver',
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                'Mohamed Ahmed',
                                style: theme.textTheme.bodyMedium,
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.phone),
                          onPressed: () {},
                        ),
                      ],
                    ),
                    const Divider(),
                    _buildTrackingStep(
                      theme,
                      'Order Confirmed',
                      'Your order has been confirmed',
                      Icons.check_circle,
                      true,
                    ),
                    _buildTrackingStep(
                      theme,
                      'Processing',
                      'Your order is being prepared',
                      Icons.inventory_2,
                      true,
                    ),
                    _buildTrackingStep(
                      theme,
                      'Out for Delivery',
                      'Driver is on the way',
                      Icons.local_shipping,
                      true,
                    ),
                    _buildTrackingStep(
                      theme,
                      'Delivered',
                      'Estimated arrival: 30 mins',
                      Icons.home,
                      false,
                      isLast: true,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTrackingStep(
    ThemeData theme,
    String title,
    String subtitle,
    IconData icon,
    bool isCompleted, {
    bool isLast = false,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Icon(
              icon,
              size: 24.r,
              color: isCompleted
                  ? theme.colorScheme.primary
                  : theme.colorScheme.onSurfaceVariant.withOpacity(0.3),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 30.h,
                color: isCompleted
                    ? theme.colorScheme.primary
                    : theme.colorScheme.outline.withOpacity(0.3),
              ),
          ],
        ),
        SizedBox(width: 12.w),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: isCompleted ? FontWeight.w600 : FontWeight.normal,
                ),
              ),
              Text(
                subtitle,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              SizedBox(height: isLast ? 0 : 12.h),
            ],
          ),
        ),
      ],
    );
  }
}
