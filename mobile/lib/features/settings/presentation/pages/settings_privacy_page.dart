import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class SettingsPrivacyPage extends ConsumerWidget {
  const SettingsPrivacyPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Privacy Policy')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.r),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Last Updated: July 13, 2024', style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey)),
            SizedBox(height: 16.h),
            _section(theme, '1. Information We Collect',
              'We collect information you provide directly, including name, email address, phone number, delivery address, and payment information. '
              'We also automatically collect certain technical information when you use our services.'),
            SizedBox(height: 16.h),
            _section(theme, '2. How We Use Your Information',
              'Your information is used to process orders, deliver medicines, provide customer support, improve our services, '
              'send important updates, and comply with legal obligations.'),
            SizedBox(height: 16.h),
            _section(theme, '3. Information Sharing',
              'We do not sell your personal information. We may share information with delivery partners to fulfill orders, '
              'with healthcare providers for prescription verification, and as required by law.'),
            SizedBox(height: 16.h),
            _section(theme, '4. Data Security',
              'We implement industry-standard security measures including encryption, secure servers, and regular security audits. '
              'Your payment information is processed securely by PCI-compliant payment processors.'),
            SizedBox(height: 16.h),
            _section(theme, '5. Your Rights',
              'You have the right to access, correct, or delete your personal data. You can manage your preferences in account settings. '
              'Contact us at privacy@pharmaworld.com for data-related requests.'),
            SizedBox(height: 16.h),
            _section(theme, '6. Cookies',
              'We use essential cookies for site functionality and analytics cookies to improve your experience. '
              'You can manage cookie preferences in your browser settings.'),
            SizedBox(height: 16.h),
            _section(theme, '7. Contact Us',
              'For privacy-related inquiries, contact our Data Protection Officer at privacy@pharmaworld.com '
              'or write to: PharmaWorld Inc., 123 Healthcare Ave, Medical District, NY 10001.'),
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
