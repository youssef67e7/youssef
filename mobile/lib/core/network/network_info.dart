import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final networkInfoProvider = Provider<NetworkInfo>((ref) {
  return NetworkInfoImpl();
});

abstract class NetworkInfo {
  Future<bool> get isConnected;
  Stream<ConnectivityResult> get connectivityStream;
}

class NetworkInfoImpl implements NetworkInfo {

  NetworkInfoImpl({Connectivity? connectivity})
      : _connectivity = connectivity ?? Connectivity();
  final Connectivity _connectivity;

  @override
  Future<bool> get isConnected async {
    final result = await _connectivity.checkConnectivity();
    return result != ConnectivityResult.none;
  }

  @override
  Stream<ConnectivityResult> get connectivityStream =>
      _connectivity.onConnectivityChanged;
}
