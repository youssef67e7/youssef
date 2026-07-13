import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/route_names.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/custom_text_field.dart';

class CheckoutPage extends ConsumerStatefulWidget {
  const CheckoutPage({super.key});

  @override
  ConsumerState<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends ConsumerState<CheckoutPage> {
  String _selectedPayment = 'cod';
  String _selectedAddress = 'home';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.r),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Shipping Address',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 12.h),
            _buildAddressCard(
              theme,
              title: 'Home',
              address: '123 Main St, Cairo, Egypt',
              isSelected: _selectedAddress == 'home',
              onTap: () => setState(() => _selectedAddress = 'home'),
            ),
            SizedBox(height: 8.h),
            _buildAddressCard(
              theme,
              title: 'Office',
              address: '456 Business Ave, Cairo, Egypt',
              isSelected: _selectedAddress == 'office',
              onTap: () => setState(() => _selectedAddress = 'office'),
            ),
            SizedBox(height: 8.h),
            OutlinedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.add),
              label: const Text('Add New Address'),
            ),
            SizedBox(height: 24.h),
            Text(
              'Payment Method',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 12.h),
            _buildPaymentOption(
              theme,
              title: 'Cash on Delivery',
              icon: Icons.money,
              value: 'cod',
            ),
            _buildPaymentOption(
              theme,
              title: 'Credit Card',
              icon: Icons.credit_card,
              value: 'card',
            ),
            _buildPaymentOption(
              theme,
              title: 'Wallet',
              icon: Icons.account_balance_wallet,
              value: 'wallet',
            ),
            SizedBox(height: 24.h),
            Text(
              'Order Summary',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 12.h),
            _buildSummaryRow('Subtotal (3 items)', 'E£250.00'),
            _buildSummaryRow('Delivery Fee', 'E£25.00'),
            _buildSummaryRow('Tax (14%)', 'E£35.00'),
            const Divider(),
            _buildSummaryRow(
              'Total',
              'E£310.00',
              isBold: true,
            ),
            SizedBox(height: 24.h),
            CustomButton(
              text: 'Place Order - E£310.00',
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Order placed successfully!'),
                  ),
                );
                context.go(RouteNames.home);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAddressCard(
    ThemeData theme, {
    required String title,
    required String address,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return Card(
      color: isSelected
          ? theme.colorScheme.primaryContainer.withOpacity(0.3)
          : null,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12.r),
        side: BorderSide(
          color: isSelected
              ? theme.colorScheme.primary
              : theme.colorScheme.outline.withOpacity(0.3),
          width: isSelected ? 2 : 1,
        ),
      ),
      child: ListTile(
        leading: Icon(
          Icons.location_on,
          color: isSelected ? theme.colorScheme.primary : null,
        ),
        title: Text(title),
        subtitle: Text(address),
        trailing: isSelected
            ? Icon(Icons.check_circle, color: theme.colorScheme.primary)
            : null,
        onTap: onTap,
      ),
    );
  }

  Widget _buildPaymentOption(
    ThemeData theme, {
    required String title,
    required IconData icon,
    required String value,
  }) {
    return Card(
      child: RadioListTile<String>(
        leading: Icon(icon),
        title: Text(title),
        value: value,
        groupValue: _selectedPayment,
        onChanged: (v) => setState(() => _selectedPayment = v!),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 4.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              color: isBold ? Theme.of(context).colorScheme.error : null,
            ),
          ),
        ],
      ),
    );
  }
}
