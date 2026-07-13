import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pharmaworld_driver/core/localization/app_localizations.dart';
import 'package:pharmaworld_driver/core/constants/app_colors.dart';
import 'package:pharmaworld_driver/core/utils/formatters.dart';
import 'package:pharmaworld_driver/features/home/provider/home_provider.dart';
import 'package:pharmaworld_driver/shared/widgets/delivery_card.dart';
import 'package:pharmaworld_driver/shared/widgets/stat_card.dart';
import 'package:pharmaworld_driver/shared/widgets/online_toggle.dart';
import 'package:pharmaworld_driver/shared/widgets/loading_indicator.dart';
import 'package:pharmaworld_driver/shared/widgets/empty_state.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final dashboardAsync = ref.watch(dashboardProvider);
    final activeDeliveryAsync = ref.watch(activeDeliveryProvider);
    final isOnline = ref.watch(onlineToggleProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n?.home ?? 'Home'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(dashboardProvider);
          ref.invalidate(activeDeliveryProvider);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              OnlineToggle(
                isOnline: isOnline,
                onToggle: () async {
                  try {
                    await ref.read(onlineToggleProvider.notifier).toggle();
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Failed to update status')),
                      );
                    }
                  }
                },
              ),
              const SizedBox(height: 16),
              dashboardAsync.when(
                data: (data) => _buildStatsGrid(context, data, l10n),
                loading: () => const LoadingIndicator(),
                error: (_, __) => const SizedBox.shrink(),
              ),
              const SizedBox(height: 24),
              Text(
                l10n?.activeDelivery ?? 'Active Delivery',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 12),
              activeDeliveryAsync.when(
                data: (delivery) {
                  if (delivery == null) {
                    return EmptyState(
                      icon: Icons.local_shipping_outlined,
                      title: l10n?.noActiveDelivery ?? 'No Active Delivery',
                      subtitle: isOnline
                          ? 'Waiting for new deliveries...'
                          : 'Go online to receive deliveries',
                    );
                  }
                  return DeliveryCard(
                    delivery: delivery,
                    onTap: () => context.push('/deliveries/${delivery.id}'),
                  );
                },
                loading: () => const LoadingIndicator(),
                error: (_, __) => EmptyState(
                  icon: Icons.error_outline,
                  title: l10n?.failedToLoad ?? 'Failed to load',
                  subtitle: l10n?.tryAgain ?? 'Try again',
                  onRetry: () => ref.refresh(activeDeliveryProvider),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatsGrid(BuildContext context, Map<String, dynamic> data, AppLocalizations? l10n) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        StatCard(
          icon: Icons.local_shipping_outlined,
          title: l10n?.todaysDeliveries ?? "Today's Deliveries",
          value: '${data['todayDeliveries'] ?? 0}',
          color: AppColors.info,
        ),
        StatCard(
          icon: Icons.attach_money,
          title: l10n?.todaysEarnings ?? "Today's Earnings",
          value: Formatters.formatCurrency(data['todayEarnings'] ?? 0.0),
          color: AppColors.success,
        ),
        StatCard(
          icon: Icons.check_circle_outline,
          title: l10n?.completionRate ?? 'Completion Rate',
          value: '${(data['completionRate'] ?? 0.0).toStringAsFixed(0)}%',
          color: AppColors.primaryLight,
        ),
        StatCard(
          icon: Icons.star_outline,
          title: l10n?.averageRating ?? 'Average Rating',
          value: '${(data['averageRating'] ?? 0.0).toStringAsFixed(1)}',
          color: AppColors.warning,
        ),
      ],
    );
  }
}
