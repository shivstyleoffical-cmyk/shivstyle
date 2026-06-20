import '../services/api_service.dart';
import '../constants/api_constants.dart';
import '../../features/home/models/order_model.dart';

class OrderService {
  final ApiService _apiService;

  OrderService() : _apiService = ApiService(baseUrl: ApiConstants.baseUrl);

  Future<OrderModel> placeOrder({
    required List<Map<String, dynamic>> items,
    required String addressId,
    String? couponCode,
    bool useCoins = false,
    required String paymentType,
    String? transactionId,
  }) async {
    final response = await _apiService.post(
      ApiConstants.ordersCreate,
      body: {
        'items': items,
        'shipping_address_id': addressId,
        'coupon_code': couponCode,
        'use_coins': useCoins,
        'payment_type': paymentType,
        'payment_transaction_id': transactionId,
      },
      requiresAuth: true,
    );

    if (response['success'] == true) {
      return OrderModel.fromJson(response['order']);
    }
    throw ApiException(response['message'] ?? 'Failed to place order');
  }

  Future<List<OrderModel>> getMyOrders() async {
    final response = await _apiService.get(ApiConstants.ordersMyOrders, requiresAuth: true);
    if (response['success'] == true) {
      final List list = response['orders'] ?? [];
      return list.map((item) => OrderModel.fromJson(item)).toList();
    }
    throw ApiException(response['message'] ?? 'Failed to fetch orders');
  }

  Future<OrderModel> getOrderDetails(String id) async {
    final response = await _apiService.get('${ApiConstants.ordersOrder}/$id', requiresAuth: true);
    if (response['success'] == true) {
      return OrderModel.fromJson(response['order']);
    }
    throw ApiException(response['message'] ?? 'Failed to fetch order details');
  }
}
