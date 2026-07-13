import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:pharmaworld_dashboard/shared/widgets/stat_card.dart';
import 'package:pharmaworld_dashboard/shared/widgets/chart_card.dart';
import 'package:pharmaworld_dashboard/shared/widgets/page_header.dart';
import 'package:pharmaworld_dashboard/shared/widgets/status_badge.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';
import 'package:pharmaworld_dashboard/core/constants/app_colors.dart';
import 'package:pharmaworld_dashboard/core/utils/formatters.dart';

final dashboardStatsProvider = FutureProvider<DashboardStats>((ref) async {
  return DashboardStats(
    totalRevenue: 125430.50,
    revenueChange: 12.5,
    totalOrders: 3842,
    ordersChange: 8.3,
    totalCustomers: 1250,
    customersChange: 15.2,
    totalMedicines: 520,
    medicinesChange: 3.1,
    pendingOrders: 45,
    onlineDrivers: 12,
    pendingReturns: 8,
    activeCoupons: 5,
    lowStockItems: 15,
    expiringItems: 7,
  );
});

final revenueChartProvider = FutureProvider<List<ChartData>>((ref) async {
  return List.generate(
    7,
    (i) => ChartData(
      label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      value: [12500, 15800, 11200, 18900, 16500, 22000, 19500][i].toDouble(),
    ),
  );
});

final ordersChartProvider = FutureProvider<List<ChartData>>((ref) async {
  return List.generate(
    7,
    (i) => ChartData(
      label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      value: [45, 62, 38, 78, 55, 90, 72][i].toDouble(),
    ),
  );
});

final topMedicinesProvider = FutureProvider<List<ChartData>>((ref) async {
  return [
    ChartData(label: 'Paracetamol', value: 245),
    ChartData(label: 'Ibuprofen', value: 198),
    ChartData(label: 'Amoxicillin', value: 165),
    ChartData(label: 'Vitamin C', value: 142),
    ChartData(label: 'Cetirizine', value: 128),
    ChartData(label: 'Omeprazole', value: 115),
    ChartData(label: 'Metformin', value: 98),
    ChartData(label: 'Losartan', value: 85),
  ];
});

final recentOrdersProvider = FutureProvider<List<Order>>((ref) async {
  return List.generate(
    8,
    (i) => Order(
      id: 'ORD-${1000 + i}',
      orderNumber: '#${1000 + i}',
      customerId: 'C${i + 1}',
      customerName: ['Ahmed Ali', 'Sara Mohammed', 'Omar Hassan', 'Fatima Khan', 'Ali Ibrahim', 'Nora Salem', 'Khalid Omar', 'Mona Ali'][i],
      totalAmount: [245.00, 180.50, 320.00, 150.75, 420.00, 95.50, 275.00, 190.25][i],
      status: ['pending', 'confirmed', 'delivered', 'preparing', 'out_for_delivery', 'delivered', 'cancelled', 'pending'][i],
      paymentMethod: 'cash_on_delivery',
      subtotal: 0,
      createdAt: DateTime.now().subtract(Duration(hours: i * 2)),
      updatedAt: DateTime.now().subtract(Duration(hours: i)),
    ),
  );
});

final orderStatusProvider = FutureProvider<List<ChartData>>((ref) async {
  return [
    ChartData(label: 'Pending', value: 45),
    ChartData(label: 'Confirmed', value: 32),
    ChartData(label: 'Preparing', value: 18),
    ChartData(label: 'Out for Delivery', value: 25),
    ChartData(label: 'Delivered', value: 120),
    ChartData(label: 'Cancelled', value: 12),
  ];
});

class DashboardPage extends ConsumerWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(dashboardStatsProvider);

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const PageHeader(
            title: 'Dashboard',
            subtitle: 'Welcome back! Here\'s what\'s happening today.',
          ),
          const SizedBox(height: 24),
          statsAsync.when(
            data: (stats) => _buildStatsSection(context, stats),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Error: $e')),
          ),
          const SizedBox(height: 24),
          _buildChartsSection(context, ref),
          const SizedBox(height: 24),
          _buildBottomSection(context, ref),
        ],
      ),
    );
  }

  Widget _buildStatsSection(BuildContext context, DashboardStats stats) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final crossAxisCount = constraints.maxWidth > 1200
            ? 4
            : constraints.maxWidth > 800
                ? 3
                : constraints.maxWidth > 500
                    ? 2
                    : 1;

        return GridView.count(
          crossAxisCount: crossAxisCount,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 1.8,
          children: [
            StatCard(
              title: 'Total Revenue',
              value: Formatters.formatCurrency(stats.totalRevenue),
              change: '${stats.revenueChange.toStringAsFixed(1)}%',
              isPositive: stats.revenueChange >= 0,
              icon: Icons.attach_money,
              iconColor: Colors.green,
              sparklineData: [
                FlSpot(0, 3), FlSpot(1, 5), FlSpot(2, 4),
                FlSpot(3, 7), FlSpot(4, 6), FlSpot(5, 8), FlSpot(6, 9),
              ],
            ),
            StatCard(
              title: 'Total Orders',
              value: Formatters.formatCompactNumber(stats.totalOrders.toDouble()),
              change: '${stats.ordersChange.toStringAsFixed(1)}%',
              isPositive: stats.ordersChange >= 0,
              icon: Icons.shopping_cart_outlined,
              iconColor: Colors.blue,
              sparklineData: [
                FlSpot(0, 2), FlSpot(1, 4), FlSpot(2, 3),
                FlSpot(3, 6), FlSpot(4, 5), FlSpot(5, 7), FlSpot(6, 8),
              ],
            ),
            StatCard(
              title: 'Total Customers',
              value: Formatters.formatCompactNumber(stats.totalCustomers.toDouble()),
              change: '${stats.customersChange.toStringAsFixed(1)}%',
              isPositive: stats.customersChange >= 0,
              icon: Icons.people_outlined,
              iconColor: Colors.purple,
              sparklineData: [
                FlSpot(0, 1), FlSpot(1, 3), FlSpot(2, 2),
                FlSpot(3, 5), FlSpot(4, 4), FlSpot(5, 6), FlSpot(6, 7),
              ],
            ),
            StatCard(
              title: 'Total Medicines',
              value: stats.totalMedicines.toString(),
              change: '${stats.medicinesChange.toStringAsFixed(1)}%',
              isPositive: stats.medicinesChange >= 0,
              icon: Icons.medication_outlined,
              iconColor: Colors.orange,
              sparklineData: [
                FlSpot(0, 4), FlSpot(1, 5), FlSpot(2, 4),
                FlSpot(3, 6), FlSpot(4, 7), FlSpot(5, 6), FlSpot(6, 7),
              ],
            ),
          ],
        );
      },
    );
  }

  Widget _buildChartsSection(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth > 800;

        return Column(
          children: [
            if (isWide)
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(flex: 3, child: _buildRevenueChart(context, ref)),
                  const SizedBox(width: 16),
                  Expanded(flex: 2, child: _buildOrdersChart(context, ref)),
                ],
              )
            else ...[
              _buildRevenueChart(context, ref),
              const SizedBox(height: 16),
              _buildOrdersChart(context, ref),
            ],
            const SizedBox(height: 16),
            if (isWide)
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(flex: 2, child: _buildTopMedicinesChart(context, ref)),
                  const SizedBox(width: 16),
                  Expanded(flex: 1, child: _buildOrderStatusChart(context, ref)),
                ],
              )
            else ...[
              _buildTopMedicinesChart(context, ref),
              const SizedBox(height: 16),
              _buildOrderStatusChart(context, ref),
            ],
          ],
        );
      },
    );
  }

  Widget _buildRevenueChart(BuildContext context, WidgetRef ref) {
    final revenueAsync = ref.watch(revenueChartProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ChartCard(
      title: 'Revenue (Last 7 Days)',
      height: 280,
      trailing: SegmentedButton<String>(
        segments: const [
          ButtonSegment(value: '7d', label: Text('7D')),
          ButtonSegment(value: '30d', label: Text('30D')),
          ButtonSegment(value: '12m', label: Text('12M')),
        ],
        selected: const {'7d'},
        onSelectionChanged: (v) {},
        style: ButtonStyle(
          visualDensity: VisualDensity.compact,
          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
        ),
      ),
      child: revenueAsync.when(
        data: (data) => LineChart(
          LineChartData(
            gridData: FlGridData(
              show: true,
              drawVerticalLine: false,
              horizontalInterval: 5000,
              getDrawingHorizontalLine: (value) => FlLine(
                color: isDark ? Colors.white10 : Colors.grey.shade200,
                strokeWidth: 1,
              ),
            ),
            titlesData: FlTitlesData(
              leftTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  reservedSize: 50,
                  getTitlesWidget: (value, meta) => Text(
                    Formatters.formatCompactNumber(value),
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark ? Colors.white38 : Colors.grey.shade500,
                    ),
                  ),
                ),
              ),
              bottomTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  getTitlesWidget: (value, meta) => Text(
                    data[value.toInt()].label,
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark ? Colors.white38 : Colors.grey.shade500,
                    ),
                  ),
                ),
              ),
              topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            ),
            borderData: FlBorderData(show: false),
            lineBarsData: [
              LineChartBarData(
                spots: data
                    .asMap()
                    .entries
                    .map((e) => FlSpot(e.key.toDouble(), e.value.value))
                    .toList(),
                isCurved: true,
                color: Theme.of(context).colorScheme.primary,
                barWidth: 3,
                isStrokeCapRound: true,
                dotData: const FlDotData(show: true),
                belowBarData: BarAreaData(
                  show: true,
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                ),
              ),
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }

  Widget _buildOrdersChart(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(ordersChartProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ChartCard(
      title: 'Orders (Last 7 Days)',
      height: 280,
      child: ordersAsync.when(
        data: (data) => BarChart(
          BarChartData(
            gridData: FlGridData(
              show: true,
              drawVerticalLine: false,
              getDrawingHorizontalLine: (value) => FlLine(
                color: isDark ? Colors.white10 : Colors.grey.shade200,
                strokeWidth: 1,
              ),
            ),
            titlesData: FlTitlesData(
              leftTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  reservedSize: 30,
                  getTitlesWidget: (value, meta) => Text(
                    value.toInt().toString(),
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark ? Colors.white38 : Colors.grey.shade500,
                    ),
                  ),
                ),
              ),
              bottomTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  getTitlesWidget: (value, meta) => Text(
                    data[value.toInt()].label.substring(0, 3),
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark ? Colors.white38 : Colors.grey.shade500,
                    ),
                  ),
                ),
              ),
              topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            ),
            borderData: FlBorderData(show: false),
            barGroups: data
                .asMap()
                .entries
                .map((e) => BarChartGroupData(
                      x: e.key,
                      barRods: [
                        BarChartRodData(
                          toY: e.value.value,
                          color: Theme.of(context).colorScheme.secondary,
                          width: 20,
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(4),
                            topRight: Radius.circular(4),
                          ),
                        ),
                      ],
                    ))
                .toList(),
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }

  Widget _buildTopMedicinesChart(BuildContext context, WidgetRef ref) {
    final topMedicinesAsync = ref.watch(topMedicinesProvider);

    return ChartCard(
      title: 'Top Selling Medicines',
      height: 300,
      child: topMedicinesAsync.when(
        data: (data) => BarChart(
          BarChartData(
            barTouchData: BarTouchData(
              touchTooltipData: BarTouchTooltipData(
                getTooltipItem: (group, groupIndex, rod, rodIndex) {
                  return BarTooltipItem(
                    '${data[groupIndex].label}\n',
                    const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    children: [
                      TextSpan(
                        text: '${rod.toY.toInt()} sold',
                        style: const TextStyle(fontSize: 12),
                      ),
                    ],
                  );
                },
              ),
            ),
            gridData: FlGridData(
              show: true,
              drawVerticalLine: false,
              getDrawingHorizontalLine: (value) => FlLine(
                color: Theme.of(context).brightness == Brightness.dark
                    ? Colors.white10
                    : Colors.grey.shade200,
                strokeWidth: 1,
              ),
            ),
            titlesData: FlTitlesData(
              leftTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  reservedSize: 30,
                  getTitlesWidget: (value, meta) => Text(
                    value.toInt().toString(),
                    style: TextStyle(
                      fontSize: 11,
                      color: Theme.of(context).brightness == Brightness.dark
                          ? Colors.white38
                          : Colors.grey.shade500,
                    ),
                  ),
                ),
              ),
              bottomTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  getTitlesWidget: (value, meta) {
                    final label = data[value.toInt()].label;
                    return SideTitleWidget(
                      meta: meta,
                      child: Text(
                        label.length > 8 ? '${label.substring(0, 8)}...' : label,
                        style: TextStyle(
                          fontSize: 10,
                          color: Theme.of(context).brightness == Brightness.dark
                              ? Colors.white38
                              : Colors.grey.shade500,
                        ),
                      ),
                    );
                  },
                ),
              ),
              topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            ),
            borderData: FlBorderData(show: false),
            barGroups: data
                .asMap()
                .entries
                .map((e) => BarChartGroupData(
                      x: e.key,
                      barRods: [
                        BarChartRodData(
                          toY: e.value.value,
                          color: AppColors.chartColors[e.key % AppColors.chartColors.length],
                          width: 24,
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(4),
                            topRight: Radius.circular(4),
                          ),
                        ),
                      ],
                    ))
                .toList(),
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }

  Widget _buildOrderStatusChart(BuildContext context, WidgetRef ref) {
    final statusAsync = ref.watch(orderStatusProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ChartCard(
      title: 'Order Status Distribution',
      height: 300,
      child: statusAsync.when(
        data: (data) => Column(
          children: [
            Expanded(
              child: PieChart(
                PieChartData(
                  sectionsSpace: 2,
                  centerSpaceRadius: 50,
                  sections: data
                      .asMap()
                      .entries
                      .map((e) => PieChartSectionData(
                            value: e.value.value,
                            title: '${e.value.value.toInt()}',
                            color: AppColors.chartColors[e.key % AppColors.chartColors.length],
                            radius: 50,
                            titleStyle: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ))
                      .toList(),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 12,
              runSpacing: 8,
              children: data
                  .asMap()
                  .entries
                  .map((e) => Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: AppColors.chartColors[e.key % AppColors.chartColors.length],
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            e.value.label,
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? Colors.white70 : Colors.grey.shade600,
                            ),
                          ),
                        ],
                      ))
                  .toList(),
            ),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }

  Widget _buildBottomSection(BuildContext context, WidgetRef ref) {
    final recentOrdersAsync = ref.watch(recentOrdersProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth > 800;

        return Column(
          children: [
            if (isWide)
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(flex: 3, child: _buildRecentOrdersTable(context, ref)),
                  const SizedBox(width: 16),
                  Expanded(flex: 1, child: _buildInventoryAlerts(context)),
                ],
              )
            else ...[
              _buildRecentOrdersTable(context, ref),
              const SizedBox(height: 16),
              _buildInventoryAlerts(context),
            ],
          ],
        );
      },
    );
  }

  Widget _buildRecentOrdersTable(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(recentOrdersProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Recent Orders',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
                TextButton(
                  onPressed: () {},
                  child: const Text('View All'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ordersAsync.when(
              data: (orders) => SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: SizedBox(
                  width: 700,
                  child: DataTable(
                    columns: const [
                      DataColumn(label: Text('Order #')),
                      DataColumn(label: Text('Customer')),
                      DataColumn(label: Text('Amount')),
                      DataColumn(label: Text('Status')),
                      DataColumn(label: Text('Date')),
                    ],
                    rows: orders
                        .map(
                          (order) => DataRow(cells: [
                            DataCell(Text(
                              order.orderNumber,
                              style: const TextStyle(fontWeight: FontWeight.w500),
                            )),
                            DataCell(Text(order.customerName ?? '-')),
                            DataCell(Text(Formatters.formatCurrency(order.totalAmount))),
                            DataCell(StatusBadge(status: order.status)),
                            DataCell(Text(Formatters.timeAgo(order.createdAt))),
                          ]),
                        )
                        .toList(),
                  ),
                ),
              ),
              loading: () => const Center(
                child: Padding(
                  padding: EdgeInsets.all(20),
                  child: CircularProgressIndicator(),
                ),
              ),
              error: (e, _) => Center(child: Text('Error: $e')),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInventoryAlerts(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Inventory Alerts',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            const SizedBox(height: 16),
            _buildAlertItem(
              context,
              icon: Icons.warning_amber_rounded,
              title: 'Low Stock Items',
              count: 15,
              color: Colors.orange,
            ),
            const Divider(),
            _buildAlertItem(
              context,
              icon: Icons.schedule,
              title: 'Expiring Soon',
              count: 7,
              color: Colors.red,
            ),
            const Divider(),
            _buildAlertItem(
              context,
              icon: Icons.shopping_cart,
              title: 'Pending Orders',
              count: 45,
              color: Colors.blue,
            ),
            const Divider(),
            _buildAlertItem(
              context,
              icon: Icons.local_offer,
              title: 'Active Coupons',
              count: 5,
              color: Colors.green,
            ),
            const Divider(),
            _buildAlertItem(
              context,
              icon: Icons.delivery_dining,
              title: 'Online Drivers',
              count: 12,
              color: Colors.purple,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAlertItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required int count,
    required Color color,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              title,
              style: TextStyle(
                fontSize: 14,
                color: isDark ? Colors.white70 : Colors.black87,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              count.toString(),
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
