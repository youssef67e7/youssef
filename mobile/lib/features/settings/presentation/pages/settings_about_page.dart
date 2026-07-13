import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class SettingsAboutPage extends ConsumerWidget {
  const SettingsAboutPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('About')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.r),
        child: Column(
          children: [
            SizedBox(height: 32.h),
            Container(
              width: 80.r, height: 80.r,
              decoration: BoxDecoration(
                color: theme.colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(20.r),
              ),
              child: Icon(Icons.medication_outlined, size: 40.r, color: theme.colorScheme.primary),
            ),
            SizedBox(height: 16.h),
            Text('PharmaWorld', style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
            SizedBox(height: 4.h),
            Text('Enterprise Pharmacy Management System', style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey)),
            SizedBox(height: 8.h),
            Text('Version 1.0.0', style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey)),
            SizedBox(height: 32.h),
            _buildInfoCard(theme, 'About', 'PharmaWorld is a comprehensive pharmacy management platform that connects patients, pharmacies, doctors, and delivery partners in one seamless ecosystem.'),
            SizedBox(height: 12.h),
            _buildInfoCard(theme, 'Features', '• Online medicine ordering\n• Prescription management\n• AI-powered prescription analysis\n• Telemedicine consultations\n• Real-time order tracking\n• Pharmacy inventory management\n• Delivery partner coordination'),
            SizedBox(height: 12.h),
            _buildInfoCard(theme, 'Contact', 'Email: support@pharmaworld.com\nPhone: +1 (555) 123-4567\nWebsite: www.pharmaworld.com'),
            SizedBox(height: 12.h),
            Card(
              child: Padding(
                padding: EdgeInsets.all(16.r),
                child: Column(
                  children: [
                    _buildInfoRow(theme, 'Developer', 'PharmaWorld Inc.'),
                    const Divider(),
                    _buildInfoRow(theme, 'License', 'Proprietary'),
                    const Divider(),
                    _buildInfoRow(theme, 'Build Number', '2024.07.13-001'),
                  ],
                ),
              ),
            ),
            SizedBox(height: 24.h),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard(ThemeData theme, String title, String content) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16.r),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
            SizedBox(height: 8.h),
            Text(content, style: theme.textTheme.bodyMedium?.copyWith(height: 1.5)),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(ThemeData theme, String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: theme.textTheme.bodyMedium),
        Text(value, style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey)),
      ],
    );
  }
}
