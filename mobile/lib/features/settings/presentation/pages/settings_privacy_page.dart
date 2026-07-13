import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SettingsPrivacyPage extends ConsumerWidget {
  const SettingsPrivacyPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Privacy Policy')),
      body: const Center(child: Text('Privacy Policy')),
    );
  }
}
