import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../features/home/models/cart_model.dart';
import '../../features/home/models/product_model.dart';
import '../services/coupon_service.dart';
import '../services/api_service.dart';
import '../services/location_service.dart';

class CartProvider extends ChangeNotifier {
  List<CartItem> _items = [];
  final String _storageKey = 'user_cart';
  final CouponService _couponService = CouponService();
  final LocationService _locationService = LocationService();
  
  String? _appliedCoupon;
  double _couponDiscount = 0.0;
  double _dynamicShippingFee = 0.0;
  double? _minOrderForFreeShipping;
  bool _isValidatingCoupon = false;

  CartProvider() {
    _loadFromPrefs();
  }

  // Find matching location and update shipping
  Future<void> updateShippingFromAddress(String? city) async {
    if (city == null || city.isEmpty) {
       _dynamicShippingFee = 0.0;
       _minOrderForFreeShipping = null;
       notifyListeners();
       return;
    }

    try {
      final activeLocations = await _locationService.getActiveLocations();
      final String searchCity = city.trim().toLowerCase();
      
      debugPrint("🔍 Searching shipping fee for: $searchCity");
      debugPrint("📊 Active locations in cache: ${activeLocations.length}");
      
      // Use greedy matching to find the best region match
      LocationModel? match;
      for (var loc in activeLocations) {
        final cityName = loc.cityName.trim().toLowerCase();
        if (searchCity.contains(cityName) || cityName.contains(searchCity)) {
          match = loc;
          break;
        }
      }

      // Final fallback search if no direct city match
      if (match == null) {
        debugPrint("⚠️ No direct city match for $searchCity, trying regional fallback...");
        match = activeLocations.cast<LocationModel?>().firstWhere(
          (loc) => loc!.cityName.toLowerCase().contains('siliguri') || 
                   loc.cityName.toLowerCase().contains('kalimpong'),
          orElse: () => null,
        );
      }

      if (match != null) {
        debugPrint("✅ Found match: ${match.cityName}, Charge: ${match.deliveryCharge}");
        _dynamicShippingFee = match.deliveryCharge;
        _minOrderForFreeShipping = match.minOrderAmount;
      } else {
        debugPrint("❌ No service area match found for $searchCity");
        _dynamicShippingFee = 0.0;
        _minOrderForFreeShipping = null;
      }
      notifyListeners();
    } catch (e) {
      debugPrint("Error updating shipping for city $city: $e");
    }
  }

  List<CartItem> get items => _items;
  String? get appliedCoupon => _appliedCoupon;
  double get couponDiscount => _couponDiscount;
  bool get isValidatingCoupon => _isValidatingCoupon;
  
  double get shippingFee {
    if (items.isEmpty) return 0.0;
    
    // If we have a min order amount from the location and we've met it
    if (_minOrderForFreeShipping != null && _minOrderForFreeShipping! > 0) {
      if (subTotal >= _minOrderForFreeShipping!) return 0.0;
    }
    
    return _dynamicShippingFee;
  }

  void setShippingDetails(double fee, double? minOrder) {
    _dynamicShippingFee = fee;
    _minOrderForFreeShipping = minOrder;
    notifyListeners();
  }

  int get totalItems => _items.fold(0, (sum, item) => sum + item.quantity);

  double get subTotal => _items.fold(0.0, (sum, item) => sum + item.totalActualPrice);
  
  bool _useCoins = false;
  int _coinBalance = 0;
  
  bool get useCoins => _useCoins;
  int get coinBalance => _coinBalance;

  void setCoinBalance(int coins) {
      _coinBalance = coins;
      notifyListeners();
  }

  void toggleUseCoins(bool value) {
      if (value && _coinBalance < 50) return; // Basic validation
      _useCoins = value;
      notifyListeners();
  }

  double get coinDiscountAmount {
      if (!_useCoins || _coinBalance < 50) return 0.0;
      double discount = _coinBalance.toDouble();
      // Assume 1 Coin = 1 Rupee. Max discount cannot exceed subTotal (before or after coupon?)
      // Usually after coupon, but for simplicity let's say it applies to total payable.
      // Logic: Max redeemable is remaining amount after coupon.
      double remaining = (subTotal + shippingFee) - _couponDiscount;
      if (discount > remaining) return remaining;
      return discount;
  }
  
  double get totalAmount => (subTotal + shippingFee) - _couponDiscount - coinDiscountAmount;

  void addToCart(ProductModel product, {String? size, String? color}) {
    final existingIndex = _items.indexWhere(
      (item) => item.product.id == product.id && 
                item.selectedSize == size && 
                item.selectedColor == color
    );

    if (existingIndex >= 0) {
      _items[existingIndex].quantity += 1;
    } else {
      _items.add(CartItem(
        product: product, 
        selectedSize: size, 
        selectedColor: color
      ));
    }
    _resetCoupon(); // Reset coupon if bag changes
    notifyListeners();
    _saveToPrefs();
  }

  void removeFromCart(String productId, {String? size, String? color}) {
    _items.removeWhere((item) => 
      item.product.id == productId && 
      item.selectedSize == size && 
      item.selectedColor == color
    );
    _resetCoupon();
    notifyListeners();
    _saveToPrefs();
  }

  void updateQuantity(String productId, int newQuantity, {String? size, String? color}) {
    final index = _items.indexWhere(
      (item) => item.product.id == productId && 
                item.selectedSize == size && 
                item.selectedColor == color
    );
    if (index >= 0) {
      if (newQuantity <= 0) {
        _items.removeAt(index);
      } else {
        _items[index].quantity = newQuantity;
      }
      _resetCoupon();
      notifyListeners();
      _saveToPrefs();
    }
  }

  /// Apply coupon using Backend validation
  Future<bool> applyCoupon(String code) async {
    if (code.isEmpty) return false;
    
    _isValidatingCoupon = true;
    notifyListeners();

    try {
      final coupon = await _couponService.validateCoupon(code.toUpperCase().trim(), subTotal);
      _appliedCoupon = coupon.code;
      _couponDiscount = coupon.discountAmount;
      _isValidatingCoupon = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isValidatingCoupon = false;
      _resetCoupon();
      notifyListeners();
      rethrow; // Allow UI to handle specific error message
    }
  }

  void removeCoupon() {
    _resetCoupon();
    notifyListeners();
  }

  void _resetCoupon() {
    _appliedCoupon = null;
    _couponDiscount = 0.0;
  }

  void clearCart() {
    _items.clear();
    _resetCoupon();
    notifyListeners();
    _saveToPrefs();
  }

  Future<void> _saveToPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final data = _items.map((item) => {
      'product': item.product.toJson(),
      'selectedSize': item.selectedSize,
      'selectedColor': item.selectedColor,
      'quantity': item.quantity,
    }).toList();
    await prefs.setString(_storageKey, json.encode(data));
  }

  Future<void> _loadFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final String? data = prefs.getString(_storageKey);
    if (data != null) {
      try {
        final List<dynamic> decoded = json.decode(data);
        List<CartItem> loadedItems = [];
        
        for (var item in decoded) {
          if (item is Map && item.containsKey('product')) {
            loadedItems.add(CartItem(
              product: ProductModel.fromJson(Map<String, dynamic>.from(item['product'])),
              selectedSize: item['selectedSize']?.toString(),
              selectedColor: item['selectedColor']?.toString(),
              quantity: int.tryParse(item['quantity']?.toString() ?? '1') ?? 1,
            ));
          } else {
            throw Exception('Invalid cart item structure');
          }
        }
        
        _items = loadedItems;
        notifyListeners();
      } catch (e) {
        debugPrint('🧹 Clearing corrupt cart data: $e');
        _items = [];
        prefs.remove(_storageKey);
        notifyListeners();
      }
    }
  }

  Future<void> fetchUserCoins() async {
      try {
          final prefs = await SharedPreferences.getInstance();
          String? token = prefs.getString('auth_token');
          if (token == null) return;
          
          // We can use ApiService or direct http. optimizing for time, using ApiService if available or direct http
          // Actually, let's just reuse the logic from ReferScreen or clean it up.
          // Better: We already have 'user_data' in prefs from Profile/Login. 
          // Let's load from there first for speed, then background refresh.
          
          String? userDataStr = prefs.getString('user_data');
          if (userDataStr != null) {
              final user = json.decode(userDataStr);
              _coinBalance = user['coins'] ?? 0;
              notifyListeners();
          }
          
          // TODO: Implement background refresh if needed, but local data should be kept in sync by Profile/Login
      } catch (e) {
          debugPrint("Error fetching coins: $e");
      }
  }
}
