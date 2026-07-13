import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pharmaworld_driver/core/localization/app_localizations.dart';
import 'package:pharmaworld_driver/core/constants/app_colors.dart';
import 'package:pharmaworld_driver/core/utils/helpers.dart';
import 'package:pharmaworld_driver/core/utils/formatters.dart';
import 'package:pharmaworld_driver/core/utils/snackbar_helper.dart';
import 'package:pharmaworld_driver/features/deliveries/provider/delivery_provider.dart';
import 'package:pharmaworld_driver/shared/widgets/loading_indicator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:pharmaworld_driver/shared/widgets/empty_state.dart';
import 'package:pharmaworld_driver/shared/widgets/confirmation_dialog.dart';
import 'package:url_launcher/url_launcher.dart';

class ActiveDeliveryPage extends ConsumerWidget {
  const ActiveDeliveryPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final activeDeliveryAsync = ref.watch(activeDeliveryProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n?.activeDelivery ?? 'Active Delivery'),
      ),
      body: activeDeliveryAsync.when(
        data: (delivery) {
          if (delivery == null) {
            return EmptyState(
              icon: Icons.local_shipping_outlined,
              title: l10n?.noActiveDelivery ?? 'No Active Delivery',
              subtitle: 'You don\'t have an active delivery at the moment',
            );
          }
          return _buildDeliveryDetails(context, ref, delivery, l10n);
        },
        loading: () => const LoadingIndicator(),
        error: (e, _) => EmptyState(
          icon: Icons.error_outline,
          title: l10n?.failedToLoad ?? 'Failed to load',
          subtitle: e.toString(),
          onRetry: () => ref.refresh(activeDeliveryProvider),
        ),
      ),
    );
  }

  Widget _buildDeliveryDetails(
    BuildContext context,
    WidgetRef ref,
    dynamic delivery,
    AppLocalizations? l10n,
  ) {
    final status = delivery.status;
    final nextStatus = _getNextStatus(status);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.getStatusColor(status).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.getStatusColor(status)),
            ),
            child: Row(
              children: [
                Icon(
                  Helpers.getStatusIcon(status),
                  color: AppColors.getStatusColor(status),
                  size: 32,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Order #${delivery.orderId}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      Text(
                        Helpers.getStatusText(context, status),
                        style: TextStyle(
                          color: AppColors.getStatusColor(status),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _buildInfoCard(
            context,
            title: l10n?.pickupLocation ?? 'Pickup Location',
            icon: Icons.store,
            address: delivery.pickupAddress.address,
            onNavigate: () => context.push(
              '/navigation/${delivery.pickupAddress.latitude}/${delivery.pickupAddress.longitude}?title=Pickup',
            ),
          ),
          const SizedBox(height: 12),
          _buildInfoCard(
            context,
            title: l10n?.deliveryLocation ?? 'Delivery Location',
            icon: Icons.location_on,
            address: delivery.deliveryAddress.address,
            onNavigate: () => context.push(
              '/navigation/${delivery.deliveryAddress.latitude}/${delivery.deliveryAddress.longitude}?title=Delivery',
            ),
          ),
          const SizedBox(height: 12),
          _buildCustomerCard(context, delivery, l10n),
          const SizedBox(height: 12),
          if (delivery.specialInstructions != null &&
              delivery.specialInstructions!.isNotEmpty) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.orange.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.orange),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.info_outline, color: Colors.orange),
                      const SizedBox(width: 8),
                      Text(
                        l10n?.specialInstructions ?? 'Special Instructions',
                        style: const TextStyle(
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
            const SizedBox(height: 12),
          ],
          _buildOrderSummary(context, delivery, l10n),
          const SizedBox(height: 16),
          if (nextStatus != null) ...[
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => _handleStatusUpdate(context, ref, delivery.id, nextStatus),
                icon: Icon(_getStatusButtonIcon(nextStatus)),
                label: Text(_getStatusLabel(context, nextStatus)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.getStatusColor(nextStatus),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ),
            const SizedBox(height: 8),
          ],
          if (status == 'DELIVERING')
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => _showFailDialog(context, ref, delivery.id),
                icon: const Icon(Icons.cancel_outlined, color: AppColors.error),
                label: Text(
                  l10n?.failed ?? 'Failed',
                  style: const TextStyle(color: AppColors.error),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildInfoCard(
    BuildContext context, {
    required String title,
    required IconData icon,
    required String address,
    required VoidCallback onNavigate,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(icon, color: AppColors.primaryLight),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.grey,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    address,
                    style: const TextStyle(fontSize: 14),
                  ),
                ],
              ),
            ),
            IconButton(
              onPressed: onNavigate,
              icon: const Icon(Icons.directions, color: AppColors.primaryLight),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCustomerCard(BuildContext context, dynamic delivery, AppLocalizations? l10n) {
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
                color: Colors.grey,
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              delivery.customer.name,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.phone, size: 16, color: Colors.grey),
                const SizedBox(width: 8),
                Text(delivery.customer.phone),
                const Spacer(),
                TextButton.icon(
                  onPressed: () async {
                    final url = Uri.parse('tel:${delivery.customer.phone}');
                    if (await canLaunchUrl(url)) {
                      await launchUrl(url);
                    }
                  },
                  icon: const Icon(Icons.call, size: 16),
                  label: Text(l10n?.call ?? 'Call'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderSummary(BuildContext context, dynamic delivery, AppLocalizations? l10n) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n?.orderSummary ?? 'Order Summary',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            const Divider(),
            ...delivery.items.map<Widget>((item) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text('${item.quantity}x ${item.name}'),
                      ),
                      Text(Formatters.formatCurrency(item.price * item.quantity)),
                    ],
                  ),
                )),
            const Divider(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Total',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                Text(
                  Formatters.formatCurrency(
                    delivery.items.fold<double>(
                      0,
                      (sum, item) => sum + item.price * item.quantity,
                    ),
                  ),
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String? _getNextStatus(String currentStatus) {
    switch (currentStatus) {
      case 'ASSIGNED':
        return 'ACCEPTED';
      case 'ACCEPTED':
        return 'PICKING_UP';
      case 'PICKING_UP':
        return 'PICKED_UP';
      case 'PICKED_UP':
        return 'DELIVERING';
      case 'DELIVERING':
        return 'DELIVERED';
      default:
        return null;
    }
  }

  IconData _getStatusButtonIcon(String status) {
    switch (status) {
      case 'ACCEPTED':
        return Icons.check;
      case 'PICKING_UP':
        return Icons.navigation;
      case 'PICKED_UP':
        return Icons.inventory_2;
      case 'DELIVERING':
        return Icons.local_shipping;
      case 'DELIVERED':
        return Icons.check_circle;
      default:
        return Icons.arrow_forward;
    }
  }

  String _getStatusLabel(BuildContext context, String status) {
    switch (status) {
      case 'ACCEPTED':
        return 'Accept Delivery';
      case 'PICKING_UP':
        return 'Navigate to Pickup';
      case 'PICKED_UP':
        return 'Picked Up';
      case 'DELIVERING':
        return 'Out for Delivery';
      case 'DELIVERED':
        return 'Confirm Delivery';
      default:
        return status;
    }
  }

  void _handleStatusUpdate(BuildContext context, WidgetRef ref, String deliveryId, String status) async {
    if (status == 'DELIVERED') {
      _showDeliveryConfirmation(context, ref, deliveryId);
      return;
    }

    try {
      await ref.read(deliveryActionProvider.notifier).updateStatus(deliveryId, status);
      if (context.mounted) {
        SnackbarHelper.showSuccess(context, 'Status updated successfully');
        ref.invalidate(activeDeliveryProvider);
      }
    } catch (e) {
      if (context.mounted) {
        SnackbarHelper.showError(context, e.toString());
      }
    }
  }

  void _showDeliveryConfirmation(BuildContext context, WidgetRef ref, String deliveryId) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 16,
          right: 16,
          top: 16,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Confirm Delivery',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text('Take a photo as proof of delivery'),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () async {
                  final ImagePicker picker = ImagePicker();
                  final XFile? image = await picker.pickImage(source: ImageSource.camera);
                  if (image != null) {
                    Navigator.pop(context);
                    try {
                      await ref.read(deliveryActionProvider.notifier).confirmDelivery(deliveryId, photoUrl: image.path);
                      if (context.mounted) {
                        SnackbarHelper.showSuccess(context, 'Delivery completed!');
                        ref.invalidate(activeDeliveryProvider);
                      }
                    } catch (e) {
                      if (context.mounted) {
                        SnackbarHelper.showError(context, e.toString());
                      }
                    }
                  }
                },
                icon: const Icon(Icons.camera_alt),
                label: const Text('Take Photo & Confirm'),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  void _showFailDialog(BuildContext context, WidgetRef ref, String deliveryId) {
    String? selectedReason;
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Delivery Failed'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Select a reason:'),
              const SizedBox(height: 16),
              ...['Customer Unavailable', 'Wrong Address', 'Customer Refused', 'Other'].map(
                (reason) => RadioListTile<String>(
                  title: Text(reason),
                  value: reason,
                  groupValue: selectedReason,
                  onChanged: (value) {
                    setState(() => selectedReason = value);
                  },
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: selectedReason != null
                  ? () async {
                      Navigator.pop(context);
                      try {
                        await ref.read(deliveryActionProvider.notifier).failDelivery(
                              deliveryId,
                              selectedReason!,
                            );
                        if (context.mounted) {
                          SnackbarHelper.showInfo(context, 'Delivery marked as failed');
                          ref.invalidate(activeDeliveryProvider);
                        }
                      } catch (e) {
                        if (context.mounted) {
                          SnackbarHelper.showError(context, e.toString());
                        }
                      }
                    }
                  : null,
              child: const Text('Submit'),
            ),
          ],
        ),
      ),
    );
  }
}
