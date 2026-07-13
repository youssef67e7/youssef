class Branch {
  final String id;
  final String name;
  final String city;
  final String region;
  final String address;
  final String phone;
  final String managerName;
  final String managerId;
  final String status;
  final double totalRevenue;
  final int totalOrders;
  final int totalCustomers;
  final int totalMedicines;
  final double rating;
  final DateTime createdAt;
  final DateTime? lastActive;

  const Branch({
    required this.id,
    required this.name,
    required this.city,
    required this.region,
    this.address = '',
    this.phone = '',
    this.managerName = '',
    this.managerId = '',
    this.status = 'active',
    this.totalRevenue = 0,
    this.totalOrders = 0,
    this.totalCustomers = 0,
    this.totalMedicines = 0,
    this.rating = 0,
    required this.createdAt,
    this.lastActive,
  });

  factory Branch.fromJson(Map<String, dynamic> json) {
    return Branch(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      city: json['city'] ?? '',
      region: json['region'] ?? '',
      address: json['address'] ?? '',
      phone: json['phone'] ?? '',
      managerName: json['managerName'] ?? '',
      managerId: json['managerId'] ?? '',
      status: json['status'] ?? 'active',
      totalRevenue: (json['totalRevenue'] ?? 0).toDouble(),
      totalOrders: json['totalOrders'] ?? 0,
      totalCustomers: json['totalCustomers'] ?? 0,
      totalMedicines: json['totalMedicines'] ?? 0,
      rating: (json['rating'] ?? 0).toDouble(),
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      lastActive: json['lastActive'] != null ? DateTime.tryParse(json['lastActive']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'city': city,
    'region': region,
    'address': address,
    'phone': phone,
    'managerName': managerName,
    'managerId': managerId,
    'status': status,
    'totalRevenue': totalRevenue,
    'totalOrders': totalOrders,
    'totalCustomers': totalCustomers,
    'totalMedicines': totalMedicines,
    'rating': rating,
    'createdAt': createdAt.toIso8601String(),
    'lastActive': lastActive?.toIso8601String(),
  };

  bool get isActive => status == 'active';
}
