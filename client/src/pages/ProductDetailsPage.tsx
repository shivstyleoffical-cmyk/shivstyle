import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, Star, StarHalf, ChevronRight, Plus, Minus, Ruler } from 'lucide-react';
import api, { fetchProductBySlug, fetchRecommendedProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ui/ProductCard';
import SEO from '../components/common/SEO';

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
  image_url?: string;
  images?: ProductImage[];
  variants?: Variant[];
  average_rating?: number;
  total_reviews?: number;
  url_slug: string;
  is_featured?: boolean;
  is_trending?: boolean;
  is_new_arrival?: boolean;
  is_on_sale?: boolean;
  tags?: string;
  material?: string;
  care_instructions?: string;
  fit?: string;
  country_of_origin?: string;
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

  // Size Chart state
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  // Zoom magnifier states
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

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
          
          // Combine prod.image_url and prod.images if they are different and image_url is not in images
          const allImages = prod.images ? [...prod.images] : [];
          if (prod.image_url && !allImages.some(img => img.image_url === prod.image_url)) {
            allImages.unshift({
              id: 'primary-fallback',
              image_url: prod.image_url,
              image_order: -1,
              is_primary: !allImages.some(img => img.is_primary)
            });
          }
          prod.images = allImages;
          
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

  const isOnSale = product.is_on_sale || 
                   (product.original_price && 
                    !isNaN(Number(product.original_price)) && 
                    Number(product.original_price) > displayPrice);

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
      const response = await api.post('/checkout/initiate', {
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
          one_click_checkout: true,
          show_address: true,
          handler: async (paymentRes: any) => {
            setLoading(true);
            try {
              const verifyRes = await api.post('/checkout/verify', {
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
              const verifyRes = await api.post('/checkout/verify', {
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

  const averageRating = (!product.average_rating || Number(product.average_rating) === 0) ? 4.5 : Number(product.average_rating);
  const reviewsCount = (!product.total_reviews || Number(product.total_reviews) === 0) ? 12 : Number(product.total_reviews);

  const schemaMarkup = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.product_name,
    "image": activeImage || product.image_url || '',
    "description": product.description ? product.description.replace(/<[^>]*>/g, '') : '',
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "ShivStyle"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "INR",
      "price": displayPrice,
      "priceValidUntil": "2030-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title={product.product_name}
        description={product.description ? product.description.replace(/<[^>]*>/g, '').substring(0, 160) : `Buy ${product.product_name} at ShivStyle. Premium clothing crafted with standard quality.`}
        keywords={product.tags ? `${product.product_name}, ${product.tags}` : `${product.product_name}, premium clothing, fashion, shivstyle`}
        ogImage={activeImage || product.image_url}
        ogType="product"
        schemaMarkup={schemaMarkup}
      />
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
            <div 
              className="flex-1 aspect-[3/4] bg-gray-50 overflow-hidden relative group rounded-2xl border border-zinc-100 cursor-zoom-in shadow-sm"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              {activeImage ? (
                <img 
                  src={activeImage} 
                  alt={product.product_name} 
                  className="w-full h-full object-cover object-center transition-transform duration-150 ease-out"
                  style={{
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: isZoomed ? 'scale(1.8)' : 'scale(1)'
                  }}
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
                      className={`w-20 aspect-[3/4] flex-shrink-0 border-2 overflow-hidden bg-gray-50 rounded-lg transition-all ${
                        activeImage === img.image_url ? 'border-black shadow-sm scale-95' : 'border-transparent hover:border-gray-300'
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
            
            {/* Badges */}
            {(product.is_new_arrival || product.is_trending || product.is_featured) && (
              <div className="flex flex-wrap gap-1.5 mb-3.5">
                {product.is_new_arrival && (
                  <span className="bg-black text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                    New Arrival
                  </span>
                )}
                {product.is_trending && (
                  <span className="bg-yellow-400 text-black text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                    Trending
                  </span>
                )}
                {product.is_featured && (
                  <span className="bg-brand-accent text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                    Featured
                  </span>
                )}
              </div>
            )}

            {/* Brand & Title */}
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-brand-accent mb-2">
              {product.brand || 'ShivStyle Originals'}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-black mb-3">
              {product.product_name}
            </h1>

            {/* Rating / Review Overview */}
            <div className="flex items-center space-x-2.5 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => {
                  const starNumber = i + 1;
                  const isFilled = starNumber <= Math.floor(averageRating);
                  const isHalf = !isFilled && starNumber === Math.ceil(averageRating) && averageRating % 1 !== 0;
                  
                  if (isFilled) {
                    return <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />;
                  } else if (isHalf) {
                    return <StarHalf key={i} size={14} className="fill-yellow-400 text-yellow-400" />;
                  } else {
                    return <Star key={i} size={14} className="text-zinc-200" />;
                  }
                })}
                <span className="text-xs font-bold text-zinc-800 ml-1.5">{averageRating.toFixed(1)}</span>
              </div>
              <span className="text-xs font-bold text-zinc-400 tracking-wider">
                ({reviewsCount} reviews)
              </span>
            </div>

            {/* Pricing Section */}
            <div className="mb-8 border-y border-gray-100 py-5">
              <div className="flex items-baseline space-x-3">
                <span className="text-2xl font-bold text-black">₹{displayPrice.toFixed(2)}</span>
                {isOnSale && product.original_price && !isNaN(Number(product.original_price)) && (
                  <>
                    <span className="text-sm font-semibold text-gray-400 line-through">
                      ₹{Number(product.original_price).toFixed(2)}
                    </span>
                    <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">
                      ({Math.round(((Number(product.original_price) - displayPrice) / Number(product.original_price)) * 100)}% OFF)
                    </span>
                    <span className="bg-brand-accent text-white text-[9px] font-bold uppercase px-2 py-0.5 tracking-wider rounded-sm">
                      Sale
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-2 font-medium uppercase tracking-wider">Tax included. Shipping calculated at checkout.</p>
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
                    <span className="text-xs font-bold uppercase tracking-wider text-black">Color</span>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{selectedColor}</span>
                  </div>
                  <div className="flex gap-2.5 flex-wrap">
                    {availableColors.map((color) => {
                      const isSelected = selectedColor === color;
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`text-xs font-bold uppercase tracking-wider px-5 py-2.5 border rounded-full transition-all duration-300 ${
                            isSelected 
                              ? 'border-black bg-black text-white shadow-md shadow-black/10' 
                              : 'border-zinc-200 hover:border-black text-black hover:bg-zinc-50'
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
                    <span className="text-xs font-bold uppercase tracking-wider text-black">Size</span>
                    <button 
                      onClick={() => setIsSizeChartOpen(true)}
                      className="text-xs font-bold text-zinc-500 hover:text-black flex items-center space-x-1.5 transition-colors uppercase tracking-wider"
                    >
                      <Ruler size={14} />
                      <span>Size Chart</span>
                    </button>
                  </div>
                  <div className="flex gap-2.5 flex-wrap">
                    {availableSizes.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`w-12 h-12 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-300 flex items-center justify-center ${
                            isSelected 
                              ? 'border-black bg-black text-white shadow-md shadow-black/10 scale-105' 
                              : 'border-zinc-200 hover:border-black text-black hover:bg-zinc-50'
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
                <span className="text-xs font-bold uppercase tracking-wider text-black block mb-3">Quantity</span>
                <div className="flex items-center border border-zinc-200 rounded-full w-32 justify-between px-1.5 py-1">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-50 transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-bold text-black">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-50 transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 mb-8">
              <div className="flex gap-3">
                <button 
                  onClick={handleAddToBag}
                  className="flex-grow bg-transparent hover:bg-zinc-50 text-black border border-black transition-all duration-300 text-xs font-bold uppercase tracking-widest py-4 rounded-full flex items-center justify-center space-x-3"
                >
                  <ShoppingBag size={16} />
                  <span>Add to Bag</span>
                </button>
                <button className="border border-zinc-200 hover:border-black hover:bg-zinc-50 text-black transition-colors px-6 py-4 rounded-full flex items-center justify-center">
                  <Heart size={18} />
                </button>
              </div>
              <button 
                onClick={handleBuyItNow}
                className="w-full bg-[#B91C1C] text-white hover:bg-[#A11717] transition-all duration-300 text-xs font-bold uppercase tracking-widest py-4 rounded-full flex items-center justify-center shadow-lg shadow-red-700/10"
              >
                Buy It Now
              </button>
            </div>

            {/* Dynamic Specs Accordion */}
            <div className="border-t border-gray-100 pt-4 mt-2">
              <div className="border-b border-gray-100 pb-3">
                <button 
                  onClick={() => setActiveAccordion(activeAccordion === 'description' ? '' : 'description')}
                  className="w-full flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-black text-left py-2"
                >
                  <span>Description</span>
                  <Plus size={12} className={`transition-transform ${activeAccordion === 'description' ? 'rotate-45' : ''}`} />
                </button>
                {activeAccordion === 'description' && (
                  <div className="mt-2 text-xs leading-relaxed text-gray-500 font-medium">
                    {product.description || "No description available for this premium ShivaStyle garment."}
                  </div>
                )}
              </div>

              <div className="border-b border-gray-100 py-3">
                <button 
                  onClick={() => setActiveAccordion(activeAccordion === 'details' ? '' : 'details')}
                  className="w-full flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-black text-left py-1"
                >
                  <span>Product Specifications</span>
                  <Plus size={12} className={`transition-transform ${activeAccordion === 'details' ? 'rotate-45' : ''}`} />
                </button>
                {activeAccordion === 'details' && (
                  <div className="mt-3 text-xs leading-relaxed text-gray-500 font-medium space-y-1">
                    {(product.material && product.material !== 'null') ? (
                      <p><strong className="text-black font-semibold uppercase tracking-wider text-[9px]">Material:</strong> {product.material}</p>
                    ) : (
                      <p><strong className="text-black font-semibold uppercase tracking-wider text-[9px]">Material:</strong> 100% Pure Organic Cotton</p>
                    )}
                    {(product.care_instructions && product.care_instructions !== 'null') ? (
                      <p><strong className="text-black font-semibold uppercase tracking-wider text-[9px]">Care instructions:</strong> {product.care_instructions}</p>
                    ) : (
                      <p><strong className="text-black font-semibold uppercase tracking-wider text-[9px]">Care instructions:</strong> Machine Wash Cold / Dry Low</p>
                    )}
                    {(product.fit && product.fit !== 'null') ? (
                      <p><strong className="text-black font-semibold uppercase tracking-wider text-[9px]">Fit:</strong> {product.fit}</p>
                    ) : (
                      <p><strong className="text-black font-semibold uppercase tracking-wider text-[9px]">Fit:</strong> Tailored Fit for Indian Standard Silhouette</p>
                    )}
                    {(product.country_of_origin && product.country_of_origin !== 'null') ? (
                      <p><strong className="text-black font-semibold uppercase tracking-wider text-[9px]">Country of origin:</strong> {product.country_of_origin}</p>
                    ) : (
                      <p><strong className="text-black font-semibold uppercase tracking-wider text-[9px]">Country of origin:</strong> Crafted with Pride in India</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {product.tags && (
              <div className="flex flex-wrap gap-1.5 mt-6 border-t border-zinc-100 pt-4">
                {product.tags.split(',').map((tag: string) => (
                  <span 
                    key={tag}
                    className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-50 px-2.5 py-1 rounded-full border border-zinc-100"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}

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

      {/* Size Chart Modal */}
      {isSizeChartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white max-w-lg w-full mx-4 p-8 rounded-2xl border border-zinc-100 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsSizeChartOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black p-2 transition-colors"
            >
              <Plus className="rotate-45" size={24} />
            </button>
            <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-1">Size Guide</h3>
            <p className="text-xs text-zinc-500 mb-6 font-medium">Standard measurements in inches. Fit may vary depending on style and fabric.</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50">
                    <th className="p-3 font-semibold uppercase tracking-wider text-[10px] text-zinc-500">Size</th>
                    <th className="p-3 font-semibold uppercase tracking-wider text-[10px] text-zinc-500">Waist (in)</th>
                    <th className="p-3 font-semibold uppercase tracking-wider text-[10px] text-zinc-500">Chest (in)</th>
                    <th className="p-3 font-semibold uppercase tracking-wider text-[10px] text-zinc-500">Length (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  <tr>
                    <td className="p-3 text-black font-bold">S</td>
                    <td className="p-3 text-zinc-600">28 - 30</td>
                    <td className="p-3 text-zinc-600">34 - 36</td>
                    <td className="p-3 text-zinc-600">27</td>
                  </tr>
                  <tr className="bg-zinc-50/50">
                    <td className="p-3 text-black font-bold">M</td>
                    <td className="p-3 text-zinc-600">31 - 33</td>
                    <td className="p-3 text-zinc-600">38 - 40</td>
                    <td className="p-3 text-zinc-600">28</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-black font-bold">L</td>
                    <td className="p-3 text-zinc-600">34 - 36</td>
                    <td className="p-3 text-zinc-600">42 - 44</td>
                    <td className="p-3 text-zinc-600">29</td>
                  </tr>
                  <tr className="bg-zinc-50/50">
                    <td className="p-3 text-black font-bold">XL</td>
                    <td className="p-3 text-zinc-600">38 - 40</td>
                    <td className="p-3 text-zinc-600">46 - 48</td>
                    <td className="p-3 text-zinc-600">30</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-black font-bold">XXL</td>
                    <td className="p-3 text-zinc-600">42 - 44</td>
                    <td className="p-3 text-zinc-600">50 - 52</td>
                    <td className="p-3 text-zinc-600">31.5</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-black mb-1">How to Measure</h4>
              <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                <strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.<br/>
                <strong>Waist:</strong> Measure around your natural waistline, where your belt usually sits.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetailsPage;
