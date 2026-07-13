class Role {
  final String id;
  final String name;
  final String description;
  final List<String> permissions;
  final int userCount;
  final bool isSystem;
  final DateTime createdAt;

  const Role({
    required this.id,
    required this.name,
    required this.description,
    this.permissions = const [],
    this.userCount = 0,
    this.isSystem = false,
    required this.createdAt,
  });

  factory Role.fromJson(Map<String, dynamic> json) {
    return Role(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      permissions: List<String>.from(json['permissions'] ?? []),
      userCount: json['userCount'] ?? 0,
      isSystem: json['isSystem'] ?? false,
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'description': description,
    'permissions': permissions,
    'userCount': userCount,
    'isSystem': isSystem,
    'createdAt': createdAt.toIso8601String(),
  };

  Role copyWith({
    String? name,
    String? description,
    List<String>? permissions,
    int? userCount,
  }) {
    return Role(
      id: id,
      name: name ?? this.name,
      description: description ?? this.description,
      permissions: permissions ?? this.permissions,
      userCount: userCount ?? this.userCount,
      isSystem: isSystem,
      createdAt: createdAt,
    );
  }
}
