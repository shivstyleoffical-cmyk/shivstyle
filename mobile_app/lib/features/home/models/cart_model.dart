import 'product_model.dart';

class CartItem {
  final ProductModel product;
  final String? selectedSize;
  final String? selectedColor;
  int quantity;

  CartItem({
    required this.product,
    this.selectedSize,
    this.selectedColor,
    this.quantity = 1,
  });

  double get totalOriginalPrice => (product.originalPrice ?? product.price) * quantity;
  double get totalActualPrice => product.price * quantity;
}
