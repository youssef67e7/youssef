import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/widgets/page_header.dart';
import 'package:pharmaworld_dashboard/shared/widgets/date_range_picker.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';
import 'package:pharmaworld_dashboard/core/utils/formatters.dart';

final auditLogProvider = FutureProvider<List<AuditLog>>((ref) async {
  return List.generate(
    25,
    (i) => AuditLog(
      id: 'LOG-${i + 1}',
      userId: 'USR-${(i % 5) + 1}',
      userName: ['Admin Ahmed', 'Pharmacist Sara', 'Manager Omar', 'Admin Fatima', 'Pharmacist Ali'][i % 5],
      action: ['create', 'update', 'delete', 'login', 'logout', 'approve', 'reject', 'export'][i % 8],
      entity: ['Medicine', 'Order', 'Customer', 'Category', 'Coupon', 'Offer', 'Banner', 'Settings'][i % 8],
      entityId: '${(i % 8) + 100}',
      ipAddress: '192.168.1.${100 + i}',
      createdAt: DateTime.now().subtract(Duration(minutes: i * 15)),
    ),
  );
});

final auditActionFilterProvider = StateProvider<String>((ref) => '');
final auditEntityFilterProvider = StateProvider<String>((ref) => '');

class AuditLogPage extends ConsumerWidget {
  const AuditLogPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auditAsync = ref.watch(auditLogProvider);
    final actionFilter = ref.watch(auditActionFilterProvider);
    final entityFilter = ref.watch(auditEntityFilterProvider);

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const PageHeader(
            title: 'Audit Log',
            subtitle: 'Track all system activities',
          ),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  SizedBox(
                    width: 160,
                    child: DropdownButtonFormField<String>(
                      value: actionFilter.isEmpty ? null : actionFilter,
                      hint: const Text('Action'),
                      isDense: true,
                      decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10)),
                      items: const [
                        DropdownMenuItem(value: 'create', child: Text('Create')),
                        DropdownMenuItem(value: 'update', child: Text('Update')),
                        DropdownMenuItem(value: 'delete', child: Text('Delete')),
                        DropdownMenuItem(value: 'login', child: Text('Login')),
                        DropdownMenuItem(value: 'approve', child: Text('Approve')),
                        DropdownMenuItem(value: 'reject', child: Text('Reject')),
                        DropdownMenuItem(value: 'export', child: Text('Export')),
                      ],
                      onChanged: (v) => ref.read(auditActionFilterProvider.notifier).state = v ?? '',
                    ),
                  ),
                  const SizedBox(width: 12),
                  SizedBox(
                    width: 160,
                    child: DropdownButtonFormField<String>(
                      value: entityFilter.isEmpty ? null : entityFilter,
                      hint: const Text('Entity'),
                      isDense: true,
                      decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10)),
                      items: const [
                        DropdownMenuItem(value: 'Medicine', child: Text('Medicine')),
                        DropdownMenuItem(value: 'Order', child: Text('Order')),
                        DropdownMenuItem(value: 'Customer', child: Text('Customer')),
                        DropdownMenuItem(value: 'Category', child: Text('Category')),
                        DropdownMenuItem(value: 'Coupon', child: Text('Coupon')),
                        DropdownMenuItem(value: 'Settings', child: Text('Settings')),
                      ],
                      onChanged: (v) => ref.read(auditEntityFilterProvider.notifier).state = v ?? '',
                    ),
                  ),
                  const SizedBox(width: 12),
                  DateRangePicker(
                    onStartDateChanged: (d) {},
                    onEndDateChanged: (d) {},
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          auditAsync.when(
            data: (logs) {
              var filtered = logs;
              if (actionFilter.isNotEmpty) {
                filtered = filtered.where((l) => l.action == actionFilter).toList();
              }
              if (entityFilter.isNotEmpty) {
                filtered = filtered.where((l) => l.entity == entityFilter).toList();
              }

              return Card(
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: SizedBox(
                    width: 1000,
                    child: DataTable(
                      columns: const [
                        DataColumn(label: Text('Timestamp')),
                        DataColumn(label: Text('User')),
                        DataColumn(label: Text('Action')),
                        DataColumn(label: Text('Entity')),
                        DataColumn(label: Text('Entity ID')),
                        DataColumn(label: Text('IP Address')),
                      ],
                      rows: filtered
                          .map(
                            (log) => DataRow(cells: [
                              DataCell(Text(Formatters.formatDateTime(log.createdAt),
                                  style: const TextStyle(fontSize: 12))),
                              DataCell(Text(log.userName ?? '-')),
                              DataCell(
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: _getActionColor(log.action).withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    log.action.toUpperCase(),
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: _getActionColor(log.action),
                                    ),
                                  ),
                                ),
                              ),
                              DataCell(Text(log.entity)),
                              DataCell(Text(log.entityId ?? '-')),
                              DataCell(Text(log.ipAddress ?? '-')),
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

  Color _getActionColor(String action) {
    switch (action) {
      case 'create':
        return Colors.green;
      case 'update':
        return Colors.blue;
      case 'delete':
        return Colors.red;
      case 'login':
        return Colors.purple;
      case 'approve':
        return Colors.green;
      case 'reject':
        return Colors.red;
      case 'export':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }
}
