import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/widgets/page_header.dart';
import 'package:pharmaworld_dashboard/shared/widgets/status_badge.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/core/utils/formatters.dart';
import 'package:pharmaworld_dashboard/features/returns/providers/returns_provider.dart';

class ReturnsPage extends ConsumerWidget {
  const ReturnsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final returnsAsync = ref.watch(returnsProvider);
    final filter = ref.watch(returnsFilterProvider);

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const PageHeader(
            title: 'Returns',
            subtitle: 'Manage return and exchange requests',
          ),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Wrap(
                spacing: 8,
                children: [
                  FilterChip(label: const Text('All'), selected: filter.isEmpty,
                      onSelected: (_) => ref.read(returnsFilterProvider.notifier).state = ''),
                  FilterChip(label: const Text('Pending'), selected: filter == 'pending',
                      onSelected: (_) => ref.read(returnsFilterProvider.notifier).state = filter == 'pending' ? '' : 'pending'),
                  FilterChip(label: const Text('Approved'), selected: filter == 'approved',
                      onSelected: (_) => ref.read(returnsFilterProvider.notifier).state = filter == 'approved' ? '' : 'approved'),
                  FilterChip(label: const Text('Rejected'), selected: filter == 'rejected',
                      onSelected: (_) => ref.read(returnsFilterProvider.notifier).state = filter == 'rejected' ? '' : 'rejected'),
                  FilterChip(label: const Text('Processed'), selected: filter == 'processed',
                      onSelected: (_) => ref.read(returnsFilterProvider.notifier).state = filter == 'processed' ? '' : 'processed'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          returnsAsync.when(
            data: (allReturns) {
              var filtered = allReturns;
              if (filter.isNotEmpty) {
                filtered = filtered.where((r) => r.status == filter).toList();
              }
              return Card(
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: SizedBox(
                    width: 1000,
                    child: DataTable(
                      columns: const [
                        DataColumn(label: Text('Return #')),
                        DataColumn(label: Text('Order')),
                        DataColumn(label: Text('Customer')),
                        DataColumn(label: Text('Reason')),
                        DataColumn(label: Text('Refund'), numeric: true),
                        DataColumn(label: Text('Status')),
                        DataColumn(label: Text('Date')),
                        DataColumn(label: Text('Actions')),
                      ],
                      rows: filtered
                          .map(
                            (ret) => DataRow(cells: [
                              DataCell(Text(ret.id, style: const TextStyle(fontWeight: FontWeight.w500))),
                              DataCell(Text(ret.orderNumber)),
                              DataCell(Text(ret.customerName ?? '-')),
                              DataCell(Text(ret.reason, maxLines: 1, overflow: TextOverflow.ellipsis)),
                              DataCell(Text(Formatters.formatCurrency(ret.refundAmount))),
                              DataCell(StatusBadge(status: ret.status)),
                              DataCell(Text(Formatters.timeAgo(ret.createdAt))),
                              DataCell(
                                PopupMenuButton<String>(
                                  itemBuilder: (context) {
                                    if (ret.status == 'pending') {
                                      return [
                                        const PopupMenuItem(value: 'approve', child: Text('Approve')),
                                        const PopupMenuItem(value: 'reject', child: Text('Reject')),
                                      ];
                                    }
                                    if (ret.status == 'approved') {
                                      return [
                                        const PopupMenuItem(value: 'refund', child: Text('Process Refund')),
                                      ];
                                    }
                                    return [
                                      const PopupMenuItem(value: 'view', child: Text('View Details')),
                                    ];
                                  },
                                  onSelected: (v) => _handleReturnAction(context, ref, v, ret),
                                ),
                              ),
                            ]),
                          )
                          .toList(),
                    ),
                  ),
                ),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Error: $e')),
          ),
        ],
      ),
    );
  }

  void _handleReturnAction(BuildContext context, WidgetRef ref, String action, ReturnRequest ret) async {
    switch (action) {
      case 'approve':
        try {
          final api = ref.read(apiServiceProvider);
          await api.approveReturn(ret.id);
          ref.invalidate(returnsProvider);
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Return approved')),
            );
          }
        } catch (e) {
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
          }
        }
        break;
      case 'reject':
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Reject Return'),
            content: const TextField(
              decoration: InputDecoration(labelText: 'Reason for rejection'),
              maxLines: 3,
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                onPressed: () async {
                  try {
                    final api = ref.read(apiServiceProvider);
                    await api.rejectReturn(ret.id);
                    ref.invalidate(returnsProvider);
                    if (ctx.mounted) {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Return rejected')),
                      );
                    }
                  } catch (e) {
                    if (ctx.mounted) {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Error: $e')),
                      );
                    }
                  }
                },
                child: const Text('Reject'),
              ),
            ],
          ),
        );
        break;
      case 'refund':
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Process Refund'),
            content: Text('Process refund of ${Formatters.formatCurrency(ret.refundAmount)}?'),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
              ElevatedButton(
                onPressed: () async {
                  try {
                    final api = ref.read(apiServiceProvider);
                    await api.processRefund(ret.id, {'amount': ret.refundAmount});
                    ref.invalidate(returnsProvider);
                    if (ctx.mounted) {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Refund processed')),
                      );
                    }
                  } catch (e) {
                    if (ctx.mounted) {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Error: $e')),
                      );
                    }
                  }
                },
                child: const Text('Process Refund'),
              ),
            ],
          ),
        );
        break;
    }
  }
}
