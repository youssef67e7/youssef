import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class WriteReviewPage extends ConsumerWidget {
  final String medicineId;
  const WriteReviewPage({super.key, required this.medicineId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Write Review')),
      body: Center(child: Text('Write Review for Medicine $medicineId')),
    );
  }
}
