import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:pharmaworld_driver/core/constants/app_colors.dart';

class MapWidget extends StatelessWidget {
  final double latitude;
  final double longitude;
  final String? title;
  final bool showMarker;

  const MapWidget({
    super.key,
    required this.latitude,
    required this.longitude,
    this.title,
    this.showMarker = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 200,
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: GoogleMap(
          initialCameraPosition: CameraPosition(
            target: LatLng(latitude, longitude),
            zoom: 15,
          ),
          markers: showMarker
              ? {
                  Marker(
                    markerId: const MarkerId('destination'),
                    position: LatLng(latitude, longitude),
                    infoWindow: InfoWindow(
                      title: title ?? 'Destination',
                    ),
                  ),
                }
              : {},
          zoomControlsEnabled: false,
          myLocationEnabled: false,
          myLocationButtonEnabled: false,
        ),
      ),
    );
  }
}
