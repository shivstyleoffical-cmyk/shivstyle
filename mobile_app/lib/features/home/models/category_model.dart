class CategoryModel {
  final String id;
  final String name;
  final String? imageUrl;
  final String? parentCatId;
  final String? urlSlug;

  CategoryModel({
    required this.id,
    required this.name,
    this.imageUrl,
    this.parentCatId,
    this.urlSlug,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id']?.toString() ?? 'unknown-cat-id',
      name: json['category_name']?.toString() ?? 'Unnamed Category',
      imageUrl: json['image_url']?.toString(),
      parentCatId: json['parent_cat_id']?.toString(),
      urlSlug: json['url_slug']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'category_name': name,
      'image_url': imageUrl,
      'parent_cat_id': parentCatId,
      'url_slug': urlSlug,
    };
  }
}
