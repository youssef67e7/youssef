import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/colors.dart';
import '../../../core/localization/app_localizations.dart';
import '../../../shared/widgets/page_header.dart';
import '../../../shared/widgets/status_indicator.dart';
import '../../../shared/widgets/confirm_dialog.dart';

class MaintenanceState {
  final bool isEnabled;
  final String message;
  final DateTime? scheduledStart;
  final DateTime? scheduledEnd;
  final List<String> whitelistedIPs;
  final List<String> whitelistedUsers;

  const MaintenanceState({
    this.isEnabled = false,
    this.message = 'System is under maintenance. Please try again later.',
    this.scheduledStart,
    this.scheduledEnd,
    this.whitelistedIPs = const ['192.168.1.0/24', '10.0.0.0/8'],
    this.whitelistedUsers = const ['1', '2'],
  });

  MaintenanceState copyWith({bool? isEnabled, String? message, DateTime? scheduledStart, DateTime? scheduledEnd, List<String>? whitelistedIPs, List<String>? whitelistedUsers}) {
    return MaintenanceState(
      isEnabled: isEnabled ?? this.isEnabled,
      message: message ?? this.message,
      scheduledStart: scheduledStart ?? this.scheduledStart,
      scheduledEnd: scheduledEnd ?? this.scheduledEnd,
      whitelistedIPs: whitelistedIPs ?? this.whitelistedIPs,
      whitelistedUsers: whitelistedUsers ?? this.whitelistedUsers,
    );
  }
}

final maintenanceProvider = StateNotifierProvider<MaintenanceNotifier, MaintenanceState>((ref) {
  return MaintenanceNotifier();
});

class MaintenanceNotifier extends StateNotifier<MaintenanceState> {
  MaintenanceNotifier() : super(const MaintenanceState());

  void toggle() => state = state.copyWith(isEnabled: !state.isEnabled);
  void setMessage(String msg) => state = state.copyWith(message: msg);
  void schedule(DateTime start, DateTime end) => state = state.copyWith(scheduledStart: start, scheduledEnd: end);
  void removeIP(String ip) => state = state.copyWith(whitelistedIPs: state.whitelistedIPs.where((i) => i != ip).toList());
  void addIP(String ip) => state = state.copyWith(whitelistedIPs: [...state.whitelistedIPs, ip]);
}

class MaintenancePage extends ConsumerStatefulWidget {
  const MaintenancePage({super.key});

  @override
  ConsumerState<MaintenancePage> createState() => _MaintenancePageState();
}

class _MaintenancePageState extends ConsumerState<MaintenancePage> {
  late TextEditingController _messageController;
  final _ipController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final state = ref.read(maintenanceProvider);
    _messageController = TextEditingController(text: state.message);
  }

  @override
  void dispose() {
    _messageController.dispose();
    _ipController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(maintenanceProvider);
    final loc = AppLocalizations.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        PageHeader(
          title: loc.translate('maintenanceMode'),
          subtitle: 'Control system availability',
          actions: [
            StatusIndicator(status: state.isEnabled ? 'warning' : 'healthy', label: state.isEnabled ? 'MAINTENANCE ON' : 'MAINTENANCE OFF'),
          ],
        ),
        _buildToggleCard(state, loc),
        const SizedBox(height: 24),
        _buildSettingsRow(state, loc),
      ],
    );
  }

  Widget _buildToggleCard(MaintenanceState state, AppLocalizations loc) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(loc.translate('maintenanceMode'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text(
                      state.isEnabled
                          ? 'Maintenance mode is currently ACTIVE. Users cannot access the system.'
                          : 'Maintenance mode is OFF. System is operating normally.',
                      style: TextStyle(color: Colors.grey[500], fontSize: 13),
                    ),
                  ],
                ),
                Switch(
                  value: state.isEnabled,
                  activeColor: AppColors.warning,
                  onChanged: (_) {
                    ConfirmDialog.show(
                      context: context,
                      title: state.isEnabled ? loc.translate('endMaintenance') : loc.translate('startMaintenance'),
                      message: state.isEnabled
                          ? 'This will restore normal system operation.'
                          : 'This will make the system unavailable to most users.',
                      confirmText: state.isEnabled ? loc.translate('endMaintenance') : loc.translate('startMaintenance'),
                      confirmColor: state.isEnabled ? Colors.green : AppColors.warning,
                      icon: state.isEnabled ? Icons.play_arrow : Icons.pause,
                      onConfirm: () => ref.read(maintenanceProvider.notifier).toggle(),
                    );
                  },
                ),
              ],
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _messageController,
              maxLines: 3,
              decoration: InputDecoration(
                labelText: loc.translate('maintenanceMessage'),
                hintText: 'Enter the message users will see...',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onChanged: (v) => ref.read(maintenanceProvider.notifier).setMessage(v),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingsRow(MaintenanceState state, AppLocalizations loc) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth > 900) {
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: _buildScheduleCard(state, loc)),
              const SizedBox(width: 24),
              Expanded(child: _buildWhitelistCard(state, loc)),
            ],
          );
        }
        return Column(
          children: [
            _buildScheduleCard(state, loc),
            const SizedBox(height: 24),
            _buildWhitelistCard(state, loc),
          ],
        );
      },
    );
  }

  Widget _buildScheduleCard(MaintenanceState state, AppLocalizations loc) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(loc.translate('scheduledWindow'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () async {
                      final date = await showDatePicker(context: context, initialDate: DateTime.now(), firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365)));
                      if (date != null && context.mounted) {
                        final time = await showTimePicker(context: context, initialTime: TimeOfDay.now());
                        if (time != null) {
                          final start = DateTime(date.year, date.month, date.day, time.hour, time.minute);
                          final end = start.add(const Duration(hours: 4));
                          ref.read(maintenanceProvider.notifier).schedule(start, end);
                        }
                      }
                    },
                    icon: const Icon(Icons.calendar_today, size: 18),
                    label: Text(state.scheduledStart != null
                        ? '${state.scheduledStart!.day}/${state.scheduledStart!.month}/${state.scheduledStart!.year} ${state.scheduledStart!.hour}:${state.scheduledStart!.minute.toString().padLeft(2, '0')}'
                        : 'Set Start Time'),
                  ),
                ),
              ],
            ),
            if (state.scheduledStart != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.info.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline, size: 18, color: AppColors.info),
                    const SizedBox(width: 8),
                    Expanded(child: Text('Scheduled: ${state.scheduledStart} - ${state.scheduledEnd}', style: const TextStyle(fontSize: 12))),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildWhitelistCard(MaintenanceState state, AppLocalizations loc) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(loc.translate('whitelistIPs'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _ipController,
                    decoration: InputDecoration(
                      hintText: 'IP Address',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: () {
                    if (_ipController.text.isNotEmpty) {
                      ref.read(maintenanceProvider.notifier).addIP(_ipController.text);
                      _ipController.clear();
                    }
                  },
                  child: const Text('Add'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: state.whitelistedIPs.map((ip) => Chip(
                label: Text(ip, style: const TextStyle(fontSize: 12)),
                deleteIcon: const Icon(Icons.close, size: 16),
                onDeleted: () => ref.read(maintenanceProvider.notifier).removeIP(ip),
              )).toList(),
            ),
          ],
        ),
      ),
    );
  }
}
