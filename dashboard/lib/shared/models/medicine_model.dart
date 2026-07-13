class Medicine {
  final String id;
  final String name;
  final String nameAr;
  final String description;
  final String? descriptionAr;
  final double price;
  final double? discountPrice;
  final int stock;
  final int lowStockThreshold;
  final String categoryId;
  final String? categoryName;
  final String brandId;
  final String? brandName;
  final String? sku;
  final String? barcode;
  final String? imageUrl;
  final List<String> images;
  final String? manufacturer;
  final DateTime? expiryDate;
  final String? batchNumber;
  final bool requiresPrescription;
  final bool isActive;
  final bool isFeatured;
  final double? rating;
  final int? reviewCount;
  final int? soldCount;
  final Map<String, dynamic>? attributes;
  final DateTime createdAt;
  final DateTime updatedAt;

  Medicine({
    required this.id,
    required this.name,
    this.nameAr = '',
    this.description = '',
    this.descriptionAr,
    required this.price,
    this.discountPrice,
    required this.stock,
    this.lowStockThreshold = 10,
    required this.categoryId,
    this.categoryName,
    required this.brandId,
    this.brandName,
    this.sku,
    this.barcode,
    this.imageUrl,
    this.images = const [],
    this.manufacturer,
    this.expiryDate,
    this.batchNumber,
    this.requiresPrescription = false,
    this.isActive = true,
    this.isFeatured = false,
    this.rating,
    this.reviewCount,
    this.soldCount,
    this.attributes,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Medicine.fromJson(Map<String, dynamic> json) {
    return Medicine(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      nameAr: json['nameAr'] ?? '',
      description: json['description'] ?? '',
      descriptionAr: json['descriptionAr'],
      price: (json['price'] ?? 0).toDouble(),
      discountPrice: json['discountPrice']?.toDouble(),
      stock: json['stock'] ?? 0,
      lowStockThreshold: json['lowStockThreshold'] ?? 10,
      categoryId: json['categoryId'] ?? '',
      categoryName: json['categoryName'],
      brandId: json['brandId'] ?? '',
      brandName: json['brandName'],
      sku: json['sku'],
      barcode: json['barcode'],
      imageUrl: json['imageUrl'],
      images: List<String>.from(json['images'] ?? []),
      manufacturer: json['manufacturer'],
      expiryDate: json['expiryDate'] != null ? DateTime.parse(json['expiryDate']) : null,
      batchNumber: json['batchNumber'],
      requiresPrescription: json['requiresPrescription'] ?? false,
      isActive: json['isActive'] ?? true,
      isFeatured: json['isFeatured'] ?? false,
      rating: json['rating']?.toDouble(),
      reviewCount: json['reviewCount'],
      soldCount: json['soldCount'],
      attributes: json['attributes'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'nameAr': nameAr,
      'description': description,
      'descriptionAr': descriptionAr,
      'price': price,
      'discountPrice': discountPrice,
      'stock': stock,
      'lowStockThreshold': lowStockThreshold,
      'categoryId': categoryId,
      'brandId': brandId,
      'sku': sku,
      'barcode': barcode,
      'imageUrl': imageUrl,
      'images': images,
      'manufacturer': manufacturer,
      'expiryDate': expiryDate?.toIso8601String(),
      'batchNumber': batchNumber,
      'requiresPrescription': requiresPrescription,
      'isActive': isActive,
      'isFeatured': isFeatured,
      'attributes': attributes,
    };
  }

  bool get isLowStock => stock <= lowStockThreshold;
  bool get isExpiringSoon =>
      expiryDate != null && expiryDate!.difference(DateTime.now()).inDays < 90;
  bool get hasDiscount => discountPrice != null && discountPrice! < price;
  double get discountPercentage =>
      hasDiscount ? ((price - discountPrice!) / price * 100) : 0;
  String get displayName => nameAr.isNotEmpty ? nameAr : name;
}
