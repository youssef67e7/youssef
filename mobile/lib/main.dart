import 'dart:async';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:pharmaworld/app.dart';
import 'package:pharmaworld/core/di/injection.dart';
import 'package:pharmaworld/firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (e) {
    debugPrint('Firebase init failed (non-fatal): $e');
  }

  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  if (!kIsWeb) {
    try {
      final crashlytics = FirebaseCrashlytics.instance;
      if (kDebugMode) {
        await crashlytics.setCrashlyticsCollectionEnabled(false);
      }
      FlutterError.onError = (errorDetails) {
        try {
          crashlytics.recordFlutterFatalError(errorDetails);
        } catch (_) {}
      };
    } catch (_) {}
  }

  runZonedGuarded<Future<void>>(() async {
    final container = ProviderContainer();
    try {
      await container.read(initializationProvider.future);
    } catch (e, st) {
      debugPrint('Init provider failed: $e $st');
    }

    runApp(
      UncontrolledProviderScope(
        container: container,
        child: const PharmaWorldApp(),
      ),
    );
  }, (error, stack) {
    debugPrint('Unhandled error: $error');
  });
}
