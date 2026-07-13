import 'package:flutter/material.dart';
import 'package:file_saver/file_saver.dart';

class ImportButton extends StatelessWidget {
  final String label;
  final Future<void> Function(List<List<dynamic>> data) onImport;

  const ImportButton({
    super.key,
    this.label = 'Import',
    required this.onImport,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: () => _showImportDialog(context),
      icon: const Icon(Icons.upload, size: 18),
      label: Text(label),
    );
  }

  void _showImportDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => _ImportDialog(onImport: onImport),
    );
  }
}

class _ImportDialog extends StatefulWidget {
  final Future<void> Function(List<List<dynamic>> data) onImport;

  const _ImportDialog({required this.onImport});

  @override
  State<_ImportDialog> createState() => _ImportDialogState();
}

class _ImportDialogState extends State<_ImportDialog> {
  List<List<dynamic>>? _previewData;
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Import Data'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade300),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              children: [
                Icon(
                  Icons.cloud_upload_outlined,
                  size: 48,
                  color: Colors.grey.shade400,
                ),
                const SizedBox(height: 12),
                Text(
                  'Drag and drop or click to upload CSV',
                  style: TextStyle(color: Colors.grey.shade600),
                ),
                const SizedBox(height: 8),
                ElevatedButton(
                  onPressed: _pickFile,
                  child: const Text('Select File'),
                ),
              ],
            ),
          ),
          if (_previewData != null) ...[
            const SizedBox(height: 16),
            Text(
              'Preview: ${_previewData!.length} rows found',
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ],
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _previewData != null && !_isLoading
              ? () async {
                  setState(() => _isLoading = true);
                  await widget.onImport(_previewData!);
                  if (context.mounted) Navigator.of(context).pop();
                }
              : null,
          child: _isLoading
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Import'),
        ),
      ],
    );
  }

  Future<void> _pickFile() async {
    // For web, use file_picker or universal_html
    // This is a simplified version
    setState(() {
      _previewData = [
        ['Name', 'Price', 'Stock', 'Category'],
        ['Paracetamol', '5.99', '100', 'Pain Relief'],
        ['Ibuprofen', '7.99', '50', 'Pain Relief'],
        ['Vitamin C', '12.99', '200', 'Vitamins'],
      ];
    });
  }
}
