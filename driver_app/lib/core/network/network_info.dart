import 'package:connectivity_plus/connectivity_plus.dart';

class NetworkInfo {
  final Connectivity _connectivity;

  NetworkInfo(this._connectivity);

  Future<bool> get isConnected async {
    final connectivityResults = await _connectivity.checkConnectivity();
    if (connectivityResults.any((r) => r == ConnectivityResult.none)) {
      return false;
    }
    return true;
  }

  Stream<List<ConnectivityResult>> get onConnectivityChanged =>
      _connectivity.onConnectivityChanged;
}
