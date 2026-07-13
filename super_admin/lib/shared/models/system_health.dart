class SystemHealth {
  final ApiHealth api;
  final DatabaseHealth database;
  final CacheHealth cache;
  final SessionHealth sessions;
  final ServerHealth server;

  const SystemHealth({
    required this.api,
    required this.database,
    required this.cache,
    required this.sessions,
    required this.server,
  });

  factory SystemHealth.fromJson(Map<String, dynamic> json) {
    return SystemHealth(
      api: ApiHealth.fromJson(json['api'] ?? {}),
      database: DatabaseHealth.fromJson(json['database'] ?? {}),
      cache: CacheHealth.fromJson(json['cache'] ?? {}),
      sessions: SessionHealth.fromJson(json['sessions'] ?? {}),
      server: ServerHealth.fromJson(json['server'] ?? {}),
    );
  }

  String get overallStatus {
    final statuses = [api.status, database.status, cache.status];
    if (statuses.every((s) => s == 'healthy')) return 'healthy';
    if (statuses.any((s) => s == 'down')) return 'down';
    return 'degraded';
  }
}

class ApiHealth {
  final String status;
  final double responseTimeMs;
  final double errorRate;
  final double requestsPerSecond;
  final List<double> responseTimes;

  const ApiHealth({
    this.status = 'healthy',
    this.responseTimeMs = 0,
    this.errorRate = 0,
    this.requestsPerSecond = 0,
    this.responseTimes = const [],
  });

  factory ApiHealth.fromJson(Map<String, dynamic> json) {
    return ApiHealth(
      status: json['status'] ?? 'healthy',
      responseTimeMs: (json['responseTimeMs'] ?? 0).toDouble(),
      errorRate: (json['errorRate'] ?? 0).toDouble(),
      requestsPerSecond: (json['requestsPerSecond'] ?? 0).toDouble(),
      responseTimes: List<double>.from(json['responseTimes']?.map((e) => (e as num).toDouble()) ?? []),
    );
  }
}

class DatabaseHealth {
  final String status;
  final int activeConnections;
  final int connectionPoolSize;
  final double queryTimeMs;
  final int totalQueries;

  const DatabaseHealth({
    this.status = 'healthy',
    this.activeConnections = 0,
    this.connectionPoolSize = 100,
    this.queryTimeMs = 0,
    this.totalQueries = 0,
  });

  factory DatabaseHealth.fromJson(Map<String, dynamic> json) {
    return DatabaseHealth(
      status: json['status'] ?? 'healthy',
      activeConnections: json['activeConnections'] ?? 0,
      connectionPoolSize: json['connectionPoolSize'] ?? 100,
      queryTimeMs: (json['queryTimeMs'] ?? 0).toDouble(),
      totalQueries: json['totalQueries'] ?? 0,
    );
  }

  double get connectionUsage => connectionPoolSize > 0 ? (activeConnections / connectionPoolSize) * 100 : 0;
}

class CacheHealth {
  final String status;
  final double hitRate;
  final double missRate;
  final int totalKeys;
  final double memoryUsedMB;

  const CacheHealth({
    this.status = 'healthy',
    this.hitRate = 0,
    this.missRate = 0,
    this.totalKeys = 0,
    this.memoryUsedMB = 0,
  });

  factory CacheHealth.fromJson(Map<String, dynamic> json) {
    return CacheHealth(
      status: json['status'] ?? 'healthy',
      hitRate: (json['hitRate'] ?? 0).toDouble(),
      missRate: (json['missRate'] ?? 0).toDouble(),
      totalKeys: json['totalKeys'] ?? 0,
      memoryUsedMB: (json['memoryUsedMB'] ?? 0).toDouble(),
    );
  }
}

class SessionHealth {
  final int activeSessions;
  final int peakToday;
  final double avgDurationMinutes;

  const SessionHealth({
    this.activeSessions = 0,
    this.peakToday = 0,
    this.avgDurationMinutes = 0,
  });

  factory SessionHealth.fromJson(Map<String, dynamic> json) {
    return SessionHealth(
      activeSessions: json['activeSessions'] ?? 0,
      peakToday: json['peakToday'] ?? 0,
      avgDurationMinutes: (json['avgDurationMinutes'] ?? 0).toDouble(),
    );
  }
}

class ServerHealth {
  final double cpuUsage;
  final double memoryUsage;
  final double diskUsage;
  final double uptime;

  const ServerHealth({
    this.cpuUsage = 0,
    this.memoryUsage = 0,
    this.diskUsage = 0,
    this.uptime = 0,
  });

  factory ServerHealth.fromJson(Map<String, dynamic> json) {
    return ServerHealth(
      cpuUsage: (json['cpuUsage'] ?? 0).toDouble(),
      memoryUsage: (json['memoryUsage'] ?? 0).toDouble(),
      diskUsage: (json['diskUsage'] ?? 0).toDouble(),
      uptime: (json['uptime'] ?? 0).toDouble(),
    );
  }
}
