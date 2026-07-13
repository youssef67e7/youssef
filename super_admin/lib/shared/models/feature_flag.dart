class FeatureFlag {
  final String id;
  final String name;
  final String description;
  final bool isEnabled;
  final int rolloutPercentage;
  final List<String> targetRoles;
  final List<String> targetUsers;
  final bool abTestingEnabled;
  final String? abTestVariant;
  final DateTime createdAt;
  final DateTime updatedAt;

  const FeatureFlag({
    required this.id,
    required this.name,
    required this.description,
    this.isEnabled = false,
    this.rolloutPercentage = 0,
    this.targetRoles = const [],
    this.targetUsers = const [],
    this.abTestingEnabled = false,
    this.abTestVariant,
    required this.createdAt,
    required this.updatedAt,
  });

  factory FeatureFlag.fromJson(Map<String, dynamic> json) {
    return FeatureFlag(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      isEnabled: json['isEnabled'] ?? false,
      rolloutPercentage: json['rolloutPercentage'] ?? 0,
      targetRoles: List<String>.from(json['targetRoles'] ?? []),
      targetUsers: List<String>.from(json['targetUsers'] ?? []),
      abTestingEnabled: json['abTestingEnabled'] ?? false,
      abTestVariant: json['abTestVariant'],
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'description': description,
    'isEnabled': isEnabled,
    'rolloutPercentage': rolloutPercentage,
    'targetRoles': targetRoles,
    'targetUsers': targetUsers,
    'abTestingEnabled': abTestingEnabled,
    'abTestVariant': abTestVariant,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };

  FeatureFlag copyWith({
    String? name,
    String? description,
    bool? isEnabled,
    int? rolloutPercentage,
    List<String>? targetRoles,
    List<String>? targetUsers,
    bool? abTestingEnabled,
    String? abTestVariant,
  }) {
    return FeatureFlag(
      id: id,
      name: name ?? this.name,
      description: description ?? this.description,
      isEnabled: isEnabled ?? this.isEnabled,
      rolloutPercentage: rolloutPercentage ?? this.rolloutPercentage,
      targetRoles: targetRoles ?? this.targetRoles,
      targetUsers: targetUsers ?? this.targetUsers,
      abTestingEnabled: abTestingEnabled ?? this.abTestingEnabled,
      abTestVariant: abTestVariant ?? this.abTestVariant,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
    );
  }
}
