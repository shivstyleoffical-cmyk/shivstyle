import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface Product {
  id: string;
  product_name: string;
  price: number;
  original_price?: number;
  image_url: string;
  category: string | { id: string; category_name: string } | null;
  is_new_arrival?: boolean;
  is_trending?: boolean;
  is_featured?: boolean;
  is_on_sale?: boolean;
  url_slug: string;
  stock_quantity?: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToBag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      product_name: product.product_name,
      price: Number(product.price),
      image_url: product.image_url,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Wishlist functionality (can be stubbed/placeholder for now)
  };

  const isOnSale = product.is_on_sale || 
                   (product.original_price && 
                    !isNaN(Number(product.original_price)) && 
                    Number(product.original_price) > Number(product.price));

  const isOutOfStock = product.stock_quantity !== undefined && Number(product.stock_quantity) <= 0;

  return (
    <Link to={`/product/${product.url_slug}`} className="group cursor-pointer flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4 rounded-xl border border-gray-100 shadow-sm">
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center z-10 transition-all duration-300">
            <span className="bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-[0.2em] px-4 py-2 rounded-sm shadow-md border border-red-500">
              Out of Stock
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10">
          {isOnSale ? (
            <span className="bg-rose-600 text-white text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm">
              Sale
            </span>
          ) : product.is_new_arrival ? (
            <span className="bg-black text-white text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-sm">
              New
            </span>
          ) : product.is_trending ? (
            <span className="bg-yellow-500 text-black text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-sm">
              Trending
            </span>
          ) : product.is_featured ? (
            <span className="bg-brand-accent text-white text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-sm">
              Featured
            </span>
          ) : null}
        </div>

        {/* Wishlist Heart */}
        <button 
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:text-brand-accent transition-colors"
        >
          <Heart size={16} strokeWidth={2} />
        </button>

        {/* Image */}
        <img 
          src={product.image_url} 
          alt={product.product_name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Quick Add Button */}
        {!isOutOfStock && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
            <button 
              onClick={handleAddToBag}
              className="w-full bg-black/90 backdrop-blur-md text-white hover:bg-brand-secondary font-bold text-[11px] uppercase tracking-widest py-3.5 flex items-center justify-center space-x-2 transition-colors"
            >
              <ShoppingBag size={14} />
              <span>Add to Bag</span>
            </button>
          </div>
        )}

      </div>

      {/* Product Info */}
      <div className="flex flex-col mt-3">
        <h3 className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide line-clamp-1">{product.product_name}</h3>
        <span className="inline-block border border-gray-200 text-gray-500 text-[10px] px-1.5 py-0.5 rounded-sm self-start mb-1">
          {typeof product.category === 'object' ? product.category?.category_name : product.category || 'Apparel'}
        </span>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-sm font-bold text-black">₹{Number(product.price).toFixed(2)}</span>
          {isOnSale && product.original_price && !isNaN(Number(product.original_price)) && (
            <>
              <span className="text-xs text-gray-400 line-through">₹{Number(product.original_price).toFixed(2)}</span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                ({Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100)}% OFF)
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
