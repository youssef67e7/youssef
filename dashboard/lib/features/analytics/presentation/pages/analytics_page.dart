import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:pharmaworld_dashboard/shared/widgets/page_header.dart';
import 'package:pharmaworld_dashboard/shared/widgets/chart_card.dart';
import 'package:pharmaworld_dashboard/shared/widgets/date_range_picker.dart';
import 'package:pharmaworld_dashboard/core/constants/app_colors.dart';
import 'package:pharmaworld_dashboard/core/utils/formatters.dart';

class AnalyticsPage extends ConsumerStatefulWidget {
  const AnalyticsPage({super.key});

  @override
  ConsumerState<AnalyticsPage> createState() => _AnalyticsPageState();
}

class _AnalyticsPageState extends ConsumerState<AnalyticsPage> {
  DateTime? _startDate;
  DateTime? _endDate;
  String _selectedPeriod = '7d';

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            title: 'Analytics',
            subtitle: 'Detailed analytics and insights',
            actions: [
              DateRangePicker(
                startDate: _startDate,
                endDate: _endDate,
                onStartDateChanged: (d) => setState(() => _startDate = d),
                onEndDateChanged: (d) => setState(() => _endDate = d),
                onClear: () => setState(() {
                  _startDate = null;
                  _endDate = null;
                }),
              ),
              const SizedBox(width: 8),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: '7d', label: Text('7D')),
                  ButtonSegment(value: '30d', label: Text('30D')),
                  ButtonSegment(value: '12m', label: Text('12M')),
                ],
                selected: {_selectedPeriod},
                onSelectionChanged: (v) => setState(() => _selectedPeriod = v.first),
              ),
            ],
          ),
          const SizedBox(height: 24),
          _buildKPICards(context),
          const SizedBox(height: 24),
          _buildCharts(context),
        ],
      ),
    );
  }

  Widget _buildKPICards(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final kpis = [
      {'title': 'Total Revenue', 'value': '\$125,430', 'change': '+12.5%', 'positive': true},
      {'title': 'Total Orders', 'value': '3,842', 'change': '+8.3%', 'positive': true},
      {'title': 'Avg Order Value', 'value': '\$32.65', 'change': '+3.2%', 'positive': true},
      {'title': 'Conversion Rate', 'value': '4.2%', 'change': '-0.8%', 'positive': false},
      {'title': 'Customer Retention', 'value': '68%', 'change': '+5.1%', 'positive': true},
      {'title': 'Avg Rating', 'value': '4.3', 'change': '+0.2', 'positive': true},
    ];

    return Wrap(
      spacing: 16,
      runSpacing: 16,
      children: kpis
          .map(
            (kpi) => SizedBox(
              width: 200,
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(kpi['title']!,
                          style: TextStyle(fontSize: 13, color: Colors.grey.shade500)),
                      const SizedBox(height: 8),
                      Text(kpi['value']!,
                          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(
                            (kpi['positive'] as bool) ? Icons.trending_up : Icons.trending_down,
                            size: 14,
                            color: (kpi['positive'] as bool) ? Colors.green : Colors.red,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${kpi['change']} vs last period',
                            style: TextStyle(
                              fontSize: 11,
                              color: (kpi['positive'] as bool) ? Colors.green : Colors.red,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          )
          .toList(),
    );
  }

  Widget _buildCharts(BuildContext context) {
    final revenueData = List.generate(
      30, (i) => FlSpot(i.toDouble(), 3000 + (i * 200) + (i % 7 == 0 ? 2000 : 0).toDouble()),
    );

    final categoryData = [
      {'label': 'Pain Relief', 'value': 35.0},
      {'label': 'Antibiotics', 'value': 25.0},
      {'label': 'Vitamins', 'value': 20.0},
      {'label': 'Gastro', 'value': 12.0},
      {'label': 'Other', 'value': 8.0},
    ];

    return Column(
      children: [
        ChartCard(
          title: 'Revenue Trend',
          height: 300,
          trailing: SegmentedButton<String>(
            segments: const [
              ButtonSegment(value: 'daily', label: Text('Daily')),
              ButtonSegment(value: 'weekly', label: Text('Weekly')),
              ButtonSegment(value: 'monthly', label: Text('Monthly')),
            ],
            selected: const {'daily'},
            onSelectionChanged: (v) {},
            style: ButtonStyle(visualDensity: VisualDensity.compact),
          ),
          child: LineChart(
            LineChartData(
              gridData: FlGridData(show: true, drawVerticalLine: false),
              titlesData: FlTitlesData(
                leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 50)),
                bottomTitles: AxisTitles(sideTitles: SideTitles(
                  showTitles: true,
                  interval: 5,
                  getTitlesWidget: (v, _) => Text('${v.toInt() + 1}'),
                )),
                topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              ),
              borderData: FlBorderData(show: false),
              lineBarsData: [
                LineChartBarData(
                  spots: revenueData,
                  isCurved: true,
                  color: AppColors.primaryLight,
                  barWidth: 2,
                  dotData: const FlDotData(show: false),
                  belowBarData: BarAreaData(
                    show: true,
                    color: AppColors.primaryLight.withOpacity(0.1),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ChartCard(
                title: 'Sales by Category',
                height: 300,
                child: BarChart(
                  BarChartData(
                    barGroups: categoryData.asMap().entries.map((e) {
                      return BarChartGroupData(
                        x: e.key,
                        barRods: [
                          BarChartRodData(
                            toY: e.value['value']!,
                            color: AppColors.chartColors[e.key % AppColors.chartColors.length],
                            width: 30,
                            borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                          ),
                        ],
                      );
                    }).toList(),
                    titlesData: FlTitlesData(
                      bottomTitles: AxisTitles(sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (v, _) => Text(
                          categoryData[v.toInt()]['label'].toString().substring(0, 4),
                          style: const TextStyle(fontSize: 10),
                        ),
                      )),
                      leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 30)),
                      topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    ),
                    gridData: FlGridData(show: true, drawVerticalLine: false),
                    borderData: FlBorderData(show: false),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: ChartCard(
                title: 'Orders by Day',
                height: 300,
                child: BarChart(
                  BarChartData(
                    barGroups: List.generate(7, (i) {
                      return BarChartGroupData(
                        x: i,
                        barRods: [
                          BarChartRodData(
                            toY: [45, 62, 38, 78, 55, 90, 72][i].toDouble(),
                            color: AppColors.chartColors[i % AppColors.chartColors.length],
                            width: 20,
                            borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                          ),
                        ],
                      );
                    }),
                    titlesData: FlTitlesData(
                      bottomTitles: AxisTitles(sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (v, _) => Text(
                          ['M', 'T', 'W', 'T', 'F', 'S', 'S'][v.toInt()],
                          style: const TextStyle(fontSize: 12),
                        ),
                      )),
                      leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 30)),
                      topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    ),
                    gridData: FlGridData(show: true, drawVerticalLine: false),
                    borderData: FlBorderData(show: false),
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
