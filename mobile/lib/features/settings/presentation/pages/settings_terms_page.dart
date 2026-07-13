import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SettingsTermsPage extends ConsumerWidget {
  const SettingsTermsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Terms of Service')),
      body: const Center(child: Text('Terms of Service')),
    );
  }
}
