import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:pharmaworld_driver/core/localization/app_localizations.dart';
import 'package:pharmaworld_driver/core/constants/app_colors.dart';
import 'package:url_launcher/url_launcher.dart';

class NavigationPage extends ConsumerStatefulWidget {
  final double latitude;
  final double longitude;
  final String title;

  const NavigationPage({
    super.key,
    required this.latitude,
    required this.longitude,
    required this.title,
  });

  @override
  ConsumerState<NavigationPage> createState() => _NavigationPageState();
}

class _NavigationPageState extends ConsumerState<NavigationPage> {
  late CameraPosition _initialPosition;
  final Set<Marker> _markers = {};

  @override
  void initState() {
    super.initState();
    _initialPosition = CameraPosition(
      target: LatLng(widget.latitude, widget.longitude),
      zoom: 14,
    );

    _markers.add(Marker(
      markerId: const MarkerId('destination'),
      position: LatLng(widget.latitude, widget.longitude),
      infoWindow: InfoWindow(
        title: widget.title,
        snippet: '${widget.latitude.toStringAsFixed(4)}, ${widget.longitude.toStringAsFixed(4)}',
      ),
      icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
    ));
  }

  Future<void> _openGoogleMaps() async {
    final url = Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=${widget.latitude},${widget.longitude}',
    );
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title.isNotEmpty ? widget.title : (l10n?.getDirections ?? 'Navigation')),
        actions: [
          IconButton(
            icon: const Icon(Icons.directions),
            onPressed: _openGoogleMaps,
            tooltip: 'Open in Google Maps',
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: GoogleMap(
              initialCameraPosition: _initialPosition,
              markers: _markers,
              myLocationEnabled: true,
              myLocationButtonEnabled: true,
              zoomControlsEnabled: false,
              mapToolbarEnabled: false,
            ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _openGoogleMaps,
                      icon: const Icon(Icons.navigation),
                      label: Text(l10n?.getDirections ?? 'Get Directions'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryLight,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton(
                    onPressed: _openGoogleMaps,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: AppColors.primaryLight,
                      side: const BorderSide(color: AppColors.primaryLight),
                      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                    ),
                    child: const Icon(Icons.map),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
