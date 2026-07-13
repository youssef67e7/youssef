import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_driver/core/di/injection.dart';
import 'package:pharmaworld_driver/features/deliveries/repository/delivery_repository.dart';
import 'package:pharmaworld_driver/shared/models/delivery.dart';

final deliveryRepositoryProvider = Provider<DeliveryRepository>((ref) {
  return DeliveryRepository(
    deliveryService: ref.watch(deliveryServiceProvider),
  );
});

final deliveryServiceProvider = Provider((ref) {
  return Injection.deliveryService;
});

final activeDeliveryProvider = FutureProvider<Delivery?>((ref) async {
  final repo = ref.watch(deliveryRepositoryProvider);
  return await repo.getActiveDelivery();
});

final deliveryQueueProvider = FutureProvider<List<Delivery>>((ref) async {
  final repo = ref.watch(deliveryRepositoryProvider);
  return await repo.getDeliveryQueue();
});

final completedDeliveriesProvider = FutureProvider<List<Delivery>>((ref) async {
  final repo = ref.watch(deliveryRepositoryProvider);
  return await repo.getCompletedDeliveries();
});

final deliveryDetailProvider = FutureProvider.family<Delivery, String>((ref, id) async {
  final repo = ref.watch(deliveryRepositoryProvider);
  return await repo.getDeliveryDetail(id);
});

final deliveryActionProvider = StateNotifierProvider<DeliveryActionNotifier, AsyncValue<void>>((ref) {
  return DeliveryActionNotifier(ref);
});

class DeliveryActionNotifier extends StateNotifier<AsyncValue<void>> {
  final Ref _ref;

  DeliveryActionNotifier(this._ref) : super(const AsyncValue.data(null));

  Future<void> acceptDelivery(String deliveryId) async {
    state = const AsyncValue.loading();
    try {
      await _ref.read(deliveryRepositoryProvider).acceptDelivery(deliveryId);
      _ref.invalidate(activeDeliveryProvider);
      _ref.invalidate(deliveryQueueProvider);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> declineDelivery(String deliveryId) async {
    state = const AsyncValue.loading();
    try {
      await _ref.read(deliveryRepositoryProvider).declineDelivery(deliveryId);
      _ref.invalidate(deliveryQueueProvider);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> updateStatus(String deliveryId, String status) async {
    state = const AsyncValue.loading();
    try {
      await _ref.read(deliveryRepositoryProvider).updateStatus(deliveryId, status);
      _ref.invalidate(activeDeliveryProvider);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> confirmDelivery(String deliveryId, {String? photoUrl}) async {
    state = const AsyncValue.loading();
    try {
      await _ref.read(deliveryRepositoryProvider).confirmDelivery(deliveryId, photoUrl: photoUrl);
      _ref.invalidate(activeDeliveryProvider);
      _ref.invalidate(completedDeliveriesProvider);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> failDelivery(String deliveryId, String reason) async {
    state = const AsyncValue.loading();
    try {
      await _ref.read(deliveryRepositoryProvider).failDelivery(deliveryId, reason);
      _ref.invalidate(activeDeliveryProvider);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final currentDeliveryStatusProvider = Provider<String>((ref) {
  final activeDelivery = ref.watch(activeDeliveryProvider);
  return activeDelivery.when(
    data: (delivery) => delivery?.status ?? 'NONE',
    loading: () => 'LOADING',
    error: (_, __) => 'ERROR',
  );
});
