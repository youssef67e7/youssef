import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/colors.dart';
import '../../../../core/localization/app_localizations.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../shared/models/branch.dart';
import '../../../../shared/widgets/data_table_widget.dart';
import '../../../../shared/widgets/page_header.dart';
import '../../../../shared/widgets/status_indicator.dart';
import '../../../../shared/widgets/confirm_dialog.dart';
import '../../../../shared/widgets/chart_card.dart';
import '../../../../core/utils/extensions.dart';

final pharmaciesProvider = Provider<List<Branch>>((ref) {
  return [
    Branch(id: '1', name: 'PharmaWorld Central', city: 'New York', region: 'North', managerName: 'John Smith', status: 'active', totalRevenue: 345000, totalOrders: 12500, totalCustomers: 8500, totalMedicines: 1200, rating: 4.8, createdAt: DateTime(2022, 1, 15)),
    Branch(id: '2', name: 'PharmaWorld North', city: 'Chicago', region: 'North', managerName: 'Sarah Johnson', status: 'active', totalRevenue: 298000, totalOrders: 10800, totalCustomers: 7200, totalMedicines: 1100, rating: 4.6, createdAt: DateTime(2022, 3, 20)),
    Branch(id: '3', name: 'PharmaWorld South', city: 'Miami', region: 'South', managerName: 'Mike Davis', status: 'active', totalRevenue: 267000, totalOrders: 9600, totalCustomers: 6800, totalMedicines: 1050, rating: 4.5, createdAt: DateTime(2022, 5, 10)),
    Branch(id: '4', name: 'PharmaWorld East', city: 'Boston', region: 'East', managerName: 'Emily Brown', status: 'active', totalRevenue: 234000, totalOrders: 8400, totalCustomers: 5900, totalMedicines: 980, rating: 4.4, createdAt: DateTime(2022, 7, 1)),
    Branch(id: '5', name: 'PharmaWorld West', city: 'Los Angeles', region: 'West', managerName: 'David Wilson', status: 'inactive', totalRevenue: 198000, totalOrders: 7100, totalCustomers: 4800, totalMedicines: 920, rating: 4.3, createdAt: DateTime(2022, 9, 15)),
    Branch(id: '6', name: 'PharmaWorld Central 2', city: 'Houston', region: 'Central', managerName: 'Lisa Anderson', status: 'active', totalRevenue: 176000, totalOrders: 6300, totalCustomers: 4200, totalMedicines: 850, rating: 4.2, createdAt: DateTime(2023, 1, 5)),
  ];
});

class PharmaciesPage extends ConsumerWidget {
  const PharmaciesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pharmacies = ref.watch(pharmaciesProvider);
    final loc = AppLocalizations.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        PageHeader(
          title: loc.translate('pharmacies'),
          subtitle: '${pharmacies.length} branches total',
          actions: [
            ElevatedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.add, size: 18),
              label: Text(loc.translate('addNew')),
            ),
          ],
        ),
        _buildComparisonChart(pharmacies, loc),
        const SizedBox(height: 24),
        _buildPharmaciesTable(context, pharmacies, loc),
      ],
    );
  }

  Widget _buildComparisonChart(List<Branch> pharmacies, AppLocalizations loc) {
    final data = pharmacies.take(6).map((p) => {'name': p.name.replaceAll('PharmaWorld ', ''), 'revenue': p.totalRevenue}).toList();
    return ChartCard(
      title: loc.translate('branchPerformance'),
      height: 250,
      child: BarChartWidget(data: data),
    );
  }

  Widget _buildPharmaciesTable(BuildContext context, List<Branch> pharmacies, AppLocalizations loc) {
    return DataTableWidget<Branch>(
      data: pharmacies,
      columns: const [
        DataColumn(label: Text('Branch')),
        DataColumn(label: Text('City')),
        DataColumn(label: Text('Manager')),
        DataColumn(label: Text('Status')),
        DataColumn(label: Text('Revenue')),
        DataColumn(label: Text('Orders')),
        DataColumn(label: Text('Rating')),
        DataColumn(label: Text('Actions')),
      ],
      rowBuilder: (branch, index) => DataRow(
        cells: [
          DataCell(Text(branch.name, style: const TextStyle(fontWeight: FontWeight.w500))),
          DataCell(Text('${branch.city}, ${branch.region}')),
          DataCell(Text(branch.managerName)),
          DataCell(StatusIndicator(status: branch.status)),
          DataCell(Text(Formatters.currency(branch.totalRevenue))),
          DataCell(Text(Formatters.compact(branch.totalOrders.toDouble()))),
          DataCell(Row(children: [
            const Icon(Icons.star, color: Colors.amber, size: 16),
            const SizedBox(width: 4),
            Text(branch.rating.toStringAsFixed(1)),
          ])),
          DataCell(Row(children: [
            IconButton(icon: const Icon(Icons.visibility, size: 18), onPressed: () => _showBranchDetails(context, branch)),
            IconButton(
              icon: Icon(branch.isActive ? Icons.pause : Icons.play_arrow, size: 18),
              onPressed: () => _toggleBranch(context, branch),
            ),
          ])),
        ],
      ),
    );
  }

  void _showBranchDetails(BuildContext context, Branch branch) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(branch.name),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        content: SizedBox(
          width: 400,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _detailRow('City', '${branch.city}, ${branch.region}'),
              _detailRow('Manager', branch.managerName),
              _detailRow('Status', branch.status.capitalize),
              _detailRow('Revenue', Formatters.currency(branch.totalRevenue)),
              _detailRow('Total Orders', '${branch.totalOrders}'),
              _detailRow('Customers', '${branch.totalCustomers}'),
              _detailRow('Medicines', '${branch.totalMedicines}'),
              _detailRow('Rating', '${branch.rating}/5.0'),
              _detailRow('Created', Formatters.date(branch.createdAt)),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
        ],
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
        ],
      ),
    );
  }

  void _toggleBranch(BuildContext context, Branch branch) {
    ConfirmDialog.show(
      context: context,
      title: '${branch.isActive ? 'Disable' : 'Enable'} Branch',
      message: 'Are you sure you want to ${branch.isActive ? 'disable' : 'enable'} ${branch.name}?',
      confirmText: branch.isActive ? 'Disable' : 'Enable',
      confirmColor: branch.isActive ? Colors.red : Colors.green,
      icon: branch.isActive ? Icons.pause : Icons.play_arrow,
      onConfirm: () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Branch ${branch.isActive ? 'disabled' : 'enabled'}'), backgroundColor: Colors.green),
        );
      },
    );
  }
}
