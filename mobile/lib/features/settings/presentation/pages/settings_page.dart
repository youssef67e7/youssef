import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:package_info_plus/package_info_plus.dart';

import '../../../shared/providers/locale_provider.dart';
import '../../../shared/providers/theme_provider.dart';

class SettingsPage extends ConsumerWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final themeMode = ref.watch(themeModeProvider);
    final locale = ref.watch(localeProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          SizedBox(height: 8.h),
          _buildSectionHeader(context, 'Appearance'),
          _buildThemeTile(context, ref, themeMode),
          const Divider(height: 1),
          _buildLanguageTile(context, ref, locale),
          SizedBox(height: 16.h),
          _buildSectionHeader(context, 'Notifications'),
          SwitchListTile(
            title: const Text('Push Notifications'),
            subtitle: const Text('Receive push notifications'),
            value: true,
            onChanged: (_) {},
          ),
          SwitchListTile(
            title: const Text('Email Notifications'),
            subtitle: const Text('Receive email updates'),
            value: true,
            onChanged: (_) {},
          ),
          SwitchListTile(
            title: const Text('SMS Notifications'),
            subtitle: const Text('Receive SMS updates'),
            value: false,
            onChanged: (_) {},
          ),
          const Divider(height: 1),
          _buildInfoTile(
            context,
            icon: Icons.info_outline,
            title: 'About',
            onTap: () => _showAboutDialog(context),
          ),
          _buildInfoTile(
            context,
            icon: Icons.description_outlined,
            title: 'Privacy Policy',
            onTap: () {},
          ),
          _buildInfoTile(
            context,
            icon: Icons.description_outlined,
            title: 'Terms of Service',
            onTap: () {},
          ),
          _buildInfoTile(
            context,
            icon: Icons.star_outline,
            title: 'Rate the App',
            onTap: () {},
          ),
          _buildInfoTile(
            context,
            icon: Icons.share,
            title: 'Share the App',
            onTap: () {},
          ),
          SizedBox(height: 16.h),
          FutureBuilder<PackageInfo>(
            future: PackageInfo.fromPlatform(),
            builder: (context, snapshot) {
              return Center(
                child: Text(
                  'Version ${snapshot.data?.version ?? '1.0.0'}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              );
            },
          ),
          SizedBox(height: 16.h),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleSmall?.copyWith(
              color: Theme.of(context).colorScheme.primary,
              fontWeight: FontWeight.bold,
            ),
      ),
    );
  }

  Widget _buildThemeTile(BuildContext context, WidgetRef ref, ThemeMode themeMode) {
    return ListTile(
      leading: const Icon(Icons.dark_mode_outlined),
      title: const Text('Theme'),
      trailing: DropdownButton<ThemeMode>(
        value: themeMode,
        underline: const SizedBox.shrink(),
        items: const [
          DropdownMenuItem(value: ThemeMode.system, child: Text('System')),
          DropdownMenuItem(value: ThemeMode.light, child: Text('Light')),
          DropdownMenuItem(value: ThemeMode.dark, child: Text('Dark')),
        ],
        onChanged: (mode) {
          if (mode != null) {
            ref.read(themeModeProvider.notifier).setThemeMode(mode);
          }
        },
      ),
    );
  }

  Widget _buildLanguageTile(BuildContext context, WidgetRef ref, Locale locale) {
    return ListTile(
      leading: const Icon(Icons.language),
      title: const Text('Language'),
      trailing: DropdownButton<Locale>(
        value: locale,
        underline: const SizedBox.shrink(),
        items: const [
          DropdownMenuItem(value: Locale('en'), child: Text('English')),
          DropdownMenuItem(value: Locale('ar'), child: Text('العربية')),
        ],
        onChanged: (loc) {
          if (loc != null) {
            ref.read(localeProvider.notifier).setLocale(loc);
          }
        },
      ),
    );
  }

  Widget _buildInfoTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
      onTap: onTap,
    );
  }

  void _showAboutDialog(BuildContext context) {
    showAboutDialog(
      context: context,
      applicationName: 'PharmaWorld',
      applicationVersion: '1.0.0',
      applicationIcon: Icon(
        Icons.local_pharmacy,
        size: 48,
        color: Theme.of(context).colorScheme.primary,
      ),
      children: [
        const Text(
          'PharmaWorld is your trusted online pharmacy providing quality medicines and healthcare products at your doorstep.',
        ),
      ],
    );
  }
}
