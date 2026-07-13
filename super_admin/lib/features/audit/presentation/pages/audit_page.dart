import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/colors.dart';
import '../../../core/localization/app_localizations.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/helpers.dart';
import '../../../shared/models/audit_log.dart';
import '../../../shared/widgets/page_header.dart';
import '../../../shared/widgets/export_button.dart';

final auditLogsProvider = Provider<List<AuditLog>>((ref) {
  return [
    AuditLog(id: '1', userId: '1', userName: 'Ahmed Hassan', userRole: 'super_admin', action: 'login', entity: 'auth', entityId: '', ipAddress: '192.168.1.100', timestamp: DateTime.now().subtract(const Duration(minutes: 5))),
    AuditLog(id: '2', userId: '2', userName: 'Sara Johnson', userRole: 'admin', action: 'update', entity: 'pharmacy', entityId: 'ph_123', oldValues: {'status': 'active'}, newValues: {'status': 'disabled'}, timestamp: DateTime.now().subtract(const Duration(minutes: 30)), details: 'Disabled pharmacy branch'),
    AuditLog(id: '3', userId: '1', userName: 'Ahmed Hassan', userRole: 'super_admin', action: 'create', entity: 'role', entityId: 'role_456', newValues: {'name': 'Senior Manager'}, timestamp: DateTime.now().subtract(const Duration(hours: 1)), details: 'Created new role'),
    AuditLog(id: '4', userId: '3', userName: 'Mohamed Ali', userRole: 'pharmacy_owner', action: 'delete', entity: 'user', entityId: 'usr_789', oldValues: {'name': 'Test User'}, timestamp: DateTime.now().subtract(const Duration(hours: 2)), ipAddress: '10.0.0.55'),
    AuditLog(id: '5', userId: '4', userName: 'Emily Brown', userRole: 'pharmacy_manager', action: 'toggle', entity: 'feature_flag', entityId: 'ff_101', oldValues: {'enabled': false}, newValues: {'enabled': true}, timestamp: DateTime.now().subtract(const Duration(hours: 3)), details: 'Enabled AI prescription checker'),
    AuditLog(id: '6', userId: '1', userName: 'Ahmed Hassan', userRole: 'super_admin', action: 'update', entity: 'config', entityId: 'payment', timestamp: DateTime.now().subtract(const Duration(hours: 5)), details: 'Updated payment gateway settings'),
    AuditLog(id: '7', userId: '2', userName: 'Sara Johnson', userRole: 'admin', action: 'login_failed', entity: 'auth', entityId: '', ipAddress: '203.0.113.42', timestamp: DateTime.now().subtract(const Duration(hours: 6)), details: 'Multiple failed login attempts'),
    AuditLog(id: '8', userId: '5', userName: 'Omar Wilson', userRole: 'driver', action: 'update', entity: 'profile', entityId: 'usr_456', timestamp: DateTime.now().subtract(const Duration(hours: 8)), details: 'Updated phone number'),
  ];
});

final auditFilterProvider = StateProvider<AuditFilter>((ref) => const AuditFilter());

class AuditFilter {
  final String? userId;
  final String? action;
  final String? entity;
  final DateTimeRange? dateRange;

  const AuditFilter({this.userId, this.action, this.entity, this.dateRange});

  AuditFilter copyWith({String? userId, String? action, String? entity, DateTimeRange? dateRange, bool clearDate = false}) {
    return AuditFilter(
      userId: userId ?? this.userId,
      action: action ?? this.action,
      entity: entity ?? this.entity,
      dateRange: clearDate ? null : (dateRange ?? this.dateRange),
    );
  }
}

class AuditPage extends ConsumerWidget {
  const AuditPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final logs = ref.watch(auditLogsProvider);
    final filter = ref.watch(auditFilterProvider);
    final loc = AppLocalizations.of(context);
    final filtered = logs.where((log) {
      if (filter.userId != null && log.userId != filter.userId) return false;
      if (filter.action != null && log.action != filter.action) return false;
      if (filter.entity != null && log.entity != filter.entity) return false;
      return true;
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        PageHeader(
          title: loc.translate('auditLogs'),
          subtitle: '${logs.length} entries recorded',
          actions: [
            ExportButton(data: logs.map((l) => l.toJson()).toList(), fileName: 'audit_logs'),
          ],
        ),
        _buildFilters(ref, logs, loc),
        const SizedBox(height: 16),
        _buildLogsList(filtered, loc),
      ],
    );
  }

  Widget _buildFilters(WidgetRef ref, List<AuditLog> logs, AppLocalizations loc) {
    final filter = ref.watch(auditFilterProvider);
    final users = {for (var l in logs) l.userId: l.userName}.entries.toList();
    final actions = {for (var l in logs) l.action}.toList();
    final entities = {for (var l in logs) l.entity}.toList();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Wrap(
          spacing: 16,
          runSpacing: 12,
          children: [
            SizedBox(
              width: 200,
              child: DropdownButtonFormField<String>(
                value: filter.userId,
                hint: Text(loc.translate('filterByUser')),
                isExpanded: true,
                decoration: InputDecoration(border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)), contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
                items: [const DropdownMenuItem(value: null, child: Text('All Users')), ...users.map((u) => DropdownMenuItem(value: u.key, child: Text(u.value, overflow: TextOverflow.ellipsis)))],
                onChanged: (v) => ref.read(auditFilterProvider.notifier).state = filter.copyWith(userId: v),
              ),
            ),
            SizedBox(
              width: 200,
              child: DropdownButtonFormField<String>(
                value: filter.action,
                hint: Text(loc.translate('filterByAction')),
                isExpanded: true,
                decoration: InputDecoration(border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)), contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
                items: [const DropdownMenuItem(value: null, child: Text('All Actions')), ...actions.map((a) => DropdownMenuItem(value: a, child: Text(a, overflow: TextOverflow.ellipsis)))],
                onChanged: (v) => ref.read(auditFilterProvider.notifier).state = filter.copyWith(action: v),
              ),
            ),
            SizedBox(
              width: 200,
              child: DropdownButtonFormField<String>(
                value: filter.entity,
                hint: Text(loc.translate('filterByEntity')),
                isExpanded: true,
                decoration: InputDecoration(border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)), contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
                items: [const DropdownMenuItem(value: null, child: Text('All Entities')), ...entities.map((e) => DropdownMenuItem(value: e, child: Text(e, overflow: TextOverflow.ellipsis)))],
                onChanged: (v) => ref.read(auditFilterProvider.notifier).state = filter.copyWith(entity: v),
              ),
            ),
            if (filter.userId != null || filter.action != null || filter.entity != null)
              TextButton.icon(
                onPressed: () => ref.read(auditFilterProvider.notifier).state = const AuditFilter(),
                icon: const Icon(Icons.clear, size: 16),
                label: const Text('Clear Filters'),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildLogsList(List<AuditLog> logs, AppLocalizations loc) {
    if (logs.isEmpty) {
      return Card(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(48),
            child: Column(
              children: [
                Icon(Icons.security, size: 64, color: Colors.grey[300]),
                const SizedBox(height: 16),
                Text(loc.translate('noAuditLogs'), style: TextStyle(color: Colors.grey[500])),
              ],
            ),
          ),
        ),
      );
    }

    return Card(
      child: ListView.builder(
        shrinkWrap: true,
        itemCount: logs.length,
        itemBuilder: (context, index) {
          final log = logs[index];
          return ListTile(
            leading: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Helpers.getActionIcon(log.action) == Icons.delete ? AppColors.error.withValues(alpha: 0.1) : AppColors.info.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(Helpers.getActionIcon(log.action), size: 20, color: log.action == 'delete' ? AppColors.error : AppColors.info),
            ),
            title: Row(
              children: [
                Text(log.userName, style: const TextStyle(fontWeight: FontWeight.w500)),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(color: Helpers.getRoleColor(log.userRole).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
                  child: Text(log.userRole.replaceAll('_', ' '), style: TextStyle(fontSize: 10, color: Helpers.getRoleColor(log.userRole))),
                ),
                const SizedBox(width: 8),
                Text('${log.action} on ${log.entity}', style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                if (log.isSecurityAlert) ...[
                  const SizedBox(width: 8),
                  const Icon(Icons.warning, size: 14, color: AppColors.warning),
                ],
              ],
            ),
            subtitle: log.details != null ? Text(log.details!, style: const TextStyle(fontSize: 12)) : null,
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(Helpers.formatRelativeTime(log.timestamp), style: TextStyle(fontSize: 11, color: Colors.grey[500])),
                if (log.ipAddress != null) Text(log.ipAddress!, style: TextStyle(fontSize: 10, color: Colors.grey[400])),
              ],
            ),
            isThreeLine: log.details != null,
          );
        },
      ),
    );
  }
}
