import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/widgets/page_header.dart';
import 'package:pharmaworld_dashboard/shared/widgets/status_badge.dart';
import 'package:pharmaworld_dashboard/shared/models/user_model.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/core/utils/formatters.dart';
import 'package:pharmaworld_dashboard/features/users/providers/users_provider.dart';

class UsersPage extends ConsumerWidget {
  const UsersPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final usersAsync = ref.watch(adminUsersProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            title: 'Admin Users',
            subtitle: 'Manage admin and pharmacist accounts',
            actions: [
              ElevatedButton.icon(
                onPressed: () => _showAddUserDialog(context, ref),
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Add User'),
              ),
            ],
          ),
          const SizedBox(height: 24),
          usersAsync.when(
            data: (users) => Card(
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: SizedBox(
                  width: 900,
                  child: DataTable(
                    columns: const [
                      DataColumn(label: Text('User')),
                      DataColumn(label: Text('Role')),
                      DataColumn(label: Text('Status')),
                      DataColumn(label: Text('Last Login')),
                      DataColumn(label: Text('Created')),
                      DataColumn(label: Text('Actions')),
                    ],
                    rows: users
                        .map(
                          (user) => DataRow(cells: [
                            DataCell(
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  CircleAvatar(
                                    radius: 18,
                                    backgroundColor: _getRoleColor(user.role).withOpacity(0.1),
                                    child: Text(
                                      user.initials,
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: _getRoleColor(user.role),
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(user.name, style: const TextStyle(fontWeight: FontWeight.w500)),
                                      Text(user.email, style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            DataCell(
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: _getRoleColor(user.role).withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  user.role.toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: _getRoleColor(user.role),
                                  ),
                                ),
                              ),
                            ),
                            DataCell(
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: (user.isActive ? Colors.green : Colors.red).withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  user.isActive ? 'Active' : 'Inactive',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: user.isActive ? Colors.green : Colors.red,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ),
                            DataCell(Text(
                              user.lastLogin != null ? Formatters.timeAgo(user.lastLogin!) : 'Never',
                            )),
                            DataCell(Text(Formatters.formatDate(user.createdAt))),
                            DataCell(
                              PopupMenuButton<String>(
                                itemBuilder: (context) => [
                                  const PopupMenuItem(value: 'edit', child: Text('Edit')),
                                  const PopupMenuItem(value: 'permissions', child: Text('Permissions')),
                                  PopupMenuItem(
                                    value: 'toggle',
                                    child: Text(user.isActive ? 'Deactivate' : 'Activate',
                                        style: TextStyle(color: user.isActive ? Colors.red : Colors.green)),
                                  ),
                                ],
                                onSelected: (value) async {
                                  try {
                                    final api = ref.read(apiServiceProvider);
                                    if (value == 'toggle') {
                                      await api.updateUser(user.id, {'isActive': !user.isActive});
                                      ref.invalidate(adminUsersProvider);
                                      if (context.mounted) {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(content: Text(
                                            user.isActive ? 'User deactivated' : 'User activated',
                                          )),
                                        );
                                      }
                                    }
                                  } catch (e) {
                                    if (context.mounted) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(content: Text('Error: $e')),
                                      );
                                    }
                                  }
                                },
                              ),
                            ),
                          ]),
                        )
                        .toList(),
                  ),
                ),
              ),
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Error: $e')),
          ),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Roles & Permissions',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600,
                          color: isDark ? Colors.white : Colors.black87)),
                  const SizedBox(height: 16),
                  _buildRoleCard(context, 'Admin', 'Full access to all features', Colors.red),
                  _buildRoleCard(context, 'Manager', 'Manage orders, customers, and reports', Colors.blue),
                  _buildRoleCard(context, 'Pharmacist', 'Manage medicines and inventory', Colors.green),
                  _buildRoleCard(context, 'Editor', 'Edit content and banners', Colors.orange),
                  _buildRoleCard(context, 'Viewer', 'Read-only access', Colors.grey),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleCard(BuildContext context, String role, String description, Color color) {
    return ListTile(
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(Icons.shield, color: color, size: 20),
      ),
      title: Text(role, style: const TextStyle(fontWeight: FontWeight.w500)),
      subtitle: Text(description),
      trailing: IconButton(
        icon: const Icon(Icons.edit_outlined, size: 18),
        onPressed: () {},
      ),
    );
  }

  Color _getRoleColor(String role) {
    switch (role) {
      case 'admin':
        return Colors.red;
      case 'manager':
        return Colors.blue;
      case 'pharmacist':
        return Colors.green;
      case 'editor':
        return Colors.orange;
      case 'viewer':
        return Colors.grey;
      default:
        return Colors.blue;
    }
  }

  void _showAddUserDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add User'),
        content: SingleChildScrollView(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(decoration: const InputDecoration(labelText: 'Full Name')),
                const SizedBox(height: 12),
                TextFormField(decoration: const InputDecoration(labelText: 'Email'), keyboardType: TextInputType.emailAddress),
                const SizedBox(height: 12),
                TextFormField(decoration: const InputDecoration(labelText: 'Password'), obscureText: true),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  decoration: const InputDecoration(labelText: 'Role'),
                  items: const [
                    DropdownMenuItem(value: 'admin', child: Text('Admin')),
                    DropdownMenuItem(value: 'manager', child: Text('Manager')),
                    DropdownMenuItem(value: 'pharmacist', child: Text('Pharmacist')),
                    DropdownMenuItem(value: 'editor', child: Text('Editor')),
                    DropdownMenuItem(value: 'viewer', child: Text('Viewer')),
                  ],
                  onChanged: (v) {},
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              try {
                final api = ref.read(apiServiceProvider);
                await api.createUser({
                  'name': 'New User',
                  'email': 'new@pharmaworld.com',
                  'role': 'viewer',
                });
                ref.invalidate(adminUsersProvider);
                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('User created successfully')),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e')),
                  );
                }
              }
            },
            child: const Text('Create User'),
          ),
        ],
      ),
    );
  }
}
