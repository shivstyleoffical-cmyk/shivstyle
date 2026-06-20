import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/providers/cart_provider.dart';
import '../../../core/providers/wishlist_provider.dart';
import '../../../core/widgets/top_toast.dart';
import '../../../core/services/product_service.dart';
import '../../../core/widgets/skeleton.dart';
import '../models/product_model.dart';
import '../widgets/product_card.dart';

class ProductDetailsScreen extends StatefulWidget {
  final ProductModel product;
  const ProductDetailsScreen({super.key, required this.product});

  @override
  State<ProductDetailsScreen> createState() => _ProductDetailsScreenState();
}

class _ProductDetailsScreenState extends State<ProductDetailsScreen> {
  int _selectedSizeIndex = 0;
  int _selectedColorIndex = 0;
  List<String> _availableSizes = [];
  List<String> _availableColors = [];
  final PageController _imageController = PageController();
  final ProductService _productService = ProductService();
  
  List<ProductModel> _similarProducts = [];
  bool _isSimilarLoading = true;

  @override
  void initState() {
    super.initState();
    _extractVariants();
    _fetchSimilarProducts();
  }

  void _extractVariants() {
    // Extract unique sizes and colors from variants
    _availableSizes = widget.product.variants
        .map((v) => v.size)
        .whereType<String>()
        .toSet() // Unique
        .toList();
    
    _availableColors = widget.product.variants
        .map((v) => v.color)
        .whereType<String>()
        .toSet() // Unique
        .toList();
        
    // Sort sizes for better UX
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];
    _availableSizes.sort((a, b) {
      int idxA = sizeOrder.indexOf(a);
      int idxB = sizeOrder.indexOf(b);
      return (idxA != -1 && idxB != -1) ? idxA.compareTo(idxB) : a.compareTo(b);
    });
  }

  Future<void> _fetchSimilarProducts() async {
    try {
      final response = await _productService.getSimilarProducts(
        productId: widget.product.id,
        limit: 6,
      );
      if (mounted) {
        setState(() {
          _similarProducts = response.products;
          _isSimilarLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSimilarLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final wishlist = Provider.of<WishlistProvider>(context);
    final isFavorite = wishlist.isFavorite(widget.product.id);

    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Content
          SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Image Gallery
                _buildImageGallery(),
                
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Badges Section
                      _buildBadges(),

                      const SizedBox(height: 12),

                      // Brand Name
                      if (widget.product.brand != null)
                        FadeInLeft(
                          child: Text(
                            widget.product.brand!.toUpperCase(),
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: Colors.grey[400],
                              letterSpacing: 2,
                            ),
                          ),
                        ),
                      
                      const SizedBox(height: 8),

                      // Header: Name & Price
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: FadeInLeft(
                              child: Text(
                                widget.product.name,
                                style: const TextStyle(
                                  fontSize: 26,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.accent,
                                  letterSpacing: -0.5,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          FadeInRight(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  "₹${widget.product.price.toStringAsFixed(0)}",
                                  style: const TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.w900,
                                    color: AppColors.primary,
                                  ),
                                ),
                                if (widget.product.originalPrice != null && 
                                    widget.product.originalPrice! > widget.product.price)
                                  Text(
                                    "₹${widget.product.originalPrice!.toStringAsFixed(0)}",
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.grey[400],
                                      decoration: TextDecoration.lineThrough,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 12),
                      
                      // Rating & Stock
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          FadeInLeft(
                            delay: const Duration(milliseconds: 100),
                            child: Row(
                              children: [
                                const Icon(Icons.star_rounded, color: Colors.amber, size: 20),
                                const SizedBox(width: 4),
                                Text(
                                  "${widget.product.averageRating ?? 4.5}",
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  "(${widget.product.totalReviews ?? 0} Reviews)",
                                  style: TextStyle(color: Colors.grey[500], fontSize: 13),
                                ),
                              ],
                            ),
                          ),
                          FadeInRight(
                            child: _buildStockStatus(),
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 32),
                      
                      // Description
                      FadeInUp(
                        delay: const Duration(milliseconds: 200),
                        child: const Text(
                          "Description",
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(height: 12),
                      FadeInUp(
                        delay: const Duration(milliseconds: 300),
                        child: Text(
                          widget.product.description ?? "No description available.",
                          style: TextStyle(
                            color: Colors.grey[600],
                            height: 1.6,
                            fontSize: 15,
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 32),
                      
                      // Size Selection
                      if (_availableSizes.isNotEmpty) ...[
                        FadeInUp(
                          delay: const Duration(milliseconds: 400),
                          child: const Text(
                            "Select Size",
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(height: 16),
                        FadeInUp(
                          delay: const Duration(milliseconds: 500),
                          child: SizedBox(
                            height: 50,
                            child: ListView.builder(
                              scrollDirection: Axis.horizontal,
                              itemCount: _availableSizes.length,
                              itemBuilder: (context, index) {
                                bool isSelected = _selectedSizeIndex == index;
                                return GestureDetector(
                                  onTap: () => setState(() => _selectedSizeIndex = index),
                                  child: Container(
                                    width: 50,
                                    margin: const EdgeInsets.only(right: 12),
                                    decoration: BoxDecoration(
                                      color: isSelected ? Colors.black : Colors.grey[100],
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                        color: isSelected ? Colors.black : Colors.transparent,
                                      ),
                                    ),
                                    child: Center(
                                      child: Text(
                                        _availableSizes[index],
                                        style: TextStyle(
                                          color: isSelected ? Colors.white : Colors.black,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        ),
                        const SizedBox(height: 32),
                      ],

                      // Color Selection
                      if (_availableColors.isNotEmpty) ...[
                        FadeInUp(
                          delay: const Duration(milliseconds: 400),
                          child: const Text(
                            "Select Color",
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(height: 16),
                        FadeInUp(
                          delay: const Duration(milliseconds: 500),
                          child: SizedBox(
                            height: 50,
                            child: ListView.builder(
                              scrollDirection: Axis.horizontal,
                              itemCount: _availableColors.length,
                              itemBuilder: (context, index) {
                                bool isSelected = _selectedColorIndex == index;
                                return GestureDetector(
                                  onTap: () => setState(() => _selectedColorIndex = index),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 16),
                                    margin: const EdgeInsets.only(right: 12),
                                    decoration: BoxDecoration(
                                      color: isSelected ? Colors.black : Colors.grey[100],
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                        color: isSelected ? Colors.black : Colors.transparent,
                                      ),
                                    ),
                                    child: Center(
                                      child: Text(
                                        _availableColors[index],
                                        style: TextStyle(
                                          color: isSelected ? Colors.white : Colors.black,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        ),
                        const SizedBox(height: 32),
                      ],

                      // Similar Products
                      _buildSimilarProducts(),
                      
                      const SizedBox(height: 120), // Spacer for bottom navigation
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          // Custom App Bar
          Positioned(
            top: 50,
            left: 20,
            right: 20,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _circularButton(
                  icon: Icons.arrow_back_ios_new_rounded,
                  onTap: () => Navigator.pop(context),
                ),
                _circularButton(
                  icon: isFavorite ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                  color: isFavorite ? Colors.red : Colors.black,
                  onTap: () {
                    wishlist.toggleWishlist(widget.product);
                    TopToast.show(
                      context, 
                      isFavorite ? "Removed from wishlist" : "Added to wishlist"
                    );
                  },
                ),
              ],
            ),
          ),
          
          Positioned(
            bottom: 30,
            left: 24,
            right: 24,
            child: FadeInUp(
              duration: const Duration(milliseconds: 800),
              child: Consumer<CartProvider>(
                builder: (context, cart, child) {
                  int totalStock = widget.product.stockQuantity;
                  if (widget.product.variants.isNotEmpty) {
                    totalStock = widget.product.variants.fold(0, (sum, v) => sum + v.stockQuantity);
                  }
                  final bool isOutOfStock = totalStock <= 0;

                  return GestureDetector(
                    onTap: isOutOfStock ? null : () {
                      final size = _availableSizes.isNotEmpty ? _availableSizes[_selectedSizeIndex] : null;
                      final color = _availableColors.isNotEmpty ? _availableColors[_selectedColorIndex] : null;
                      cart.addToCart(widget.product, size: size, color: color);
                      TopToast.show(context, "${widget.product.name} added to bag!");
                    },
                    child: Container(
                      height: 65,
                      decoration: BoxDecoration(
                        color: isOutOfStock ? Colors.grey[300] : Colors.black,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: isOutOfStock ? null : [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.3),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            isOutOfStock ? Icons.block_flipped : Icons.shopping_bag_outlined, 
                            color: isOutOfStock ? Colors.grey[500] : Colors.white, 
                            size: 22
                          ),
                          const SizedBox(width: 12),
                          Text(
                            isOutOfStock ? "Out of Stock" : "Add to Bag",
                            style: TextStyle(
                              color: isOutOfStock ? Colors.grey[500] : Colors.white,
                              fontSize: 17,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBadges() {
    return Row(
      children: [
        if (widget.product.isNew)
          _badge(text: "NEW ARRIVAL", color: Colors.green),
        if (widget.product.isTrending) ...[
          if (widget.product.isNew) const SizedBox(width: 8),
          _badge(text: "TRENDING", color: Colors.orange),
        ],
        if (widget.product.discountPercentage != null && widget.product.discountPercentage! > 0) ...[
          if (widget.product.isNew || widget.product.isTrending) const SizedBox(width: 8),
          _badge(text: "${widget.product.discountPercentage!.toStringAsFixed(0)}% OFF", color: Colors.red),
        ],
      ],
    );
  }

  Widget _badge({required String text, required Color color}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w900,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildStockStatus() {
    int totalStock = widget.product.stockQuantity;
    if (widget.product.variants.isNotEmpty) {
      totalStock = widget.product.variants.fold(0, (sum, v) => sum + v.stockQuantity);
    }
    
    Color statusColor = Colors.green;
    String statusText = "In Stock";
    
    if (totalStock <= 0) {
      statusColor = Colors.red;
      statusText = "Out of Stock";
    } else if (totalStock < 10) {
      statusColor = Colors.orange;
      statusText = "Only $totalStock Left!";
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: statusColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: statusColor,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            statusText,
            style: TextStyle(
              color: statusColor,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSimilarProducts() {
    if (_isSimilarLoading) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 48),
          const Text(
            "You Might Also Like",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 250,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: 3,
              itemBuilder: (context, index) => const Padding(
                padding: EdgeInsets.only(right: 16),
                child: Skeleton(width: 180, height: 250, borderRadius: 20),
              ),
            ),
          ),
        ],
      );
    }

    if (_similarProducts.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 48),
        const Text(
          "You Might Also Like",
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 300,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: _similarProducts.length,
            itemBuilder: (context, index) {
              return Padding(
                padding: const EdgeInsets.only(right: 16),
                child: ProductCard(
                  product: _similarProducts[index],
                  width: 180,
                  onTap: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (_) => ProductDetailsScreen(product: _similarProducts[index]),
                      ),
                    );
                  },
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildImageGallery() {
    final images = widget.product.images.isNotEmpty 
        ? widget.product.images 
        : [widget.product.imagePath ?? ''];

    return Stack(
      children: [
        SizedBox(
          height: 450,
          child: PageView.builder(
            controller: _imageController,
            itemCount: images.length,
            itemBuilder: (context, index) {
              return Hero(
                tag: widget.product.id,
                child: Image.network(
                  images[index],
                  fit: BoxFit.cover,
                  width: double.infinity,
                  errorBuilder: (c, e, s) => Container(
                    color: Colors.grey[200],
                    child: const Icon(Icons.image, size: 100, color: Colors.grey),
                  ),
                ),
              );
            },
          ),
        ),
        
        // Indicator
        if (images.length > 1)
          Positioned(
            bottom: 30,
            left: 0,
            right: 0,
            child: Center(
              child: SmoothPageIndicator(
                controller: _imageController,
                count: images.length,
                effect: const ExpandingDotsEffect(
                  activeDotColor: Colors.black,
                  dotColor: Colors.white70,
                  dotHeight: 8,
                  dotWidth: 8,
                  expansionFactor: 3,
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _circularButton({required IconData icon, required VoidCallback onTap, Color color = Colors.black}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 45,
        width: 45,
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Icon(icon, size: 20, color: color),
      ),
    );
  }
}
