import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:pharmaworld_driver/features/deliveries/provider/delivery_provider.dart';
import 'package:pharmaworld_driver/shared/widgets/delivery_card.dart';
import 'package:pharmaworld_driver/shared/widgets/loading_indicator.dart';
import 'package:pharmaworld_driver/shared/widgets/empty_state.dart';

class CompletedDeliveriesPage extends ConsumerWidget {
  const CompletedDeliveriesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final completedAsync = ref.watch(completedDeliveriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n?.completedDeliveries ?? 'Completed Deliveries'),
      ),
      body: completedAsync.when(
        data: (deliveries) {
          if (deliveries.isEmpty) {
            return EmptyState(
              icon: Icons.check_circle_outline,
              title: 'No Completed Deliveries',
              subtitle: 'Your completed deliveries will appear here',
              onRetry: () => ref.refresh(completedDeliveriesProvider),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.refresh(completedDeliveriesProvider),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: deliveries.length,
              itemBuilder: (context, index) {
                final delivery = deliveries[index];
                return DeliveryCard(
                  delivery: delivery,
                  isCompleted: true,
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
          onRetry: () => ref.refresh(completedDeliveriesProvider),
        ),
      ),
    );
  }
}
