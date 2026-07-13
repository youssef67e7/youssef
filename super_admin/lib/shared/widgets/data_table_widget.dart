import 'package:flutter/material.dart';

class DataTableWidget<T> extends StatelessWidget {
  final List<T> data;
  final List<DataColumn> columns;
  final DataRow Function(T item, int index) rowBuilder;
  final String emptyMessage;
  final int? rowsPerPage;
  final bool showPagination;
  final ValueChanged<T>? onRowTap;

  const DataTableWidget({
    super.key,
    required this.data,
    required this.columns,
    required this.rowBuilder,
    this.emptyMessage = 'No data available',
    this.rowsPerPage = 10,
    this.showPagination = true,
    this.onRowTap,
  });

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(48),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.inbox_outlined, size: 64, color: Colors.grey[400]),
              const SizedBox(height: 16),
              Text(emptyMessage, style: TextStyle(color: Colors.grey[500], fontSize: 16)),
            ],
          ),
        ),
      );
    }

    return Card(
      clipBehavior: Clip.antiAlias,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: DataTable(
          columns: columns,
          rows: List.generate(data.length, (index) => rowBuilder(data[index], index)),
          headingRowHeight: 48,
          dataRowMinHeight: 52,
          dataRowMaxHeight: 52,
          showCheckboxColumn: false,
          horizontalMargin: 16,
          columnSpacing: 24,
        ),
      ),
    );
  }
}
