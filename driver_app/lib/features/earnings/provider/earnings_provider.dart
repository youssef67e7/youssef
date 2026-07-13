import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_driver/features/earnings/provider/earnings_service.dart';
import 'package:pharmaworld_driver/shared/models/earnings.dart';

final earningsProvider = FutureProvider<Earnings>((ref) async {
  final service = ref.watch(earningsServiceProvider);
  try {
    final response = await service.getEarnings();
    return Earnings.fromJson(response);
  } catch (e) {
    return const Earnings(
      totalEarnings: 0,
      todayEarnings: 0,
      weeklyEarnings: 0,
      monthlyEarnings: 0,
      baseFeesTotal: 0,
      tipsTotal: 0,
      bonusesTotal: 0,
      totalDeliveries: 0,
      todayDeliveries: 0,
    );
  }
});

final earningsHistoryProvider = FutureProvider<List<EarningRecord>>((ref) async {
  final service = ref.watch(earningsServiceProvider);
  try {
    final response = await service.getEarningsHistory();
    final records = response['records'] as List? ?? [];
    return records.map((r) => EarningRecord.fromJson(r)).toList();
  } catch (e) {
    return [];
  }
});

final selectedPeriodProvider = StateProvider<String>((ref) => 'daily');

final filteredEarningsHistoryProvider = FutureProvider<List<EarningRecord>>((ref) async {
  final service = ref.watch(earningsServiceProvider);
  final period = ref.watch(selectedPeriodProvider);
  try {
    final response = await service.getEarningsHistory(period: period);
    final records = response['records'] as List? ?? [];
    return records.map((r) => EarningRecord.fromJson(r)).toList();
  } catch (e) {
    return [];
  }
});

final withdrawProvider = StateNotifierProvider<WithdrawNotifier, AsyncValue<void>>((ref) {
  return WithdrawNotifier(ref);
});

class WithdrawNotifier extends StateNotifier<AsyncValue<void>> {
  final Ref _ref;

  WithdrawNotifier(this._ref) : super(const AsyncValue.data(null));

  Future<void> withdraw(double amount, String method) async {
    state = const AsyncValue.loading();
    try {
      await _ref.read(earningsServiceProvider).withdraw(amount, method);
      _ref.invalidate(earningsProvider);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}
