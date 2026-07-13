import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:pharmaworld_driver/core/constants/app_colors.dart';
import 'package:pharmaworld_driver/core/utils/formatters.dart';
import 'package:pharmaworld_driver/features/deliveries/provider/delivery_provider.dart';
import 'package:pharmaworld_driver/shared/widgets/loading_indicator.dart';
import 'package:pharmaworld_driver/shared/widgets/empty_state.dart';

class OrderDetailPage extends ConsumerWidget {
  final String orderId;

  const OrderDetailPage({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final deliveryAsync = ref.watch(deliveryDetailProvider(orderId));

    return Scaffold(
      appBar: AppBar(
        title: Text('${l10n?.order ?? 'Order'} #$orderId'),
      ),
      body: deliveryAsync.when(
        data: (delivery) {
          if (delivery == null) {
            return const EmptyState(
              icon: Icons.receipt_long,
              title: 'Order Not Found',
              subtitle: 'This order could not be found',
            );
          }
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildCustomerInfo(context, delivery, l10n),
                const SizedBox(height: 16),
                _buildOrderItems(context, delivery, l10n),
                const SizedBox(height: 16),
                _buildLocations(context, delivery, l10n),
                if (delivery.specialInstructions != null &&
                    delivery.specialInstructions!.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  _buildSpecialInstructions(context, delivery),
                ],
                const SizedBox(height: 16),
                _buildMapView(context, delivery, l10n),
              ],
            ),
          );
        },
        loading: () => const LoadingIndicator(),
        error: (e, _) => EmptyState(
          icon: Icons.error_outline,
          title: l10n?.failedToLoad ?? 'Failed to load',
          subtitle: e.toString(),
          onRetry: () => ref.refresh(deliveryDetailProvider(orderId)),
        ),
      ),
    );
  }

  Widget _buildCustomerInfo(BuildContext context, dynamic delivery, AppLocalizations? l10n) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n?.customerName ?? 'Customer',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 12),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: CircleAvatar(
                backgroundColor: AppColors.primaryLight,
                child: Text(
                  delivery.customer.name[0].toUpperCase(),
                  style: const TextStyle(color: Colors.white),
                ),
              ),
              title: Text(delivery.customer.name),
              subtitle: Text(delivery.customer.phone),
              trailing: IconButton(
                onPressed: () {
                  // Launch phone call
                },
                icon: const Icon(Icons.call, color: AppColors.success),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderItems(BuildContext context, dynamic delivery, AppLocalizations? l10n) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  l10n?.orderSummary ?? 'Order Items',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '${delivery.items.length} ${l10n?.items ?? 'items'}',
                    style: const TextStyle(
                      color: AppColors.primaryLight,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
            const Divider(),
            ...delivery.items.map<Widget>((item) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: item.image != null
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.network(
                              item.image!,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => const Icon(Icons.medication),
                            ),
                          )
                        : const Icon(Icons.medication),
                  ),
                  title: Text(item.name),
                  subtitle: Text('${l10n?.quantity ?? 'Qty'}: ${item.quantity}'),
                  trailing: Text(
                    Formatters.formatCurrency(item.price * item.quantity),
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                )),
            const Divider(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  l10n?.total ?? 'Total',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Text(
                  Formatters.formatCurrency(
                    delivery.items.fold<double>(
                      0,
                      (sum, item) => sum + item.price * item.quantity,
                    ),
                  ),
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: AppColors.primaryLight,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLocations(BuildContext context, dynamic delivery, AppLocalizations? l10n) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Locations',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 12),
            _buildLocationItem(
              context,
              icon: Icons.store,
              title: l10n?.pickup ?? 'Pickup',
              address: delivery.pickupAddress.address,
              lat: delivery.pickupAddress.latitude,
              lng: delivery.pickupAddress.longitude,
            ),
            const SizedBox(height: 12),
            _buildLocationItem(
              context,
              icon: Icons.location_on,
              title: l10n?.dropoff ?? 'Drop-off',
              address: delivery.deliveryAddress.address,
              lat: delivery.deliveryAddress.latitude,
              lng: delivery.deliveryAddress.longitude,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLocationItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String address,
    required double lat,
    required double lng,
  }) {
    return Row(
      children: [
        Icon(icon, color: AppColors.primaryLight, size: 20),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                  color: Colors.grey,
                ),
              ),
              Text(address),
            ],
          ),
        ),
        IconButton(
          onPressed: () => context.push('/navigation/$lat/$lng?title=$title'),
          icon: const Icon(Icons.directions, color: AppColors.primaryLight),
        ),
      ],
    );
  }

  Widget _buildSpecialInstructions(BuildContext context, dynamic delivery) {
    return Card(
      color: Colors.orange.withOpacity(0.1),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.info_outline, color: Colors.orange),
                SizedBox(width: 8),
                Text(
                  'Special Instructions',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.orange,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(delivery.specialInstructions!),
          ],
        ),
      ),
    );
  }

  Widget _buildMapView(BuildContext context, dynamic delivery, AppLocalizations? l10n) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n?.routeMap ?? 'Route Map',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              height: 200,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(12),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Stack(
                  children: [
                    const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.map, size: 48, color: Colors.grey),
                          SizedBox(height: 8),
                          Text(
                            'Map View',
                            style: TextStyle(color: Colors.grey),
                          ),
                        ],
                      ),
                    ),
                    Positioned(
                      bottom: 8,
                      right: 8,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          final lat = delivery.deliveryAddress.latitude;
                          final lng = delivery.deliveryAddress.longitude;
                          context.push('/navigation/$lat/$lng?title=Delivery');
                        },
                        icon: const Icon(Icons.navigation, size: 16),
                        label: Text(l10n?.getDirections ?? 'Get Directions'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryLight,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
