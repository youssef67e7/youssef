class AppUser {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String role;
  final String roleId;
  final String status;
  final String? avatar;
  final DateTime createdAt;
  final DateTime? lastActive;
  final String? branchId;
  final String? branchName;
  final Map<String, dynamic>? metadata;

  const AppUser({
    required this.id,
    required this.name,
    required this.email,
    this.phone = '',
    required this.role,
    required this.roleId,
    this.status = 'active',
    this.avatar,
    required this.createdAt,
    this.lastActive,
    this.branchId,
    this.branchName,
    this.metadata,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] ?? '',
      roleId: json['roleId'] ?? '',
      status: json['status'] ?? 'active',
      avatar: json['avatar'],
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      lastActive: json['lastActive'] != null ? DateTime.tryParse(json['lastActive']) : null,
      branchId: json['branchId'],
      branchName: json['branchName'],
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'phone': phone,
    'role': role,
    'roleId': roleId,
    'status': status,
    'avatar': avatar,
    'createdAt': createdAt.toIso8601String(),
    'lastActive': lastActive?.toIso8601String(),
    'branchId': branchId,
    'branchName': branchName,
    'metadata': metadata,
  };

  bool get isActive => status == 'active';
  bool get isSuspended => status == 'suspended';

  AppUser copyWith({
    String? name,
    String? email,
    String? phone,
    String? role,
    String? roleId,
    String? status,
    String? avatar,
    DateTime? lastActive,
    String? branchId,
    String? branchName,
  }) {
    return AppUser(
      id: id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      roleId: roleId ?? this.roleId,
      status: status ?? this.status,
      avatar: avatar ?? this.avatar,
      createdAt: createdAt,
      lastActive: lastActive ?? this.lastActive,
      branchId: branchId ?? this.branchId,
      branchName: branchName ?? this.branchName,
      metadata: metadata,
    );
  }
}
