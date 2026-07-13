import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../../core/constants/colors.dart';
import '../../../../core/localization/app_localizations.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../shared/widgets/page_header.dart';
import '../../../../shared/widgets/chart_card.dart';
import '../../../../shared/widgets/date_range_picker.dart';

class AnalyticsPage extends ConsumerStatefulWidget {
  const AnalyticsPage({super.key});

  @override
  ConsumerState<AnalyticsPage> createState() => _AnalyticsPageState();
}

class _AnalyticsPageState extends ConsumerState<AnalyticsPage> {
  DateTimeRange? _dateRange;

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        PageHeader(
          title: loc.translate('analytics'),
          subtitle: 'System-wide analytics and insights',
          actions: [
            DateRangePickerWidget(
              selectedRange: _dateRange,
              onChanged: (range) => setState(() => _dateRange = range),
            ),
          ],
        ),
        _buildTopCharts(loc),
        const SizedBox(height: 24),
        _buildBottomCharts(loc),
      ],
    );
  }

  Widget _buildTopCharts(AppLocalizations loc) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth > 900) {
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(flex: 3, child: _buildRevenueComparison(loc)),
              const SizedBox(width: 24),
              Expanded(flex: 2, child: _buildUsersByRole(loc)),
            ],
          );
        }
        return Column(children: [
          _buildRevenueComparison(loc),
          const SizedBox(height: 24),
          _buildUsersByRole(loc),
        ]);
      },
    );
  }

  Widget _buildRevenueComparison(AppLocalizations loc) {
    final data = [
      {'name': 'Jan', 'revenue': 180000.0},
      {'name': 'Feb', 'revenue': 220000.0},
      {'name': 'Mar', 'revenue': 190000.0},
      {'name': 'Apr', 'revenue': 240000.0},
      {'name': 'May', 'revenue': 280000.0},
      {'name': 'Jun', 'revenue': 320000.0},
      {'name': 'Jul', 'revenue': 310000.0},
      {'name': 'Aug', 'revenue': 350000.0},
      {'name': 'Sep', 'revenue': 380000.0},
      {'name': 'Oct', 'revenue': 420000.0},
      {'name': 'Nov', 'revenue': 450000.0},
      {'name': 'Dec', 'revenue': 480000.0},
    ];

    return ChartCard(
      title: loc.translate('revenueComparison'),
      height: 300,
      child: BarChartWidget(data: data),
    );
  }

  Widget _buildUsersByRole(AppLocalizations loc) {
    final data = [
      {'region': 'Customers', 'percentage': 92.0, 'orders': 87652},
      {'region': 'Drivers', 'percentage': 4.0, 'orders': 892},
      {'region': 'Managers', 'percentage': 2.5, 'orders': 89},
      {'region': 'Owners', 'percentage': 1.0, 'orders': 47},
      {'region': 'Admins', 'percentage': 0.5, 'orders': 7},
    ];

    return ChartCard(
      title: loc.translate('usersByRole'),
      height: 300,
      child: PieChartWidget(data: data),
    );
  }

  Widget _buildBottomCharts(AppLocalizations loc) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth > 900) {
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: _buildUserGrowth(loc)),
              const SizedBox(width: 24),
              Expanded(child: _buildMedicinePopularity(loc)),
            ],
          );
        }
        return Column(children: [
          _buildUserGrowth(loc),
          const SizedBox(height: 24),
          _buildMedicinePopularity(loc),
        ]);
      },
    );
  }

  Widget _buildUserGrowth(AppLocalizations loc) {
    final data = [4200, 4800, 5200, 5800, 6300, 6900, 7500, 7800, 8200, 8600, 8800, 8923];
    return ChartCard(
      title: loc.translate('userGrowth'),
      height: 280,
      child: LineChartWidget(
        data: data.map((e) => e.toDouble()).toList(),
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        color: AppColors.secondaryLight,
      ),
    );
  }

  Widget _buildMedicinePopularity(AppLocalizations loc) {
    final data = [
      {'name': 'Antibiotics', 'value': 28500.0},
      {'name': 'Pain Relief', 'value': 22300.0},
      {'name': 'Vitamins', 'value': 18900.0},
      {'name': 'Allergy', 'value': 15200.0},
      {'name': 'Heart', 'value': 12800.0},
      {'name': 'Diabetes', 'value': 10500.0},
    ];

    return ChartCard(
      title: loc.translate('medicinePopularity'),
      height: 280,
      child: BarChartWidget(data: data, barColor: AppColors.accent),
    );
  }
}
