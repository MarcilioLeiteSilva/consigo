class Product {
  final String id;
  final String name;
  final String? sku;
  final String? description;
  final double? price; // Preço sugerido ou do lote
  final int? stock;

  Product({
    required this.id,
    required this.name,
    this.sku,
    this.description,
    this.price,
    this.stock,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      sku: json['sku'],
      description: json['description'],
      price: json['price']?.toDouble(),
      stock: json['totalStock'],
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
