import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../features/home/models/product_model.dart';

class WishlistProvider extends ChangeNotifier {
  List<ProductModel> _items = [];
  final String _storageKey = 'user_wishlist';

  WishlistProvider() {
    _loadFromPrefs();
  }

  List<ProductModel> get items => _items;

  bool isFavorite(String productId) {
    return _items.any((item) => item.id == productId);
  }

  Future<void> toggleWishlist(ProductModel product) async {
    final index = _items.indexWhere((item) => item.id == product.id);
    if (index >= 0) {
      _items.removeAt(index);
    } else {
      _items.add(product);
    }
    notifyListeners();
    await _saveToPrefs();
  }

  Future<void> _saveToPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final String data = json.encode(_items.map((item) => item.toJson()).toList());
    await prefs.setString(_storageKey, data);
  }

  Future<void> _loadFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final String? data = prefs.getString(_storageKey);
    if (data != null) {
      final List<dynamic> decoded = json.decode(data);
      _items = decoded.map((item) => ProductModel.fromJson(item)).toList();
      notifyListeners();
    }
  }
}
