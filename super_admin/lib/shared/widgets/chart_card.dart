import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../core/constants/colors.dart';

class ChartCard extends StatelessWidget {
  final String title;
  final Widget? child;
  final Widget? trailing;
  final double height;
  final List<Widget>? actions;

  const ChartCard({
    super.key,
    required this.title,
    this.child,
    this.trailing,
    this.height = 300,
    this.actions,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                if (trailing != null) trailing!,
              ],
            ),
            if (actions != null) ...[
              const SizedBox(height: 8),
              Row(children: actions!),
            ],
            const SizedBox(height: 16),
            SizedBox(height: height, child: child),
          ],
        ),
      ),
    );
  }
}

class LineChartWidget extends StatelessWidget {
  final List<double> data;
  final List<String> labels;
  final Color? color;
  final String? label;
  final bool showArea;

  const LineChartWidget({
    super.key,
    required this.data,
    this.labels = const [],
    this.color,
    this.label,
    this.showArea = true,
  });

  @override
  Widget build(BuildContext context) {
    final chartColor = color ?? AppColors.success;
    final spots = data.asMap().entries.map((e) {
      return FlSpot(e.key.toDouble(), e.value);
    }).toList();

    return LineChart(
      LineChartData(
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          horizontalInterval: data.isNotEmpty ? (data.reduce((a, b) => a > b ? a : b) / 5) : 20,
          getDrawingHorizontalLine: (value) => FlLine(color: Colors.grey.withValues(alpha: 0.2), strokeWidth: 1),
        ),
        titlesData: FlTitlesData(
          show: true,
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 30,
              interval: 1,
              getTitlesWidget: (value, meta) {
                final idx = value.toInt();
                if (idx >= 0 && idx < labels.length) {
                  return Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(labels[idx], style: const TextStyle(fontSize: 10, color: Colors.grey)),
                  );
                }
                return const Text('');
              },
            ),
          ),
          leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(show: false),
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            preventCurveOverShooting: true,
            color: chartColor,
            barWidth: 3,
            isStrokeCapRound: true,
            dotData: FlDotData(
              show: true,
              getDotPainter: (spot, percent, bar, index) => FlDotCirclePainter(
                radius: 3,
                color: chartColor,
                strokeWidth: 2,
                strokeColor: Colors.white,
              ),
            ),
            belowBarData: showArea
                ? BarAreaData(
                    show: true,
                    color: chartColor.withValues(alpha: 0.1),
                  )
                : BarAreaData(show: false),
          ),
        ],
        lineTouchData: LineTouchData(
          touchTooltipData: LineTouchTooltipData(
            getTooltipItems: (touchedSpots) {
              return touchedSpots.map((spot) {
                return LineTooltipItem(
                  spot.y.toStringAsFixed(0),
                  TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12),
                );
              }).toList();
            },
          ),
        ),
      ),
    );
  }
}

class PieChartWidget extends StatelessWidget {
  final List<Map<String, dynamic>> data;
  final List<Color>? colors;

  const PieChartWidget({
    super.key,
    required this.data,
    this.colors,
  });

  @override
  Widget build(BuildContext context) {
    final chartColors = colors ?? AppColors.chartPalette;
    final total = data.fold<double>(0, (sum, item) => sum + ((item['percentage'] ?? 0) as num).toDouble());

    return Row(
      children: [
        Expanded(
          child: PieChart(
            PieChartData(
              sectionsSpace: 2,
              centerSpaceRadius: 40,
              sections: data.asMap().entries.map((e) {
                final value = ((e.value['percentage'] ?? 0) as num).toDouble();
                return PieChartSectionData(
                  value: value,
                  color: chartColors[e.key % chartColors.length],
                  radius: 50,
                  title: '${value.toStringAsFixed(1)}%',
                  titleStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                );
              }).toList(),
            ),
          ),
        ),
        const SizedBox(width: 24),
        Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: data.asMap().entries.map((e) {
            final item = e.value;
            final color = chartColors[e.key % chartColors.length];
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(width: 12, height: 12, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3))),
                  const SizedBox(width: 8),
                  Text('${item['region'] ?? item['name'] ?? ''}', style: const TextStyle(fontSize: 12)),
                  const SizedBox(width: 4),
                  Text('(${item['orders'] ?? item['count'] ?? ''})', style: TextStyle(fontSize: 11, color: Colors.grey[500])),
                ],
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

class BarChartWidget extends StatelessWidget {
  final List<Map<String, dynamic>> data;
  final Color? barColor;
  final String? xLabel;
  final String? yLabel;

  const BarChartWidget({
    super.key,
    required this.data,
    this.barColor,
    this.xLabel,
    this.yLabel,
  });

  @override
  Widget build(BuildContext context) {
    final color = barColor ?? AppColors.primaryLight;
    final maxY = data.fold<double>(0, (max, item) {
      final val = ((item['revenue'] ?? item['value'] ?? 0) as num).toDouble();
      return val > max ? val : max;
    });

    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        maxY: maxY * 1.2,
        barTouchData: BarTouchData(
          touchTooltipData: BarTouchTooltipData(
            getTooltipItem: (group, groupIndex, rod, rodIndex) {
              return BarTooltipItem(
                rod.toY.toStringAsFixed(0),
                const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12),
              );
            },
          ),
        ),
        titlesData: FlTitlesData(
          show: true,
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                final idx = value.toInt();
                if (idx >= 0 && idx < data.length) {
                  return Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      (data[idx]['name'] ?? data[idx]['label'] ?? '').toString().substring(0, min(10, (data[idx]['name'] ?? '').toString().length)),
                      style: const TextStyle(fontSize: 9, color: Colors.grey),
                    ),
                  );
                }
                return const Text('');
              },
            ),
          ),
          leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(show: false),
        barGroups: data.asMap().entries.map((e) {
          final val = ((e.value['revenue'] ?? e.value['value'] ?? 0) as num).toDouble();
          return BarChartGroupData(
            x: e.key,
            barRods: [
              BarChartRodData(
                toY: val,
                color: color.withValues(alpha: 0.8),
                width: 20,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(6)),
              ),
            ],
          );
        }).toList(),
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          horizontalInterval: maxY > 0 ? maxY / 5 : 20,
          getDrawingHorizontalLine: (value) => FlLine(color: Colors.grey.withValues(alpha: 0.2), strokeWidth: 1),
        ),
      ),
    );
  }

  int min(int a, int b) => a < b ? a : b;
}
