import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/colors.dart';
import '../../../../core/localization/app_localizations.dart';
import '../../../../shared/models/feature_flag.dart';
import '../../../../shared/widgets/page_header.dart';
import '../../../../shared/widgets/confirm_dialog.dart';

final featureFlagsProvider = StateNotifierProvider<FeatureFlagsNotifier, List<FeatureFlag>>((ref) {
  return FeatureFlagsNotifier();
});

class FeatureFlagsNotifier extends StateNotifier<List<FeatureFlag>> {
  FeatureFlagsNotifier() : super([
    FeatureFlag(id: '1', name: 'dark_mode_v2', description: 'New dark mode with Material 3', isEnabled: true, rolloutPercentage: 100, targetRoles: ['all'], createdAt: DateTime(2024, 1, 1), updatedAt: DateTime(2024, 6, 15)),
    FeatureFlag(id: '2', name: 'ai_prescription_checker', description: 'AI-powered prescription validation', isEnabled: true, rolloutPercentage: 50, targetRoles: ['pharmacy_owner', 'pharmacy_manager'], createdAt: DateTime(2024, 2, 1), updatedAt: DateTime(2024, 7, 1)),
    FeatureFlag(id: '3', name: 'live_tracking_v2', description: 'Enhanced real-time delivery tracking', isEnabled: false, rolloutPercentage: 0, targetRoles: ['customer', 'driver'], createdAt: DateTime(2024, 3, 1), updatedAt: DateTime(2024, 7, 10)),
    FeatureFlag(id: '4', name: 'multi_language_support', description: 'Support for French and German', isEnabled: false, rolloutPercentage: 10, targetRoles: ['all'], createdAt: DateTime(2024, 4, 1), updatedAt: DateTime(2024, 7, 12), abTestingEnabled: true, abTestVariant: 'A'),
    FeatureFlag(id: '5', name: 'bulk_order_import', description: 'Import orders from CSV files', isEnabled: true, rolloutPercentage: 75, targetRoles: ['pharmacy_owner'], createdAt: DateTime(2024, 5, 1), updatedAt: DateTime(2024, 7, 14)),
  ]);

  void toggleFlag(String id) {
    state = state.map((f) => f.id == id ? f.copyWith(isEnabled: !f.isEnabled) : f).toList();
  }

  void updateRollout(String id, int percentage) {
    state = state.map((f) => f.id == id ? f.copyWith(rolloutPercentage: percentage) : f).toList();
  }

  void addFlag(FeatureFlag flag) => state = [...state, flag];
  void removeFlag(String id) => state = state.where((f) => f.id != id).toList();
}

class FeatureFlagsPage extends ConsumerStatefulWidget {
  const FeatureFlagsPage({super.key});

  @override
  ConsumerState<FeatureFlagsPage> createState() => _FeatureFlagsPageState();
}

class _FeatureFlagsPageState extends ConsumerState<FeatureFlagsPage> {
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final flags = ref.watch(featureFlagsProvider);
    final loc = AppLocalizations.of(context);
    final filtered = flags.where((f) => _searchQuery.isEmpty || f.name.toLowerCase().contains(_searchQuery.toLowerCase())).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        PageHeader(
          title: loc.translate('featureFlags'),
          subtitle: '${flags.length} flags, ${flags.where((f) => f.isEnabled).length} active',
          actions: [
            ElevatedButton.icon(
              onPressed: () => _showAddFlagDialog(context),
              icon: const Icon(Icons.add, size: 18),
              label: Text(loc.translate('addNew')),
            ),
          ],
        ),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: InputDecoration(
                hintText: loc.translate('search'),
                prefixIcon: const Icon(Icons.search, size: 20),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                filled: true,
              ),
              onChanged: (v) => setState(() => _searchQuery = v),
            ),
          ),
        ),
        const SizedBox(height: 16),
        ...filtered.map((flag) => _buildFlagCard(flag, loc)),
      ],
    );
  }

  Widget _buildFlagCard(FeatureFlag flag, AppLocalizations loc) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Switch(
                  value: flag.isEnabled,
                  onChanged: (_) => ref.read(featureFlagsProvider.notifier).toggleFlag(flag.id),
                  activeThumbColor: AppColors.success,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(flag.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          if (flag.abTestingEnabled) ...[
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(color: AppColors.info.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                              child: Text('A/B: Variant ${flag.abTestVariant ?? "N/A"}', style: const TextStyle(fontSize: 11, color: AppColors.info)),
                            ),
                          ],
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: (flag.isEnabled ? AppColors.success : Colors.grey).withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              flag.isEnabled ? loc.translate('activeFlag') : loc.translate('inactiveFlag'),
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: flag.isEnabled ? AppColors.success : Colors.grey),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(flag.description, style: TextStyle(color: Colors.grey[500], fontSize: 13)),
                    ],
                  ),
                ),
                PopupMenuButton(
                  itemBuilder: (context) => [
                    const PopupMenuItem(value: 'edit', child: ListTile(leading: Icon(Icons.edit, size: 18), title: Text('Edit'), dense: true)),
                    const PopupMenuItem(value: 'delete', child: ListTile(leading: Icon(Icons.delete, size: 18, color: Colors.red), title: Text('Delete', style: TextStyle(color: Colors.red)), dense: true)),
                  ],
                  onSelected: (v) {
                    if (v == 'delete') {
                      ConfirmDialog.show(
                        context: context,
                        title: 'Delete Feature Flag',
                        message: 'Are you sure you want to delete "${flag.name}"?',
                        confirmText: 'Delete',
                        icon: Icons.delete,
                        onConfirm: () => ref.read(featureFlagsProvider.notifier).removeFlag(flag.id),
                      );
                    }
                  },
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                const Icon(Icons.percent, size: 16, color: Colors.grey),
                const SizedBox(width: 8),
                Text('${loc.translate('rolloutPercentage')}: ', style: const TextStyle(fontSize: 13)),
                Expanded(
                  child: Slider(
                    value: flag.rolloutPercentage.toDouble(),
                    min: 0,
                    max: 100,
                    divisions: 20,
                    label: '${flag.rolloutPercentage}%',
                    onChanged: (v) => ref.read(featureFlagsProvider.notifier).updateRollout(flag.id, v.round()),
                  ),
                ),
                Container(
                  width: 50,
                  alignment: Alignment.center,
                  child: Text('${flag.rolloutPercentage}%', style: const TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: [
                ...flag.targetRoles.map((role) => Chip(
                  label: Text(role.replaceAll('_', ' '), style: const TextStyle(fontSize: 11)),
                  visualDensity: VisualDensity.compact,
                )),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showAddFlagDialog(BuildContext context) {
    final nameController = TextEditingController();
    final descController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create Feature Flag'),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        content: SizedBox(
          width: 400,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Flag Name', hintText: 'e.g., new_checkout_flow')),
              const SizedBox(height: 16),
              TextField(controller: descController, decoration: const InputDecoration(labelText: 'Description'), maxLines: 2),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              if (nameController.text.isNotEmpty) {
                ref.read(featureFlagsProvider.notifier).addFlag(FeatureFlag(
                  id: DateTime.now().millisecondsSinceEpoch.toString(),
                  name: nameController.text,
                  description: descController.text,
                  createdAt: DateTime.now(),
                  updatedAt: DateTime.now(),
                ));
                Navigator.pop(context);
              }
            },
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }
}
