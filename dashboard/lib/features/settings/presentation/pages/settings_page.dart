import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/widgets/page_header.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/shared/providers/theme_provider.dart';
import 'package:pharmaworld_dashboard/shared/providers/locale_provider.dart';
import 'package:pharmaworld_dashboard/features/settings/providers/settings_provider.dart';

class SettingsPage extends ConsumerStatefulWidget {
  const SettingsPage({super.key});

  @override
  ConsumerState<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends ConsumerState<SettingsPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const PageHeader(
          title: 'Settings',
          subtitle: 'Manage system settings and preferences',
        ),
        const SizedBox(height: 24),
        Card(
          child: TabBar(
            controller: _tabController,
            isScrollable: true,
            tabs: const [
              Tab(text: 'General'),
              Tab(text: 'Payment'),
              Tab(text: 'Delivery'),
              Tab(text: 'Feature Flags'),
              Tab(text: 'Maintenance'),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              _buildGeneralSettings(context, ref),
              _buildPaymentSettings(context, ref),
              _buildDeliverySettings(context, ref),
              _buildFeatureFlags(context, ref),
              _buildMaintenanceMode(context, ref),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildGeneralSettings(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final themeMode = ref.watch(themeModeProvider);
    final locale = ref.watch(localeProvider);

    return SingleChildScrollView(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('Store Information', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),
                TextFormField(
                  decoration: const InputDecoration(labelText: 'Store Name'),
                  initialValue: 'PharmaWorld',
                ),
                const SizedBox(height: 16),
                TextFormField(
                  decoration: const InputDecoration(labelText: 'Store Address'),
                  initialValue: 'Riyadh, Saudi Arabia',
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        decoration: const InputDecoration(labelText: 'Store Phone'),
                        initialValue: '+966 11 234 5678',
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        decoration: const InputDecoration(labelText: 'Store Email'),
                        initialValue: 'info@pharmaworld.com',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                const Divider(),
                const SizedBox(height: 16),
                const Text('Preferences', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: locale.languageCode,
                        decoration: const InputDecoration(labelText: 'Language'),
                        items: const [
                          DropdownMenuItem(value: 'en', child: Text('English')),
                          DropdownMenuItem(value: 'ar', child: Text('العربية')),
                        ],
                        onChanged: (v) {
                          if (v != null) {
                            ref.read(localeProvider.notifier).setLocale(
                                  Locale(v, v == 'ar' ? 'SA' : 'US'),
                                );
                          }
                        },
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: DropdownButtonFormField<ThemeMode>(
                        value: themeMode,
                        decoration: const InputDecoration(labelText: 'Theme'),
                        items: const [
                          DropdownMenuItem(value: ThemeMode.light, child: Text('Light')),
                          DropdownMenuItem(value: ThemeMode.dark, child: Text('Dark')),
                          DropdownMenuItem(value: ThemeMode.system, child: Text('System')),
                        ],
                        onChanged: (v) {
                          if (v != null) ref.read(themeModeProvider.notifier).setThemeMode(v);
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        decoration: const InputDecoration(labelText: 'Currency'),
                        value: 'SAR',
                        items: const [
                          DropdownMenuItem(value: 'SAR', child: Text('SAR - Saudi Riyal')),
                          DropdownMenuItem(value: 'USD', child: Text('USD - US Dollar')),
                          DropdownMenuItem(value: 'EUR', child: Text('EUR - Euro')),
                        ],
                        onChanged: (v) {},
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        decoration: const InputDecoration(labelText: 'Timezone'),
                        value: 'Asia/Riyadh',
                        items: const [
                          DropdownMenuItem(value: 'Asia/Riyadh', child: Text('Asia/Riyadh (GMT+3)')),
                          DropdownMenuItem(value: 'Asia/Dubai', child: Text('Asia/Dubai (GMT+4)')),
                          DropdownMenuItem(value: 'Asia/Cairo', child: Text('Asia/Cairo (GMT+2)')),
                        ],
                        onChanged: (v) {},
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      try {
                        final api = ref.read(apiServiceProvider);
                        await api.updateSettings({
                          'storeName': 'PharmaWorld',
                          'storeAddress': 'Riyadh, Saudi Arabia',
                        });
                        ref.invalidate(settingsProvider);
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Settings saved successfully')),
                          );
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Error: $e')),
                          );
                        }
                      }
                    },
                    child: const Text('Save Settings'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPaymentSettings(BuildContext context, WidgetRef ref) {
    return SingleChildScrollView(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('Payment Gateways', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),
                _buildPaymentToggle('Cash on Delivery', true),
                _buildPaymentToggle('Credit/Debit Card', true),
                _buildPaymentToggle('Apple Pay', true),
                _buildPaymentToggle('Mada', true),
                _buildPaymentToggle('STC Pay', false),
                const SizedBox(height: 24),
                const Divider(),
                const SizedBox(height: 16),
                const Text('Tax Settings', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),
                TextFormField(
                  decoration: const InputDecoration(labelText: 'Tax Rate (%)'),
                  initialValue: '15',
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 16),
                const Text('Platform Fee', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),
                TextFormField(
                  decoration: const InputDecoration(labelText: 'Platform Fee (%)'),
                  initialValue: '10',
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      try {
                        final api = ref.read(apiServiceProvider);
                        await api.updateSettings({'taxRate': 15, 'platformFee': 10});
                        ref.invalidate(settingsProvider);
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Payment settings saved')),
                          );
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Error: $e')),
                          );
                        }
                      }
                    },
                    child: const Text('Save Payment Settings'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPaymentToggle(String name, bool isEnabled) {
    return SwitchListTile(
      title: Text(name),
      value: isEnabled,
      onChanged: (v) {},
    );
  }

  Widget _buildDeliverySettings(BuildContext context, WidgetRef ref) {
    return SingleChildScrollView(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('Delivery Configuration', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),
                TextFormField(
                  decoration: const InputDecoration(labelText: 'Delivery Radius (km)'),
                  initialValue: '25',
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  decoration: const InputDecoration(labelText: 'Free Delivery Threshold'),
                  initialValue: '100',
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  decoration: const InputDecoration(labelText: 'Default Delivery Fee'),
                  initialValue: '15',
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 24),
                const Text('Delivery Zones', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),
                const ListTile(
                  leading: Icon(Icons.location_on),
                  title: Text('Riyadh - Central'),
                  subtitle: Text('Fee: \$10 | Radius: 10km'),
                  trailing: Icon(Icons.edit_outlined),
                ),
                const ListTile(
                  leading: Icon(Icons.location_on),
                  title: Text('Riyadh - Extended'),
                  subtitle: Text('Fee: \$20 | Radius: 25km'),
                  trailing: Icon(Icons.edit_outlined),
                ),
                const SizedBox(height: 16),
                OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('Add Delivery Zone'),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      try {
                        final api = ref.read(apiServiceProvider);
                        await api.updateSettings({'deliveryRadius': 25, 'freeDeliveryThreshold': 100});
                        ref.invalidate(settingsProvider);
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Delivery settings saved')),
                          );
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Error: $e')),
                          );
                        }
                      }
                    },
                    child: const Text('Save Delivery Settings'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFeatureFlags(BuildContext context, WidgetRef ref) {
    final settingsAsync = ref.watch(settingsProvider);
    final flags = settingsAsync.when(
      data: (s) => s.featureFlags,
      loading: () => <String, bool>{},
      error: (_, __) => <String, bool>{},
    );

    return SingleChildScrollView(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('Feature Flags',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text(
                  'Toggle features on/off for the application',
                  style: TextStyle(color: Colors.grey.shade500),
                ),
                const SizedBox(height: 16),
                ...flags.entries.map(
                  (entry) => SwitchListTile(
                    title: Text(entry.key.replaceAll('_', ' ').toUpperCase()),
                    subtitle: Text('Feature: ${entry.key}'),
                    value: entry.value,
                    onChanged: (v) async {
                      try {
                        final api = ref.read(apiServiceProvider);
                        await api.toggleFeatureFlag(entry.key, v);
                        ref.invalidate(settingsProvider);
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Error: $e')),
                          );
                        }
                      }
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMaintenanceMode(BuildContext context, WidgetRef ref) {
    return SingleChildScrollView(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.orange.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.orange.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.warning_amber_rounded, color: Colors.orange),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Maintenance Mode',
                              style: TextStyle(fontWeight: FontWeight.w600),
                            ),
                            Text(
                              'When enabled, the app will show a maintenance page to users.',
                              style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                SwitchListTile(
                  title: const Text('Enable Maintenance Mode'),
                  subtitle: const Text('All users will see the maintenance page'),
                  value: false,
                  onChanged: (v) async {
                    try {
                      final api = ref.read(apiServiceProvider);
                      await api.toggleMaintenanceMode(v);
                      ref.invalidate(settingsProvider);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(v ? 'Maintenance mode enabled' : 'Maintenance mode disabled')),
                        );
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Error: $e')),
                        );
                      }
                    }
                  },
                ),
                const SizedBox(height: 24),
                TextFormField(
                  decoration: const InputDecoration(
                    labelText: 'Maintenance Message',
                    hintText: 'We are currently performing scheduled maintenance...',
                  ),
                  maxLines: 3,
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      try {
                        final api = ref.read(apiServiceProvider);
                        await api.updateSettings({'maintenanceMode': true});
                        ref.invalidate(settingsProvider);
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Maintenance settings saved')),
                          );
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Error: $e')),
                          );
                        }
                      }
                    },
                    child: const Text('Save'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
