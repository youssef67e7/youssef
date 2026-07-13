import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';

final notificationsProvider = FutureProvider<List<NotificationModel>>((ref) async {
  final api = ref.read(apiServiceProvider);
  final response = await api.getNotifications();
  final data = response.data['data'];
  if (data is List) {
    return data.map((e) => NotificationModel.fromJson(e as Map<String, dynamic>)).toList();
  }
  return [];
});

final notificationTabProvider = StateProvider<int>((ref) => 0);

class NotificationsNotifier extends StateNotifier<AsyncValue<List<NotificationModel>>> {
  final dynamic _api;
  NotificationsNotifier(this._api) : super(const AsyncValue.loading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.getNotifications();
      final data = response.data['data'];
      final notifications = data is List
          ? data.map((e) => NotificationModel.fromJson(e as Map<String, dynamic>)).toList()
          : <NotificationModel>[];
      state = AsyncValue.data(notifications);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> send(Map<String, dynamic> data) async {
    await _api.sendNotification(data);
    await load();
  }
}
