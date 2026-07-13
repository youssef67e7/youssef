import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/colors.dart';
import '../../../../core/localization/app_localizations.dart';
import '../../../../shared/models/role.dart';
import '../../../../shared/models/permission.dart';
import '../../../../shared/widgets/page_header.dart';
import '../../../../shared/widgets/permission_matrix.dart';
import '../../../../shared/widgets/confirm_dialog.dart';
import '../../../../shared/widgets/role_badge.dart';

final rolesProvider = StateNotifierProvider<RolesNotifier, List<Role>>((ref) {
  return RolesNotifier();
});

class RolesNotifier extends StateNotifier<List<Role>> {
  RolesNotifier() : super([
    Role(id: '1', name: 'Super Admin', description: 'Full system access', permissions: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15'], userCount: 2, isSystem: true, createdAt: DateTime(2022, 1, 1)),
    Role(id: '2', name: 'Admin', description: 'System administration', permissions: ['1','2','3','4','5','6','10','12','13','14'], userCount: 5, isSystem: true, createdAt: DateTime(2022, 1, 1)),
    Role(id: '3', name: 'Pharmacy Owner', description: 'Pharmacy ownership management', permissions: ['1','3','5','10','12'], userCount: 47, isSystem: false, createdAt: DateTime(2022, 3, 1)),
    Role(id: '4', name: 'Pharmacy Manager', description: 'Branch management', permissions: ['1','3','5'], userCount: 89, isSystem: false, createdAt: DateTime(2022, 3, 1)),
    Role(id: '5', name: 'Driver', description: 'Delivery operations', permissions: ['1'], userCount: 892, isSystem: true, createdAt: DateTime(2022, 5, 1)),
    Role(id: '6', name: 'Customer', description: 'Customer access', permissions: ['1'], userCount: 87652, isSystem: true, createdAt: DateTime(2022, 5, 1)),
  ]);

  void addRole(Role role) => state = [...state, role];
  void updateRole(String id, Role updated) => state = state.map((r) => r.id == id ? updated : r).toList();
  void removeRole(String id) => state = state.where((r) => r.id != id).toList();
}

final permissionMatrixProvider = StateProvider<Map<String, Set<String>>>((ref) {
  return {
    '1': {'1','2','3','4','5','6','7','8','9','10','11','12','13','14','15'},
    '2': {'1','2','3','4','5','6','10','12','13','14'},
    '3': {'1','3','5','10','12'},
    '4': {'1','3','5'},
    '5': {'1'},
    '6': {'1'},
  };
});

class RolesPage extends ConsumerStatefulWidget {
  const RolesPage({super.key});

  @override
  ConsumerState<RolesPage> createState() => _RolesPageState();
}

class _RolesPageState extends ConsumerState<RolesPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final roles = ref.watch(rolesProvider);
    final loc = AppLocalizations.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        PageHeader(
          title: loc.translate('roles'),
          subtitle: '${roles.length} roles defined',
          actions: [
            ElevatedButton.icon(
              onPressed: () => _showCreateRoleDialog(context),
              icon: const Icon(Icons.add, size: 18),
              label: Text(loc.translate('createRole')),
            ),
          ],
        ),
        Card(
          child: TabBar(
            controller: _tabController,
            labelColor: AppColors.primaryLight,
            unselectedLabelColor: Colors.grey,
            indicatorColor: AppColors.primaryLight,
            tabs: [
              Tab(text: loc.translate('roles')),
              Tab(text: loc.translate('permissionMatrix')),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 600,
          child: TabBarView(
            controller: _tabController,
            children: [
              _buildRolesList(roles, loc),
              _buildPermissionMatrix(roles, loc),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRolesList(List<Role> roles, AppLocalizations loc) {
    return GridView.builder(
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1.8,
      ),
      itemCount: roles.length,
      itemBuilder: (context, index) {
        final role = roles[index];
        return Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    RoleBadge(role: role.name),
                    PopupMenuButton(
                      itemBuilder: (context) => [
                        if (!role.isSystem) const PopupMenuItem(value: 'edit', child: ListTile(leading: Icon(Icons.edit, size: 18), title: Text('Edit'), dense: true)),
                        if (!role.isSystem) const PopupMenuItem(value: 'delete', child: ListTile(leading: Icon(Icons.delete, size: 18, color: Colors.red), title: Text('Delete', style: TextStyle(color: Colors.red)), dense: true)),
                      ],
                      onSelected: (v) {
                        if (v == 'edit') _showEditRoleDialog(context, role);
                        if (v == 'delete') _deleteRole(context, role);
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(role.description, style: TextStyle(fontSize: 13, color: Colors.grey[500])),
                const Spacer(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('${role.permissions.length} permissions', style: const TextStyle(fontSize: 12)),
                    Text('${role.userCount} users', style: const TextStyle(fontSize: 12)),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildPermissionMatrix(List<Role> roles, AppLocalizations loc) {
    final matrix = ref.watch(permissionMatrixProvider);
    final rolesData = roles.map((r) => {'id': r.id, 'name': r.name}).toList();
    final permsData = Permission.allPermissions.map((p) => {'id': p.id, 'name': p.name, 'module': p.module}).toList();

    return PermissionMatrix(
      roles: rolesData,
      permissions: permsData,
      matrix: matrix,
      onPermissionToggle: (key) {
        final parts = key.split(':');
        if (parts.length == 2) {
          final roleId = parts[0];
          final permId = parts[1];
          final newMatrix = Map<String, Set<String>>.from(matrix.map((k, v) => MapEntry(k, Set<String>.from(v))));
          if (newMatrix[roleId]?.contains(permId) ?? false) {
            newMatrix[roleId]?.remove(permId);
          } else {
            newMatrix.putIfAbsent(roleId, () => {}).add(permId);
          }
          ref.read(permissionMatrixProvider.notifier).state = newMatrix;
        }
      },
    );
  }

  void _showCreateRoleDialog(BuildContext context) {
    final nameController = TextEditingController();
    final descController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create Role'),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        content: SizedBox(
          width: 400,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Role Name')),
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
                ref.read(rolesProvider.notifier).addRole(Role(
                  id: DateTime.now().millisecondsSinceEpoch.toString(),
                  name: nameController.text,
                  description: descController.text,
                  createdAt: DateTime.now(),
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

  void _showEditRoleDialog(BuildContext context, Role role) {
    final nameController = TextEditingController(text: role.name);
    final descController = TextEditingController(text: role.description);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Role'),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        content: SizedBox(
          width: 400,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Role Name')),
              const SizedBox(height: 16),
              TextField(controller: descController, decoration: const InputDecoration(labelText: 'Description'), maxLines: 2),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              ref.read(rolesProvider.notifier).updateRole(role.id, role.copyWith(
                name: nameController.text,
                description: descController.text,
              ));
              Navigator.pop(context);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _deleteRole(BuildContext context, Role role) {
    ConfirmDialog.show(
      context: context,
      title: 'Delete Role',
      message: 'Are you sure you want to delete "${role.name}"? ${role.userCount} users currently have this role.',
      confirmText: 'Delete',
      icon: Icons.delete,
      onConfirm: () {
        ref.read(rolesProvider.notifier).removeRole(role.id);
      },
    );
  }
}
