import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';

final auditLogProvider = FutureProvider<List<AuditLog>>((ref) async {
  final api = ref.read(apiServiceProvider);
  final response = await api.getAuditLogs();
  final data = response.data['data'];
  if (data is List) {
    return data.map((e) => AuditLog.fromJson(e as Map<String, dynamic>)).toList();
  }
  return [];
});

final auditActionFilterProvider = StateProvider<String>((ref) => '');
final auditEntityFilterProvider = StateProvider<String>((ref) => '');
