import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/core/constants/app_constants.dart';
import 'package:shared_preferences/shared_preferences.dart';

final localeProvider =
    StateNotifierProvider<LocaleNotifier, Locale>((ref) => LocaleNotifier());

class LocaleNotifier extends StateNotifier<Locale> {
  LocaleNotifier() : super(AppConstants.defaultLocale) {
    _loadLocale();
  }

  Future<void> _loadLocale() async {
    final prefs = await SharedPreferences.getInstance();
    final languageCode = prefs.getString(AppConstants.localeKey) ?? 'en';
    state = Locale(languageCode, languageCode == 'ar' ? 'SA' : 'US');
  }

  Future<void> setLocale(Locale locale) async {
    state = locale;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.localeKey, locale.languageCode);
  }

  void toggleLocale() {
    final newLocale =
        state.languageCode == 'en' ? const Locale('ar', 'SA') : const Locale('en', 'US');
    setLocale(newLocale);
  }
}
