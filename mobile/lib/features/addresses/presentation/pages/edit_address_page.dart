import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class EditAddressPage extends ConsumerWidget {
  final String addressId;
  const EditAddressPage({super.key, required this.addressId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Edit Address')),
      body: Center(child: Text('Edit Address $addressId')),
    );
  }
}
