import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:pharmaworld_driver/core/constants/storage_keys.dart';
import 'package:pharmaworld_driver/shared/models/settings.dart';

final settingsProvider = StateNotifierProvider<SettingsNotifier, DriverSettings>((ref) {
  return SettingsNotifier();
});

class SettingsNotifier extends StateNotifier<DriverSettings> {
  SettingsNotifier() : super(const DriverSettings()) {
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    state = DriverSettings(
      language: prefs.getString(StorageKeys.language) ?? 'en',
      darkMode: prefs.getBool(StorageKeys.darkMode) ?? false,
      notificationsEnabled: prefs.getBool(StorageKeys.notificationEnabled) ?? true,
      soundEnabled: true,
      newDeliveryAlert: true,
      statusUpdateAlert: true,
      earningsAlert: true,
    );
  }

  Future<void> setLanguage(String language) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(StorageKeys.language, language);
    state = state.copyWith(language: language);
  }

  Future<void> setDarkMode(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(StorageKeys.darkMode, value);
    state = state.copyWith(darkMode: value);
  }

  Future<void> setNotificationsEnabled(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(StorageKeys.notificationEnabled, value);
    state = state.copyWith(notificationsEnabled: value);
  }

  Future<void> setSoundEnabled(bool value) async {
    state = state.copyWith(soundEnabled: value);
  }

  Future<void> setNewDeliveryAlert(bool value) async {
    state = state.copyWith(newDeliveryAlert: value);
  }

  Future<void> setStatusUpdateAlert(bool value) async {
    state = state.copyWith(statusUpdateAlert: value);
  }

  Future<void> setEarningsAlert(bool value) async {
    state = state.copyWith(earningsAlert: value);
  }
}
