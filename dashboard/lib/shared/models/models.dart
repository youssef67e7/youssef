class Customer {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String? avatar;
  final String? address;
  final bool isBlocked;
  final int totalOrders;
  final double totalSpent;
  final DateTime createdAt;
  final DateTime? lastOrderAt;

  Customer({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.avatar,
    this.address,
    this.isBlocked = false,
    this.totalOrders = 0,
    this.totalSpent = 0,
    required this.createdAt,
    this.lastOrderAt,
  });

  factory Customer.fromJson(Map<String, dynamic> json) {
    return Customer(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      avatar: json['avatar'],
      address: json['address'],
      isBlocked: json['isBlocked'] ?? false,
      totalOrders: json['totalOrders'] ?? 0,
      totalSpent: (json['totalSpent'] ?? 0).toDouble(),
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      lastOrderAt: json['lastOrderAt'] != null ? DateTime.parse(json['lastOrderAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'avatar': avatar,
      'address': address,
      'isBlocked': isBlocked,
    };
  }

  String get initials {
    final parts = name.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }
}

class Driver {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String? avatar;
  final String? vehicleType;
  final String? vehicleNumber;
  final bool isOnline;
  final bool isActive;
  final int totalDeliveries;
  final double totalEarnings;
  final double rating;
  final DateTime createdAt;

  Driver({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.avatar,
    this.vehicleType,
    this.vehicleNumber,
    this.isOnline = false,
    this.isActive = true,
    this.totalDeliveries = 0,
    this.totalEarnings = 0,
    this.rating = 0,
    required this.createdAt,
  });

  factory Driver.fromJson(Map<String, dynamic> json) {
    return Driver(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      avatar: json['avatar'],
      vehicleType: json['vehicleType'],
      vehicleNumber: json['vehicleNumber'],
      isOnline: json['isOnline'] ?? false,
      isActive: json['isActive'] ?? true,
      totalDeliveries: json['totalDeliveries'] ?? 0,
      totalEarnings: (json['totalEarnings'] ?? 0).toDouble(),
      rating: (json['rating'] ?? 0).toDouble(),
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'avatar': avatar,
      'vehicleType': vehicleType,
      'vehicleNumber': vehicleNumber,
      'isOnline': isOnline,
      'isActive': isActive,
    };
  }

  String get initials {
    final parts = name.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }
}

class Category {
  final String id;
  final String name;
  final String nameAr;
  final String? description;
  final String? imageUrl;
  final String? parentId;
  final int sortOrder;
  final bool isActive;
  final int productCount;
  final DateTime createdAt;

  Category({
    required this.id,
    required this.name,
    this.nameAr = '',
    this.description,
    this.imageUrl,
    this.parentId,
    this.sortOrder = 0,
    this.isActive = true,
    this.productCount = 0,
    required this.createdAt,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      nameAr: json['nameAr'] ?? '',
      description: json['description'],
      imageUrl: json['imageUrl'],
      parentId: json['parentId'],
      sortOrder: json['sortOrder'] ?? 0,
      isActive: json['isActive'] ?? true,
      productCount: json['productCount'] ?? 0,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'nameAr': nameAr,
      'description': description,
      'imageUrl': imageUrl,
      'parentId': parentId,
      'sortOrder': sortOrder,
      'isActive': isActive,
    };
  }

  String get displayName => nameAr.isNotEmpty ? nameAr : name;
}

class Brand {
  final String id;
  final String name;
  final String? description;
  final String? logoUrl;
  final bool isActive;
  final int productCount;
  final DateTime createdAt;

  Brand({
    required this.id,
    required this.name,
    this.description,
    this.logoUrl,
    this.isActive = true,
    this.productCount = 0,
    required this.createdAt,
  });

  factory Brand.fromJson(Map<String, dynamic> json) {
    return Brand(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      logoUrl: json['logoUrl'],
      isActive: json['isActive'] ?? true,
      productCount: json['productCount'] ?? 0,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'logoUrl': logoUrl,
      'isActive': isActive,
    };
  }
}

class Coupon {
  final String id;
  final String code;
  final String description;
  final String discountType;
  final double discountValue;
  final double? minimumOrder;
  final double? maximumDiscount;
  final int? maxUsage;
  final int currentUsage;
  final bool isActive;
  final DateTime validFrom;
  final DateTime validTo;
  final DateTime createdAt;

  Coupon({
    required this.id,
    required this.code,
    this.description = '',
    required this.discountType,
    required this.discountValue,
    this.minimumOrder,
    this.maximumDiscount,
    this.maxUsage,
    this.currentUsage = 0,
    this.isActive = true,
    required this.validFrom,
    required this.validTo,
    required this.createdAt,
  });

  factory Coupon.fromJson(Map<String, dynamic> json) {
    return Coupon(
      id: json['id'] ?? '',
      code: json['code'] ?? '',
      description: json['description'] ?? '',
      discountType: json['discountType'] ?? 'percentage',
      discountValue: (json['discountValue'] ?? 0).toDouble(),
      minimumOrder: json['minimumOrder']?.toDouble(),
      maximumDiscount: json['maximumDiscount']?.toDouble(),
      maxUsage: json['maxUsage'],
      currentUsage: json['currentUsage'] ?? 0,
      isActive: json['isActive'] ?? true,
      validFrom: DateTime.parse(json['validFrom'] ?? DateTime.now().toIso8601String()),
      validTo: DateTime.parse(json['validTo'] ?? DateTime.now().toIso8601String()),
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'description': description,
      'discountType': discountType,
      'discountValue': discountValue,
      'minimumOrder': minimumOrder,
      'maximumDiscount': maximumDiscount,
      'maxUsage': maxUsage,
      'isActive': isActive,
      'validFrom': validFrom.toIso8601String(),
      'validTo': validTo.toIso8601String(),
    };
  }

  bool get isExpired => DateTime.now().isAfter(validTo);
  bool get isUsageLimitReached => maxUsage != null && currentUsage >= maxUsage!;
}

class Offer {
  final String id;
  final String title;
  final String titleAr;
  final String? description;
  final String? imageUrl;
  final String type;
  final double? discountValue;
  final List<String> applicableMedicines;
  final List<String> applicableCategories;
  final bool isActive;
  final bool isScheduled;
  final DateTime? startDate;
  final DateTime? endDate;
  final DateTime createdAt;

  Offer({
    required this.id,
    required this.title,
    this.titleAr = '',
    this.description,
    this.imageUrl,
    required this.type,
    this.discountValue,
    this.applicableMedicines = const [],
    this.applicableCategories = const [],
    this.isActive = true,
    this.isScheduled = false,
    this.startDate,
    this.endDate,
    required this.createdAt,
  });

  factory Offer.fromJson(Map<String, dynamic> json) {
    return Offer(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      titleAr: json['titleAr'] ?? '',
      description: json['description'],
      imageUrl: json['imageUrl'],
      type: json['type'] ?? 'percentage',
      discountValue: json['discountValue']?.toDouble(),
      applicableMedicines: List<String>.from(json['applicableMedicines'] ?? []),
      applicableCategories: List<String>.from(json['applicableCategories'] ?? []),
      isActive: json['isActive'] ?? true,
      isScheduled: json['isScheduled'] ?? false,
      startDate: json['startDate'] != null ? DateTime.parse(json['startDate']) : null,
      endDate: json['endDate'] != null ? DateTime.parse(json['endDate']) : null,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'titleAr': titleAr,
      'description': description,
      'imageUrl': imageUrl,
      'type': type,
      'discountValue': discountValue,
      'applicableMedicines': applicableMedicines,
      'applicableCategories': applicableCategories,
      'isActive': isActive,
      'isScheduled': isScheduled,
      'startDate': startDate?.toIso8601String(),
      'endDate': endDate?.toIso8601String(),
    };
  }

  String get displayTitle => titleAr.isNotEmpty ? titleAr : title;
}

class BannerModel {
  final String id;
  final String title;
  final String? imageUrl;
  final String? link;
  final int sortOrder;
  final bool isActive;
  final bool isScheduled;
  final DateTime? startDate;
  final DateTime? endDate;
  final DateTime createdAt;

  BannerModel({
    required this.id,
    required this.title,
    this.imageUrl,
    this.link,
    this.sortOrder = 0,
    this.isActive = true,
    this.isScheduled = false,
    this.startDate,
    this.endDate,
    required this.createdAt,
  });

  factory BannerModel.fromJson(Map<String, dynamic> json) {
    return BannerModel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      imageUrl: json['imageUrl'],
      link: json['link'],
      sortOrder: json['sortOrder'] ?? 0,
      isActive: json['isActive'] ?? true,
      isScheduled: json['isScheduled'] ?? false,
      startDate: json['startDate'] != null ? DateTime.parse(json['startDate']) : null,
      endDate: json['endDate'] != null ? DateTime.parse(json['endDate']) : null,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'imageUrl': imageUrl,
      'link': link,
      'sortOrder': sortOrder,
      'isActive': isActive,
      'isScheduled': isScheduled,
      'startDate': startDate?.toIso8601String(),
      'endDate': endDate?.toIso8601String(),
    };
  }
}

class Review {
  final String id;
  final String customerId;
  final String? customerName;
  final String medicineId;
  final String? medicineName;
  final String orderId;
  final int rating;
  final String? comment;
  final String? adminReply;
  final String status;
  final DateTime createdAt;

  Review({
    required this.id,
    required this.customerId,
    this.customerName,
    required this.medicineId,
    this.medicineName,
    required this.orderId,
    required this.rating,
    this.comment,
    this.adminReply,
    this.status = 'pending',
    required this.createdAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'] ?? '',
      customerId: json['customerId'] ?? '',
      customerName: json['customerName'],
      medicineId: json['medicineId'] ?? '',
      medicineName: json['medicineName'],
      orderId: json['orderId'] ?? '',
      rating: json['rating'] ?? 0,
      comment: json['comment'],
      adminReply: json['adminReply'],
      status: json['status'] ?? 'pending',
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customerId': customerId,
      'medicineId': medicineId,
      'orderId': orderId,
      'rating': rating,
      'comment': comment,
      'adminReply': adminReply,
      'status': status,
    };
  }
}

class ReturnRequest {
  final String id;
  final String orderId;
  final String orderNumber;
  final String customerId;
  final String? customerName;
  final String reason;
  final String? notes;
  final double refundAmount;
  final String status;
  final DateTime createdAt;
  final DateTime? processedAt;

  ReturnRequest({
    required this.id,
    required this.orderId,
    required this.orderNumber,
    required this.customerId,
    this.customerName,
    required this.reason,
    this.notes,
    required this.refundAmount,
    this.status = 'pending',
    required this.createdAt,
    this.processedAt,
  });

  factory ReturnRequest.fromJson(Map<String, dynamic> json) {
    return ReturnRequest(
      id: json['id'] ?? '',
      orderId: json['orderId'] ?? '',
      orderNumber: json['orderNumber'] ?? '',
      customerId: json['customerId'] ?? '',
      customerName: json['customerName'],
      reason: json['reason'] ?? '',
      notes: json['notes'],
      refundAmount: (json['refundAmount'] ?? 0).toDouble(),
      status: json['status'] ?? 'pending',
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      processedAt: json['processedAt'] != null ? DateTime.parse(json['processedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'orderId': orderId,
      'reason': reason,
      'notes': notes,
      'refundAmount': refundAmount,
      'status': status,
    };
  }
}

class NotificationModel {
  final String id;
  final String title;
  final String body;
  final String? imageUrl;
  final String targetType;
  final List<String> targetUsers;
  final int sentCount;
  final int? readCount;
  final String status;
  final DateTime createdAt;

  NotificationModel({
    required this.id,
    required this.title,
    required this.body,
    this.imageUrl,
    required this.targetType,
    this.targetUsers = const [],
    this.sentCount = 0,
    this.readCount,
    this.status = 'sent',
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      body: json['body'] ?? '',
      imageUrl: json['imageUrl'],
      targetType: json['targetType'] ?? 'all',
      targetUsers: List<String>.from(json['targetUsers'] ?? []),
      sentCount: json['sentCount'] ?? 0,
      readCount: json['readCount'],
      status: json['status'] ?? 'sent',
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'body': body,
      'imageUrl': imageUrl,
      'targetType': targetType,
      'targetUsers': targetUsers,
    };
  }
}

class AuditLog {
  final String id;
  final String userId;
  final String? userName;
  final String action;
  final String entity;
  final String? entityId;
  final Map<String, dynamic>? oldValues;
  final Map<String, dynamic>? newValues;
  final String? ipAddress;
  final DateTime createdAt;

  AuditLog({
    required this.id,
    required this.userId,
    this.userName,
    required this.action,
    required this.entity,
    this.entityId,
    this.oldValues,
    this.newValues,
    this.ipAddress,
    required this.createdAt,
  });

  factory AuditLog.fromJson(Map<String, dynamic> json) {
    return AuditLog(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      userName: json['userName'],
      action: json['action'] ?? '',
      entity: json['entity'] ?? '',
      entityId: json['entityId'],
      oldValues: json['oldValues'] != null ? Map<String, dynamic>.from(json['oldValues']) : null,
      newValues: json['newValues'] != null ? Map<String, dynamic>.from(json['newValues']) : null,
      ipAddress: json['ipAddress'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }
}

class DashboardStats {
  final double totalRevenue;
  final double revenueChange;
  final int totalOrders;
  final double ordersChange;
  final int totalCustomers;
  final double customersChange;
  final int totalMedicines;
  final double medicinesChange;
  final int pendingOrders;
  final int onlineDrivers;
  final int pendingReturns;
  final int activeCoupons;
  final int lowStockItems;
  final int expiringItems;

  DashboardStats({
    this.totalRevenue = 0,
    this.revenueChange = 0,
    this.totalOrders = 0,
    this.ordersChange = 0,
    this.totalCustomers = 0,
    this.customersChange = 0,
    this.totalMedicines = 0,
    this.medicinesChange = 0,
    this.pendingOrders = 0,
    this.onlineDrivers = 0,
    this.pendingReturns = 0,
    this.activeCoupons = 0,
    this.lowStockItems = 0,
    this.expiringItems = 0,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      totalRevenue: (json['totalRevenue'] ?? 0).toDouble(),
      revenueChange: (json['revenueChange'] ?? 0).toDouble(),
      totalOrders: json['totalOrders'] ?? 0,
      ordersChange: (json['ordersChange'] ?? 0).toDouble(),
      totalCustomers: json['totalCustomers'] ?? 0,
      customersChange: (json['customersChange'] ?? 0).toDouble(),
      totalMedicines: json['totalMedicines'] ?? 0,
      medicinesChange: (json['medicinesChange'] ?? 0).toDouble(),
      pendingOrders: json['pendingOrders'] ?? 0,
      onlineDrivers: json['onlineDrivers'] ?? 0,
      pendingReturns: json['pendingReturns'] ?? 0,
      activeCoupons: json['activeCoupons'] ?? 0,
      lowStockItems: json['lowStockItems'] ?? 0,
      expiringItems: json['expiringItems'] ?? 0,
    );
  }
}

class ChartData {
  final String label;
  final double value;
  final DateTime? date;

  ChartData({
    required this.label,
    required this.value,
    this.date,
  });

  factory ChartData.fromJson(Map<String, dynamic> json) {
    return ChartData(
      label: json['label'] ?? '',
      value: (json['value'] ?? 0).toDouble(),
      date: json['date'] != null ? DateTime.parse(json['date']) : null,
    );
  }
}

class AppSettings {
  final String storeName;
  final String storeAddress;
  final String storePhone;
  final String storeEmail;
  final String currency;
  final String timezone;
  final double taxRate;
  final double platformFee;
  final double deliveryRadius;
  final double freeDeliveryThreshold;
  final Map<String, bool> featureFlags;
  final bool maintenanceMode;

  AppSettings({
    this.storeName = 'PharmaWorld',
    this.storeAddress = '',
    this.storePhone = '',
    this.storeEmail = '',
    this.currency = 'SAR',
    this.timezone = 'Asia/Riyadh',
    this.taxRate = 15,
    this.platformFee = 10,
    this.deliveryRadius = 25,
    this.freeDeliveryThreshold = 100,
    this.featureFlags = const {},
    this.maintenanceMode = false,
  });

  factory AppSettings.fromJson(Map<String, dynamic> json) {
    return AppSettings(
      storeName: json['storeName'] ?? 'PharmaWorld',
      storeAddress: json['storeAddress'] ?? '',
      storePhone: json['storePhone'] ?? '',
      storeEmail: json['storeEmail'] ?? '',
      currency: json['currency'] ?? 'SAR',
      timezone: json['timezone'] ?? 'Asia/Riyadh',
      taxRate: (json['taxRate'] ?? 15).toDouble(),
      platformFee: (json['platformFee'] ?? 10).toDouble(),
      deliveryRadius: (json['deliveryRadius'] ?? 25).toDouble(),
      freeDeliveryThreshold: (json['freeDeliveryThreshold'] ?? 100).toDouble(),
      featureFlags: Map<String, bool>.from(json['featureFlags'] ?? {}),
      maintenanceMode: json['maintenanceMode'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'storeName': storeName,
      'storeAddress': storeAddress,
      'storePhone': storePhone,
      'storeEmail': storeEmail,
      'currency': currency,
      'timezone': timezone,
      'taxRate': taxRate,
      'platformFee': platformFee,
      'deliveryRadius': deliveryRadius,
      'freeDeliveryThreshold': freeDeliveryThreshold,
      'featureFlags': featureFlags,
      'maintenanceMode': maintenanceMode,
    };
  }
}
