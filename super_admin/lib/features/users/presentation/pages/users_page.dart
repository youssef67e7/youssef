import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/colors.dart';
import '../../../../core/localization/app_localizations.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../core/utils/extensions.dart';
import '../../../../shared/models/user.dart';
import '../../../../shared/widgets/data_table_widget.dart';
import '../../../../shared/widgets/page_header.dart';
import '../../../../shared/widgets/role_badge.dart';
import '../../../../shared/widgets/user_avatar.dart';
import '../../../../shared/widgets/confirm_dialog.dart';
import '../../../../shared/widgets/export_button.dart';

final usersProvider = Provider<List<AppUser>>((ref) {
  return [
    AppUser(id: '1', name: 'Ahmed Hassan', email: 'ahmed@pharmaworld.com', phone: '+1234567890', role: 'super_admin', roleId: '1', status: 'active', createdAt: DateTime(2022, 1, 15), lastActive: DateTime.now().subtract(const Duration(minutes: 5))),
    AppUser(id: '2', name: 'Sara Johnson', email: 'sara@pharmaworld.com', phone: '+1234567891', role: 'admin', roleId: '2', status: 'active', createdAt: DateTime(2022, 3, 20), lastActive: DateTime.now().subtract(const Duration(minutes: 30))),
    AppUser(id: '3', name: 'Mohamed Ali', email: 'mohamed@pharmaworld.com', phone: '+1234567892', role: 'pharmacy_owner', roleId: '3', status: 'active', createdAt: DateTime(2022, 5, 10), lastActive: DateTime.now().subtract(const Duration(hours: 1)), branchName: 'Central'),
    AppUser(id: '4', name: 'Emily Brown', email: 'emily@pharmaworld.com', phone: '+1234567893', role: 'pharmacy_manager', roleId: '4', status: 'active', createdAt: DateTime(2022, 7, 1), lastActive: DateTime.now().subtract(const Duration(hours: 2)), branchName: 'North'),
    AppUser(id: '5', name: 'Omar Wilson', email: 'omar@driver.com', phone: '+1234567894', role: 'driver', roleId: '5', status: 'active', createdAt: DateTime(2022, 9, 15), lastActive: DateTime.now().subtract(const Duration(minutes: 15))),
    AppUser(id: '6', name: 'Fatima Davis', email: 'fatima@customer.com', phone: '+1234567895', role: 'customer', roleId: '6', status: 'suspended', createdAt: DateTime(2023, 1, 5), lastActive: DateTime.now().subtract(const Duration(days: 3))),
    AppUser(id: '7', name: 'John Smith', email: 'john@driver.com', phone: '+1234567896', role: 'driver', roleId: '5', status: 'active', createdAt: DateTime(2023, 2, 10), lastActive: DateTime.now().subtract(const Duration(minutes: 45))),
    AppUser(id: '8', name: 'Layla Ahmed', email: 'layla@pharmaworld.com', phone: '+1234567897', role: 'admin', roleId: '2', status: 'inactive', createdAt: DateTime(2023, 3, 15), lastActive: DateTime.now().subtract(const Duration(days: 7))),
  ];
});

class UsersPage extends ConsumerStatefulWidget {
  const UsersPage({super.key});

  @override
  ConsumerState<UsersPage> createState() => _UsersPageState();
}

class _UsersPageState extends ConsumerState<UsersPage> {
  String _selectedRole = 'All';
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final users = ref.watch(usersProvider);
    final loc = AppLocalizations.of(context);
    final filteredUsers = users.where((u) {
      final matchesRole = _selectedRole == 'All' || u.role == _selectedRole;
      final matchesSearch = _searchQuery.isEmpty || u.name.toLowerCase().contains(_searchQuery.toLowerCase()) || u.email.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        PageHeader(
          title: loc.translate('users'),
          subtitle: '${users.length} total users across all roles',
          actions: [
            ExportButton(data: users.map((u) => u.toJson()).toList(), fileName: 'users'),
            const SizedBox(width: 8),
            ElevatedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.add, size: 18),
              label: Text(loc.translate('addNew')),
            ),
          ],
        ),
        _buildFilters(users, loc),
        const SizedBox(height: 16),
        _buildUsersTable(filteredUsers, loc),
      ],
    );
  }

  Widget _buildFilters(List<AppUser> users, AppLocalizations loc) {
    final roles = ['All', ...{for (var u in users) u.role}];
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                decoration: InputDecoration(
                  hintText: loc.translate('search'),
                  prefixIcon: const Icon(Icons.search, size: 20),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  filled: true,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                ),
                onChanged: (v) => setState(() => _searchQuery = v),
              ),
            ),
            const SizedBox(width: 16),
            SizedBox(
              width: 200,
              child: DropdownButtonFormField<String>(
                value: _selectedRole,
                decoration: InputDecoration(
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  filled: true,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                ),
                items: roles.map((r) => DropdownMenuItem(value: r, child: Text(r.replaceAll('_', ' ').titleCase))).toList(),
                onChanged: (v) => setState(() => _selectedRole = v!),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUsersTable(List<AppUser> users, AppLocalizations loc) {
    return DataTableWidget<AppUser>(
      data: users,
      columns: const [
        DataColumn(label: Text('User')),
        DataColumn(label: Text('Role')),
        DataColumn(label: Text('Status')),
        DataColumn(label: Text('Branch')),
        DataColumn(label: Text('Last Active')),
        DataColumn(label: Text('Actions')),
      ],
      rowBuilder: (user, index) => DataRow(cells: [
        DataCell(Row(children: [
          UserAvatar(name: user.name, size: 32),
          const SizedBox(width: 12),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(user.name, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
              Text(user.email, style: TextStyle(fontSize: 11, color: Colors.grey[500])),
            ],
          ),
        ])),
        DataCell(RoleBadge(role: user.role)),
        DataCell(StatusIndicator(status: user.status)),
        DataCell(Text(user.branchName ?? '-', style: const TextStyle(fontSize: 13))),
        DataCell(Text(user.lastActive != null ? Helpers.formatRelativeTime(user.lastActive!) : '-', style: const TextStyle(fontSize: 13))),
        DataCell(Row(children: [
          IconButton(icon: const Icon(Icons.visibility, size: 18), onPressed: () => _showUserDetail(context, user)),
          IconButton(
            icon: Icon(user.isActive ? Icons.pause_circle : Icons.play_circle, size: 18, color: user.isActive ? Colors.orange : Colors.green),
            onPressed: () => _toggleUser(context, user),
          ),
        ])),
      ]),
    );
  }

  void _showUserDetail(BuildContext context, AppUser user) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(user.name),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        content: SizedBox(
          width: 450,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(children: [
                UserAvatar(name: user.name, size: 64),
                const SizedBox(width: 16),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(user.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  Text(user.email, style: TextStyle(color: Colors.grey[500])),
                  const SizedBox(height: 8),
                  RoleBadge(role: user.role),
                ])),
              ]),
              const Divider(height: 32),
              _detailItem('Phone', user.phone),
              _detailItem('Status', user.status.capitalize),
              _detailItem('Branch', user.branchName ?? 'N/A'),
              _detailItem('Date Joined', Formatters.date(user.createdAt)),
              _detailItem('Last Active', user.lastActive != null ? Helpers.formatRelativeTime(user.lastActive!) : 'N/A'),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
          ElevatedButton(
            onPressed: () { Navigator.pop(context); },
            child: const Text('View History'),
          ),
        ],
      ),
    );
  }

  Widget _detailItem(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
        ],
      ),
    );
  }

  void _toggleUser(BuildContext context, AppUser user) {
    ConfirmDialog.show(
      context: context,
      title: user.isActive ? 'Suspend User' : 'Activate User',
      message: 'Are you sure you want to ${user.isActive ? 'suspend' : 'activate'} ${user.name}?',
      confirmText: user.isActive ? 'Suspend' : 'Activate',
      confirmColor: user.isActive ? Colors.red : Colors.green,
      onConfirm: () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('User ${user.isActive ? 'suspended' : 'activated'}'), backgroundColor: Colors.green),
        );
      },
    );
  }
}
