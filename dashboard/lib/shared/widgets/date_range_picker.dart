import 'package:flutter/material.dart';

class DateRangePicker extends StatelessWidget {
  final DateTime? startDate;
  final DateTime? endDate;
  final ValueChanged<DateTime?> onStartDateChanged;
  final ValueChanged<DateTime?> onEndDateChanged;
  final VoidCallback? onClear;

  const DateRangePicker({
    super.key,
    this.startDate,
    this.endDate,
    required this.onStartDateChanged,
    required this.onEndDateChanged,
    this.onClear,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _buildDateField(
          context,
          label: 'From',
          value: startDate,
          onChanged: onStartDateChanged,
        ),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 8),
          child: Icon(Icons.arrow_forward, size: 16),
        ),
        _buildDateField(
          context,
          label: 'To',
          value: endDate,
          onChanged: onEndDateChanged,
        ),
        if (onClear != null)
          IconButton(
            onPressed: onClear,
            icon: const Icon(Icons.clear, size: 18),
            tooltip: 'Clear dates',
          ),
      ],
    );
  }

  Widget _buildDateField(
    BuildContext context, {
    required String label,
    required DateTime? value,
    required ValueChanged<DateTime?> onChanged,
  }) {
    return SizedBox(
      width: 150,
      child: TextField(
        readOnly: true,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: const Icon(Icons.calendar_today, size: 18),
          isDense: true,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        ),
        controller: TextEditingController(
          text: value != null
              ? '${value.month.toString().padLeft(2, '0')}/${value.day.toString().padLeft(2, '0')}/${value.year}'
              : '',
        ),
        onTap: () async {
          final date = await showDatePicker(
            context: context,
            initialDate: value ?? DateTime.now(),
            firstDate: DateTime(2020),
            lastDate: DateTime.now(),
          );
          onChanged(date);
        },
      ),
    );
  }
}
