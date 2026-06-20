import '../services/api_service.dart';
import '../../features/home/models/category_model.dart';
import '../constants/api_constants.dart';

/// Category Service
/// Handles all category-related API calls
class CategoryService {
  final ApiService _apiService;

  CategoryService() : _apiService = ApiService(baseUrl: ApiConstants.baseUrl);

  /// Get all categories
  Future<List<CategoryModel>> getAllCategories({
    bool includeInactive = false,
    String? search,
    String? parentCatId,
  }) async {
    final queryParams = <String, dynamic>{};
    if (includeInactive) queryParams['includeInactive'] = true;
    if (search != null && search.isNotEmpty) queryParams['search'] = search;
    if (parentCatId != null) queryParams['parent_cat_id'] = parentCatId;

    final response = await _apiService.get(
      ApiConstants.categories,
      queryParams: queryParams,
    );

    if (response['success'] == true && response['categories'] != null) {
      return (response['categories'] as List)
          .map((item) => CategoryModel.fromJson(item))
          .toList();
    }

    return [];
  }

  /// Get main categories (parent categories only)
  Future<List<CategoryModel>> getMainCategories() async {
    final response = await _apiService.get(ApiConstants.categories);

    if (response['success'] == true && response['categories'] != null) {
      final allCategories = (response['categories'] as List)
          .map((item) => CategoryModel.fromJson(item))
          .toList();
      
      // Filter only parent categories (those without parent_cat_id)
      return allCategories.where((cat) => cat.parentCatId == null).toList();
    }

    return [];
  }

  /// Get subcategories for a parent category
  Future<List<CategoryModel>> getSubcategories(String parentCategoryId) async {
    final response = await _apiService.get(ApiConstants.categories);

    if (response['success'] == true && response['categories'] != null) {
      final allCategories = (response['categories'] as List)
          .map((item) => CategoryModel.fromJson(item))
          .toList();
      
      // Filter subcategories
      return allCategories
          .where((cat) => cat.parentCatId == parentCategoryId)
          .toList();
    }

    return [];
  }

  /// Get category by ID
  Future<CategoryModel?> getCategoryById(String categoryId) async {
    try {
      final response = await _apiService.get(
        '${ApiConstants.categories}/$categoryId',
      );

      if (response['success'] == true && response['category'] != null) {
        return CategoryModel.fromJson(response['category']);
      }
    } catch (e) {
      print('Error fetching category: $e');
    }

    return null;
  }

  /// Get category by slug
  Future<CategoryModel?> getCategoryBySlug(String slug) async {
    try {
      final response = await _apiService.get(
        '${ApiConstants.categories}/slug/$slug',
      );

      if (response['success'] == true && response['category'] != null) {
        return CategoryModel.fromJson(response['category']);
      }
    } catch (e) {
      print('Error fetching category: $e');
    }

    return null;
  }

  /// Get category hierarchy (parent with all subcategories)
  Future<Map<CategoryModel, List<CategoryModel>>> getCategoryHierarchy() async {
    final allCategories = await getAllCategories();
    final Map<CategoryModel, List<CategoryModel>> hierarchy = {};

    // Get all parent categories
    final parentCategories = allCategories.where((cat) => cat.parentCatId == null).toList();

    // For each parent, find its subcategories
    for (final parent in parentCategories) {
      final subcategories = allCategories
          .where((cat) => cat.parentCatId == parent.id)
          .toList();
      hierarchy[parent] = subcategories;
    }

    return hierarchy;
  }
}
