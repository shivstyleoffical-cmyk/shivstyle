class ProductVariant {
  final String id;
  final String? variantName;
  final String? variantValue;
  final String? size;
  final String? color;
  final double priceAdjustment;
  final int stockQuantity;
  final String status;

  ProductVariant({
    required this.id,
    this.variantName,
    this.variantValue,
    this.size,
    this.color,
    required this.priceAdjustment,
    required this.stockQuantity,
    this.status = 'active',
  });

  factory ProductVariant.fromJson(Map<String, dynamic> json) {
    return ProductVariant(
      id: json['id']?.toString() ?? DateTime.now().millisecondsSinceEpoch.toString(),
      variantName: json['variant_name'],
      variantValue: json['variant_value'],
      size: json['size'],
      color: json['color'],
      priceAdjustment: double.tryParse(json['price_adjustment']?.toString() ?? '0.0') ?? 0.0,
      stockQuantity: int.tryParse(json['stock_quantity']?.toString() ?? '0') ?? 0,
      status: json['status'] ?? 'active',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'variant_name': variantName,
      'variant_value': variantValue,
      'size': size,
      'color': color,
      'price_adjustment': priceAdjustment,
      'stock_quantity': stockQuantity,
      'status': status,
    };
  }
}

class ProductModel {
  final String id;
  final String name;
  final String? description;
  final double price;
  final double? originalPrice;
  final String? imagePath;
  final List<String> images;
  final double? averageRating;
  final int? totalReviews;
  final bool isNew;
  final bool isFeatured;
  final bool isTrending;
  final String? brand;
  final String? tags;
  final double? discountPercentage;
  final String? categoryId;
  final String? categoryName;
  final List<ProductVariant> variants;
  final int stockQuantity;

  ProductModel({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    this.originalPrice,
    this.imagePath,
    this.images = const [],
    this.averageRating,
    this.totalReviews,
    this.isNew = false,
    this.isFeatured = false,
    this.isTrending = false,
    this.brand,
    this.tags,
    this.discountPercentage,
    this.categoryId,
    this.categoryName,
    this.variants = const [],
    this.stockQuantity = 0,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    List<String> imageUrls = [];
    if (json['images'] != null && json['images'] is List) {
      imageUrls = (json['images'] as List)
          .map((img) => img['image_url']?.toString() ?? '')
          .where((url) => url.isNotEmpty)
          .toList();
    }
    
    // If no explicit images list, use the primary image_url if available
    if (imageUrls.isEmpty && json['image_url'] != null) {
      imageUrls.add(json['image_url']);
    }

    List<ProductVariant> variantList = [];
    if (json['variants'] != null && json['variants'] is List) {
      variantList = (json['variants'] as List)
          .map((v) => ProductVariant.fromJson(v))
          .toList();
    }

    return ProductModel(
      id: json['id']?.toString() ?? 'unknown-id',
      name: json['product_name']?.toString() ?? 'No Name',
      description: json['description'],
      price: double.tryParse(json['price']?.toString() ?? '0.0') ?? 0.0,
      originalPrice: json['original_price'] != null 
          ? double.tryParse(json['original_price'].toString()) 
          : null,
      imagePath: json['image_url'],
      images: imageUrls,
      averageRating: json['average_rating'] != null
          ? double.tryParse(json['average_rating'].toString())
          : null,
      totalReviews: int.tryParse(json['total_reviews']?.toString() ?? '0') ?? 0,
      isNew: json['is_new_arrival'] ?? json['is_new'] ?? false,
      isFeatured: json['is_featured'] ?? false,
      isTrending: json['is_trending'] ?? false,
      brand: json['brand'],
      tags: json['tags'],
      discountPercentage: json['discount_percentage'] != null
          ? double.tryParse(json['discount_percentage'].toString())
          : null,
      categoryId: json['category_id']?.toString(),
      categoryName: json['category'] is Map ? json['category']['category_name'] : null,
      variants: variantList,
      stockQuantity: int.tryParse(json['stock_quantity']?.toString() ?? '0') ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'product_name': name,
      'description': description,
      'price': price,
      'original_price': originalPrice,
      'image_url': imagePath,
      'images': images,
      'average_rating': averageRating,
      'total_reviews': totalReviews,
      'is_new_arrival': isNew,
      'is_featured': isFeatured,
      'is_trending': isTrending,
      'brand': brand,
      'tags': tags,
      'discount_percentage': discountPercentage,
      'category_id': categoryId,
      'variants': variants.map((v) => v.toJson()).toList(),
    };
  }
}
