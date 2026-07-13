import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../../core/localization/app_localizations.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/constants/colors.dart';
import '../../../../shared/models/dashboard_stats.dart';
import '../../../../shared/widgets/stat_card.dart';
import '../../../../shared/widgets/chart_card.dart';
import '../../../../shared/widgets/page_header.dart';
import '../../../../shared/widgets/status_indicator.dart';

final dashboardStatsProvider = Provider<DashboardStats>((ref) {
  return DashboardStats.mock();
});

class DashboardPage extends ConsumerWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stats = ref.watch(dashboardStatsProvider);
    final loc = AppLocalizations.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        PageHeader(
          title: loc.translate('dashboard'),
          subtitle: 'System-wide overview',
        ),
        _buildStatCards(stats, loc),
        const SizedBox(height: 24),
        _buildChartsRow(stats, loc),
        const SizedBox(height: 24),
        _buildBottomRow(stats, loc),
      ],
    );
  }

  Widget _buildStatCards(DashboardStats stats, AppLocalizations loc) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final crossAxisCount = constraints.maxWidth > 1200 ? 6 : (constraints.maxWidth > 800 ? 3 : 2);
        return GridView.count(
          crossAxisCount: crossAxisCount,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 16,
          crossAxisSpacing: 16,
          childAspectRatio: 1.8,
          children: [
            StatCard(title: loc.translate('totalRevenue'), value: Formatters.currency(stats.totalRevenue), icon: Icons.attach_money, color: AppColors.success, growth: stats.revenueGrowth),
            StatCard(title: loc.translate('totalOrders'), value: Formatters.compact(stats.totalOrders.toDouble()), icon: Icons.shopping_cart, color: AppColors.info, growth: stats.ordersGrowth),
            StatCard(title: loc.translate('totalUsers'), value: Formatters.compact(stats.totalUsers.toDouble()), icon: Icons.people, color: AppColors.accent, growth: stats.usersGrowth),
            StatCard(title: loc.translate('totalMedicines'), value: Formatters.compact(stats.totalMedicines.toDouble()), icon: Icons.medication, color: AppColors.primaryLight),
            StatCard(title: loc.translate('totalPharmacies'), value: '${stats.totalPharmacies}', icon: Icons.local_pharmacy, color: const Color(0xFF9C27B0)),
            StatCard(title: loc.translate('activeDrivers'), value: '${stats.activeDrivers}', icon: Icons.delivery_dining, color: const Color(0xFFFF9800)),
          ],
        );
      },
    );
  }

  Widget _buildChartsRow(DashboardStats stats, AppLocalizations loc) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth > 900) {
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(flex: 3, child: _buildRevenueChart(stats, loc)),
              const SizedBox(width: 24),
              Expanded(flex: 2, child: _buildOrdersByRegionChart(stats, loc)),
            ],
          );
        }
        return Column(
          children: [
            _buildRevenueChart(stats, loc),
            const SizedBox(height: 24),
            _buildOrdersByRegionChart(stats, loc),
          ],
        );
      },
    );
  }

  Widget _buildRevenueChart(DashboardStats stats, AppLocalizations loc) {
    return ChartCard(
      title: loc.translate('revenueTrends'),
      height: 280,
      child: LineChartWidget(
        data: stats.revenueTrend,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        color: AppColors.success,
      ),
    );
  }

  Widget _buildOrdersByRegionChart(DashboardStats stats, AppLocalizations loc) {
    return ChartCard(
      title: loc.translate('ordersByRegion'),
      height: 280,
      child: PieChartWidget(data: stats.ordersByRegion),
    );
  }

  Widget _buildBottomRow(DashboardStats stats, AppLocalizations loc) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth > 900) {
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(flex: 3, child: _buildTopPharmacies(stats, loc)),
              const SizedBox(width: 24),
              Expanded(flex: 2, child: _buildSystemAlerts(stats, loc)),
            ],
          );
        }
        return Column(
          children: [
            _buildTopPharmacies(stats, loc),
            const SizedBox(height: 24),
            _buildSystemAlerts(stats, loc),
          ],
        );
      },
    );
  }

  Widget _buildTopPharmacies(DashboardStats stats, AppLocalizations loc) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(loc.translate('topPharmacies'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 16),
            ...stats.topPharmacies.asMap().entries.map((e) {
              final item = e.value;
              final maxRevenue = stats.topPharmacies.first['revenue'] as double;
              final revenue = (item['revenue'] as num).toDouble();
              final percentage = maxRevenue > 0 ? revenue / maxRevenue : 0.0;
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Row(
                  children: [
                    SizedBox(width: 24, child: Text('#${e.key + 1}', style: const TextStyle(fontWeight: FontWeight.bold))),
                    Expanded(flex: 2, child: Text('${item['name']}', style: const TextStyle(fontSize: 13))),
                    Expanded(
                      flex: 3,
                      child: LinearProgressIndicator(
                        value: percentage,
                        backgroundColor: Colors.grey[200],
                        color: AppColors.chartPalette[e.key % AppColors.chartPalette.length],
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    const SizedBox(width: 12),
                    SizedBox(width: 80, child: Text(Formatters.currency(revenue), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600), textAlign: TextAlign.right)),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildSystemAlerts(DashboardStats stats, AppLocalizations loc) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(loc.translate('systemAlerts'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(color: AppColors.error.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                  child: Text('${stats.systemAlerts}', style: const TextStyle(color: AppColors.error, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...stats.recentAlerts.map((alert) {
              final type = alert['type'] as String;
              final color = type == 'error' ? AppColors.error : type == 'warning' ? AppColors.warning : AppColors.info;
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    StatusIndicator(status: type, showLabel: false, size: 8),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('${alert['message']}', style: const TextStyle(fontSize: 13)),
                          const SizedBox(height: 2),
                          Text('${alert['time']}', style: TextStyle(fontSize: 11, color: Colors.grey[500])),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
