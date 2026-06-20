class OfferModel {
  final String id;
  final String code;
  final String? description;
  final String discountType;
  final double discountValue;
  final double minOrderAmount;
  final double? maxDiscountAmount;
  final DateTime endDate;
  final String status;

  OfferModel({
    required this.id,
    required this.code,
    this.description,
    required this.discountType,
    required this.discountValue,
    required this.minOrderAmount,
    this.maxDiscountAmount,
    required this.endDate,
    required this.status,
  });

  factory OfferModel.fromJson(Map<String, dynamic> json) {
    return OfferModel(
      id: json['id']?.toString() ?? '',
      code: json['code']?.toString() ?? '',
      description: json['description']?.toString(),
      discountType: json['discount_type']?.toString() ?? 'percentage',
      discountValue: double.tryParse(json['discount_value']?.toString() ?? '0') ?? 0,
      minOrderAmount: double.tryParse(json['min_order_amount']?.toString() ?? '0') ?? 0,
      maxDiscountAmount: json['max_discount_amount'] != null 
          ? double.tryParse(json['max_discount_amount'].toString()) 
          : null,
      endDate: DateTime.parse(json['end_date'] ?? DateTime.now().toIso8601String()),
      status: json['status']?.toString() ?? 'active',
    );
  }
}
