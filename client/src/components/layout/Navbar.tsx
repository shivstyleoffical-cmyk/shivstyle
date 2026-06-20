import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, ChevronDown, Plus, Minus, Trash2 } from 'lucide-react';
import logo from '../../assets/logo.png';
import api, { fetchCategories } from '../../services/api';
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
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentSearchParam = searchParams.get('search') || '';
  const [categories, setCategories] = useState<any[]>([]);

  // Announcement Bar sliding state
  const announcements = [
    "FREE SHIPPING ON ALL ORDERS OVER $50",
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

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const catData = await fetchCategories();
        setCategories(catData.categories || []);
      } catch (error) {
        console.error("Failed to load categories in navbar:", error);
      }
    };
    loadCategories();
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

  // Close search overlay if the path changes to something other than /products
  useEffect(() => {
    if (location.pathname !== '/products' && !location.pathname.startsWith('/category/')) {
      setIsSearchOpen(false);
    }
  }, [location.pathname]);

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
    } else {
      if (cleanValue !== '') {
        navigate(`/products?search=${encodeURIComponent(cleanValue)}`, { replace: true });
      } else {
        navigate(`/products`, { replace: true });
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchOpen(false);
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
              <button className="text-black hover:text-brand-accent transition-colors">
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
                            ${(item.price * item.quantity).toFixed(2)}
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
                    <span>${cartTotal.toFixed(2)}</span>
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
                                ondismiss: () => {
                                  console.log("Checkout modal dismissed.");
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
    </nav>
  );
};

export default Navbar;
