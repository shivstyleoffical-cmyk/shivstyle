import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ui/ProductCard';
import { fetchProducts } from '../services/api';

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchProducts();
        // The API returns { success: true, products: [...] }
        setProducts(data.products || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero Section */}
      <section className="relative h-[80svh] bg-black overflow-hidden flex items-center">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071" 
            alt="High Fashion Editorial" 
            className="w-full h-full object-cover object-center opacity-60"
          />
        </div>
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-0">
          <div className="max-w-xl">
            <span className="inline-block text-white font-bold tracking-[0.2em] uppercase text-xs mb-4">
              Premium Collection
            </span>
            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tighter mb-6 uppercase">
              Shop Men's &<br/>Women's Essentials
            </h1>
            <p className="text-gray-200 text-sm md:text-base font-medium max-w-md mb-8 leading-relaxed">
              Discover the new standard of premium streetwear. Sharp silhouettes, bold contrasts, and unapologetic style.
            </p>
            <Link 
              to="/products" 
              className="inline-flex items-center justify-center bg-brand-accent text-white hover:bg-white hover:text-black px-10 py-4 font-bold text-xs uppercase tracking-widest transition-all duration-300"
            >
              <span>Explore Collection</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div className="max-w-lg">
            <h2 className="text-3xl md:text-4xl font-black text-black tracking-tighter mb-4 uppercase">Latest Arrivals</h2>
            <p className="text-gray-500 font-light text-sm md:text-base leading-relaxed">
              Curated pieces designed to make a statement. Uncompromising quality meets striking aesthetics.
            </p>
          </div>
          <Link to="/products" className="inline-flex items-center text-xs font-bold text-brand-accent hover:text-black transition-colors uppercase tracking-[0.2em] pb-1 border-b border-brand-accent hover:border-black">
            View Everything
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-brand-accent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Categories Banner */}
      <section className="py-12 bg-[#09090b]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row gap-4 h-[120vh] md:h-[70vh]">
            {/* Men's Collection */}
            <Link to="/category/men" className="group relative flex-1 overflow-hidden bg-gray-900">
              <img src="https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800" alt="Men's Collection" className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                <div>
                  <span className="text-brand-accent text-[10px] font-bold tracking-[0.2em] uppercase block mb-2">Modern Tailoring</span>
                  <h3 className="text-white text-4xl font-black tracking-tighter uppercase">Men</h3>
                </div>
                <div className="w-10 h-10 bg-white flex items-center justify-center rounded-full group-hover:bg-brand-accent group-hover:text-white transition-colors duration-300">
                  <ArrowRight size={18} />
                </div>
              </div>
            </Link>
            
            {/* Women's Collection */}
            <Link to="/category/women" className="group relative flex-1 overflow-hidden bg-gray-900">
              <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800" alt="Women's Collection" className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                <div>
                  <span className="text-brand-secondary text-[10px] font-bold tracking-[0.2em] uppercase block mb-2">Elegant Essentials</span>
                  <h3 className="text-white text-4xl font-black tracking-tighter uppercase">Women</h3>
                </div>
                <div className="w-10 h-10 bg-white flex items-center justify-center rounded-full group-hover:bg-brand-secondary group-hover:text-white transition-colors duration-300">
                  <ArrowRight size={18} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
