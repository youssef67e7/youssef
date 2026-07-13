import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_driver/core/localization/app_localizations.dart';
import 'package:pharmaworld_driver/core/constants/app_colors.dart';
import 'package:pharmaworld_driver/features/settings/provider/settings_provider.dart';

class SettingsPage extends ConsumerWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final settings = ref.watch(settingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n?.settings ?? 'Settings'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSectionHeader(l10n?.language ?? 'Language'),
          Card(
            child: Column(
              children: [
                RadioListTile<String>(
                  title: Text(l10n?.english ?? 'English'),
                  value: 'en',
                  groupValue: settings.language,
                  onChanged: (value) {
                    if (value != null) {
                      ref.read(settingsProvider.notifier).setLanguage(value);
                    }
                  },
                ),
                RadioListTile<String>(
                  title: Text(l10n?.arabic ?? 'Arabic'),
                  value: 'ar',
                  groupValue: settings.language,
                  onChanged: (value) {
                    if (value != null) {
                      ref.read(settingsProvider.notifier).setLanguage(value);
                    }
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _buildSectionHeader('Appearance'),
          Card(
            child: SwitchListTile(
              title: Text(l10n?.darkMode ?? 'Dark Mode'),
              subtitle: const Text('Enable dark theme'),
              value: settings.darkMode,
              onChanged: (value) {
                ref.read(settingsProvider.notifier).setDarkMode(value);
              },
              secondary: Icon(
                settings.darkMode ? Icons.dark_mode : Icons.light_mode,
                color: AppColors.primaryLight,
              ),
            ),
          ),
          const SizedBox(height: 16),
          _buildSectionHeader(l10n?.notifications ?? 'Notifications'),
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  title: Text(l10n?.notifications ?? 'Notifications'),
                  subtitle: const Text('Enable push notifications'),
                  value: settings.notificationsEnabled,
                  onChanged: (value) {
                    ref.read(settingsProvider.notifier).setNotificationsEnabled(value);
                  },
                  secondary: const Icon(
                    Icons.notifications_outlined,
                    color: AppColors.primaryLight,
                  ),
                ),
                if (settings.notificationsEnabled) ...[
                  const Divider(height: 0),
                  SwitchListTile(
                    title: const Text('Sound'),
                    subtitle: const Text('Enable notification sounds'),
                    value: settings.soundEnabled,
                    onChanged: (value) {
                      ref.read(settingsProvider.notifier).setSoundEnabled(value);
                    },
                    secondary: const Icon(
                      Icons.volume_up_outlined,
                      color: AppColors.primaryLight,
                    ),
                  ),
                  const Divider(height: 0),
                  SwitchListTile(
                    title: const Text('New Delivery Alerts'),
                    subtitle: const Text('Get notified of new deliveries'),
                    value: settings.newDeliveryAlert,
                    onChanged: (value) {
                      ref.read(settingsProvider.notifier).setNewDeliveryAlert(value);
                    },
                    secondary: const Icon(
                      Icons.local_shipping_outlined,
                      color: AppColors.primaryLight,
                    ),
                  ),
                  const Divider(height: 0),
                  SwitchListTile(
                    title: const Text('Status Updates'),
                    subtitle: const Text('Get notified of status changes'),
                    value: settings.statusUpdateAlert,
                    onChanged: (value) {
                      ref.read(settingsProvider.notifier).setStatusUpdateAlert(value);
                    },
                    secondary: const Icon(
                      Icons.update,
                      color: AppColors.primaryLight,
                    ),
                  ),
                  const Divider(height: 0),
                  SwitchListTile(
                    title: const Text('Earnings Alerts'),
                    subtitle: const Text('Get notified of earnings'),
                    value: settings.earningsAlert,
                    onChanged: (value) {
                      ref.read(settingsProvider.notifier).setEarningsAlert(value);
                    },
                    secondary: const Icon(
                      Icons.attach_money,
                      color: AppColors.primaryLight,
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),
          _buildSectionHeader(l10n?.availabilitySchedule ?? 'Availability Schedule'),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Set your available hours for deliveries',
                    style: TextStyle(color: Colors.grey),
                  ),
                  const SizedBox(height: 16),
                  ...['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                      .map((day) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(day),
                                TextButton(
                                  onPressed: () {
                                    // Show time picker
                                  },
                                  child: const Text('Set Hours'),
                                ),
                              ],
                            ),
                          )),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'About',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 12),
                  const ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text('Version'),
                    trailing: Text('1.0.0'),
                  ),
                  const ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text('Build'),
                    trailing: Text('1'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 4),
      child: Text(
        title,
        style: const TextStyle(
          fontWeight: FontWeight.bold,
          fontSize: 16,
          color: AppColors.primaryLight,
        ),
      ),
    );
  }
}
