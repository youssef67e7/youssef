import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../core/router/route_names.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/quantity_selector.dart';
import '../../../shared/widgets/empty_state.dart';

class CartPage extends ConsumerStatefulWidget {
  const CartPage({super.key});

  @override
  ConsumerState<CartPage> createState() => _CartPageState();
}

class _CartPageState extends ConsumerState<CartPage> {
  final List<Map<String, dynamic>> _cartItems = [
    {
      'id': '1',
      'name': 'Panadol Extra',
      'price': 45.0,
      'quantity': 2,
      'image': 'https://via.placeholder.com/100',
    },
    {
      'id': '2',
      'name': 'Augmentin 1g',
      'price': 120.0,
      'quantity': 1,
      'image': 'https://via.placeholder.com/100',
    },
    {
      'id': '3',
      'name': 'Vitamin C',
      'price': 85.0,
      'quantity': 3,
      'image': 'https://via.placeholder.com/100',
    },
  ];

  double get _subtotal =>
      _cartItems.fold(0, (sum, item) => sum + item['price'] * item['quantity']);
  double get _deliveryFee => 25.0;
  double get _tax => _subtotal * 0.14;
  double get _total => _subtotal + _deliveryFee + _tax;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (_cartItems.isEmpty) {
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
        title: Text('Cart (${_cartItems.length})'),
        actions: [
          TextButton(
            onPressed: () {
              setState(() {
                _cartItems.clear();
              });
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
              itemCount: _cartItems.length,
              itemBuilder: (context, index) {
                final item = _cartItems[index];
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
                                item['name'],
                                style: theme.textTheme.bodyLarge?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              SizedBox(height: 4.h),
                              Text(
                                'E£${item['price'].toStringAsFixed(2)}',
                                style: TextStyle(
                                  color: theme.colorScheme.error,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              SizedBox(height: 8.h),
                              QuantitySelector(
                                quantity: item['quantity'],
                                minQuantity: 1,
                                maxQuantity: 10,
                                onChanged: (qty) {
                                  setState(() {
                                    _cartItems[index]['quantity'] = qty;
                                  });
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
                            setState(() {
                              _cartItems.removeAt(index);
                            });
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
                Text('E£${_subtotal.toStringAsFixed(2)}'),
              ],
            ),
            SizedBox(height: 4.h),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Delivery Fee'),
                Text('E£${_deliveryFee.toStringAsFixed(2)}'),
              ],
            ),
            SizedBox(height: 4.h),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Tax (14%)'),
                Text('E£${_tax.toStringAsFixed(2)}'),
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
                  'E£${_total.toStringAsFixed(2)}',
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
