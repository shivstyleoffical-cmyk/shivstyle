import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:intl/intl.dart';
import '../../../core/services/order_service.dart';
import '../../../core/theme/app_colors.dart';
import '../models/order_model.dart';

class OrderDetailsScreen extends StatefulWidget {
  final String orderId;

  const OrderDetailsScreen({super.key, required this.orderId});

  @override
  State<OrderDetailsScreen> createState() => _OrderDetailsScreenState();
}

class _OrderDetailsScreenState extends State<OrderDetailsScreen> {
  final OrderService _orderService = OrderService();
  OrderModel? _order;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadOrderDetails();
  }

  Future<void> _loadOrderDetails() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final order = await _orderService.getOrderDetails(widget.orderId);
      setState(() {
        _order = order;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: AppColors.primary,
        title: const Text(
          'Order Details',
          style: TextStyle(fontWeight: FontWeight.w900),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _error != null
              ? _buildErrorState()
              : _order == null
                  ? const Center(child: Text('Order not found'))
                  : _buildOrderDetails(),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 80, color: Colors.red[300]),
          const SizedBox(height: 16),
          const Text(
            'Failed to load order details',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _loadOrderDetails,
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderDetails() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildStatusTracker(),
          const SizedBox(height: 16),
          _buildOrderInfo(),
          const SizedBox(height: 16),
          _buildOrderItems(),
          const SizedBox(height: 16),
          _buildShippingAddress(),
          const SizedBox(height: 16),
          _buildPriceSummary(),
          const SizedBox(height: 100),
        ],
      ),
    );
  }

  Widget _buildStatusTracker() {
    final statuses = [
      {'status': 'placed', 'label': 'Placed', 'icon': Icons.check_circle},
      {'status': 'confirmed', 'label': 'Confirmed', 'icon': Icons.verified},
      {'status': 'processing', 'label': 'Processing', 'icon': Icons.sync},
      {'status': 'shipped', 'label': 'Shipped', 'icon': Icons.local_shipping},
      {'status': 'delivered', 'label': 'Delivered', 'icon': Icons.done_all},
    ];

    final currentStatusIndex = statuses.indexWhere((s) => s['status'] == _order!.status);

    return FadeInDown(
      child: Container(
        margin: const EdgeInsets.all(16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.primary, AppColors.primary.withOpacity(0.8)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.3),
              blurRadius: 15,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Order Status',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    _order!.status.toUpperCase().replaceAll('_', ' '),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              children: List.generate(statuses.length, (index) {
                final isCompleted = index <= currentStatusIndex;
                final isCurrent = index == currentStatusIndex;
                
                return Expanded(
                  child: Column(
                    children: [
                      Row(
                        children: [
                          if (index > 0)
                            Expanded(
                              child: Container(
                                height: 2,
                                color: isCompleted
                                    ? Colors.white
                                    : Colors.white.withOpacity(0.3),
                              ),
                            ),
                          Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: isCompleted
                                  ? Colors.white
                                  : Colors.white.withOpacity(0.3),
                              shape: BoxShape.circle,
                              border: isCurrent
                                  ? Border.all(color: Colors.white, width: 3)
                                  : null,
                            ),
                            child: Icon(
                              statuses[index]['icon'] as IconData,
                              size: 16,
                              color: isCompleted
                                  ? AppColors.primary
                                  : Colors.white.withOpacity(0.5),
                            ),
                          ),
                          if (index < statuses.length - 1)
                            Expanded(
                              child: Container(
                                height: 2,
                                color: isCompleted && index < currentStatusIndex
                                    ? Colors.white
                                    : Colors.white.withOpacity(0.3),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        statuses[index]['label'] as String,
                        style: TextStyle(
                          color: isCompleted
                              ? Colors.white
                              : Colors.white.withOpacity(0.5),
                          fontSize: 10,
                          fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderInfo() {
    return FadeInLeft(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Order Information',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w900,
                color: AppColors.accent,
              ),
            ),
            const SizedBox(height: 16),
            _infoRow('Order Number', _order!.orderNumber, isMonospace: true),
            const Divider(height: 24),
            _infoRow('Order Date', DateFormat('dd MMM yyyy, hh:mm a').format(_order!.createdAt)),
            const Divider(height: 24),
            _infoRow('Payment Method', (_order!.paymentType ?? 'N/A').toUpperCase()),
            const Divider(height: 24),
            _infoRow(
              'Payment Status',
              _order!.paymentStatus.toUpperCase().replaceAll('_', ' '),
              valueColor: _order!.paymentStatus == 'paid' ? Colors.green : Colors.orange,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderItems() {
    return FadeInRight(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Order Items',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w900,
                color: AppColors.accent,
              ),
            ),
            const SizedBox(height: 16),
            ...List.generate(_order!.orderItems?.length ?? 0, (index) {
              final item = _order!.orderItems![index];
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.shopping_bag_outlined,
                        color: AppColors.primary,
                        size: 30,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.productName,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          if (item.color != null || item.size != null)
                            Text(
                              [
                                if (item.color != null) 'Color: ${item.color}',
                                if (item.size != null) 'Size: ${item.size}',
                              ].join(' | '),
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey[600],
                              ),
                            ),
                          const SizedBox(height: 4),
                          Text(
                            '₹${item.price.toStringAsFixed(2)} × ${item.quantity}',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.primary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '₹${item.totalAmount.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: AppColors.accent,
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildShippingAddress() {
    final address = _order!.shippingAddress;
    if (address == null) return const SizedBox.shrink();

    return FadeInLeft(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.location_on,
                    color: AppColors.primary,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                const Text(
                  'Shipping Address',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: AppColors.accent,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              address.fullName ?? 'Customer',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 15,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '${address.addressLine1}\n${address.addressLine2 ?? ''}\n${address.city}, ${address.state} - ${address.postalCode}\n${address.country}',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[700],
                height: 1.5,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.phone, size: 16, color: AppColors.primary),
                const SizedBox(width: 6),
                Text(
                  address.phone,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AppColors.accent,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPriceSummary() {
    return FadeInUp(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Price Summary',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w900,
                color: AppColors.accent,
              ),
            ),
            const SizedBox(height: 16),
            _priceRow('Subtotal', _order!.totalAmount),
            if (_order!.discountAmount > 0) ...[
              const SizedBox(height: 12),
              _priceRow('Discount', -_order!.discountAmount, isDiscount: true),
            ],
            const SizedBox(height: 12),
            _priceRow('Shipping', _order!.shippingAmount),
            const Divider(height: 24),
            _priceRow('Total', _order!.netAmount, isTotal: true),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(String label, String value, {bool isMonospace = false, Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 14,
            color: Colors.grey[600],
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            fontFamily: isMonospace ? 'monospace' : null,
            color: valueColor ?? AppColors.accent,
          ),
        ),
      ],
    );
  }

  Widget _priceRow(String label, double amount, {bool isDiscount = false, bool isTotal = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isTotal ? 16 : 14,
            fontWeight: isTotal ? FontWeight.w900 : FontWeight.normal,
            color: isTotal ? AppColors.accent : Colors.grey[700],
          ),
        ),
        Text(
          '${isDiscount ? '-' : ''}₹${amount.toStringAsFixed(2)}',
          style: TextStyle(
            fontSize: isTotal ? 18 : 14,
            fontWeight: isTotal ? FontWeight.w900 : FontWeight.bold,
            color: isDiscount ? Colors.green : (isTotal ? AppColors.accent : Colors.grey[800]),
          ),
        ),
      ],
    );
  }
}
