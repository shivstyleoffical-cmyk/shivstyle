import '../services/api_service.dart';
import '../../features/home/models/product_model.dart';
import '../constants/api_constants.dart';

/// Product Service
/// Handles all product-related API calls
class ProductService {
  final ApiService _apiService;

  ProductService() : _apiService = ApiService(baseUrl: ApiConstants.baseUrl);

  /// Get all products with filtering and pagination
  Future<ProductListResponse> getAllProducts({
    int page = 1,
    int limit = 20,
    String? sortBy,
    String? sortOrder,
    String? categoryId,
    String? subcategoryId,
    String? search,
    double? minPrice,
    double? maxPrice,
    bool? inStock,
    String? brand,
    String? tags,
    bool? isFeatured,
    bool? isTrending,
    bool? isNewArrival,
    String? sizes,
    String? colors,
    double? minRating,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
    };

    if (sortBy != null) queryParams['sortBy'] = sortBy;
    if (sortOrder != null) queryParams['sortOrder'] = sortOrder;
    if (categoryId != null) queryParams['category_id'] = categoryId;
    if (subcategoryId != null) queryParams['subcategory_id'] = subcategoryId;
    if (search != null && search.isNotEmpty) queryParams['search'] = search;
    if (minPrice != null) queryParams['minPrice'] = minPrice;
    if (maxPrice != null) queryParams['maxPrice'] = maxPrice;
    if (inStock != null) queryParams['inStock'] = inStock;
    if (brand != null) queryParams['brand'] = brand;
    if (tags != null) queryParams['tags'] = tags;
    if (isFeatured != null) queryParams['is_featured'] = isFeatured;
    if (isTrending != null) queryParams['is_trending'] = isTrending;
    if (isNewArrival != null) queryParams['is_new_arrival'] = isNewArrival;
    if (sizes != null) queryParams['sizes'] = sizes;
    if (colors != null) queryParams['colors'] = colors;
    if (minRating != null) queryParams['minRating'] = minRating;

    final response = await _apiService.get(
      ApiConstants.products,
      queryParams: queryParams,
    );

    return ProductListResponse.fromJson(response);
  }

  /// Search products
  Future<ProductListResponse> searchProducts({
    required String query,
    int page = 1,
    int limit = 20,
    String? sortBy,
    String? sortOrder,
    String? categoryId,
    double? minPrice,
    double? maxPrice,
    bool autocomplete = false,
  }) async {
    final queryParams = <String, dynamic>{
      'q': query,
      'page': page,
      'limit': limit,
      'autocomplete': autocomplete,
    };

    if (sortBy != null) queryParams['sortBy'] = sortBy;
    if (sortOrder != null) queryParams['sortOrder'] = sortOrder;
    if (categoryId != null) queryParams['category_id'] = categoryId;
    if (minPrice != null) queryParams['minPrice'] = minPrice;
    if (maxPrice != null) queryParams['maxPrice'] = maxPrice;

    final response = await _apiService.get(
      '${ApiConstants.products}/search',
      queryParams: queryParams,
    );

    return ProductListResponse.fromJson(response);
  }

  /// Get featured products
  Future<ProductListResponse> getFeaturedProducts({
    int page = 1,
    int limit = 10,
  }) async {
    final response = await _apiService.get(
      '${ApiConstants.products}/featured',
      queryParams: {'page': page, 'limit': limit},
    );

    return ProductListResponse.fromJson(response);
  }

  /// Get trending products
  Future<ProductListResponse> getTrendingProducts({
    int page = 1,
    int limit = 10,
    String period = 'week',
  }) async {
    final response = await _apiService.get(
      '${ApiConstants.products}/trending',
      queryParams: {'page': page, 'limit': limit, 'period': period},
    );

    return ProductListResponse.fromJson(response);
  }

  /// Get new arrivals
  Future<ProductListResponse> getNewArrivals({
    int page = 1,
    int limit = 10,
    int days = 30,
  }) async {
    final response = await _apiService.get(
      '${ApiConstants.products}/new-arrivals',
      queryParams: {'page': page, 'limit': limit, 'days': days},
    );

    return ProductListResponse.fromJson(response);
  }

  /// Get best sellers
  Future<ProductListResponse> getBestSellers({
    int page = 1,
    int limit = 10,
  }) async {
    final response = await _apiService.get(
      '${ApiConstants.products}/best-sellers',
      queryParams: {'page': page, 'limit': limit},
    );

    return ProductListResponse.fromJson(response);
  }

  /// Get recommended products
  Future<ProductListResponse> getRecommendedProducts({
    String? productId,
    String? categoryId,
    int limit = 6,
    bool excludeCurrent = true,
  }) async {
    final queryParams = <String, dynamic>{
      'limit': limit,
      'exclude_current': excludeCurrent,
    };

    if (productId != null) queryParams['product_id'] = productId;
    if (categoryId != null) queryParams['category_id'] = categoryId;

    final response = await _apiService.get(
      '${ApiConstants.products}/recommended',
      queryParams: queryParams,
    );

    return ProductListResponse.fromJson(response);
  }

  /// Get similar products
  Future<ProductListResponse> getSimilarProducts({
    required String productId,
    int limit = 6,
  }) async {
    final response = await _apiService.get(
      '${ApiConstants.products}/$productId/similar',
      queryParams: {'limit': limit},
    );

    return ProductListResponse.fromJson(response);
  }

  /// Get products by category
  Future<ProductListResponse> getProductsByCategory({
    required String categoryId,
    int page = 1,
    int limit = 20,
    String? sortBy,
    String? sortOrder,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
    };

    if (sortBy != null) queryParams['sortBy'] = sortBy;
    if (sortOrder != null) queryParams['sortOrder'] = sortOrder;

    final response = await _apiService.get(
      '${ApiConstants.products}/category/$categoryId',
      queryParams: queryParams,
    );

    return ProductListResponse.fromJson(response);
  }

  /// Get product by ID
  Future<ProductModel> getProductById(String productId) async {
    final response = await _apiService.get(
      '${ApiConstants.products}/$productId',
    );

    if (response['success'] == true && response['product'] != null) {
      return ProductModel.fromJson(response['product']);
    }

    throw ApiException('Failed to fetch product');
  }

  /// Get product by slug
  Future<ProductModel> getProductBySlug(String slug) async {
    final response = await _apiService.get(
      '${ApiConstants.products}/slug/$slug',
    );

    if (response['success'] == true && response['product'] != null) {
      return ProductModel.fromJson(response['product']);
    }

    throw ApiException('Failed to fetch product');
  }

  /// Get filter options
  Future<FilterOptions> getFilterOptions({String? categoryId}) async {
    final queryParams = <String, dynamic>{};
    if (categoryId != null) queryParams['category_id'] = categoryId;

    final response = await _apiService.get(
      '${ApiConstants.products}/filters',
      queryParams: queryParams,
    );

    if (response['success'] == true && response['filters'] != null) {
      return FilterOptions.fromJson(response['filters']);
    }

    throw ApiException('Failed to fetch filter options');
  }
}

/// Product List Response Model
class ProductListResponse {
  final bool success;
  final List<ProductModel> products;
  final List<ProductModel> suggestions;
  final Pagination? pagination;
  final Map<String, dynamic>? filters;

  ProductListResponse({
    required this.success,
    required this.products,
    this.suggestions = const [],
    this.pagination,
    this.filters,
  });

  factory ProductListResponse.fromJson(Map<String, dynamic> json) {
    return ProductListResponse(
      success: json['success'] ?? false,
      products: (json['products'] as List?)
              ?.map((item) => ProductModel.fromJson(item))
              .toList() ??
          [],
      suggestions: (json['suggestions'] as List?)
              ?.map((item) => ProductModel.fromJson(item))
              .toList() ??
          [],
      pagination: json['pagination'] != null
          ? Pagination.fromJson(json['pagination'])
          : null,
      filters: json['filters'],
    );
  }
}

/// Pagination Model
class Pagination {
  final int total;
  final int currentPage;
  final int totalPages;
  final bool hasNextPage;
  final bool hasPrevPage;
  final int? limit;

  Pagination({
    required this.total,
    required this.currentPage,
    required this.totalPages,
    required this.hasNextPage,
    required this.hasPrevPage,
    this.limit,
  });

  factory Pagination.fromJson(Map<String, dynamic> json) {
    return Pagination(
      total: json['total'] ?? 0,
      currentPage: json['currentPage'] ?? 1,
      totalPages: json['totalPages'] ?? 1,
      hasNextPage: json['hasNextPage'] ?? false,
      hasPrevPage: json['hasPrevPage'] ?? false,
      limit: json['limit'],
    );
  }
}

/// Filter Options Model
class FilterOptions {
  final List<String> brands;
  final PriceRange priceRange;
  final List<String> sizes;
  final List<String> colors;

  FilterOptions({
    required this.brands,
    required this.priceRange,
    required this.sizes,
    required this.colors,
  });

  factory FilterOptions.fromJson(Map<String, dynamic> json) {
    return FilterOptions(
      brands: (json['brands'] as List?)?.map((e) => e.toString()).toList() ?? [],
      priceRange: json['priceRange'] != null
          ? PriceRange.fromJson(json['priceRange'])
          : PriceRange(min: 0, max: 1000),
      sizes: (json['sizes'] as List?)?.map((e) => e.toString()).toList() ?? [],
      colors: (json['colors'] as List?)?.map((e) => e.toString()).toList() ?? [],
    );
  }
}

/// Price Range Model
class PriceRange {
  final double min;
  final double max;

  PriceRange({required this.min, required this.max});

  factory PriceRange.fromJson(Map<String, dynamic> json) {
    return PriceRange(
      min: (json['min'] ?? 0).toDouble(),
      max: (json['max'] ?? 1000).toDouble(),
    );
  }
}
