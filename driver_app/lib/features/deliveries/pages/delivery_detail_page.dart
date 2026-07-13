import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:pharmaworld_driver/core/constants/app_colors.dart';
import 'package:pharmaworld_driver/core/utils/helpers.dart';
import 'package:pharmaworld_driver/core/utils/formatters.dart';
import 'package:pharmaworld_driver/features/deliveries/provider/delivery_provider.dart';
import 'package:pharmaworld_driver/shared/widgets/loading_indicator.dart';
import 'package:pharmaworld_driver/shared/widgets/empty_state.dart';

class DeliveryDetailPage extends ConsumerWidget {
  final String deliveryId;

  const DeliveryDetailPage({super.key, required this.deliveryId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final deliveryAsync = ref.watch(deliveryDetailProvider(deliveryId));

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n?.orderDetails ?? 'Order Details'),
      ),
      body: deliveryAsync.when(
        data: (delivery) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildStatusHeader(context, delivery, l10n),
                const SizedBox(height: 16),
                _buildTimeline(context, delivery, l10n),
                const SizedBox(height: 16),
                _buildLocationCard(
                  context,
                  title: l10n?.pickupLocation ?? 'Pickup Location',
                  icon: Icons.store,
                  address: delivery.pickupAddress.address,
                  lat: delivery.pickupAddress.latitude,
                  lng: delivery.pickupAddress.longitude,
                ),
                const SizedBox(height: 12),
                _buildLocationCard(
                  context,
                  title: l10n?.deliveryLocation ?? 'Delivery Location',
                  icon: Icons.location_on,
                  address: delivery.deliveryAddress.address,
                  lat: delivery.deliveryAddress.latitude,
                  lng: delivery.deliveryAddress.longitude,
                ),
                const SizedBox(height: 12),
                _buildCustomerSection(context, delivery, l10n),
                const SizedBox(height: 12),
                _buildOrderItems(context, delivery, l10n),
                if (delivery.specialInstructions != null &&
                    delivery.specialInstructions!.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  _buildSpecialInstructions(context, delivery),
                ],
                const SizedBox(height: 12),
                if (delivery.distance != null || delivery.estimatedTime != null)
                  _buildDistanceInfo(context, delivery, l10n),
              ],
            ),
          );
        },
        loading: () => const LoadingIndicator(),
        error: (e, _) => EmptyState(
          icon: Icons.error_outline,
          title: l10n?.failedToLoad ?? 'Failed to load',
          subtitle: e.toString(),
          onRetry: () => ref.refresh(deliveryDetailProvider(deliveryId)),
        ),
      ),
    );
  }

  Widget _buildStatusHeader(BuildContext context, dynamic delivery, AppLocalizations? l10n) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.getStatusColor(delivery.status).withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.getStatusColor(delivery.status)),
      ),
      child: Column(
        children: [
          Icon(
            Helpers.getStatusIcon(delivery.status),
            color: AppColors.getStatusColor(delivery.status),
            size: 48,
          ),
          const SizedBox(height: 8),
          Text(
            Helpers.getStatusText(context, delivery.status),
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.getStatusColor(delivery.status),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Order #${delivery.orderId}',
            style: const TextStyle(color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Widget _buildTimeline(BuildContext context, dynamic delivery, AppLocalizations? l10n) {
    final steps = [
      {'status': 'ASSIGNED', 'label': 'Assigned', 'time': delivery.assignedAt},
      {'status': 'ACCEPTED', 'label': 'Accepted', 'time': delivery.acceptedAt},
      {'status': 'PICKING_UP', 'label': 'Picking Up', 'time': null},
      {'status': 'PICKED_UP', 'label': 'Picked Up', 'time': delivery.pickedUpAt},
      {'status': 'DELIVERING', 'label': 'Delivering', 'time': null},
      {'status': 'DELIVERED', 'label': 'Delivered', 'time': delivery.deliveredAt},
    ];

    final currentStatusIndex = steps.indexWhere((s) => s['status'] == delivery.status);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Delivery Timeline',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 12),
            ...List.generate(steps.length, (index) {
              final step = steps[index];
              final isCompleted = index <= currentStatusIndex;
              final isCurrent = step['status'] == delivery.status;

              return Row(
                children: [
                  Column(
                    children: [
                      Container(
                        width: 24,
                        height: 24,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isCompleted
                              ? AppColors.getStatusColor(delivery.status)
                              : Colors.grey[300],
                          border: isCurrent
                              ? Border.all(
                                  color: AppColors.getStatusColor(delivery.status),
                                  width: 2,
                                )
                              : null,
                        ),
                        child: isCompleted
                            ? const Icon(Icons.check, color: Colors.white, size: 14)
                            : null,
                      ),
                      if (index < steps.length - 1)
                        Container(
                          width: 2,
                          height: 30,
                          color: isCompleted
                              ? AppColors.getStatusColor(delivery.status)
                              : Colors.grey[300],
                        ),
                    ],
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          step['label'] as String,
                          style: TextStyle(
                            fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                            color: isCompleted ? Colors.black : Colors.grey,
                          ),
                        ),
                        if (step['time'] != null)
                          Text(
                            Formatters.formatDateTime(step['time'] as DateTime),
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.grey,
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildLocationCard(
    BuildContext context, {
    required String title,
    required IconData icon,
    required String address,
    required double lat,
    required double lng,
  }) {
    return Card(
      child: ListTile(
        leading: Icon(icon, color: AppColors.primaryLight),
        title: Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
        subtitle: Text(address),
        trailing: IconButton(
          onPressed: () => context.push('/navigation/$lat/$lng?title=$title'),
          icon: const Icon(Icons.directions, color: AppColors.primaryLight),
        ),
      ),
    );
  }

  Widget _buildCustomerSection(BuildContext context, dynamic delivery, AppLocalizations? l10n) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Customer Information',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const Divider(),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: CircleAvatar(
                child: Text(delivery.customer.name[0].toUpperCase()),
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
            Text(
              '${l10n?.orderSummary ?? 'Order Summary'} (${delivery.items.length} ${l10n?.items ?? 'items'})',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const Divider(),
            ...delivery.items.map<Widget>((item) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Row(
                    children: [
                      Container(
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
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.name,
                              style: const TextStyle(fontWeight: FontWeight.w500),
                            ),
                            Text(
                              '${l10n?.quantity ?? 'Qty'}: ${item.quantity}',
                              style: const TextStyle(
                                fontSize: 12,
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        Formatters.formatCurrency(item.price * item.quantity),
                        style: const TextStyle(fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                )),
            const Divider(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  l10n?.total ?? 'Total',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                Text(
                  Formatters.formatCurrency(
                    delivery.items.fold<double>(
                      0,
                      (sum, item) => sum + item.price * item.quantity,
                    ),
                  ),
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ],
            ),
          ],
        ),
      ),
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

  Widget _buildDistanceInfo(BuildContext context, dynamic delivery, AppLocalizations? l10n) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            if (delivery.distance != null)
              Column(
                children: [
                  const Icon(Icons.straighten, color: AppColors.primaryLight),
                  const SizedBox(height: 4),
                  Text(
                    Formatters.formatDistance(delivery.distance!),
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    l10n?.distance ?? 'Distance',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
            if (delivery.estimatedTime != null)
              Column(
                children: [
                  const Icon(Icons.access_time, color: AppColors.primaryLight),
                  const SizedBox(height: 4),
                  Text(
                    '${delivery.estimatedTime} min',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    l10n?.estimatedTime ?? 'Est. Time',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}
