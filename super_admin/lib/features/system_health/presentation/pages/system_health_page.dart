import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../../core/constants/colors.dart';
import '../../../../core/localization/app_localizations.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../shared/models/system_health.dart';
import '../../../../shared/widgets/page_header.dart';
import '../../../../shared/widgets/chart_card.dart';
import '../../../../shared/widgets/status_indicator.dart';
import '../../../../shared/widgets/stat_card.dart';

final systemHealthProvider = Provider<SystemHealth>((ref) {
  return SystemHealth(
    api: ApiHealth(
      status: 'healthy',
      responseTimeMs: 145,
      errorRate: 0.3,
      requestsPerSecond: 2450,
      responseTimes: [120, 135, 145, 155, 140, 130, 160, 148, 142, 138, 150, 155],
    ),
    database: DatabaseHealth(
      status: 'healthy',
      activeConnections: 45,
      connectionPoolSize: 100,
      queryTimeMs: 12,
      totalQueries: 158432,
    ),
    cache: CacheHealth(
      status: 'healthy',
      hitRate: 94.5,
      missRate: 5.5,
      totalKeys: 245632,
      memoryUsedMB: 512,
    ),
    sessions: SessionHealth(
      activeSessions: 1247,
      peakToday: 2891,
      avgDurationMinutes: 23.5,
    ),
    server: ServerHealth(
      cpuUsage: 42,
      memoryUsage: 68,
      diskUsage: 55,
      uptime: 99.8,
    ),
  );
});

final apiHealthHistoryProvider = Provider<List<double>>((ref) {
  return [145, 138, 142, 155, 160, 148, 140, 135, 150, 158, 145, 142];
});

class SystemHealthPage extends ConsumerWidget {
  const SystemHealthPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final health = ref.watch(systemHealthProvider);
    final loc = AppLocalizations.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        PageHeader(
          title: loc.translate('systemHealth'),
          subtitle: 'Real-time system monitoring',
          actions: [
            StatusIndicator(status: health.overallStatus),
            const SizedBox(width: 12),
            ElevatedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.refresh, size: 18),
              label: const Text('Refresh'),
            ),
          ],
        ),
        _buildOverallStatus(health, loc),
        const SizedBox(height: 24),
        _buildMetricsGrid(health, loc),
        const SizedBox(height: 24),
        _buildCharts(health, loc),
      ],
    );
  }

  Widget _buildOverallStatus(SystemHealth health, AppLocalizations loc) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Row(
          children: [
            _buildHealthIndicator(loc.translate('apiStatus'), health.api.status),
            const SizedBox(width: 32),
            _buildHealthIndicator(loc.translate('databaseStatus'), health.database.status),
            const SizedBox(width: 32),
            _buildHealthIndicator(loc.translate('cacheStatus'), health.cache.status),
            const Spacer(),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: (health.overallStatus == 'healthy' ? AppColors.success : health.overallStatus == 'degraded' ? AppColors.warning : AppColors.error).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  StatusIndicator(status: health.overallStatus),
                  const SizedBox(width: 8),
                  Text(health.overallStatus.toUpperCase(), style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHealthIndicator(String label, String status) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[500])),
        const SizedBox(height: 4),
        StatusIndicator(status: status),
      ],
    );
  }

  Widget _buildMetricsGrid(SystemHealth health, AppLocalizations loc) {
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
            StatCard(title: loc.translate('responseTime'), value: Formatters.responseTime(health.api.responseTimeMs), icon: Icons.speed, color: AppColors.info),
            StatCard(title: loc.translate('errorRate'), value: '${health.api.errorRate}%', icon: Icons.error_outline, color: AppColors.error),
            StatCard(title: loc.translate('requestsPerSecond'), value: Formatters.compact(health.api.requestsPerSecond), icon: Icons.trending_up, color: AppColors.success),
            StatCard(title: loc.translate('activeSessions'), value: '${health.sessions.activeSessions}', icon: Icons.people, color: const Color(0xFF9C27B0)),
            StatCard(title: loc.translate('cpuUsage'), value: '${health.server.cpuUsage}%', icon: Icons.memory, color: AppColors.warning),
            StatCard(title: loc.translate('memoryUsage'), value: '${health.server.memoryUsage}%', icon: Icons.storage, color: AppColors.accent),
          ],
        );
      },
    );
  }

  Widget _buildCharts(SystemHealth health, AppLocalizations loc) {
    final apiHistory = ref.watch(apiHealthHistoryProvider);
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth > 900) {
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: _buildApiChart(apiHistory, loc)),
              const SizedBox(width: 24),
              Expanded(child: _buildResourceChart(health, loc)),
            ],
          );
        }
        return Column(
          children: [
            _buildApiChart(apiHistory, loc),
            const SizedBox(height: 24),
            _buildResourceChart(health, loc),
          ],
        );
      },
    );
  }

  Widget _buildApiChart(List<double> data, AppLocalizations loc) {
    return ChartCard(
      title: loc.translate('apiResponseTimes'),
      height: 250,
      child: LineChartWidget(
        data: data,
        labels: ['1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m', '10m', '11m', '12m'],
        color: AppColors.info,
      ),
    );
  }

  Widget _buildResourceChart(SystemHealth health, AppLocalizations loc) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(loc.translate('serverResourceUsage'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 24),
            _buildResourceBar(loc.translate('cpuUsage'), health.server.cpuUsage, AppColors.info),
            const SizedBox(height: 16),
            _buildResourceBar(loc.translate('memoryUsage'), health.server.memoryUsage, AppColors.warning),
            const SizedBox(height: 16),
            _buildResourceBar(loc.translate('diskUsage'), health.server.diskUsage, AppColors.accent),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildMiniStat(loc.translate('uptime'), '${health.server.uptime}%'),
                _buildMiniStat(loc.translate('hitRate'), '${health.cache.hitRate}%'),
                _buildMiniStat(loc.translate('activeConnections'), '${health.database.activeConnections}'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResourceBar(String label, double value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontSize: 13)),
            Text('${value.toStringAsFixed(1)}%', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Helpers.getHealthColor(value))),
          ],
        ),
        const SizedBox(height: 6),
        LinearProgressIndicator(
          value: value / 100,
          backgroundColor: Colors.grey[200],
          color: Helpers.getHealthColor(value),
          minHeight: 8,
          borderRadius: BorderRadius.circular(4),
        ),
      ],
    );
  }

  Widget _buildMiniStat(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(label, style: TextStyle(fontSize: 11, color: Colors.grey[500])),
      ],
    );
  }
}
