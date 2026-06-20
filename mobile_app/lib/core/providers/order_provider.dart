import 'package:flutter/material.dart';
import '../../features/home/models/order_model.dart';
import '../services/order_service.dart';

class OrderProvider extends ChangeNotifier {
  final OrderService _orderService = OrderService();
  
  List<OrderModel> _orders = [];
  bool _isLoading = false;
  OrderModel? _lastPlacedOrder;

  List<OrderModel> get orders => _orders;
  bool get isLoading => _isLoading;
  OrderModel? get lastPlacedOrder => _lastPlacedOrder;

  Future<void> fetchMyOrders() async {
    _isLoading = true;
    notifyListeners();
    try {
      _orders = await _orderService.getMyOrders();
    } catch (e) {
      debugPrint('Error fetching orders: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<OrderModel> placeOrder({
    required List<Map<String, dynamic>> items,
    required String addressId,
    String? couponCode,
    bool useCoins = false,
    required String paymentType,
    String? transactionId,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      final order = await _orderService.placeOrder(
        items: items,
        addressId: addressId,
        couponCode: couponCode,
        useCoins: useCoins,
        paymentType: paymentType,
        transactionId: transactionId,
      );
      _lastPlacedOrder = order;
      return order;
    } catch (e) {
      debugPrint('Error placing order: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
