import 'package:freezed_annotation/freezed_annotation.dart';

part 'earnings.freezed.dart';
part 'earnings.g.dart';

@freezed
class Earnings with _$Earnings {
  const factory Earnings({
    required double totalEarnings,
    required double todayEarnings,
    required double weeklyEarnings,
    required double monthlyEarnings,
    required double baseFeesTotal,
    required double tipsTotal,
    required double bonusesTotal,
    required int totalDeliveries,
    required int todayDeliveries,
  }) = _Earnings;

  factory Earnings.fromJson(Map<String, dynamic> json) => _$EarningsFromJson(json);
}

@freezed
class EarningRecord with _$EarningRecord {
  const factory EarningRecord({
    required String id,
    required String deliveryId,
    required String orderId,
    required double baseFee,
    double? tip,
    double? bonus,
    required double totalAmount,
    required DateTime date,
    String? status,
  }) = _EarningRecord;

  factory EarningRecord.fromJson(Map<String, dynamic> json) => _$EarningRecordFromJson(json);
}

@freezed
class WithdrawalRequest with _$WithdrawalRequest {
  const factory WithdrawalRequest({
    required double amount,
    required String method,
    String? accountNumber,
  }) = _WithdrawalRequest;

  factory WithdrawalRequest.fromJson(Map<String, dynamic> json) => _$WithdrawalRequestFromJson(json);
}
