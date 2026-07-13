import 'dart:math';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final locationServiceProvider = Provider((ref) {
  return LocationService();
});

class LocationService {
  Future<({double lat, double lng})> getCurrentLocation() async {
    // Simulate getting current location
    return (lat: 24.7136, lng: 46.6753);
  }

  double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in km
    final dLat = _toRadians(lat2 - lat1);
    final dLng = _toRadians(lng2 - lng1);
    final a = (dLat / 2) * (dLat / 2) +
        cos(_toRadians(lat1)) *
            cos(_toRadians(lat2)) *
            (dLng / 2) *
            (dLng / 2);
    final c = 2 * asin(sqrt(a));
    return R * c;
  }

  double _toRadians(double deg) => deg * (3.141592653589793 / 180);

  int estimateTimeMinutes(double distanceKm) {
    // Assume average speed of 30 km/h in city
    return ((distanceKm / 30) * 60).ceil();
  }
}
