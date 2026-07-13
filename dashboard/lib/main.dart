import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/app.dart';
import 'package:pharmaworld_dashboard/core/di/service_locator.dart';
import 'package:pharmaworld_dashboard/core/utils/logger.dart';
import 'package:firebase_core/firebase_core.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await Firebase.initializeApp(
      options: const FirebaseOptions(
        apiKey: "AIzaSyDummyKeyForDevelopment",
        authDomain: "pharmaworld-dev.firebaseapp.com",
        projectId: "pharmaworld-dev",
        storageBucket: "pharmaworld-dev.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abc123def456",
        measurementId: "G-XXXXXXXXXX",
      ),
    );
  } catch (e) {
    Logger.warning('Firebase initialization skipped: $e');
  }

  setupServiceLocator();

  runApp(
    const ProviderScope(
      child: PharmaWorldApp(),
    ),
  );
}
