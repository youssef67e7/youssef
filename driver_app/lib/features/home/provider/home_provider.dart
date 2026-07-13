import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_driver/core/di/injection.dart';
import 'package:pharmaworld_driver/features/home/service/home_service.dart';
import 'package:pharmaworld_driver/shared/models/delivery.dart';
import 'package:pharmaworld_driver/shared/providers/auth_provider.dart';

final homeServiceProvider = Provider<HomeService>((ref) {
  return HomeService(dioClient: Injection.dioClient);
});

final activeDeliveryProvider = FutureProvider<Delivery?>((ref) async {
  final service = ref.watch(homeServiceProvider);
  try {
    final response = await service.getActiveDelivery();
    if (response['delivery'] != null) {
      return Delivery.fromJson(response['delivery']);
    }
    return null;
  } catch (e) {
    return null;
  }
});

final dashboardProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final service = ref.watch(homeServiceProvider);
  ref.watch(activeDeliveryProvider);
  try {
    final response = await service.getDashboard();
    return response;
  } catch (e) {
    return {
      'todayDeliveries': 0,
      'todayEarnings': 0.0,
      'completionRate': 0.0,
      'averageRating': 0.0,
    };
  }
});

final onlineToggleProvider = StateNotifierProvider<OnlineToggleNotifier, bool>((ref) {
  return OnlineToggleNotifier(ref);
});

class OnlineToggleNotifier extends StateNotifier<bool> {
  final Ref _ref;

  OnlineToggleNotifier(this._ref) : super(false);

  Future<void> toggle() async {
    final newState = !state;
    state = newState;
    _ref.read(isOnlineProvider.notifier).toggle();

    try {
      final service = _ref.read(homeServiceProvider);
      await service.toggleOnline(newState);
    } catch (e) {
      state = !newState;
      _ref.read(isOnlineProvider.notifier).toggle();
      rethrow;
    }
  }

  void setOnline(bool value) {
    state = value;
  }
}
