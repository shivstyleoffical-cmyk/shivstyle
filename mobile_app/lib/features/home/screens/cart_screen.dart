import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:animate_do/animate_do.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/providers/cart_provider.dart';
import '../../../core/providers/coupon_provider.dart';
import '../../../core/providers/address_provider.dart';
import '../../../core/widgets/top_toast.dart';
import '../models/cart_model.dart';
import '../models/offer_model.dart';
import 'address_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final TextEditingController _couponController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Fetch available data on load
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeCartData();
    });
  }

  Future<void> _initializeCartData() async {
    final cart = context.read<CartProvider>();
    final addressProv = context.read<AddressProvider>();
    final couponProv = context.read<CouponProvider>();

    couponProv.fetchAvailableCoupons();
    
    // Attempt to update shipping fee if we have an address
    if (addressProv.addresses.isEmpty) {
      await addressProv.fetchAddresses();
    }
    
    if (addressProv.selectedAddress != null) {
      await cart.updateShippingFromAddress(addressProv.selectedAddress!.city);
    }
    
    await cart.fetchUserCoins();
  }

  @override
  void dispose() {
    _couponController.dispose();
    super.dispose();
  }

  Future<void> _handleApplyCoupon(CartProvider cart, String code) async {
    try {
      final success = await cart.applyCoupon(code);
      if (success && mounted) {
        Navigator.pop(context); // Close modal if open
        TopToast.show(context, 'Coupon applied successfully!');
      }
    } catch (e) {
      if (mounted) {
        TopToast.show(context, e.toString(), isError: true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'SHOPPING BAG',
          style: TextStyle(
            color: AppColors.accent, 
            fontWeight: FontWeight.w900,
            fontSize: 16,
            letterSpacing: 1.2,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded, color: AppColors.accent),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Consumer<CartProvider>(
        builder: (context, cart, child) {
          if (cart.items.isEmpty) {
            return _buildEmptyCart(context);
          }

          return Column(
            children: [
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    // Items List
                    ...cart.items.asMap().entries.map((entry) {
                      final index = entry.key;
                      final item = entry.value;
                      return FadeInUp(
                        delay: Duration(milliseconds: index * 50),
                        child: Column(
                          children: [
                            _buildCartItem(context, cart, item),
                            if (index < cart.items.length - 1)
                              const Divider(height: 32, thickness: 0.5),
                          ],
                        ),
                      );
                    }).toList(),

                    const SizedBox(height: 32),
                    const SizedBox(height: 32),
                    _buildCouponSection(cart),
                    const SizedBox(height: 24),
                    _buildCoinSection(context, cart),
                    const SizedBox(height: 24),
                    _buildPriceDetails(cart),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
              _buildCheckoutSection(context, cart),
            ],
          );
        },
      ),
    );
  }

  Widget _buildEmptyCart(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shopping_bag_outlined, size: 80, color: Colors.grey[200]),
          const SizedBox(height: 20),
          const Text(
            'Your bag is empty!',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'Looks like you haven\'t added anything yet.',
            style: TextStyle(color: Colors.grey[500]),
          ),
          const SizedBox(height: 30),
          SizedBox(
            width: 200,
            height: 50,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.accent,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('CONTINUE SHOPPING', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCartItem(BuildContext context, CartProvider cart, dynamic item) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Image.network(
            item.product.imagePath ?? '',
            width: 90,
            height: 120,
            fit: BoxFit.cover,
            errorBuilder: (c, e, s) => Container(
              width: 90,
              height: 120,
              color: Colors.grey[100],
              child: const Icon(Icons.image_not_supported_outlined, color: Colors.grey),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    item.product.brand ?? 'SHIV',
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline_rounded, size: 20, color: Colors.grey),
                    onPressed: () => cart.removeFromCart(
                      item.product.id, 
                      size: item.selectedSize, 
                      color: item.selectedColor
                    ),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
              Text(
                item.product.name,
                style: TextStyle(color: Colors.grey[600], fontSize: 13),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  if (item.selectedSize != null)
                    Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Size: ${item.selectedSize}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                      ),
                    ),
                  if (item.selectedColor != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Color: ${item.selectedColor}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '₹${item.product.price.toInt()}',
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 17),
                  ),
                  _buildQuantityController(cart, item),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildQuantityController(CartProvider cart, CartItem item) {
    return Container(
      height: 36,
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            icon: const Icon(Icons.remove_rounded, size: 16),
            onPressed: () => cart.updateQuantity(
              item.product.id, 
              item.quantity - 1,
              size: item.selectedSize, 
              color: item.selectedColor
            ),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32),
          ),
          Text(
            '${item.quantity}',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          ),
          IconButton(
            icon: const Icon(Icons.add_rounded, size: 16),
            onPressed: () => cart.updateQuantity(
              item.product.id, 
              item.quantity + 1,
              size: item.selectedSize, 
              color: item.selectedColor
            ),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32),
          ),
        ],
      ),
    );
  }

  Widget _buildCouponSection(CartProvider cart) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'COUPONS',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 1),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            const Icon(Icons.local_offer_outlined, color: AppColors.primary, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: cart.appliedCoupon != null
                  ? Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Coupon Applied: ${cart.appliedCoupon}',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green, fontSize: 14),
                        ),
                        Text(
                          'You saved ₹${cart.couponDiscount.toInt()}',
                          style: TextStyle(color: Colors.green[700], fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],
                    )
                  : const Text(
                      'Apply Coupons',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
            ),
            if (cart.appliedCoupon != null)
              TextButton(
                onPressed: () => cart.removeCoupon(),
                child: const Text('REMOVE', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 12)),
              ),
            TextButton(
              onPressed: () => _showCouponModal(cart),
              child: Text(
                cart.appliedCoupon != null ? 'EDIT' : 'APPLY',
                style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ],
    );
  }

  void _showCouponModal(CartProvider cart) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          top: 24,
          left: 24,
          right: 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Apply Coupon',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            
            // Text Input for Coupon
            StatefulBuilder(
              builder: (context, setStateModal) {
                return TextField(
                  controller: _couponController,
                  decoration: InputDecoration(
                    hintText: 'Enter Coupon Code',
                    suffixIcon: cart.isValidatingCoupon 
                      ? const Padding(
                          padding: EdgeInsets.all(12),
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : TextButton(
                        onPressed: () => _handleApplyCoupon(cart, _couponController.text),
                        child: const Text('APPLY', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                  ),
                  textCapitalization: TextCapitalization.characters,
                  onChanged: (v) => setStateModal(() {}),
                );
              }
            ),
            
            const SizedBox(height: 24),
            const Text(
              'Available Coupons:',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.accent),
            ),
            const SizedBox(height: 12),
            
            // Available Coupons List from Provider
            Consumer<CouponProvider>(
              builder: (context, couponProv, child) {
                if (couponProv.isLoading) {
                  return const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator()));
                }
                
                if (couponProv.availableCoupons.isEmpty) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 20),
                    child: Text('No active coupons available right now.', style: TextStyle(color: Colors.grey)),
                  );
                }

                return ConstrainedBox(
                  constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.3),
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: couponProv.availableCoupons.length,
                    itemBuilder: (context, index) {
                      final offer = couponProv.availableCoupons[index];
                      return _availableCouponItem(offer, cart);
                    },
                  ),
                );
              },
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildCoinSection(BuildContext context, CartProvider cart) {
    if (cart.coinBalance == 0) return const SizedBox.shrink();

    bool isEligible = cart.coinBalance >= 50;
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
        boxShadow: [
           const BoxShadow(color: Color(0x08000000), blurRadius: 4, offset: Offset(0, 2))
        ]
      ),
      child: Column(
          children: [
             Row(
                children: [
                    const Icon(Icons.monetization_on_rounded, color: Colors.amber),
                    const SizedBox(width: 12),
                    Expanded(
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                                Text(
                                    "SafeCoins Balance: ${cart.coinBalance}",
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                                if (!isEligible)
                                    const Text("Min 50 coins required to redeem", style: TextStyle(fontSize: 11, color: Colors.grey))
                                else
                                    const Text("1 Coin = ₹1", style: TextStyle(fontSize: 11, color: Colors.grey))
                            ],
                        ),
                    ),
                    Switch(
                        value: cart.useCoins, 
                        onChanged: isEligible 
                            ? (val) => cart.toggleUseCoins(val)
                            : null,
                        activeColor: AppColors.primary,
                    )
                ],
             ),
          ],
      ),
    );
  }

  Widget _availableCouponItem(OfferModel offer, CartProvider cart) {
    bool isEligible = cart.subTotal >= offer.minOrderAmount;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isEligible ? Colors.white : Colors.grey[50],
        border: Border.all(color: isEligible ? AppColors.primary.withOpacity(0.3) : Colors.grey[200]!),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  offer.code, 
                  style: const TextStyle(fontWeight: FontWeight.w900, color: AppColors.primary, letterSpacing: 1),
                ),
              ),
              if (isEligible)
                TextButton(
                  onPressed: () => _handleApplyCoupon(cart, offer.code),
                  child: const Text('APPLY', style: TextStyle(fontWeight: FontWeight.w900, color: AppColors.primary)),
                )
              else
                const Text('NOT ELIGIBLE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            offer.description ?? 'Get extra discounts on your order',
            style: TextStyle(fontSize: 13, color: Colors.grey[700], fontWeight: FontWeight.w500),
          ),
          if (!isEligible)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                'Add ₹${(offer.minOrderAmount - cart.subTotal).toInt()} more to unlock this offer',
                style: const TextStyle(fontSize: 11, color: Colors.red, fontWeight: FontWeight.bold),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildPriceDetails(CartProvider cart) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'PRICE DETAILS (${cart.totalItems} Items)',
          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 1),
        ),
        const SizedBox(height: 16),
        _priceRow('Total MRP', '₹${cart.subTotal.toInt()}'),
        const SizedBox(height: 12),
        if (cart.couponDiscount > 0) ...[
            _priceRow('Coupon Discount', '-₹${cart.couponDiscount.toInt()}', color: Colors.green),
            const SizedBox(height: 12),
        ],
        if (cart.coinDiscountAmount > 0) ...[
             _priceRow('Coins Redeemed', '-₹${cart.coinDiscountAmount.toInt()}', color: Colors.green),
             const SizedBox(height: 12),
        ],
        _priceRow(
          'Shipping Fee', 
          cart.shippingFee == 0 ? 'FREE' : '₹${cart.shippingFee.toInt()}',
          color: cart.shippingFee == 0 ? Colors.green : null,
        ),
        const Divider(height: 32),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Total Amount',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
            ),
            Text(
              '₹${cart.totalAmount.toInt()}',
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: AppColors.accent),
            ),
          ],
        ),
      ],
    );
  }

  Widget _priceRow(String label, String value, {Color? color}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 14)),
        Text(
          value, 
          style: TextStyle(
            fontWeight: FontWeight.bold, 
            fontSize: 14, 
            color: color ?? AppColors.accent,
          )
        ),
      ],
    );
  }

  Widget _buildCheckoutSection(BuildContext context, CartProvider cart) {
    return Container(
      padding: EdgeInsets.fromLTRB(24, 20, 24, MediaQuery.of(context).padding.bottom + 20),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '₹${cart.totalAmount.toInt()}',
                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: AppColors.accent),
              ),
              const Text(
                'VIEW DETAILS',
                style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 55,
            child: ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const AddressSelectionScreen()),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text(
                'PLACE ORDER',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, letterSpacing: 1),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
