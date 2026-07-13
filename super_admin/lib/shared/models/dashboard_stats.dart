class DashboardStats {
  final double totalRevenue;
  final int totalOrders;
  final int totalUsers;
  final int totalMedicines;
  final int totalPharmacies;
  final int activeDrivers;
  final int systemAlerts;
  final double revenueGrowth;
  final double ordersGrowth;
  final double usersGrowth;
  final List<double> revenueTrend;
  final List<double> ordersTrend;
  final List<Map<String, dynamic>> ordersByRegion;
  final List<Map<String, dynamic>> topPharmacies;
  final List<Map<String, dynamic>> recentAlerts;
  final List<Map<String, dynamic>> realtimeOrders;

  const DashboardStats({
    this.totalRevenue = 0,
    this.totalOrders = 0,
    this.totalUsers = 0,
    this.totalMedicines = 0,
    this.totalPharmacies = 0,
    this.activeDrivers = 0,
    this.systemAlerts = 0,
    this.revenueGrowth = 0,
    this.ordersGrowth = 0,
    this.usersGrowth = 0,
    this.revenueTrend = const [],
    this.ordersTrend = const [],
    this.ordersByRegion = const [],
    this.topPharmacies = const [],
    this.recentAlerts = const [],
    this.realtimeOrders = const [],
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      totalRevenue: (json['totalRevenue'] ?? 0).toDouble(),
      totalOrders: json['totalOrders'] ?? 0,
      totalUsers: json['totalUsers'] ?? 0,
      totalMedicines: json['totalMedicines'] ?? 0,
      totalPharmacies: json['totalPharmacies'] ?? 0,
      activeDrivers: json['activeDrivers'] ?? 0,
      systemAlerts: json['systemAlerts'] ?? 0,
      revenueGrowth: (json['revenueGrowth'] ?? 0).toDouble(),
      ordersGrowth: (json['ordersGrowth'] ?? 0).toDouble(),
      usersGrowth: (json['usersGrowth'] ?? 0).toDouble(),
      revenueTrend: List<double>.from(json['revenueTrend']?.map((e) => (e as num).toDouble()) ?? []),
      ordersTrend: List<double>.from(json['ordersTrend']?.map((e) => (e as num).toDouble()) ?? []),
      ordersByRegion: List<Map<String, dynamic>>.from(json['ordersByRegion'] ?? []),
      topPharmacies: List<Map<String, dynamic>>.from(json['topPharmacies'] ?? []),
      recentAlerts: List<Map<String, dynamic>>.from(json['recentAlerts'] ?? []),
      realtimeOrders: List<Map<String, dynamic>>.from(json['realtimeOrders'] ?? []),
    );
  }

  static DashboardStats mock() {
    return const DashboardStats(
      totalRevenue: 2847563.50,
      totalOrders: 158432,
      totalUsers: 89234,
      totalMedicines: 12456,
      totalPharmacies: 247,
      activeDrivers: 892,
      systemAlerts: 3,
      revenueGrowth: 12.5,
      ordersGrowth: 8.3,
      usersGrowth: 15.2,
      revenueTrend: [180, 220, 190, 240, 280, 320, 310, 350, 380, 420, 450, 480],
      ordersTrend: [1200, 1400, 1350, 1600, 1800, 2100, 2000, 2300, 2500, 2800, 3000, 3200],
      ordersByRegion: [
        {'region': 'North', 'orders': 45000, 'percentage': 28.4},
        {'region': 'South', 'orders': 38000, 'percentage': 24.0},
        {'region': 'East', 'orders': 35000, 'percentage': 22.1},
        {'region': 'West', 'orders': 25000, 'percentage': 15.8},
        {'region': 'Central', 'orders': 15432, 'percentage': 9.7},
      ],
      topPharmacies: [
        {'name': 'PharmaWorld Central', 'revenue': 345000, 'orders': 12500},
        {'name': 'PharmaWorld North', 'revenue': 298000, 'orders': 10800},
        {'name': 'PharmaWorld South', 'revenue': 267000, 'orders': 9600},
        {'name': 'PharmaWorld East', 'revenue': 234000, 'orders': 8400},
        {'name': 'PharmaWorld West', 'revenue': 198000, 'orders': 7100},
      ],
      recentAlerts: [
        {'type': 'warning', 'message': 'High memory usage on Server 2', 'time': '10 min ago'},
        {'type': 'info', 'message': 'Scheduled maintenance in 2 hours', 'time': '1 hour ago'},
        {'type': 'error', 'message': 'Payment gateway timeout', 'time': '2 hours ago'},
      ],
    );
  }
}
