import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/widgets/page_header.dart';
import 'package:pharmaworld_dashboard/shared/widgets/date_range_picker.dart';
import 'package:csv/csv.dart';
import 'package:file_saver/file_saver.dart';
import 'dart:convert';
import 'dart:typed_data';

class ReportsPage extends ConsumerStatefulWidget {
  const ReportsPage({super.key});

  @override
  ConsumerState<ReportsPage> createState() => _ReportsPageState();
}

class _ReportsPageState extends ConsumerState<ReportsPage> {
  String _reportType = 'sales';
  DateTime? _startDate;
  DateTime? _endDate;
  bool _isGenerating = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const PageHeader(
            title: 'Reports',
            subtitle: 'Generate and download reports',
          ),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 600),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    DropdownButtonFormField<String>(
                      value: _reportType,
                      decoration: const InputDecoration(labelText: 'Report Type'),
                      items: const [
                        DropdownMenuItem(value: 'sales', child: Text('Sales Report')),
                        DropdownMenuItem(value: 'revenue', child: Text('Revenue Report')),
                        DropdownMenuItem(value: 'inventory', child: Text('Inventory Report')),
                        DropdownMenuItem(value: 'customers', child: Text('Customer Report')),
                        DropdownMenuItem(value: 'drivers', child: Text('Driver Report')),
                      ],
                      onChanged: (v) => setState(() => _reportType = v ?? _reportType),
                    ),
                    const SizedBox(height: 16),
                    DateRangePicker(
                      startDate: _startDate,
                      endDate: _endDate,
                      onStartDateChanged: (d) => setState(() => _startDate = d),
                      onEndDateChanged: (d) => setState(() => _endDate = d),
                    ),
                    const SizedBox(height: 24),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: _isGenerating ? null : () => _generateReport('pdf'),
                            icon: const Icon(Icons.picture_as_pdf, size: 18),
                            label: const Text('Download PDF'),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: _isGenerating ? null : () => _generateReport('csv'),
                            icon: _isGenerating
                                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                                : const Icon(Icons.table_chart, size: 18),
                            label: Text(_isGenerating ? 'Generating...' : 'Download Excel'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Recent Reports',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ...List.generate(
                    5,
                    (i) => ListTile(
                      leading: Icon(
                        i % 2 == 0 ? Icons.picture_as_pdf : Icons.table_chart,
                        color: i % 2 == 0 ? Colors.red : Colors.green,
                      ),
                      title: Text([
                        'Sales Report - January 2024',
                        'Revenue Report - Q4 2023',
                        'Inventory Report - Weekly',
                        'Customer Report - December',
                        'Driver Report - Monthly',
                      ][i]),
                      subtitle: Text(
                        'Generated on ${['Jan 15', 'Dec 20', 'Jan 10', 'Dec 31', 'Jan 5'][i]}, 2024',
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.download),
                        onPressed: () {},
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _generateReport(String format) async {
    setState(() => _isGenerating = true);

    await Future.delayed(const Duration(seconds: 2));

    if (format == 'csv') {
      final rows = [
        ['Order ID', 'Customer', 'Amount', 'Status', 'Date'],
        ['ORD-2000', 'Ahmed Ali', '245.00', 'Delivered', '2024-01-15'],
        ['ORD-2001', 'Sara Mohammed', '180.50', 'Pending', '2024-01-15'],
        ['ORD-2002', 'Omar Hassan', '320.00', 'Confirmed', '2024-01-14'],
      ];

      final csv = const ListToCsvConverter().convert(rows);
      final bytes = Uint8List.fromList(utf8.encode(csv));
      await FileSaver.instance.saveFile(
        name: 'report_${_reportType}',
        bytes: bytes,
        ext: 'csv',
        mimeType: MimeType.csv,
      );
    }

    setState(() => _isGenerating = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Report generated and downloaded as ${format.toUpperCase()}')),
      );
    }
  }
}
