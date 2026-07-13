import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../core/localization/app_localizations.dart';

class PermissionMatrix extends StatelessWidget {
  final List<Map<String, dynamic>> roles;
  final List<Map<String, dynamic>> permissions;
  final Map<String, Set<String>> matrix;
  final ValueChanged<String>? onPermissionToggle;
  final bool readOnly;

  const PermissionMatrix({
    super.key,
    required this.roles,
    required this.permissions,
    required this.matrix,
    this.onPermissionToggle,
    this.readOnly = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final modules = <String, List<Map<String, dynamic>>>{};

    for (final perm in permissions) {
      final module = perm['module'] as String? ?? 'Other';
      modules.putIfAbsent(module, () => []).add(perm);
    }

    return Card(
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(theme),
            ...modules.entries.map((module) => _buildModuleSection(theme, module.key, module.value)),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(ThemeData theme) {
    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
        border: Border(bottom: BorderSide(color: theme.dividerColor)),
      ),
      child: Row(
        children: [
          Container(
            width: 200,
            padding: const EdgeInsets.all(12),
            child: const Text('Permission', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
          ...roles.map((role) => Container(
            width: 100,
            padding: const EdgeInsets.all(12),
            alignment: Alignment.center,
            child: Text(
              role['name'] ?? '',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
              textAlign: TextAlign.center,
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildModuleSection(ThemeData theme, String module, List<Map<String, dynamic>> permissions) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          color: AppColors.primaryLight.withValues(alpha: 0.05),
          child: Text(
            module,
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 13,
              color: AppColors.primaryLight,
            ),
          ),
        ),
        ...permissions.map((perm) => _buildPermissionRow(theme, perm)),
      ],
    );
  }

  Widget _buildPermissionRow(ThemeData theme, Map<String, dynamic> permission) {
    final permId = permission['id'] as String? ?? '';
    final permName = permission['name'] as String? ?? '';

    return Container(
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: theme.dividerColor.withValues(alpha: 0.5))),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 200,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              child: Text(permName.replaceAll('_', ' ').titleCase, style: const TextStyle(fontSize: 13)),
            ),
          ),
          ...roles.map((role) {
            final roleId = role['id'] as String? ?? '';
            final isGranted = matrix[roleId]?.contains(permId) ?? false;

            return SizedBox(
              width: 100,
              child: Center(
                child: readOnly
                    ? Icon(
                        isGranted ? Icons.check_circle : Icons.cancel,
                        color: isGranted ? AppColors.success : Colors.grey[300],
                        size: 22,
                      )
                    : InkWell(
                        onTap: onPermissionToggle != null
                            ? () => onPermissionToggle!('$roleId:$permId')
                            : null,
                        child: Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: isGranted
                                ? AppColors.success.withValues(alpha: 0.1)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                              color: isGranted ? AppColors.success : Colors.grey[300]!,
                            ),
                          ),
                          child: Icon(
                            isGranted ? Icons.check : Icons.close,
                            color: isGranted ? AppColors.success : Colors.grey[400],
                            size: 18,
                          ),
                        ),
                      ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
