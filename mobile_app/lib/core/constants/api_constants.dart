class ApiConstants {
  // Base URL
  static const String baseUrl = 'https://kalimgo-backend-final.onrender.com/api/';
  // static const String baseUrl = 'http://10.0.2.2:6006/api/';
  
  // Authentication Endpoints
  static const String loginPhone = 'users/login-phone';
  
  // Category Endpoints
  static const String categories = 'categories';
  
  // Product Endpoints
  static const String products = 'products';
  static const String productsFeatured = 'products/featured';
  static const String productsTrending = 'products/trending';
  static const String productsNewArrivals = 'products/new-arrivals';
  static const String productsBestSellers = 'products/best-sellers';
  static const String productsFilters = 'products/filters';
  
  // User Endpoints
  static const String userProfile = 'users/user-profile';
  static const String userAddresses = 'users/addresses';
  
  // Order Endpoints
  static const String ordersOrder = 'orders';
  static const String ordersCreate = 'orders/create';
  static const String ordersMyOrders = 'orders/my-orders';
  
  // Offer / Coupon Endpoints
  static const String offers = 'offers';
  static const String validateCoupon = 'offers/validate';
  static const String activeLocations = 'locations/active';
}
