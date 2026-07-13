import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';
import 'core/di/providers.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initProviders();
  runApp(const ProviderScope(child: PharmaWorldSuperAdmin()));
}
