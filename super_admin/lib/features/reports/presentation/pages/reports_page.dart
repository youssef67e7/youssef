import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../../../../core/constants/colors.dart';
import '../../../../core/localization/app_localizations.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../shared/widgets/page_header.dart';
import '../../../../shared/widgets/chart_card.dart';
import '../../../../shared/widgets/date_range_picker.dart';

class ReportsPage extends ConsumerStatefulWidget {
  const ReportsPage({super.key});

  @override
  ConsumerState<ReportsPage> createState() => _ReportsPageState();
}

class _ReportsPageState extends ConsumerState<ReportsPage> {
  DateTimeRange? _dateRange;
  String _reportType = 'revenue';

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        PageHeader(
          title: loc.translate('reports'),
          subtitle: 'Generate and export system reports',
          actions: [
            DateRangePickerWidget(
              selectedRange: _dateRange,
              onChanged: (range) => setState(() => _dateRange = range),
            ),
            const SizedBox(width: 8),
            PopupMenuButton<String>(
              icon: const Icon(Icons.download),
              tooltip: loc.translate('export'),
              onSelected: (format) => _exportReport(format),
              itemBuilder: (context) => [
                PopupMenuItem(value: 'pdf', child: ListTile(leading: Icon(Icons.picture_as_pdf, color: Colors.red[700]), title: Text(loc.translate('exportToPDF')), dense: true)),
                PopupMenuItem(value: 'excel', child: ListTile(leading: Icon(Icons.table_chart, color: Colors.green[700]), title: Text(loc.translate('exportToExcel')), dense: true)),
              ],
            ),
          ],
        ),
        _buildReportTypeSelector(loc),
        const SizedBox(height: 24),
        _buildReportContent(loc),
      ],
    );
  }

  Widget _buildReportTypeSelector(AppLocalizations loc) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Wrap(
          spacing: 12,
          children: [
            _buildTypeChip('revenue', 'Revenue Report', Icons.attach_money),
            _buildTypeChip('orders', 'Orders Report', Icons.shopping_cart),
            _buildTypeChip('users', 'Users Report', Icons.people),
            _buildTypeChip('pharmacies', 'Pharmacies Report', Icons.local_pharmacy),
          ],
        ),
      ),
    );
  }

  Widget _buildTypeChip(String value, String label, IconData icon) {
    final isSelected = _reportType == value;
    return FilterChip(
      label: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: isSelected ? Colors.white : null),
          const SizedBox(width: 4),
          Text(label),
        ],
      ),
      selected: isSelected,
      selectedColor: AppColors.primaryLight,
      checkmarkColor: Colors.white,
      labelStyle: TextStyle(color: isSelected ? Colors.white : null),
      onSelected: (selected) => setState(() => _reportType = value),
    );
  }

  Widget _buildReportContent(AppLocalizations loc) {
    switch (_reportType) {
      case 'revenue':
        return _buildRevenueReport(loc);
      case 'orders':
        return _buildOrdersReport(loc);
      case 'users':
        return _buildUsersReport(loc);
      case 'pharmacies':
        return _buildPharmaciesReport(loc);
      default:
        return _buildRevenueReport(loc);
    }
  }

  Widget _buildRevenueReport(AppLocalizations loc) {
    final monthlyData = [
      {'name': 'Jan', 'revenue': 180000.0},
      {'name': 'Feb', 'revenue': 220000.0},
      {'name': 'Mar', 'revenue': 190000.0},
      {'name': 'Apr', 'revenue': 240000.0},
      {'name': 'May', 'revenue': 280000.0},
      {'name': 'Jun', 'revenue': 320000.0},
    ];

    return Column(
      children: [
        LayoutBuilder(
          builder: (context, constraints) {
            if (constraints.maxWidth > 800) {
              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(flex: 2, child: _buildSummaryCard(loc)),
                  const SizedBox(width: 16),
                  Expanded(flex: 2, child: _buildComparisonCard()),
                ],
              );
            }
            return Column(children: [
              _buildSummaryCard(loc),
              const SizedBox(height: 16),
              _buildComparisonCard(),
            ]);
          },
        ),
        const SizedBox(height: 24),
        ChartCard(
          title: loc.translate('revenueByPharmacy'),
          height: 300,
          child: BarChartWidget(data: monthlyData),
        ),
        const SizedBox(height: 24),
        _buildDetailedTable(),
      ],
    );
  }

  Widget _buildSummaryCard(AppLocalizations loc) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(loc.translate('period'), style: const TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 16),
            _summaryRow('Total Revenue', '\$2,847,563'),
            _summaryRow('Average Monthly', '\$237,297'),
            _summaryRow('Growth Rate', '+12.5%'),
            _summaryRow('Top Month', 'December (\$480,000)'),
            _summaryRow('Lowest Month', 'January (\$180,000)'),
          ],
        ),
      ),
    );
  }

  Widget _buildComparisonCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Period Comparison', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 16),
            _comparisonRow('Q1 2024', '\$590,000', '+8.2%'),
            _comparisonRow('Q2 2024', '\$840,000', '+15.3%'),
            _comparisonRow('Q3 2024', '\$1,080,000', '+11.1%'),
            _comparisonRow('Q4 2024', '\$1,337,563', '+14.5%'),
          ],
        ),
      ),
    );
  }

  Widget _summaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 13)), Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13))],
      ),
    );
  }

  Widget _comparisonRow(String period, String amount, String growth) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Expanded(child: Text(period, style: const TextStyle(fontSize: 13))),
          Text(amount, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
          const SizedBox(width: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(color: AppColors.success.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
            child: Text(growth, style: const TextStyle(fontSize: 11, color: AppColors.success)),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailedTable() {
    final data = [
      {'pharmacy': 'Central', 'revenue': 345000.0, 'orders': 12500, 'growth': 15.2},
      {'pharmacy': 'North', 'revenue': 298000.0, 'orders': 10800, 'growth': 12.8},
      {'pharmacy': 'South', 'revenue': 267000.0, 'orders': 9600, 'growth': 10.5},
      {'pharmacy': 'East', 'revenue': 234000.0, 'orders': 8400, 'growth': 8.3},
      {'pharmacy': 'West', 'revenue': 198000.0, 'orders': 7100, 'growth': 5.1},
    ];

    return Card(
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: DataTable(
          columns: const [
            DataColumn(label: Text('Pharmacy')),
            DataColumn(label: Text('Revenue'), numeric: true),
            DataColumn(label: Text('Orders'), numeric: true),
            DataColumn(label: Text('Growth'), numeric: true),
            DataColumn(label: Text('Revenue Share')),
          ],
          rows: data.map((d) {
            final share = (d['revenue'] as double) / 1342000;
            return DataRow(cells: [
              DataCell(Text('PharmaWorld ${d['pharmacy']}', style: const TextStyle(fontWeight: FontWeight.w500))),
              DataCell(Text(Formatters.currency(d['revenue'] as double))),
              DataCell(Text(Formatters.compact((d['orders'] as int).toDouble()))),
              DataCell(Text('${d['growth']}%', style: TextStyle(color: AppColors.success, fontWeight: FontWeight.w600))),
              DataCell(SizedBox(width: 120, child: LinearProgressIndicator(value: share, color: AppColors.primaryLight, borderRadius: BorderRadius.circular(4)))),
            ]);
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildOrdersReport(AppLocalizations loc) {
    final data = [
      {'region': 'North', 'percentage': 28.4, 'orders': 45000},
      {'region': 'South', 'percentage': 24.0, 'orders': 38000},
      {'region': 'East', 'percentage': 22.1, 'orders': 35000},
      {'region': 'West', 'percentage': 15.8, 'orders': 25000},
      {'region': 'Central', 'percentage': 9.7, 'orders': 15432},
    ];
    return ChartCard(title: loc.translate('ordersByCity'), height: 350, child: PieChartWidget(data: data));
  }

  Widget _buildUsersReport(AppLocalizations loc) {
    final data = [4200, 4800, 5200, 5800, 6300, 6900, 7500, 7800, 8200, 8600, 8800, 8923];
    return ChartCard(
      title: loc.translate('newUsersOverTime'),
      height: 350,
      child: LineChartWidget(data: data.map((e) => e.toDouble()).toList(), labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], color: AppColors.secondaryLight),
    );
  }

  Widget _buildPharmaciesReport(AppLocalizations loc) {
    final data = [
      {'name': 'Central', 'value': 345000.0},
      {'name': 'North', 'value': 298000.0},
      {'name': 'South', 'value': 267000.0},
      {'name': 'East', 'value': 234000.0},
      {'name': 'West', 'value': 198000.0},
      {'name': 'Central 2', 'value': 176000.0},
    ];
    return ChartCard(title: loc.translate('branchPerformance'), height: 350, child: BarChartWidget(data: data));
  }

  Future<void> _exportReport(String format) async {
    if (format == 'pdf') {
      final pdf = pw.Document();
      pdf.addPage(pw.MultiPage(
        build: (context) => [
          pw.Header(level: 0, child: pw.Text('PharmaWorld System Report')),
          pw.Header(level: 1, child: pw.Text('Revenue Report')),
          pw.SizedBox(height: 20),
          pw.Text('Total Revenue: \$2,847,563'),
          pw.Text('Total Orders: 158,432'),
          pw.Text('Total Users: 89,234'),
          pw.Text('Total Pharmacies: 247'),
          pw.SizedBox(height: 20),
          pw.Text('Generated: ${DateTime.now().toString()}'),
        ],
      ));
      await Printing.layoutPdf(onLayout: (format) => pdf.save());
    }
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Report exported as ${format.toUpperCase()}'), backgroundColor: Colors.green),
      );
    }
  }
}
