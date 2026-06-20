import 'package:flutter/material.dart';
import '../services/coupon_service.dart';
import '../services/api_service.dart';
import '../../features/home/models/offer_model.dart';
import '../constants/api_constants.dart';

class CouponProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService(baseUrl: ApiConstants.baseUrl);
  List<OfferModel> _availableCoupons = [];
  bool _isLoading = false;

  List<OfferModel> get availableCoupons => _availableCoupons;
  bool get isLoading => _isLoading;

  Future<void> fetchAvailableCoupons() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.get(
        ApiConstants.offers,
        queryParams: {'status': 'active'},
      );

      if (response['success'] == true) {
        final List list = response['offers'] ?? [];
        _availableCoupons = list.map((item) => OfferModel.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching coupons: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
