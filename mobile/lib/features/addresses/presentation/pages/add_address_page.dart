import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AddAddressPage extends ConsumerWidget {
  const AddAddressPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add Address')),
      body: const Center(child: Text('Add Address')),
    );
  }
}
