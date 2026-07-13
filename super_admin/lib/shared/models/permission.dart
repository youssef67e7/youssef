class Permission {
  final String id;
  final String name;
  final String module;
  final String description;

  const Permission({
    required this.id,
    required this.name,
    required this.module,
    required this.description,
  });

  factory Permission.fromJson(Map<String, dynamic> json) {
    return Permission(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      module: json['module'] ?? '',
      description: json['description'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'module': module,
    'description': description,
  };

  static List<Permission> get allPermissions => const [
    Permission(id: '1', name: 'view_dashboard', module: 'Dashboard', description: 'View Dashboard'),
    Permission(id: '2', name: 'manage_pharmacies', module: 'Pharmacies', description: 'Manage Pharmacies'),
    Permission(id: '3', name: 'view_pharmacies', module: 'Pharmacies', description: 'View Pharmacies'),
    Permission(id: '4', name: 'manage_users', module: 'Users', description: 'Manage Users'),
    Permission(id: '5', name: 'view_users', module: 'Users', description: 'View Users'),
    Permission(id: '6', name: 'manage_roles', module: 'Roles', description: 'Manage Roles'),
    Permission(id: '7', name: 'manage_feature_flags', module: 'Feature Flags', description: 'Manage Feature Flags'),
    Permission(id: '8', name: 'manage_maintenance', module: 'Maintenance', description: 'Manage Maintenance'),
    Permission(id: '9', name: 'manage_config', module: 'Config', description: 'Manage Configuration'),
    Permission(id: '10', name: 'view_audit_logs', module: 'Audit', description: 'View Audit Logs'),
    Permission(id: '11', name: 'export_audit_logs', module: 'Audit', description: 'Export Audit Logs'),
    Permission(id: '12', name: 'view_analytics', module: 'Analytics', description: 'View Analytics'),
    Permission(id: '13', name: 'generate_reports', module: 'Reports', description: 'Generate Reports'),
    Permission(id: '14', name: 'view_system_health', module: 'System Health', description: 'View System Health'),
    Permission(id: '15', name: 'manage_system_health', module: 'System Health', description: 'Manage System Health'),
  ];
}
