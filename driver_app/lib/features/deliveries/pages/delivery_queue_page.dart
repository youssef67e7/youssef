import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pharmaworld_driver/core/localization/app_localizations.dart';
import 'package:pharmaworld_driver/features/deliveries/provider/delivery_provider.dart';
import 'package:pharmaworld_driver/shared/widgets/delivery_card.dart';
import 'package:pharmaworld_driver/shared/widgets/loading_indicator.dart';
import 'package:pharmaworld_driver/shared/widgets/empty_state.dart';
import 'package:pharmaworld_driver/core/utils/snackbar_helper.dart';

class DeliveryQueuePage extends ConsumerWidget {
  const DeliveryQueuePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final queueAsync = ref.watch(deliveryQueueProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n?.deliveryQueue ?? 'Delivery Queue'),
        actions: [
          IconButton(
            icon: const Icon(Icons.checklist),
            onPressed: () => context.push('/deliveries/completed'),
          ),
        ],
      ),
      body: queueAsync.when(
        data: (deliveries) {
          if (deliveries.isEmpty) {
            return EmptyState(
              icon: Icons.inbox_outlined,
              title: l10n?.noDeliveries ?? 'No Deliveries Available',
              subtitle: 'New delivery assignments will appear here',
              onRetry: () => ref.refresh(deliveryQueueProvider),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.refresh(deliveryQueueProvider),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: deliveries.length,
              itemBuilder: (context, index) {
                final delivery = deliveries[index];
                return DeliveryCard(
                  delivery: delivery,
                  showActions: true,
                  onAccept: () => _handleAccept(context, ref, delivery.id),
                  onDecline: () => _handleDecline(context, ref, delivery.id),
                  onTap: () => context.push('/deliveries/${delivery.id}'),
                );
              },
            ),
          );
        },
        loading: () => const LoadingIndicator(),
        error: (e, _) => EmptyState(
          icon: Icons.error_outline,
          title: l10n?.failedToLoad ?? 'Failed to load',
          subtitle: e.toString(),
          onRetry: () => ref.refresh(deliveryQueueProvider),
        ),
      ),
    );
  }

  void _handleAccept(BuildContext context, WidgetRef ref, String deliveryId) async {
    try {
      await ref.read(deliveryActionProvider.notifier).acceptDelivery(deliveryId);
      if (context.mounted) {
        SnackbarHelper.showSuccess(context, 'Delivery accepted!');
      }
    } catch (e) {
      if (context.mounted) {
        SnackbarHelper.showError(context, e.toString());
      }
    }
  }

  void _handleDecline(BuildContext context, WidgetRef ref, String deliveryId) async {
    try {
      await ref.read(deliveryActionProvider.notifier).declineDelivery(deliveryId);
      if (context.mounted) {
        SnackbarHelper.showInfo(context, 'Delivery declined');
      }
    } catch (e) {
      if (context.mounted) {
        SnackbarHelper.showError(context, e.toString());
      }
    }
  }
}
