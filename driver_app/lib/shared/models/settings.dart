import 'package:freezed_annotation/freezed_annotation.dart';

part 'settings.freezed.dart';
part 'settings.g.dart';

@freezed
class DriverSettings with _$DriverSettings {
  const factory DriverSettings({
    @Default('en') String language,
    @Default(false) bool darkMode,
    @Default(true) bool notificationsEnabled,
    @Default(true) bool soundEnabled,
    @Default(true) bool newDeliveryAlert,
    @Default(true) bool statusUpdateAlert,
    @Default(true) bool earningsAlert,
    Map<String, ScheduleSlot>? availabilitySchedule,
  }) = _DriverSettings;

  factory DriverSettings.fromJson(Map<String, dynamic> json) => _$DriverSettingsFromJson(json);
}

@freezed
class ScheduleSlot with _$ScheduleSlot {
  const factory ScheduleSlot({
    required String day,
    required bool enabled,
    String? startTime,
    String? endTime,
  }) = _ScheduleSlot;

  factory ScheduleSlot.fromJson(Map<String, dynamic> json) => _$ScheduleSlotFromJson(json);
}
