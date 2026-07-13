import 'package:flutter_riverpod/flutter_riverpod.dart';

final sidebarCollapsedProvider = StateProvider<bool>((ref) => false);

final selectedMenuProvider = StateProvider<String>((ref) => '/dashboard');

final sidebarHoverProvider = StateProvider<String?>((ref) => null);
