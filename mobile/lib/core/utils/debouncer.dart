import 'dart:async';

import 'package:flutter/material.dart';

class Debouncer {

  Debouncer({this.delay = const Duration(milliseconds: 500)});
  final Duration delay;
  Timer? _timer;

  void run(VoidCallback action) {
    _timer?.cancel();
    _timer = Timer(delay, action);
  }

  void cancel() {
    _timer?.cancel();
  }

  bool get isActive => _timer?.isActive ?? false;

  void dispose() {
    _timer?.cancel();
    _timer = null;
  }
}

class DebouncerWidget<T> {

  DebouncerWidget({
    this.delay = const Duration(milliseconds: 500),
    required this.onValueChanged,
  });
  final Duration delay;
  final void Function(T value) onValueChanged;
  Timer? _timer;

  void run(T value) {
    _timer?.cancel();
    _timer = Timer(delay, () {
      onValueChanged(value);
    });
  }

  void cancel() {
    _timer?.cancel();
  }

  void dispose() {
    _timer?.cancel();
    _timer = null;
  }
}
