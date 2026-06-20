import '../services/api_service.dart';
import '../constants/api_constants.dart';
import '../../features/home/models/offer_model.dart';

class CouponModel {
  final String id;
  final String code;
  final String discountType;
  final double discountValue;
  final double discountAmount;
  final double finalTotal;

  CouponModel({
    required this.id,
    required this.code,
    required this.discountType,
    required this.discountValue,
    required this.discountAmount,
    required this.finalTotal,
  });

  factory CouponModel.fromJson(Map<String, dynamic> json) {
    return CouponModel(
      id: json['id']?.toString() ?? '',
      code: json['code']?.toString() ?? '',
      discountType: json['discount_type']?.toString() ?? 'percentage',
      discountValue: double.tryParse(json['discount_value']?.toString() ?? '0') ?? 0,
      discountAmount: double.tryParse(json['discount_amount']?.toString() ?? '0') ?? 0,
      finalTotal: double.tryParse(json['final_total']?.toString() ?? '0') ?? 0,
    );
  }
}

class CouponService {
  final ApiService _apiService;

  CouponService() : _apiService = ApiService(baseUrl: ApiConstants.baseUrl);

  Future<CouponModel> validateCoupon(String code, double subtotal) async {
    final response = await _apiService.post(
      ApiConstants.validateCoupon,
      body: {
        'code': code,
        'subtotal': subtotal,
      },
    );

    if (response['success'] == true) {
      return CouponModel.fromJson(response);
    }
    
    throw ApiException(response['message'] ?? 'Invalid coupon');
  }

  Future<List<OfferModel>> getActiveCoupons() async {
    final response = await _apiService.get(ApiConstants.offers);
    
    if (response['success'] == true) {
      final List list = response['offers'] ?? [];
      return list.map((item) => OfferModel.fromJson(item)).toList();
    }
    
    throw ApiException(response['message'] ?? 'Failed to fetch offers');
  }
}
