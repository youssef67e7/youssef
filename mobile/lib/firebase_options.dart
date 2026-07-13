import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, TargetPlatform, kIsWeb;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) return web;
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyDEuuN0KWJEf_Yk-kTsFYjkHZljpPFcYIc',
    appId: '1:294032505206:web:YOUR_WEB_APP_ID',
    messagingSenderId: '294032505206',
    projectId: 'clinic-3bb81',
    storageBucket: 'clinic-3bb81.firebasestorage.app',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyDEuuN0KWJEf_Yk-kTsFYjkHZljpPFcYIc',
    appId: '1:294032505206:android:c5a10093dbe0692042a257',
    messagingSenderId: '294032505206',
    projectId: 'clinic-3bb81',
    storageBucket: 'clinic-3bb81.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'YOUR_IOS_API_KEY',
    appId: 'YOUR_IOS_APP_ID',
    messagingSenderId: '294032505206',
    projectId: 'clinic-3bb81',
    storageBucket: 'clinic-3bb81.firebasestorage.app',
    iosBundleId: 'com.dhdh.dd',
  );
}
