import 'package:flutter/material.dart';

class ChartCard extends StatelessWidget {
  final String title;
  final Widget child;
  final Widget? trailing;
  final double? height;

  const ChartCard({
    super.key,
    required this.title,
    required this.child,
    this.trailing,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
                if (trailing != null) trailing!,
              ],
            ),
            const SizedBox(height: 20),
            if (height != null)
              SizedBox(height: height, child: child)
            else
              child,
          ],
        ),
      ),
    );
  }
}
