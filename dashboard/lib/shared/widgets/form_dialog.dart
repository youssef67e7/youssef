import 'package:flutter/material.dart';

class FormDialog extends StatelessWidget {
  final String title;
  final Widget child;
  final List<Widget>? actions;
  final double? maxWidth;
  final bool scrollable;

  const FormDialog({
    super.key,
    required this.title,
    required this.child,
    this.actions,
    this.maxWidth,
    this.scrollable = true,
  });

  static Future<T?> show<T>({
    required BuildContext context,
    required String title,
    required Widget child,
    List<Widget>? actions,
    double? maxWidth,
    bool scrollable = true,
  }) {
    return showDialog<T>(
      context: context,
      builder: (context) => FormDialog(
        title: title,
        child: child,
        actions: actions,
        maxWidth: maxWidth,
        scrollable: scrollable,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(title),
      content: scrollable
          ? SingleChildScrollView(
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  maxWidth: maxWidth ?? 500,
                ),
                child: child,
              ),
            )
          : ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: maxWidth ?? 500,
              ),
              child: child,
            ),
      actions: actions ??
          [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Save'),
            ),
          ],
    );
  }
}
