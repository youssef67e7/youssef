import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import 'package:pharmaworld/core/router/route_names.dart';
import 'package:pharmaworld/shared/widgets/custom_button.dart';
import 'package:pharmaworld/shared/widgets/quantity_selector.dart';
import 'package:pharmaworld/shared/widgets/empty_state.dart';
import 'package:pharmaworld/features/cart/presentation/providers/cart_provider.dart';

class CartPage extends ConsumerStatefulWidget {
  const CartPage({super.key});

  @override
  ConsumerState<CartPage> createState() => _CartPageState();
}

class _CartPageState extends ConsumerState<CartPage> {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cartState = ref.watch(cartProvider);

    if (cartState.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Cart')),
        body: const EmptyState(
          type: EmptyStateType.emptyCart,
          title: 'Your cart is empty',
          subtitle: 'Add some medicines to your cart',
          buttonText: 'Go Shopping',
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Cart (${cartState.itemCount})'),
        actions: [
          TextButton(
            onPressed: () {
              ref.read(cartProvider.notifier).clear();
            },
            child: const Text('Clear All'),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.all(16.r),
              itemCount: cartState.items.length,
              itemBuilder: (context, index) {
                final item = cartState.items[index];
                return Card(
                  margin: EdgeInsets.only(bottom: 8.h),
                  child: Padding(
                    padding: EdgeInsets.all(12.r),
                    child: Row(
                      children: [
                        Container(
                          width: 70.w,
                          height: 70.h,
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
                              Text(
                                item.name,
                                style: theme.textTheme.bodyLarge?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              SizedBox(height: 4.h),
                              Text(
                                'E£${item.price.toStringAsFixed(2)}',
                                style: TextStyle(
                                  color: theme.colorScheme.error,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              SizedBox(height: 8.h),
                              QuantitySelector(
                                quantity: item.quantity,
                                maxQuantity: 10,
                                onChanged: (qty) {
                                  ref.read(cartProvider.notifier).updateQuantity(item.id, qty);
                                },
                                size: 32,
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: Icon(
                            Icons.delete_outline,
                            color: theme.colorScheme.error,
                          ),
                          onPressed: () {
                            ref.read(cartProvider.notifier).removeItem(item.id);
                          },
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: EdgeInsets.all(16.r),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          boxShadow: [
            BoxShadow(
              color: theme.colorScheme.shadow.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Subtotal'),
                Text('E£${cartState.subtotal.toStringAsFixed(2)}'),
              ],
            ),
            SizedBox(height: 4.h),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Delivery Fee'),
                Text('E£${cartState.deliveryFee.toStringAsFixed(2)}'),
              ],
            ),
            SizedBox(height: 4.h),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Tax (14%)'),
                Text('E£${cartState.tax.toStringAsFixed(2)}'),
              ],
            ),
            const Divider(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'E£${cartState.total.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.error,
                    fontSize: 18.sp,
                  ),
                ),
              ],
            ),
            SizedBox(height: 12.h),
            CustomButton(
              text: 'Proceed to Checkout',
              onPressed: () => context.push(RouteNames.checkout),
            ),
          ],
        ),
      ),
    );
  }
}
