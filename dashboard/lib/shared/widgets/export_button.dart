import 'package:flutter/material.dart';
import 'package:csv/csv.dart';
import 'package:file_saver/file_saver.dart';
import 'dart:convert';
import 'dart:typed_data';

class ExportButton extends StatelessWidget {
  final String label;
  final List<List<dynamic>> data;
  final String fileName;
  final List<String>? headers;

  const ExportButton({
    super.key,
    this.label = 'Export',
    required this.data,
    required this.fileName,
    this.headers,
  });

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      icon: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.download, size: 18),
          const SizedBox(width: 4),
          Text(label),
          const Icon(Icons.arrow_drop_down, size: 18),
        ],
      ),
      onSelected: (format) => _export(context, format),
      itemBuilder: (context) => [
        const PopupMenuItem(
          value: 'csv',
          child: Row(
            children: [
              Icon(Icons.table_chart, size: 18),
              SizedBox(width: 8),
              Text('Export as CSV'),
            ],
          ),
        ),
        const PopupMenuItem(
          value: 'json',
          child: Row(
            children: [
              Icon(Icons.code, size: 18),
              SizedBox(width: 8),
              Text('Export as JSON'),
            ],
          ),
        ),
      ],
    );
  }

  Future<void> _export(BuildContext context, String format) async {
    try {
      String content;
      String extension;

      if (format == 'csv') {
        List<List<dynamic>> rows = [];
        if (headers != null) {
          rows.add(headers);
        }
        rows.addAll(data);
        content = const ListToCsvConverter().convert(rows);
        extension = 'csv';
      } else {
        content = jsonEncode(data);
        extension = 'json';
      }

      final bytes = Uint8List.fromList(utf8.encode(content));
      await FileSaver.instance.saveFile(
        name: fileName,
        bytes: bytes,
        ext: extension,
        mimeType: format == 'csv' ? MimeType.csv : MimeType.json,
      );

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Exported as $format successfully')),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Export failed: $e')),
        );
      }
    }
  }
}
