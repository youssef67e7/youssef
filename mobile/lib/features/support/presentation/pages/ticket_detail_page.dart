import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class TicketDetailPage extends ConsumerWidget {
  const TicketDetailPage({super.key, required this.ticketId});
  final String ticketId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ticket Detail')),
      body: Center(child: Text('Ticket #$ticketId')),
    );
  }
}
