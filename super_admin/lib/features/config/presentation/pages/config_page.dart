import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/colors.dart';
import '../../../../core/localization/app_localizations.dart';
import '../../../../shared/widgets/page_header.dart';

class ConfigSection {
  final String name;
  final String icon;
  final List<ConfigItem> items;

  const ConfigSection({required this.name, required this.icon, required this.items});
}

class ConfigItem {
  final String key;
  final String label;
  final String value;
  final String type;

  const ConfigItem({required this.key, required this.label, required this.value, this.type = 'text'});
}

final configProvider = StateProvider<String>((ref) => 'environment');

final configSectionsProvider = Provider<List<ConfigSection>>((ref) {
  return const [
    ConfigSection(name: 'Environment', icon: '🌐', items: [
      ConfigItem(key: 'env', label: 'Environment', value: 'production'),
      ConfigItem(key: 'region', label: 'Region', value: 'us-east-1'),
      ConfigItem(key: 'api_endpoint', label: 'API Endpoint', value: 'https://pharmaworld.vercel.app'),
      ConfigItem(key: 'debug_mode', label: 'Debug Mode', value: 'false'),
      ConfigItem(key: 'max_upload', label: 'Max Upload Size', value: '50 MB'),
    ]),
    ConfigSection(name: 'Payment Gateway', icon: '💳', items: [
      ConfigItem(key: 'currency', label: 'Currency', value: 'USD'),
      ConfigItem(key: 'tax_rate', label: 'Tax Rate', value: '8.5%'),
      ConfigItem(key: 'stripe_key', label: 'Stripe Key', value: 'pk_live_***'),
      ConfigItem(key: 'paypal_id', label: 'PayPal Client ID', value: 'AX***'),
    ]),
    ConfigSection(name: 'Delivery', icon: '🚚', items: [
      ConfigItem(key: 'delivery_radius', label: 'Delivery Radius', value: '15 km'),
      ConfigItem(key: 'max_distance', label: 'Max Delivery Distance', value: '50 km'),
      ConfigItem(key: 'driver_commission', label: 'Driver Commission', value: '15%'),
      ConfigItem(key: 'free_delivery_threshold', label: 'Free Delivery Threshold', value: '\$50'),
    ]),
    ConfigSection(name: 'Email/SMS', icon: '📧', items: [
      ConfigItem(key: 'smtp_host', label: 'SMTP Host', value: 'smtp.pharmaworld.com'),
      ConfigItem(key: 'smtp_port', label: 'SMTP Port', value: '587'),
      ConfigItem(key: 'sender_email', label: 'Sender Email', value: 'noreply@pharmaworld.com'),
      ConfigItem(key: 'sms_provider', label: 'SMS Provider', value: 'Twilio'),
    ]),
    ConfigSection(name: 'Storage', icon: '📁', items: [
      ConfigItem(key: 'storage_provider', label: 'Storage Provider', value: 'AWS S3'),
      ConfigItem(key: 'max_file_size', label: 'Max File Size', value: '25 MB'),
      ConfigItem(key: 'allowed_formats', label: 'Allowed Formats', value: 'jpg, png, pdf'),
    ]),
    ConfigSection(name: 'Cache', icon: '⚡', items: [
      ConfigItem(key: 'driver_ttl', label: 'Driver TTL', value: '30 min'),
      ConfigItem(key: 'order_cache_ttl', label: 'Order Cache TTL', value: '5 min'),
      ConfigItem(key: 'user_cache_ttl', label: 'User Cache TTL', value: '15 min'),
    ]),
  ];
});

class ConfigPage extends ConsumerWidget {
  const ConfigPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sections = ref.watch(configSectionsProvider);
    final selectedSection = ref.watch(configProvider);
    final loc = AppLocalizations.of(context);
    final currentSection = sections.firstWhere((s) => s.name.toLowerCase() == selectedSection, orElse: () => sections.first);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        PageHeader(
          title: loc.translate('config'),
          subtitle: 'System configuration settings',
          actions: [
            ElevatedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Configuration saved successfully'), backgroundColor: Colors.green),
                );
              },
              icon: const Icon(Icons.save, size: 18),
              label: Text(loc.translate('save')),
            ),
          ],
        ),
        LayoutBuilder(
          builder: (context, constraints) {
            if (constraints.maxWidth > 900) {
              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(width: 250, child: _buildMenu(sections, selectedSection, ref)),
                  const SizedBox(width: 24),
                  Expanded(child: _buildContent(currentSection)),
                ],
              );
            }
            return Column(
              children: [
                _buildMenu(sections, selectedSection, ref),
                const SizedBox(height: 16),
                _buildContent(currentSection),
              ],
            );
          },
        ),
      ],
    );
  }

  Widget _buildMenu(List<ConfigSection> sections, String selected, WidgetRef ref) {
    return Card(
      child: Column(
        children: sections.map((section) {
          final isSelected = section.name.toLowerCase() == selected;
          return ListTile(
            leading: Text(section.icon, style: const TextStyle(fontSize: 20)),
            title: Text(section.name, style: TextStyle(fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
            selected: isSelected,
            selectedTileColor: AppColors.primaryLight.withValues(alpha: 0.1),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            onTap: () => ref.read(configProvider.notifier).state = section.name.toLowerCase(),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildContent(ConfigSection section) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(section.icon, style: const TextStyle(fontSize: 24)),
                const SizedBox(width: 12),
                Text(section.name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 24),
            ...section.items.map((item) => Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Row(
                children: [
                  Expanded(flex: 2, child: Text(item.label, style: const TextStyle(fontWeight: FontWeight.w500))),
                  Expanded(
                    flex: 3,
                    child: TextField(
                      controller: TextEditingController(text: item.value),
                      decoration: InputDecoration(
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                    ),
                  ),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }
}
