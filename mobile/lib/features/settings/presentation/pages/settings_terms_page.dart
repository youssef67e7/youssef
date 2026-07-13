import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class SettingsTermsPage extends ConsumerWidget {
  const SettingsTermsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Terms of Service')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.r),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Last Updated: July 13, 2024', style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey)),
            SizedBox(height: 16.h),
            _section(theme, '1. Acceptance of Terms',
              'By accessing or using PharmaWorld, you agree to be bound by these Terms of Service. '
              'If you do not agree to these terms, please do not use our services.'),
            SizedBox(height: 16.h),
            _section(theme, '2. Description of Service',
              'PharmaWorld is an online pharmacy management platform that facilitates medicine ordering, '
              'prescription management, delivery coordination, and related healthcare services between patients, '
              'pharmacies, healthcare providers, and delivery partners.'),
            SizedBox(height: 16.h),
            _section(theme, '3. User Accounts',
              'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. '
              'You must provide accurate and complete information when creating an account.'),
            SizedBox(height: 16.h),
            _section(theme, '4. Prescription Requirements',
              'Prescription medicines can only be ordered with a valid prescription from a licensed healthcare provider. '
              'We reserve the right to verify prescriptions and refuse orders that do not comply with applicable laws.'),
            SizedBox(height: 16.h),
            _section(theme, '5. Orders and Payments',
              'All orders are subject to availability and confirmation. Payment must be received before order processing. '
              'Prices are subject to change without notice. Refunds will be processed according to our refund policy.'),
            SizedBox(height: 16.h),
            _section(theme, '6. Delivery',
              'Delivery times are estimates and not guaranteed. We are not responsible for delays caused by factors outside our control. '
              'Risk of loss passes to you upon delivery.'),
            SizedBox(height: 16.h),
            _section(theme, '7. Limitation of Liability',
              'PharmaWorld shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services. '
              'Our total liability shall not exceed the amount paid by you for the specific service giving rise to the claim.'),
            SizedBox(height: 16.h),
            _section(theme, '8. Termination',
              'We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or otherwise abuse our services.'),
            SizedBox(height: 16.h),
            _section(theme, '9. Changes to Terms',
              'We may update these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.'),
            SizedBox(height: 32.h),
          ],
        ),
      ),
    );
  }

  Widget _section(ThemeData theme, String title, String body) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
        SizedBox(height: 8.h),
        Text(body, style: theme.textTheme.bodyMedium?.copyWith(height: 1.6, color: Colors.grey.shade700)),
      ],
    );
  }
}
