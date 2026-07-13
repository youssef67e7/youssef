import 'package:flutter/material.dart';
import 'package:file_saver/file_saver.dart';
import 'dart:convert';
import 'dart:typed_data';

class ExportButton extends StatelessWidget {
  final String label;
  final List<Map<String, dynamic>> data;
  final String fileName;
  final List<String>? columns;

  const ExportButton({
    super.key,
    this.label = 'Export',
    required this.data,
    this.fileName = 'export',
    this.columns,
  });

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      icon: const Icon(Icons.download),
      tooltip: label,
      onSelected: (format) => _export(format),
      itemBuilder: (context) => [
        const PopupMenuItem(value: 'csv', child: ListTile(leading: Icon(Icons.table_chart), title: Text('CSV'), dense: true)),
        const PopupMenuItem(value: 'json', child: ListTile(leading: Icon(Icons.code), title: Text('JSON'), dense: true)),
      ],
    );
  }

  Future<void> _export(String format) async {
    try {
      String content;
      String extension;

      if (format == 'csv') {
        final headers = columns ?? (data.isNotEmpty ? data.first.keys.toList() : <String>[]);
        final csvRows = [headers.join(',')];
        for (final row in data) {
          csvRows.add(headers.map((h) => '"${(row[h] ?? '').toString().replaceAll('"', '""')}"').join(','));
        }
        content = csvRows.join('\n');
        extension = 'csv';
      } else {
        content = jsonEncode(data);
        extension = 'json';
      }

      final bytes = Uint8List.fromList(utf8.encode(content));
      await FileSaver.instance.saveFile(
        name: '$fileName.$extension',
        bytes: bytes,
        ext: extension,
        mimeType: format == 'csv' ? MimeType.csv : MimeType.json,
      );
    } catch (_) {}
  }
}
