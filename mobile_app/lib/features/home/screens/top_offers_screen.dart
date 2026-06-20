import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:intl/intl.dart';
import '../../../core/services/coupon_service.dart';
import '../../../core/theme/app_colors.dart';
import '../models/offer_model.dart';

class TopOffersScreen extends StatefulWidget {
  const TopOffersScreen({super.key});

  @override
  State<TopOffersScreen> createState() => _TopOffersScreenState();
}

class _TopOffersScreenState extends State<TopOffersScreen> {
  final CouponService _couponService = CouponService();
  List<OfferModel> _offers = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadOffers();
  }

  Future<void> _loadOffers() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final offers = await _couponService.getActiveCoupons();
      setState(() {
        _offers = offers;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  void _copyCouponCode(String code) {
    // TODO: Copy to clipboard
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Coupon code "$code" copied!'),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        centerTitle: true,
        title: const Text(
          'Top Offers',
          style: TextStyle(fontWeight: FontWeight.w900, color: AppColors.accent, fontSize: 18),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: AppColors.accent, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: Colors.grey[100], height: 1),
        ),
      ),
      body: _isLoading
          ? _buildLoadingState()
          : _error != null
              ? _buildErrorState()
              : _offers.isEmpty
                  ? _buildEmptyState()
                  : _buildOffersList(),
    );
  }

  Widget _buildLoadingState() {
    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: 4,
      itemBuilder: (context, index) => Container(
        margin: const EdgeInsets.only(bottom: 20),
        height: 180,
        decoration: BoxDecoration(
          color: Colors.grey[50],
          borderRadius: BorderRadius.circular(20),
        ),
      ),
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
            'Failed to load offers',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _loadOffers,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.local_offer_outlined, size: 100, color: Colors.grey[300]),
          const SizedBox(height: 24),
          Text(
            'No Offers Available',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.grey[700]),
          ),
          const SizedBox(height: 8),
          Text(
            'Check back later for exciting deals',
            style: TextStyle(color: Colors.grey[500]),
          ),
        ],
      ),
    );
  }

  Widget _buildOffersList() {
    return RefreshIndicator(
      onRefresh: _loadOffers,
      color: AppColors.primary,
      child: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: _offers.length,
        itemBuilder: (context, index) {
          final offer = _offers[index];
          return FadeInUp(
            delay: Duration(milliseconds: index * 100),
            child: _buildOfferCard(offer),
          );
        },
      ),
    );
  }

  Widget _buildOfferCard(OfferModel offer) {
    final isPercentage = offer.discountType == 'percentage';
    final discountText = isPercentage
        ? '${offer.discountValue.toInt()}% OFF'
        : '₹${offer.discountValue.toInt()} OFF';

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      child: ClipPath(
        clipper: CouponClipper(),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
            border: Border.all(color: Colors.grey[100]!, width: 1.5),
          ),
          child: Column(
            children: [
              // Top Section
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            discountText,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                        Icon(Icons.verified_user_rounded, color: Colors.grey[300], size: 24),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      offer.description ?? 'Special Offer for You',
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: AppColors.accent,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _infoChip(Icons.shopping_bag_outlined, 'Min. ₹${offer.minOrderAmount.toInt()}'),
                        const SizedBox(width: 12),
                        if (offer.maxDiscountAmount != null)
                          _infoChip(Icons.info_outline, 'Max. ₹${offer.maxDiscountAmount!.toInt()}'),
                      ],
                    ),
                  ],
                ),
              ),

              // Separator (Dashed Line)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 10),
                child: Row(
                  children: List.generate(
                    20,
                    (index) => Expanded(
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        height: 1.5,
                        color: Colors.grey[200],
                      ),
                    ),
                  ),
                ),
              ),

              // Bottom Section
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.03),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'COUPON CODE',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              color: Colors.grey[500],
                              letterSpacing: 1.2,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            offer.code,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              color: AppColors.accent,
                              letterSpacing: 2,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () => _copyCouponCode(offer.code),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.black,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        elevation: 0,
                      ),
                      child: const Text(
                        'COPY',
                        style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
                      ),
                    ),
                  ],
                ),
              ),
              
              // Validity footer
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  border: Border(top: BorderSide(color: Colors.grey[100]!)),
                ),
                child: Text(
                  'Expires on ${DateFormat('dd MMM yyyy').format(offer.endDate)}',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey[500],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _infoChip(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: Colors.grey[600]),
          const SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }
}

class CouponClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    Path path = Path();
    path.lineTo(0, size.height);
    path.lineTo(size.width, size.height);
    path.lineTo(size.width, 0);
    path.close();

    double radius = 12;
    double dashY = size.height * 0.665;

    Path cutouts = Path();
    cutouts.addOval(Rect.fromCircle(center: Offset(size.width, dashY), radius: radius));
    cutouts.addOval(Rect.fromCircle(center: Offset(0, dashY), radius: radius));

    return Path.combine(PathOperation.difference, path, cutouts);
  }

  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) => false;
}

