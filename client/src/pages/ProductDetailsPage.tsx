import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, Star, ChevronRight, Truck, RefreshCw, ShieldCheck, Plus, Minus } from 'lucide-react';
import { fetchProductBySlug, fetchRecommendedProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ui/ProductCard';
import axios from 'axios';

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

interface Variant {
  id: string;
  variant_name: string;
  variant_value: string;
  price_adjustment: string | number;
  stock_quantity: number;
  price: number;
  size: string | null;
  color: string | null;
}

interface ProductImage {
  id: string;
  image_url: string;
  image_order: number;
  is_primary: boolean;
}

interface Product {
  id: string;
  product_name: string;
  price: string | number;
  original_price?: string | number;
  description: string;
  brand?: string;
  category: { id: string; category_name: string; url_slug: string } | null;
  images?: ProductImage[];
  variants?: Variant[];
  average_rating?: number;
  total_reviews?: number;
  url_slug: string;
}

const ProductDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Gallery state
  const [activeImage, setActiveImage] = useState<string>('');
  
  // Selector states
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [validationError, setValidationError] = useState<string>('');

  // Accordion state
  const [activeAccordion, setActiveAccordion] = useState<string>('description');

  useEffect(() => {
    const loadProductData = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      setValidationError('');
      try {
        const response = await fetchProductBySlug(slug);
        if (response.success && response.product) {
          const prod: Product = response.product;
          setProduct(prod);
          
          // Set initial active image
          if (prod.images && prod.images.length > 0) {
            const primary = prod.images.find(img => img.is_primary);
            setActiveImage(primary ? primary.image_url : prod.images[0].image_url);
          } else {
            setActiveImage('');
          }

          // Pre-select first size/color if available
          if (prod.variants && prod.variants.length > 0) {
            const sizes = Array.from(new Set(prod.variants.map(v => v.size).filter(Boolean))) as string[];
            const colors = Array.from(new Set(prod.variants.map(v => v.color).filter(Boolean))) as string[];
            if (sizes.length > 0) setSelectedSize(sizes[0]);
            if (colors.length > 0) setSelectedColor(colors[0]);
          } else {
            setSelectedSize('');
            setSelectedColor('');
          }

          // Load recommendations
          try {
            const recResponse = await fetchRecommendedProducts({ product_id: prod.id, limit: 4 });
            if (recResponse.success) {
              setRecommended(recResponse.products || []);
            }
          } catch (recErr) {
            console.error("Failed to load recommended products:", recErr);
          }

        } else {
          setError('Product not found');
        }
      } catch (err: any) {
        console.error("Error loading product detail:", err);
        setError(err.response?.data?.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <h2 className="text-lg font-bold uppercase tracking-widest text-red-500 mb-2">Error</h2>
        <p className="text-sm text-gray-500 mb-6">{error || 'Product not found'}</p>
        <Link to="/" className="border border-black text-black hover:bg-black hover:text-white transition-all text-xs font-bold uppercase tracking-widest px-6 py-3">
          Back to Home
        </Link>
      </div>
    );
  }

  // Calculate price dynamically based on selection adjustments if any
  let displayPrice = Number(product.price);
  let selectedVariantId: string | undefined = undefined;

  if (product.variants && product.variants.length > 0) {
    // Look for matching variant
    const matched = product.variants.find(
      v => (selectedSize ? v.size === selectedSize : true) && (selectedColor ? v.color === selectedColor : true)
    );
    if (matched) {
      displayPrice = matched.price;
      selectedVariantId = matched.id;
    }
  }

  // Gather unique sizes and colors
  const availableSizes = product.variants 
    ? Array.from(new Set(product.variants.map(v => v.size).filter(Boolean))) as string[]
    : [];
  const availableColors = product.variants 
    ? Array.from(new Set(product.variants.map(v => v.color).filter(Boolean))) as string[]
    : [];

  const handleAddToBag = () => {
    if (availableSizes.length > 0 && !selectedSize) {
      setValidationError('Please select a size');
      return;
    }
    if (availableColors.length > 0 && !selectedColor) {
      setValidationError('Please select a color');
      return;
    }
    setValidationError('');

    addToCart({
      id: product.id,
      product_name: product.product_name,
      price: displayPrice,
      image_url: activeImage || (product.images && product.images[0]?.image_url) || '',
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      variantId: selectedVariantId
    }, quantity);
  };

  const handleBuyItNow = async () => {
    if (availableSizes.length > 0 && !selectedSize) {
      setValidationError('Please select a size');
      return;
    }
    if (availableColors.length > 0 && !selectedColor) {
      setValidationError('Please select a color');
      return;
    }
    setValidationError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:6006/api/checkout/initiate', {
        items: [{
          id: product.id,
          variantId: selectedVariantId,
          quantity: quantity
        }]
      });

      if (response.data.success) {
        const data = response.data;
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          setValidationError('Failed to load secure payment script.');
          setLoading(false);
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
            setLoading(true);
            try {
              const verifyRes = await axios.post('http://localhost:6006/api/checkout/verify', {
                orderId: data.orderId,
                razorpayPaymentId: paymentRes.razorpay_payment_id,
                razorpayOrderId: paymentRes.razorpay_order_id,
                razorpaySignature: paymentRes.razorpay_signature
              });
              if (verifyRes.data.success) {
                window.location.href = `/order-success?orderId=${data.orderId}&orderNumber=${data.orderNumber}&method=online`;
              } else {
                setValidationError('Payment verification failed.');
              }
            } catch (err: any) {
              console.error("Signature verification error:", err);
              setValidationError(err.response?.data?.message || 'Verification request failed');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: '',
            email: '',
            contact: ''
          },
          theme: {
            color: '#10B981'
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              console.log("Checkout modal dismissed.");
            }
          }
        };

        if (data.isMock) {
          console.log("Mock key detected. Simulating checkout verification...");
          setTimeout(async () => {
            try {
              const verifyRes = await axios.post('http://localhost:6006/api/checkout/verify', {
                orderId: data.orderId,
                razorpayPaymentId: 'pay_mock_' + Math.random().toString(36).substring(2, 12),
                razorpayOrderId: data.razorpayOrderId,
                razorpaySignature: 'mock_signature_hash'
              });
              if (verifyRes.data.success) {
                window.location.href = `/order-success?orderId=${data.orderId}&orderNumber=${data.orderNumber}&method=online&mock=true`;
              } else {
                setValidationError('Sandbox verification failed.');
                setLoading(false);
              }
            } catch (err: any) {
              console.error("Mock verify error:", err);
              setValidationError('Sandbox verification failed.');
              setLoading(false);
            }
          }, 1500);
        } else {
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        }
      } else {
        setValidationError('Checkout service temporarily unavailable');
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Checkout initiation error:", err);
      setValidationError('Failed to connect to checkout gateway');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="border-b border-gray-100 py-4">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronRight size={10} />
            {product.category && (
              <>
                <Link to={`/category/${product.category.url_slug}`} className="hover:text-black transition-colors">
                  {product.category.category_name}
                </Link>
                <ChevronRight size={10} />
              </>
            )}
            <span className="text-black line-clamp-1">{product.product_name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4">
            
            {/* Main Active Image */}
            <div className="flex-1 aspect-[3/4] bg-gray-50 overflow-hidden relative group">
              {activeImage ? (
                <img 
                  src={activeImage} 
                  alt={product.product_name} 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                  No Image Available
                </div>
              )}
            </div>

            {/* Side Thumbnail List */}
            {product.images && product.images.length > 1 && (
              <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[600px] scrollbar-thin flex-row justify-start">
                {product.images
                  .sort((a, b) => a.image_order - b.image_order)
                  .map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(img.image_url)}
                      className={`w-20 aspect-[3/4] flex-shrink-0 border-2 overflow-hidden bg-gray-50 transition-all ${
                        activeImage === img.image_url ? 'border-black' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
              </div>
            )}

          </div>

          {/* RIGHT: Product Info & Configuration */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            
            {/* Brand & Title */}
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-brand-accent mb-2">
              {product.brand || 'ShivStyle Originals'}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-black mb-3">
              {product.product_name}
            </h1>

            {/* Rating / Review Overview */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    className={i < Math.floor(product.average_rating || 4.5) ? "fill-black text-black" : "text-gray-200"} 
                  />
                ))}
                <span className="text-xs font-bold text-black ml-1.5">{Number(product.average_rating || 4.5).toFixed(1)}</span>
              </div>
              <span className="text-xs font-bold uppercase text-gray-400 tracking-widest border-l border-gray-200 pl-4">
                {product.total_reviews || 12} Reviews
              </span>
            </div>

            {/* Pricing Section */}
            <div className="flex items-baseline space-x-3 mb-8 border-y border-gray-100 py-4">
              <span className="text-2xl font-bold text-black">${displayPrice.toFixed(2)}</span>
              {product.original_price && (
                <>
                  <span className="text-sm font-semibold text-gray-400 line-through">
                    ${Number(product.original_price).toFixed(2)}
                  </span>
                  <span className="bg-brand-accent text-white text-[9px] font-bold uppercase px-2 py-0.5 tracking-wider rounded-sm">
                    Sale
                  </span>
                </>
              )}
            </div>

            {/* Validation Message */}
            {validationError && (
              <p className="text-xs font-bold text-red-500 mb-4 tracking-wide uppercase">
                {validationError}
              </p>
            )}

            {/* Configurations */}
            <div className="space-y-6 mb-8">
              
              {/* Color Selectors */}
              {availableColors.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black">Color</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedColor}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {availableColors.map((color) => {
                      const isSelected = selectedColor === color;
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`text-xs font-bold uppercase tracking-wider px-4 py-2 border rounded-sm transition-all ${
                            isSelected 
                              ? 'border-black bg-black text-white' 
                              : 'border-gray-200 hover:border-black text-black'
                          }`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selectors */}
              {availableSizes.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black">Select Size</span>
                    <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">Size Guide</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {availableSizes.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[48px] h-12 text-xs font-bold uppercase tracking-wider border rounded-sm transition-all flex items-center justify-center ${
                            isSelected 
                              ? 'border-black bg-black text-white' 
                              : 'border-gray-200 hover:border-black text-black'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-black block mb-3">Quantity</span>
                <div className="flex items-center border border-gray-200 w-32 justify-between">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-3 py-2 text-gray-400 hover:text-black transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-bold text-black">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="px-3 py-2 text-gray-400 hover:text-black transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleAddToBag}
                  className="flex-grow bg-black text-white hover:bg-zinc-800 transition-all text-xs font-bold uppercase tracking-widest py-4.5 flex items-center justify-center space-x-3.5"
                >
                  <ShoppingBag size={16} />
                  <span>Add to Bag</span>
                </button>
                <button className="border border-gray-200 text-black hover:border-black transition-colors px-6 py-4.5 flex items-center justify-center">
                  <Heart size={18} />
                </button>
              </div>
              <button 
                onClick={handleBuyItNow}
                className="w-full bg-[#B91C1C] text-white hover:bg-[#A11717] transition-all text-xs font-bold uppercase tracking-widest py-4.5 flex items-center justify-center"
              >
                Buy It Now
              </button>
            </div>

            {/* Highlights / Features Banner */}
            <div className="grid grid-cols-3 gap-2 border-t border-gray-100 py-6 text-center">
              <div className="flex flex-col items-center">
                <Truck size={18} strokeWidth={1.5} className="text-gray-400 mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center">
                <RefreshCw size={18} strokeWidth={1.5} className="text-gray-400 mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">15-Day Return</span>
              </div>
              <div className="flex flex-col items-center">
                <ShieldCheck size={18} strokeWidth={1.5} className="text-gray-400 mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">100% Genuine</span>
              </div>
            </div>

            {/* Dynamic Specs Accordion */}
            <div className="border-t border-gray-100 pt-4 mt-2">
              <div className="border-b border-gray-100 pb-3">
                <button 
                  onClick={() => setActiveAccordion(activeAccordion === 'description' ? '' : 'description')}
                  className="w-full flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-black text-left"
                >
                  <span>Description</span>
                  <Plus size={12} className={`transition-transform ${activeAccordion === 'description' ? 'rotate-45' : ''}`} />
                </button>
                {activeAccordion === 'description' && (
                  <div className="mt-3 text-xs leading-relaxed text-gray-500 font-medium">
                    {product.description || "No description available for this premium ShivaStyle garment."}
                  </div>
                )}
              </div>

              <div className="border-b border-gray-100 py-3">
                <button 
                  onClick={() => setActiveAccordion(activeAccordion === 'details' ? '' : 'details')}
                  className="w-full flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-black text-left"
                >
                  <span>Product Specifications</span>
                  <Plus size={12} className={`transition-transform ${activeAccordion === 'details' ? 'rotate-45' : ''}`} />
                </button>
                {activeAccordion === 'details' && (
                  <div className="mt-3 text-xs leading-relaxed text-gray-500 font-medium space-y-1">
                    <p><strong className="text-black font-semibold uppercase tracking-wider text-[9px]">Material:</strong> 100% Pure Organic Cotton</p>
                    <p><strong className="text-black font-semibold uppercase tracking-wider text-[9px]">Care instructions:</strong> Machine Wash Cold / Dry Low</p>
                    <p><strong className="text-black font-semibold uppercase tracking-wider text-[9px]">Fit:</strong> Tailored Fit for Indian Standard Silhouette</p>
                    <p><strong className="text-black font-semibold uppercase tracking-wider text-[9px]">Country of origin:</strong> Crafted with Pride in India</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM: Recommendations Section */}
        {recommended.length > 0 && (
          <div className="mt-24 pt-10 border-t border-gray-100">
            <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-8 text-center">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {recommended.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default ProductDetailsPage;
