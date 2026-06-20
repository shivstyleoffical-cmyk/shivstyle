import 'product_model.dart';

class OrderModel {
  final String id;
  final String orderNumber;
  final double totalAmount;
  final double discountAmount;
  final double grossAmount;
  final double shippingAmount;
  final double netAmount;
  final String status;
  final String paymentStatus;
  final String? paymentType;
  final String? paymentTransactionId;
  final DateTime createdAt;
  final List<OrderItemModel>? orderItems;
  final OrderShippingAddressModel? shippingAddress;

  OrderModel({
    required this.id,
    required this.orderNumber,
    required this.totalAmount,
    required this.discountAmount,
    required this.grossAmount,
    required this.shippingAmount,
    required this.netAmount,
    required this.status,
    required this.paymentStatus,
    this.paymentType,
    this.paymentTransactionId,
    required this.createdAt,
    this.orderItems,
    this.shippingAddress,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'],
      orderNumber: json['order_number'],
      totalAmount: double.parse(json['total_amount'].toString()),
      discountAmount: double.parse(json['discount_amount'].toString()),
      grossAmount: double.parse(json['gross_amount'].toString()),
      shippingAmount: double.parse(json['shipping_amount'].toString()),
      netAmount: double.parse(json['net_amount'].toString()),
      status: json['status'],
      paymentStatus: json['payment_status'],
      paymentType: json['payment_type'],
      paymentTransactionId: json['payment_transaction_id'],
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
      orderItems: json['orderItems'] != null 
          ? (json['orderItems'] as List).map((i) => OrderItemModel.fromJson(i)).toList()
          : null,
      shippingAddress: json['shippingAddress'] != null
          ? OrderShippingAddressModel.fromJson(json['shippingAddress'])
          : null,
    );
  }
}

class OrderItemModel {
  final String id;
  final String productName;
  final String? color;
  final String? size;
  final double price;
  final int quantity;
  final double totalAmount;
  final ProductModel? product;

  OrderItemModel({
    required this.id,
    required this.productName,
    this.color,
    this.size,
    required this.price,
    required this.quantity,
    required this.totalAmount,
    this.product,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      id: json['id'],
      productName: json['product_name'],
      color: json['color'],
      size: json['size'],
      price: double.parse(json['price'].toString()),
      quantity: json['quantity'],
      totalAmount: double.parse(json['total_amount'].toString()),
      product: json['product'] != null ? ProductModel.fromJson(json['product']) : null,
    );
  }
}

class OrderShippingAddressModel {
  final String? fullName;
  final String addressLine1;
  final String? addressLine2;
  final String city;
  final String state;
  final String postalCode;
  final String country;
  final String phone;

  OrderShippingAddressModel({
    this.fullName,
    required this.addressLine1,
    this.addressLine2,
    required this.city,
    required this.state,
    required this.postalCode,
    required this.country,
    required this.phone,
  });

  factory OrderShippingAddressModel.fromJson(Map<String, dynamic> json) {
    return OrderShippingAddressModel(
      fullName: json['full_name'],
      addressLine1: json['address_line1'],
      addressLine2: json['address_line2'],
      city: json['city'],
      state: json['state'],
      postalCode: json['postal_code'],
      country: json['country'] ?? 'India',
      phone: json['phone'],
    );
  }

  String get fullAddress => "$addressLine1, ${addressLine2 ?? ''}, $city, $state - $postalCode, $country";
}
