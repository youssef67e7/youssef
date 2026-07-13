import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class EditReviewPage extends ConsumerWidget {
  const EditReviewPage({super.key, required this.reviewId});
  final String reviewId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Edit Review')),
      body: Center(child: Text('Edit Review $reviewId')),
    );
  }
}
