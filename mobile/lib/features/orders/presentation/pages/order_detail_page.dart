import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

import 'package:pharmaworld/shared/widgets/custom_button.dart';
import 'package:pharmaworld/shared/widgets/order_status_chip.dart';

class OrderDetailPage extends ConsumerWidget {
  const OrderDetailPage({super.key, required this.orderId});
  final String orderId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text('Order #$orderId'),
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {},
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'track',
                child: Text('Track Order'),
              ),
              const PopupMenuItem(
                value: 'invoice',
                child: Text('View Invoice'),
              ),
              const PopupMenuItem(
                value: 'return',
                child: Text('Return Request'),
              ),
              const PopupMenuItem(
                value: 'cancel',
                child: Text('Cancel Order'),
              ),
            ],
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.r),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: EdgeInsets.all(16.r),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Order Status',
                          style: theme.textTheme.titleMedium,
                        ),
                        const OrderStatusChip(status: 'processing'),
                      ],
                    ),
                    SizedBox(height: 16.h),
                    _buildTimeline(theme),
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
                    Text(
                      'Order Items',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 12.h),
                    _buildOrderItem(theme, 'Panadol Extra', 2, 45.0),
                    _buildOrderItem(theme, 'Augmentin 1g', 1, 120.0),
                    _buildOrderItem(theme, 'Vitamin C', 3, 85.0),
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
                    Text(
                      'Order Summary',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 12.h),
                    _buildSummaryRow('Subtotal', 'E£325.00'),
                    _buildSummaryRow('Delivery Fee', 'E£25.00'),
                    _buildSummaryRow('Tax', 'E£45.50'),
                    const Divider(),
                    _buildSummaryRow(
                      'Total',
                      'E£395.50',
                      isBold: true,
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 16.h),
            Card(
              child: ListTile(
                leading: const Icon(Icons.location_on),
                title: const Text('Shipping Address'),
                subtitle: const Text('123 Main St, Cairo, Egypt'),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                onTap: () {},
              ),
            ),
            SizedBox(height: 8.h),
            Card(
              child: ListTile(
                leading: const Icon(Icons.payment),
                title: const Text('Payment Method'),
                subtitle: const Text('Cash on Delivery'),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                onTap: () {},
              ),
            ),
            SizedBox(height: 24.h),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => context.push('/orders/$orderId/tracking'),
                    child: const Text('Track Order'),
                  ),
                ),
                SizedBox(width: 12.w),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {},
                    child: const Text('Reorder'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeline(ThemeData theme) {
    return Column(
      children: [
        _buildTimelineItem(theme, 'Order Placed', 'Jan 25, 2024 10:00 AM', true),
        _buildTimelineItem(theme, 'Order Confirmed', 'Jan 25, 2024 11:30 AM', true),
        _buildTimelineItem(theme, 'Processing', 'Jan 25, 2024 2:00 PM', true),
        _buildTimelineItem(theme, 'Out for Delivery', 'Pending', false),
        _buildTimelineItem(theme, 'Delivered', 'Pending', false, isLast: true),
      ],
    );
  }

  Widget _buildTimelineItem(
    ThemeData theme,
    String title,
    String time,
    bool isCompleted, {
    bool isLast = false,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 20.r,
              height: 20.r,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isCompleted
                    ? theme.colorScheme.primary
                    : theme.colorScheme.surfaceContainerHigh,
                border: Border.all(
                  color: isCompleted
                      ? theme.colorScheme.primary
                      : theme.colorScheme.outline,
                ),
              ),
              child: isCompleted
                  ? Icon(Icons.check, size: 12.r, color: Colors.white)
                  : null,
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 40.h,
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
                time,
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

  Widget _buildOrderItem(ThemeData theme, String name, int qty, double price) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 4.h),
      child: Row(
        children: [
          Container(
            width: 48.r,
            height: 48.r,
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHigh,
              borderRadius: BorderRadius.circular(8.r),
            ),
            child: Icon(
              Icons.medication,
              color: theme.colorScheme.primary.withOpacity(0.5),
            ),
          ),
          SizedBox(width: 12.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: theme.textTheme.bodyMedium),
                Text(
                  'Qty: $qty × E£${price.toStringAsFixed(2)}',
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ),
          ),
          Text(
            'E£${(qty * price).toStringAsFixed(2)}',
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 4.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontWeight: isBold ? FontWeight.bold : FontWeight.normal)),
          Text(value, style: TextStyle(fontWeight: isBold ? FontWeight.bold : FontWeight.normal)),
        ],
      ),
    );
  }
}
