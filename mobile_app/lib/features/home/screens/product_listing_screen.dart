import 'package:flutter/material.dart';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:animate_do/animate_do.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/services/product_service.dart';
import '../models/product_model.dart';
import '../widgets/product_card.dart';
import 'product_details_screen.dart';
import '../widgets/view_bag_widget.dart';
import '../../../core/widgets/skeleton.dart';

class ProductListingScreen extends StatefulWidget {
  final String title;
  final String? categoryId;
  final String? subcategoryId;
  final String? searchQuery;
  final bool? isFeatured;
  final bool? isTrending;
  final bool? isNewArrival;
  final String? sortBy;
  final String? sortOrder;
  final bool? openSearchKeyboard;

  const ProductListingScreen({
    super.key,
    required this.title,
    this.categoryId,
    this.subcategoryId,
    this.searchQuery,
    this.isFeatured,
    this.isTrending,
    this.isNewArrival,
    this.sortBy,
    this.sortOrder,
    this.openSearchKeyboard,
  });

  @override
  State<ProductListingScreen> createState() => _ProductListingScreenState();
}

class _ProductListingScreenState extends State<ProductListingScreen> {
  final ProductService _productService = ProductService();
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _localSearchController = TextEditingController();
  
  List<ProductModel> _products = [];
  bool _isLoading = true;
  bool _isLoadingMore = false;
  String? _errorMessage;
  
  int _currentPage = 1;
  bool _hasMore = true;
  bool _isSearchActive = false;
  
  // Filter states
  String _sortBy = 'createdAt';
  String _sortOrder = 'DESC';
  double? _minPrice;
  double? _maxPrice;

  @override
  void initState() {
    super.initState();
    if (widget.sortBy != null) _sortBy = widget.sortBy!;
    if (widget.sortOrder != null) _sortOrder = widget.sortOrder!;
    if (widget.searchQuery != null) {
      _localSearchController.text = widget.searchQuery!;
      _isSearchActive = true;
    }
    if (widget.openSearchKeyboard == true) {
      _isSearchActive = true;
    }
    
    // Add real-time search listener
    _localSearchController.addListener(_onSearchChanged);
    
    _fetchProducts();
    _scrollController.addListener(_onScroll);
  }

  void _onSearchChanged() {
    // Only trigger if search is actually active to avoid unnecessary calls during init/close
    if (!_isSearchActive) return;
    
    // Use debouncing to prevent excessive API calls
    EasyDebounce.debounce(
      'category-search-debounce',
      const Duration(milliseconds: 500),
      () {
        if (mounted) {
          _currentPage = 1;
          _fetchProducts();
        }
      },
    );
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
            _scrollController.position.maxScrollExtent - 200 &&
        !_isLoadingMore &&
        _hasMore) {
      _loadMore();
    }
  }

  Future<void> _fetchProducts({bool loadMore = false}) async {
    if (loadMore) {
      setState(() => _isLoadingMore = true);
    } else {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });
    }

    try {
      ProductListResponse response;
      
      // We always use the getAllProducts but pass the search query if active
      // This allows filtering within a category + search string
      String? currentQuery = _localSearchController.text.trim();
      if (currentQuery.isEmpty) currentQuery = null;

      response = await _productService.getAllProducts(
        page: _currentPage,
        categoryId: widget.categoryId,
        subcategoryId: widget.subcategoryId,
        isFeatured: widget.isFeatured,
        isTrending: widget.isTrending,
        isNewArrival: widget.isNewArrival,
        sortBy: _sortBy,
        sortOrder: _sortOrder,
        minPrice: _minPrice,
        maxPrice: _maxPrice,
        search: currentQuery, // In-category search
      );

      setState(() {
        if (loadMore) {
          _products.addAll(response.products);
          _isLoadingMore = false;
        } else {
          _products = response.products;
          _isLoading = false;
        }
        _hasMore = response.pagination?.hasNextPage ?? false;
      });
    } catch (e) {
      debugPrint('Error fetching products: $e');
      setState(() {
        _errorMessage = 'Failed to load products';
        _isLoading = false;
        _isLoadingMore = false;
      });
    }
  }

  Future<void> _loadMore() async {
    _currentPage++;
    await _fetchProducts(loadMore: true);
  }

  Future<void> _refresh() async {
    _currentPage = 1;
    _hasMore = true;
    await _fetchProducts();
  }

  void _showSortOptions() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Sort By',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.accent,
                ),
              ),
              const SizedBox(height: 20),
              _buildSortOption('Newest First', 'createdAt', 'DESC'),
              _buildSortOption('Price: Low to High', 'price', 'ASC'),
              _buildSortOption('Price: High to Low', 'price', 'DESC'),
              _buildSortOption('Name: A to Z', 'product_name', 'ASC'),
              _buildSortOption('Rating: High to Low', 'average_rating', 'DESC'),
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSortOption(String label, String sortBy, String sortOrder) {
    final isSelected = _sortBy == sortBy && _sortOrder == sortOrder;
    
    return ListTile(
      title: Text(
        label,
        style: TextStyle(
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          color: isSelected ? AppColors.primary : AppColors.textPrimary,
        ),
      ),
      trailing: isSelected
          ? const Icon(Icons.check_circle, color: AppColors.primary)
          : null,
      onTap: () {
        setState(() {
          _sortBy = sortBy;
          _sortOrder = sortOrder;
          _currentPage = 1;
        });
        Navigator.pop(context);
        _fetchProducts();
      },
    );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _localSearchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: AppColors.accent),
          onPressed: () => Navigator.pop(context),
        ),
        title: _isSearchActive 
          ? _buildSearchField()
          : Text(
              widget.title,
              style: const TextStyle(
                color: AppColors.accent,
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
        actions: [
          if (!_isSearchActive)
            IconButton(
              icon: const Icon(Icons.search_rounded, color: AppColors.accent),
              onPressed: () => setState(() => _isSearchActive = true),
            ),
          IconButton(
            icon: const Icon(Icons.sort_rounded, color: AppColors.accent),
            onPressed: _showSortOptions,
          ),
          IconButton(
            icon: const Icon(Icons.filter_list_rounded, color: AppColors.accent),
            onPressed: () {
              // TODO: Show filter bottom sheet
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          RefreshIndicator(
            onRefresh: _refresh,
            color: AppColors.primary,
            child: _buildBody(),
          ),
          const ViewBagWidget(),
        ],
      ),
    );
  }

  Widget _buildSearchField() {
    return TextField(
      controller: _localSearchController,
      autofocus: true,
      onSubmitted: (value) {
        _currentPage = 1;
        _fetchProducts();
      },
      decoration: InputDecoration(
        hintText: 'Search in ${widget.title}...',
        hintStyle: const TextStyle(fontSize: 14),
        border: InputBorder.none,
        suffixIcon: IconButton(
          icon: const Icon(Icons.close_rounded, size: 20),
          onPressed: () {
            _localSearchController.clear();
            setState(() => _isSearchActive = false);
            _currentPage = 1;
            _fetchProducts();
          },
        ),
      ),
      style: const TextStyle(fontSize: 16),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const ProductListingSkeleton();
    }

    if (_errorMessage != null && _products.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline_rounded, size: 60, color: Colors.grey),
            const SizedBox(height: 16),
            Text(_errorMessage!, style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _refresh,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      );
    }

    if (_products.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.shopping_bag_outlined, size: 80, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text(
              'No products found',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey[600],
                fontWeight: FontWeight.w500,
              ),
            ),
            if (_localSearchController.text.isNotEmpty)
              TextButton(
                onPressed: () {
                  _localSearchController.clear();
                  _fetchProducts();
                },
                child: const Text('Clear Search'),
              ),
          ],
        ),
      );
    }

    return ListView(
      controller: _scrollController,
      padding: const EdgeInsets.all(16),
      children: [
        // Product count
        Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${_products.length} Products',
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
              ),
              if (_localSearchController.text.isNotEmpty)
                GestureDetector(
                  onTap: () {
                    _localSearchController.clear();
                    _fetchProducts();
                  },
                  child: const Text(
                    'CLEAR SEARCH',
                    style: TextStyle(
                      fontSize: 10,
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                    ),
                  ),
                ),
            ],
          ),
        ),
        
        // Products Grid
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 0.72,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
          ),
          itemCount: _products.length,
          itemBuilder: (context, index) {
            return FadeInUp(
              delay: Duration(milliseconds: index * 50),
              child: ProductCard(
                product: _products[index],
                showRating: true,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => ProductDetailsScreen(
                        product: _products[index],
                      ),
                    ),
                  );
                },
              ),
            );
          },
        ),
        
        // Loading more indicator
        if (_isLoadingMore)
          const Padding(
            padding: EdgeInsets.all(20),
            child: Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            ),
          ),
        
        const SizedBox(height: 20),
      ],
    );
  }
}
