import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, ChevronDown, Plus, Minus, Trash2, Loader, Package } from 'lucide-react';
import logo from '../../assets/logo.png';
import api, { fetchCategories, searchProducts } from '../../services/api';
import { useCart } from '../../context/CartContext';

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/magic-checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Navbar: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, cartCount, cartTotal, isCartOpen, setIsCartOpen, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentSearchParam = searchParams.get('search') || '';
  const [categories, setCategories] = useState<any[]>([]);

  // Search Autocomplete States
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const popularSearches = [
    'T-Shirt',
    'Denim',
    'Overalls',
    'Floral Dress',
    'Jacket',
    'Kids Wear',
    'Cotton'
  ];

  // Announcement Bar sliding state
  const announcements = [
    "FREE SHIPPING ON ALL ORDERS OVER ₹999",
    "EASY 15-DAY RETURNS & EXCHANGE",
    "100% PREMIUM HAND-CRAFTED APPAREL",
    "USE CODE: FIRST10 FOR 10% OFF YOUR FIRST ORDER"
  ];
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [announcementFade, setAnnouncementFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementFade(false);
      setTimeout(() => {
        setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
        setAnnouncementFade(true);
      }, 300);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Load categories and recent searches on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
        const cachedCats = sessionStorage.getItem('categories_cache');
        const cachedAt = sessionStorage.getItem('categories_cache_ts');
        const isFresh = cachedCats && cachedAt && (Date.now() - Number(cachedAt)) < CACHE_TTL;

        if (isFresh) {
          setCategories(JSON.parse(cachedCats!));
          return;
        }

        const catData = await fetchCategories();
        const categoriesList = catData.categories || [];
        setCategories(categoriesList);
        sessionStorage.setItem('categories_cache', JSON.stringify(categoriesList));
        sessionStorage.setItem('categories_cache_ts', Date.now().toString());
      } catch (error) {
        console.error("Failed to load categories in navbar:", error);
      }
    };
    loadCategories();

    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load recent searches:", e);
      }
    }
  }, []);

  // Keep search state synchronized with URL search parameter
  useEffect(() => {
    setSearchQuery(currentSearchParam);
  }, [currentSearchParam]);

  // Focus search input when overlay is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close search overlay and mobile menu if the path changes
  useEffect(() => {
    if (location.pathname !== '/products' && !location.pathname.startsWith('/category/')) {
      setIsSearchOpen(false);
    }
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Debounced fetch search suggestions
  useEffect(() => {
    const cleanQuery = searchQuery.trim();
    if (cleanQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const data = await searchProducts({ q: cleanQuery, autocomplete: 'true' });
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error("Failed to fetch search suggestions:", error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const saveRecentSearch = (query: string) => {
    const clean = query.trim();
    if (!clean) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 5); // Limit to top 5
      localStorage.setItem('recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const removeRecentSearch = (term: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(q => q !== term);
      localStorage.setItem('recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };

  const handleSearchTermClick = (term: string) => {
    saveRecentSearch(term);
    setSearchQuery(term);
    setIsSearchOpen(false);
    navigate(`/products?search=${encodeURIComponent(term)}`);
  };

  const handleProductClick = (slug: string, productName: string) => {
    saveRecentSearch(productName);
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(`/product/${slug}`);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    const cleanValue = value.trim();
    if (location.pathname === '/products') {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (cleanValue !== '') {
          next.set('search', cleanValue);
        } else {
          next.delete('search');
        }
        return next;
      }, { replace: true });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = searchQuery.trim();
    if (cleanQuery) {
      saveRecentSearch(cleanQuery);
      setIsSearchOpen(false);
      navigate(`/products?search=${encodeURIComponent(cleanQuery)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">

      {/* Sliding Announcement Bar */}
      <div className="bg-black text-white text-[9px] font-bold tracking-[0.25em] uppercase py-2.5 text-center border-b border-zinc-800 select-none overflow-hidden h-8 flex items-center justify-center">
        <div className={`transition-all duration-300 transform ${announcementFade ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}>
          {announcements[announcementIndex]}
        </div>
      </div>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-20">

          {/* Main Navbar Content (Hidden when search is open) */}
          <div className={`flex justify-between items-center w-full h-full transition-opacity duration-200 ${isSearchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

            {/* Mobile menu button & Search (Left side on mobile) */}
            <div className="flex items-center space-x-4 md:hidden flex-1">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-black hover:text-brand-accent transition-colors p-1"
              >
                <Menu size={22} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-black hover:text-brand-accent transition-colors"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Logo (Centered on mobile, left on desktop) */}
            <div className="flex-shrink-0 flex items-center justify-center flex-1 md:flex-none">
              <Link to="/" className="flex items-center">
                <img src={logo} alt="ShivStyle Logo" className="h-16 w-auto object-contain mix-blend-multiply" />
              </Link>
            </div>

            {/* Desktop Navigation (Centered) */}
            <div className="hidden md:flex items-center justify-center space-x-10 flex-1">
              <Link
                to="/"
                className={`text-[11px] font-bold uppercase tracking-[0.2em] pb-1 border-b-2 transition-all ${location.pathname === '/' ? 'border-black text-black' : 'border-transparent text-black hover:text-brand-accent hover:border-brand-accent'}`}
              >
                New Arrivals
              </Link>

              {categories.length === 0 ? (
                <>
                  <Link
                    to="/category/men"
                    className="text-[11px] font-bold uppercase tracking-[0.2em] pb-1 border-b-2 border-transparent text-black hover:text-brand-accent hover:border-brand-accent"
                  >
                    Men
                  </Link>
                  <Link
                    to="/category/women"
                    className="text-[11px] font-bold uppercase tracking-[0.2em] pb-1 border-b-2 border-transparent text-black hover:text-brand-accent hover:border-brand-accent"
                  >
                    Women
                  </Link>
                  <Link
                    to="/category/kids"
                    className="text-[11px] font-bold uppercase tracking-[0.2em] pb-1 border-b-2 border-transparent text-black hover:text-brand-accent hover:border-brand-accent"
                  >
                    Kids
                  </Link>
                </>
              ) : (
                categories
                  .filter((cat) => !cat.parent_cat_id)
                  .map((parent) => {
                    const children = categories.filter((c) => c.parent_cat_id === parent.id);
                    const hasChildren = children.length > 0;
                    const isActive = location.pathname === `/category/${parent.url_slug}`;

                    return (
                      <div key={parent.id} className="relative group py-2">
                        <Link
                          to={`/category/${parent.url_slug}`}
                          className={`text-[11px] font-bold uppercase tracking-[0.2em] pb-1 border-b-2 transition-all flex items-center gap-1 ${isActive ? 'border-black text-black' : 'border-transparent text-black hover:text-brand-accent hover:border-brand-accent'}`}
                        >
                          <span>{parent.category_name}</span>
                          {hasChildren && <ChevronDown size={10} className="transition-transform duration-200 group-hover:rotate-180" />}
                        </Link>

                        {hasChildren && (
                          <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white border border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50">
                            <div className="py-2">
                              {children.map((child) => (
                                <Link
                                  key={child.id}
                                  to={`/category/${child.url_slug}`}
                                  className="block px-5 py-3 text-[10px] font-bold text-gray-600 hover:bg-gray-50 hover:text-brand-accent transition-colors uppercase tracking-widest"
                                >
                                  {child.category_name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
              )}

              <Link
                to="/sale"
                className={`text-[11px] font-bold uppercase tracking-[0.2em] pb-1 border-b-2 transition-all ${location.pathname === '/sale' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-accent hover:text-black hover:border-black'}`}
              >
                Sale
              </Link>
            </div>

            {/* Right side icons (Desktop & Mobile Cart) */}
            <div className="flex items-center justify-end space-x-6 flex-1 md:flex-none">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:block text-black hover:text-brand-accent transition-colors"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>
              {/* Track Order icon */}
              <Link
                to="/track-order"
                title="Track My Order"
                className="hidden md:flex items-center gap-1.5 text-black hover:text-brand-accent transition-colors"
              >
                <Package size={20} strokeWidth={1.5} />
                <span className="hidden lg:block text-[11px] font-bold uppercase tracking-widest">Track</span>
              </Link>
              <button
                onClick={() => setIsCartOpen(true)}
                className="text-black hover:text-brand-accent transition-colors relative flex items-center space-x-2"
              >
                <span className="hidden md:block text-[11px] font-bold uppercase tracking-widest">Bag</span>
                <div className="relative">
                  <ShoppingBag size={20} strokeWidth={1.5} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-brand-accent text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                      {cartCount}
                    </span>
                  )}
                </div>
              </button>
            </div>

          </div>

          {/* Search Overlay (Visible when search is open) */}
          <div className={`absolute inset-0 bg-white flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isSearchOpen ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none -z-10'}`}>
            <div className="w-full relative flex items-center h-full">
              <form onSubmit={handleSearchSubmit} className="flex items-center w-full space-x-4">
                <Search size={22} className="text-black flex-shrink-0" strokeWidth={1.5} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products, collections, brands..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="w-full bg-transparent border-b border-gray-200 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black font-medium"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.delete('search');
                      return next;
                    }, { replace: true });
                  }}
                  className="text-black hover:text-brand-accent transition-colors flex-shrink-0 p-2"
                >
                  <X size={22} strokeWidth={1.5} />
                </button>
              </form>

              {/* Advanced Autocomplete & Recommendations Panel */}
              {isSearchOpen && (
                <div className="absolute top-[80px] left-0 right-0 bg-white/95 backdrop-blur-md border-t border-zinc-100 shadow-2xl z-50 overflow-y-auto max-h-[80vh] transition-all duration-300 transform rounded-b-xl">
                  <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* CASE 1: Empty or short query - show Popular & Recent searches */}
                    {searchQuery.trim().length < 2 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Recent Searches */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                              Recent Searches
                            </h4>
                            {recentSearches.length > 0 && (
                              <button
                                type="button"
                                onClick={clearRecentSearches}
                                className="text-[9px] font-bold text-zinc-400 hover:text-brand-accent transition-colors uppercase tracking-widest"
                              >
                                Clear All
                              </button>
                            )}
                          </div>
                          {recentSearches.length === 0 ? (
                            <p className="text-xs text-zinc-400 italic font-medium">No recent searches yet</p>
                          ) : (
                            <div className="flex flex-col space-y-3">
                              {recentSearches.map((term) => (
                                <div key={term} className="flex items-center justify-between group">
                                  <button
                                    type="button"
                                    onClick={() => handleSearchTermClick(term)}
                                    className="text-xs text-zinc-600 hover:text-black transition-colors text-left flex-1 font-medium"
                                  >
                                    {term}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeRecentSearch(term)}
                                    className="text-zinc-400 hover:text-zinc-600 transition-colors p-1"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Popular Searches & Quick Categories */}
                        <div className="space-y-8 md:col-span-2">
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pb-2 border-b border-zinc-100">
                              Popular Searches
                            </h4>
                            <div className="flex flex-wrap gap-2.5">
                              {popularSearches.map((term) => (
                                <button
                                  type="button"
                                  key={term}
                                  onClick={() => handleSearchTermClick(term)}
                                  className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 border border-zinc-200 hover:border-black hover:text-black transition-all px-3.5 py-2 bg-white"
                                >
                                  {term}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pb-2 border-b border-zinc-100">
                              Quick Categories
                            </h4>
                            <div className="flex flex-wrap gap-x-8 gap-y-3">
                              {categories.filter(c => !c.parent_cat_id).slice(0, 4).map((cat, idx, arr) => (
                                <div key={cat.id} className="flex items-center">
                                  <Link
                                    to={`/category/${cat.url_slug}`}
                                    onClick={() => setIsSearchOpen(false)}
                                    className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 hover:text-black transition-colors"
                                  >
                                    {cat.category_name}
                                  </Link>
                                  {idx < arr.length - 1 && (
                                    <span className="text-zinc-200 ml-8 text-[11px] font-light">/</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (

                      // CASE 2: Active Search - show suggestions & matches
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Auto-suggest list */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pb-2 border-b border-zinc-100">
                            Suggestions for "{searchQuery}"
                          </h4>
                          {isLoadingSuggestions ? (
                            <div className="flex items-center gap-2 text-zinc-400 text-xs py-2">
                              <Loader size={14} className="animate-spin text-zinc-500" />
                              <span>Finding matches...</span>
                            </div>
                          ) : suggestions.length === 0 ? (
                            <p className="text-xs text-zinc-400 italic font-medium">No search suggestions</p>
                          ) : (
                            <div className="flex flex-col space-y-3">
                              {Array.from(new Set(suggestions.map(s => s.product_name))).slice(0, 6).map((name) => (
                                <button
                                  type="button"
                                  key={name}
                                  onClick={() => handleSearchTermClick(name)}
                                  className="text-xs text-zinc-600 hover:text-black transition-colors text-left py-1 hover:pl-1 duration-200 transition-all font-medium flex items-center gap-2"
                                >
                                  <Search size={10} className="text-zinc-400" />
                                  <span>{name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Matching Products Column */}
                        <div className="md:col-span-2 space-y-4">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pb-2 border-b border-zinc-100">
                            Matching Products
                          </h4>

                          {isLoadingSuggestions ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {[1, 2, 3, 4].map(n => (
                                <div key={n} className="flex items-center gap-3 animate-pulse">
                                  <div className="w-12 h-16 bg-zinc-100" />
                                  <div className="space-y-2 flex-1">
                                    <div className="h-3 bg-zinc-100 w-2/3" />
                                    <div className="h-3 bg-zinc-100 w-1/3" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : suggestions.length === 0 ? (
                            <div className="text-zinc-400 text-xs italic py-4">
                              No products match your search query. Try searching for "tshirt under 500" or other keywords.
                            </div>
                          ) : (
                            <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {suggestions.slice(0, 6).map((product) => {
                                  const displayPrice = Number(product.price);
                                  const originalPrice = (product.original_price && !isNaN(Number(product.original_price))) ? Number(product.original_price) : null;
                                  const discountPercentage = product.discount_percentage ? Number(product.discount_percentage) : 0;
                                  const isOnSale = product.is_on_sale || (originalPrice && originalPrice > displayPrice);

                                  return (
                                    <div
                                      key={product.id}
                                      onClick={() => handleProductClick(product.url_slug, product.product_name)}
                                      className="flex items-center gap-3.5 p-2 bg-white hover:bg-zinc-50 border border-zinc-100 rounded-none cursor-pointer transition-all duration-200 group"
                                    >
                                      <div className="w-12 h-16 bg-zinc-100 overflow-hidden flex-shrink-0">
                                        {product.image_url ? (
                                          <img
                                            src={product.image_url}
                                            alt={product.product_name}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">No Image</div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        {product.brand && (
                                          <span className="block text-[8px] font-extrabold uppercase tracking-widest text-zinc-400">{product.brand}</span>
                                        )}
                                        <h5 className="text-[11px] font-bold text-zinc-800 truncate uppercase tracking-wide group-hover:text-brand-accent transition-colors">{product.product_name}</h5>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                          <span className="text-[11px] font-extrabold text-black">₹{displayPrice.toFixed(2)}</span>
                                          {isOnSale && originalPrice && (
                                            <>
                                              <span className="text-[9px] text-zinc-400 line-through">₹{originalPrice.toFixed(2)}</span>
                                              <span className="text-[8px] font-bold uppercase tracking-wider text-brand-accent">({discountPercentage || Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}% OFF)</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* View All Button */}
                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={() => handleSearchTermClick(searchQuery)}
                                  className="w-full text-center py-3 bg-black hover:bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest transition-colors rounded-none"
                                >
                                  View All Results ({suggestions.length})
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Sliding Cart Drawer Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300" onClick={() => setIsCartOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md transform transition-all duration-300 ease-in-out bg-white shadow-2xl flex flex-col h-full">

              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-widest text-black flex items-center gap-2">
                  <span>Shopping Bag</span>
                  <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">{cartCount}</span>
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-400 hover:text-black transition-colors p-1"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* Drawer Body - Scrollable Items */}
              <div className="flex-1 py-6 overflow-y-auto px-6 space-y-6">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <ShoppingBag size={24} className="text-gray-300" strokeWidth={1} />
                    </div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Your bag is empty</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="border border-black text-black hover:bg-black hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest px-6 py-3"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  cartItems.map((item, idx) => (
                    <div key={`${item.id}-${item.size || ''}-${item.color || ''}-${idx}`} className="flex gap-4 border-b border-gray-50 pb-6">
                      <div className="w-20 aspect-[3/4] bg-gray-50 overflow-hidden flex-shrink-0">
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide line-clamp-1">{item.product_name}</h3>
                            <button
                              onClick={() => removeFromCart(item.id, item.size, item.color)}
                              className="text-gray-400 hover:text-brand-accent p-0.5 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {/* Selected Variant Options */}
                          <div className="flex gap-2 mt-1.5 flex-wrap">
                            {item.size && (
                              <span className="text-[9px] font-bold uppercase bg-gray-50 text-gray-500 px-2 py-0.5 rounded-sm tracking-wider border border-gray-100">
                                Size: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="text-[9px] font-bold uppercase bg-gray-50 text-gray-500 px-2 py-0.5 rounded-sm tracking-wider border border-gray-100">
                                Color: {item.color}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-200">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                              className="px-2 py-1 text-gray-400 hover:text-black transition-colors"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="px-2.5 text-xs font-bold text-black min-w-[20px] text-center select-none">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                              className="px-2 py-1 text-gray-400 hover:text-black transition-colors"
                            >
                              <Plus size={10} />
                            </button>
                          </div>

                          {/* Price */}
                          <span className="text-xs font-bold text-black">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              {cartItems.length > 0 && (
                <div className="px-6 py-6 border-t border-gray-100 space-y-4 bg-gray-50">
                  <div className="flex justify-between items-center text-sm font-bold text-black uppercase tracking-wider">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">Shipping and taxes calculated at checkout.</p>
                  <div className="grid gap-2">
                    <button
                      onClick={async () => {
                        try {
                          setIsCartOpen(false);
                          const response = await api.post('/checkout/initiate', {
                            items: cartItems.map(item => ({
                              id: item.id,
                              variantId: item.variantId,
                              quantity: item.quantity
                            }))
                          });
                          if (response.data.success) {
                            const data = response.data;
                            const loaded = await loadRazorpayScript();
                            if (!loaded) {
                              alert("Failed to load secure checkout script.");
                              return;
                            }

                            const options = {
                              key: data.key,
                              amount: data.amount,
                              currency: data.currency || 'INR',
                              name: 'ShivStyle Checkout',
                              description: `Order ${data.orderNumber}`,
                              order_id: data.razorpayOrderId,
                              one_click_checkout: true, // Enables Magic Checkout
                              show_address: true, // Asks for address inside Magic Checkout modal
                              handler: async (paymentRes: any) => {
                                try {
                                  const verifyRes = await api.post('/checkout/verify', {
                                    orderId: data.orderId,
                                    razorpayPaymentId: paymentRes.razorpay_payment_id,
                                    razorpayOrderId: paymentRes.razorpay_order_id,
                                    razorpaySignature: paymentRes.razorpay_signature
                                  });
                                  if (verifyRes.data.success) {
                                    clearCart();
                                    navigate(`/order-success?orderId=${data.orderId}&orderNumber=${data.orderNumber}&method=online`);
                                  } else {
                                    alert('Payment verification failed.');
                                  }
                                } catch (err: any) {
                                  console.error("Signature verification error:", err);
                                  alert(err.response?.data?.message || 'Verification request failed');
                                }
                              },
                              prefill: {
                                name: '',
                                email: '',
                                contact: ''
                              },
                              theme: {
                                color: '#10B981' // Green theme matching Magic Checkout
                              },
                              modal: {
                                ondismiss: async () => {
                                  console.log("Checkout modal dismissed.");
                                  try {
                                    await api.post('/checkout/cancel', { orderId: data.orderId });
                                    console.log("Checkout cancelled and stock restored successfully.");
                                  } catch (cancelErr) {
                                    console.error("Error cancelling checkout:", cancelErr);
                                  }
                                }
                              }
                            };

                            if (data.isMock) {
                              console.log("Mock key detected. Simulating checkout verification...");
                              setTimeout(async () => {
                                try {
                                  const verifyRes = await api.post('/checkout/verify', {
                                    orderId: data.orderId,
                                    razorpayPaymentId: 'pay_mock_' + Math.random().toString(36).substring(2, 12),
                                    razorpayOrderId: data.razorpayOrderId,
                                    razorpaySignature: 'mock_signature_hash'
                                  });
                                  if (verifyRes.data.success) {
                                    clearCart();
                                    navigate(`/order-success?orderId=${data.orderId}&orderNumber=${data.orderNumber}&method=online&mock=true`);
                                  } else {
                                    alert('Sandbox verification failed.');
                                  }
                                } catch (err: any) {
                                  console.error("Mock verify error:", err);
                                  alert('Sandbox verification failed.');
                                }
                              }, 1500);
                            } else {
                              const rzp = new (window as any).Razorpay(options);
                              rzp.open();
                            }
                          } else {
                            alert('Checkout service temporarily unavailable');
                          }
                        } catch (err) {
                          console.error("Cart checkout trigger failed:", err);
                          alert('Failed to connect to checkout gateway');
                        }
                      }}
                      className="w-full bg-black text-white hover:bg-zinc-800 transition-all text-[11px] font-bold uppercase tracking-widest py-4 text-center"
                    >
                      Proceed to Checkout
                    </button>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="w-full bg-transparent hover:bg-gray-100 text-black border border-black/10 transition-all text-[10px] font-bold uppercase tracking-widest py-3 text-center"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Sliding Mobile Menu Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 max-w-full flex pr-10">
            <div className="w-screen max-w-xs transform transition-all duration-300 ease-in-out bg-white shadow-2xl flex flex-col h-full">

              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-widest text-black">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-black transition-colors p-1"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* Navigation list */}
              <div className="flex-1 py-6 overflow-y-auto px-6 space-y-6">
                <div className="flex flex-col space-y-4">
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-[12px] font-bold uppercase tracking-widest text-zinc-950 pb-2 border-b border-zinc-50"
                  >
                    New Arrivals
                  </Link>

                  {categories.length === 0 ? (
                    <>
                      <Link
                        to="/category/men"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-[12px] font-bold uppercase tracking-widest text-zinc-700 hover:text-black pb-2 border-b border-zinc-50"
                      >
                        Men
                      </Link>
                      <Link
                        to="/category/women"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-[12px] font-bold uppercase tracking-widest text-zinc-700 hover:text-black pb-2 border-b border-zinc-50"
                      >
                        Women
                      </Link>
                      <Link
                        to="/category/kids"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-[12px] font-bold uppercase tracking-widest text-zinc-700 hover:text-black pb-2 border-b border-zinc-50"
                      >
                        Kids
                      </Link>
                    </>
                  ) : (
                    categories
                      .filter((cat) => !cat.parent_cat_id)
                      .map((parent) => {
                        const children = categories.filter((c) => c.parent_cat_id === parent.id);
                        return (
                          <div key={parent.id} className="space-y-2">
                            <Link
                              to={`/category/${parent.url_slug}`}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="text-[12px] font-extrabold uppercase tracking-widest text-zinc-950 block"
                            >
                              {parent.category_name}
                            </Link>
                            {children.length > 0 && (
                              <div className="pl-4 flex flex-col space-y-2 border-l border-zinc-100">
                                {children.map((child) => (
                                  <Link
                                    key={child.id}
                                    to={`/category/${child.url_slug}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 hover:text-black"
                                  >
                                    {child.category_name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                  )}

                  <Link
                    to="/sale"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-[12px] font-bold uppercase tracking-widest text-brand-accent pt-2 block"
                  >
                    Sale
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
