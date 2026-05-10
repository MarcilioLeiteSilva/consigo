class Product {
  final String id;
  final String name;
  final String? sku;
  final String? description;
  final String? imageUrl;
  final String? unit;
  final String? categoryId;
  final Category? category;
  final int totalStock;
  final bool isActive;

  Product({
    required this.id,
    required this.name,
    this.sku,
    this.description,
    this.imageUrl,
    this.unit,
    this.categoryId,
    this.category,
    this.totalStock = 0,
    this.isActive = true,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      sku: json['sku'],
      description: json['description'],
      imageUrl: json['imageUrl'],
      unit: json['unit'],
      categoryId: json['categoryId'],
      category: json['category'] != null ? Category.fromJson(json['category']) : null,
      totalStock: json['_count']?['consignmentLots'] ?? json['totalStock'] ?? 0,
      isActive: json['isActive'] ?? true,
    );
  }
}

class Category {
  final String id;
  final String name;

  Category({required this.id, required this.name});

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'],
      name: json['name'],
    );
  }
}

class SaleItemRequest {
  final String productId;
  final int quantity;
  final double unitPrice;

  SaleItemRequest({
    required this.productId,
    required this.quantity,
    required this.unitPrice,
  });

  Map<String, dynamic> toJson() => {
    'productId': productId,
    'quantity': quantity,
    'unitPrice': unitPrice,
  };
}

class POS {
  final String id;
  final String name;
  final String? responsibleName;
  final String? document;
  final String? whatsapp;
  final String? email;
  final String? city;
  final String? state;
  final String? location;
  final double defaultCommission;
  final bool isActive;

  POS({
    required this.id,
    required this.name,
    this.responsibleName,
    this.document,
    this.whatsapp,
    this.email,
    this.city,
    this.state,
    this.location,
    required this.defaultCommission,
    required this.isActive,
  });

  factory POS.fromJson(Map<String, dynamic> json) {
    return POS(
      id: json['id'],
      name: json['name'],
      responsibleName: json['responsibleName'],
      document: json['document'],
      whatsapp: json['whatsapp'],
      email: json['email'],
      city: json['city'],
      state: json['state'],
      location: json['location'],
      defaultCommission: double.tryParse(json['defaultCommission']?.toString() ?? '0') ?? 0,
      isActive: json['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name,
    'responsibleName': responsibleName,
    'document': document,
    'whatsapp': whatsapp,
    'email': email,
    'city': city,
    'state': state,
    'location': location,
    'defaultCommission': defaultCommission.toString(),
    'isActive': isActive,
  };
}

class ConsignmentLot {
  final String id;
  final String productId;
  final Product? product;
  final String? posId;
  final POS? pos;
  final int quantityReceived;
  final int quantitySold;
  final int quantityReturned;
  final double commissionPercent;
  final double unitPrice;
  final String? reference;
  final String? notes;
  final DateTime createdAt;

  ConsignmentLot({
    required this.id,
    required this.productId,
    this.product,
    this.posId,
    this.pos,
    required this.quantityReceived,
    required this.quantitySold,
    required this.quantityReturned,
    required this.commissionPercent,
    required this.unitPrice,
    this.reference,
    this.notes,
    required this.createdAt,
  });

  int get currentStock => quantityReceived - quantitySold - quantityReturned;

  factory ConsignmentLot.fromJson(Map<String, dynamic> json) {
    return ConsignmentLot(
      id: json['id'],
      productId: json['productId'],
      product: json['product'] != null ? Product.fromJson(json['product']) : null,
      posId: json['posId'],
      pos: json['pos'] != null ? POS.fromJson(json['pos']) : null,
      quantityReceived: json['quantityReceived'] ?? 0,
      quantitySold: json['quantitySold'] ?? 0,
      quantityReturned: json['quantityReturned'] ?? 0,
      commissionPercent: double.tryParse(json['commissionPercent']?.toString() ?? '0') ?? 0,
      unitPrice: double.tryParse(json['unitPrice']?.toString() ?? '0') ?? 0,
      reference: json['reference'],
      notes: json['notes'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}

class UserProfile {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? tenantId;
  final String? companyName;

  UserProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.tenantId,
    this.companyName,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? '',
      tenantId: json['tenantId'],
      companyName: json['tenant']?['companyName'],
    );
  }
}
