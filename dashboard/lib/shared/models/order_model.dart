class Order {
  final String id;
  final String orderNumber;
  final String customerId;
  final String? customerName;
  final String? customerPhone;
  final List<OrderItem> items;
  final double subtotal;
  final double tax;
  final double deliveryFee;
  final double discount;
  final double totalAmount;
  final String status;
  final String paymentMethod;
  final String? paymentStatus;
  final String? driverId;
  final String? driverName;
  final String? deliveryAddress;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deliveredAt;

  Order({
    required this.id,
    required this.orderNumber,
    required this.customerId,
    this.customerName,
    this.customerPhone,
    this.items = const [],
    required this.subtotal,
    this.tax = 0,
    this.deliveryFee = 0,
    this.discount = 0,
    required this.totalAmount,
    required this.status,
    required this.paymentMethod,
    this.paymentStatus,
    this.driverId,
    this.driverName,
    this.deliveryAddress,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
    this.deliveredAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] ?? '',
      orderNumber: json['orderNumber'] ?? '',
      customerId: json['customerId'] ?? '',
      customerName: json['customerName'],
      customerPhone: json['customerPhone'],
      items: (json['items'] as List<dynamic>?)
              ?.map((item) => OrderItem.fromJson(item))
              .toList() ??
          [],
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      tax: (json['tax'] ?? 0).toDouble(),
      deliveryFee: (json['deliveryFee'] ?? 0).toDouble(),
      discount: (json['discount'] ?? 0).toDouble(),
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
      status: json['status'] ?? 'pending',
      paymentMethod: json['paymentMethod'] ?? 'cash_on_delivery',
      paymentStatus: json['paymentStatus'],
      driverId: json['driverId'],
      driverName: json['driverName'],
      deliveryAddress: json['deliveryAddress'],
      notes: json['notes'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
      deliveredAt: json['deliveredAt'] != null ? DateTime.parse(json['deliveredAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'orderNumber': orderNumber,
      'customerId': customerId,
      'items': items.map((item) => item.toJson()).toList(),
      'subtotal': subtotal,
      'tax': tax,
      'deliveryFee': deliveryFee,
      'discount': discount,
      'totalAmount': totalAmount,
      'status': status,
      'paymentMethod': paymentMethod,
      'driverId': driverId,
      'deliveryAddress': deliveryAddress,
      'notes': notes,
    };
  }

  String get statusLabel {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      case 'returned':
        return 'Returned';
      default:
        return status;
    }
  }

  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);
}

class OrderItem {
  final String id;
  final String medicineId;
  final String medicineName;
  final String? medicineImage;
  final int quantity;
  final double unitPrice;
  final double totalPrice;

  OrderItem({
    required this.id,
    required this.medicineId,
    required this.medicineName,
    this.medicineImage,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'] ?? '',
      medicineId: json['medicineId'] ?? '',
      medicineName: json['medicineName'] ?? '',
      medicineImage: json['medicineImage'],
      quantity: json['quantity'] ?? 0,
      unitPrice: (json['unitPrice'] ?? 0).toDouble(),
      totalPrice: (json['totalPrice'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'medicineId': medicineId,
      'medicineName': medicineName,
      'quantity': quantity,
      'unitPrice': unitPrice,
      'totalPrice': totalPrice,
    };
  }
}
