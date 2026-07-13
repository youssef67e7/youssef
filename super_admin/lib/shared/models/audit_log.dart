class AuditLog {
  final String id;
  final String userId;
  final String userName;
  final String userRole;
  final String action;
  final String entity;
  final String entityId;
  final Map<String, dynamic>? oldValues;
  final Map<String, dynamic>? newValues;
  final String? ipAddress;
  final String? userAgent;
  final DateTime timestamp;
  final String? details;

  const AuditLog({
    required this.id,
    required this.userId,
    required this.userName,
    required this.userRole,
    required this.action,
    required this.entity,
    required this.entityId,
    this.oldValues,
    this.newValues,
    this.ipAddress,
    this.userAgent,
    required this.timestamp,
    this.details,
  });

  factory AuditLog.fromJson(Map<String, dynamic> json) {
    return AuditLog(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      userName: json['userName'] ?? '',
      userRole: json['userRole'] ?? '',
      action: json['action'] ?? '',
      entity: json['entity'] ?? '',
      entityId: json['entityId'] ?? '',
      oldValues: json['oldValues'],
      newValues: json['newValues'],
      ipAddress: json['ipAddress'],
      userAgent: json['userAgent'],
      timestamp: DateTime.tryParse(json['timestamp'] ?? '') ?? DateTime.now(),
      details: json['details'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'userId': userId,
    'userName': userName,
    'userRole': userRole,
    'action': action,
    'entity': entity,
    'entityId': entityId,
    'oldValues': oldValues,
    'newValues': newValues,
    'ipAddress': ipAddress,
    'userAgent': userAgent,
    'timestamp': timestamp.toIso8601String(),
    'details': details,
  };

  bool get isSecurityAlert => action.toLowerCase().contains('delete') ||
      action.toLowerCase().contains('suspend') ||
      action.toLowerCase().contains('login_failed');
}
