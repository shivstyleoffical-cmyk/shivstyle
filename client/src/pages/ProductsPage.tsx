import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../services/api';
import ProductCard from '../components/ui/ProductCard';
import { Filter, X, Search as SearchIcon, ChevronDown, ChevronUp } from 'lucide-react';
import SEO from '../components/common/SEO';

const ProductsPage: React.FC = () => {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isSalePage = location.pathname === '/sale';

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Pagination states for Infinite Scroll
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Accordion section open/close states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    size: true,
    color: true,
    fabric: true
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Local state for search input to prevent input delay
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  // Local state for price inputs
  const [minPriceInput, setMinPriceInput] = useState(searchParams.get('minPrice') || '');
  const [maxPriceInput, setMaxPriceInput] = useState(searchParams.get('maxPrice') || '');

  // Source of truth from URL parameters
  const searchParam = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'DESC';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  // Multiple select filters from URL parameters
  const sizesParam = searchParams.get('sizes') || '';
  const colorsParam = searchParams.get('colors') || '';
  const fabricParam = searchParams.get('fabric') || '';

  const selectedSizes = sizesParam ? sizesParam.split(',') : [];
  const selectedColors = colorsParam ? colorsParam.split(',') : [];
  const selectedFabrics = fabricParam ? fabricParam.split(',') : [];

  // Load categories once on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const catData = await fetchCategories();
        setCategories(catData.categories || []);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    loadCategories();
  }, []);

  // Determine the active category ID based on path parameter or query parameter
  const getSelectedCategoryId = () => {
    if (categoryId) {
      const matched = categories.find(
        (c: any) => c.url_slug === categoryId || c.id === categoryId
      );
      return matched ? matched.id : '';
    }
    return searchParams.get('category_id') || '';
  };
  const selectedCategory = getSelectedCategoryId();

  const parentCategories = categories.filter((c: any) => !c.parent_cat_id);
  const getChildren = (parentId: string) => categories.filter((c: any) => c.parent_cat_id === parentId);

  // Keep local search input in sync if URL search param is changed externally
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  // Keep local price inputs in sync with URL
  useEffect(() => {
    setMinPriceInput(minPriceParam);
  }, [minPriceParam]);

  useEffect(() => {
    setMaxPriceInput(maxPriceParam);
  }, [maxPriceParam]);

  // Debounce price input changes and update URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (minPriceInput === minPriceParam && maxPriceInput === maxPriceParam) return;

      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (minPriceInput.trim() !== '') {
          next.set('minPrice', minPriceInput);
        } else {
          next.delete('minPrice');
        }
        if (maxPriceInput.trim() !== '' && Number(maxPriceInput) < 10000) {
          next.set('maxPrice', maxPriceInput);
        } else {
          next.delete('maxPrice');
        }
        return next;
      }, { replace: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [minPriceInput, maxPriceInput, minPriceParam, maxPriceParam, setSearchParams]);

  // Sidebar search input change updates URL immediately
  const handleSidebarSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    const cleanValue = value.trim();
    const newParams = new URLSearchParams(searchParams);

    if (cleanValue !== '') {
      newParams.set('search', cleanValue);
      newParams.delete('category_id'); // clear category query param if any

      if (categoryId) {
        navigate(`/products?${newParams.toString()}`, { replace: true });
      } else {
        setSearchParams(newParams, { replace: true });
      }
    } else {
      newParams.delete('search');
      if (categoryId) {
        navigate(`/products?${newParams.toString()}`, { replace: true });
      } else {
        setSearchParams(newParams, { replace: true });
      }
    }
  };

  // Core load function that supports both initial fetching and page loading
  const loadProducts = async (targetPage: number, isInitial: boolean) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const params: any = {
        page: targetPage,
        limit: 12,
        sortBy,
        sortOrder,
      };
      if (searchParam) params.search = searchParam;
      if (selectedCategory) params.category_id = selectedCategory;
      if (minPriceParam) params.minPrice = minPriceParam;
      if (maxPriceParam) params.maxPrice = maxPriceParam;
      if (sizesParam) params.sizes = sizesParam;
      if (colorsParam) params.colors = colorsParam;
      if (fabricParam) params.fabric = fabricParam;
      if (isSalePage) params.is_on_sale = 'true';

      const data = await fetchProducts(params);
      const newProducts = data.products || [];

      if (isInitial) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }

      if (data.pagination) {
        setTotalProducts(data.pagination.total);
        setHasMore(targetPage < data.pagination.totalPages);
      } else {
        // Fallback check
        setHasMore(newProducts.length === 12);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Trigger page 1 clean load when query parameters/filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    const timer = setTimeout(() => {
      loadProducts(1, true);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchParam, selectedCategory, sortBy, sortOrder, minPriceParam, maxPriceParam, sizesParam, colorsParam, fabricParam, isSalePage]);

  // Load next pages when page changes
  useEffect(() => {
    if (page > 1) {
      loadProducts(page, false);
    }
  }, [page]);

  // IntersectionObserver to watch bottom of the grid and auto load more
  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTrigger = observerRef.current;
    if (currentTrigger) {
      observer.observe(currentTrigger);
    }

    return () => {
      if (currentTrigger) {
        observer.unobserve(currentTrigger);
      }
    };
  }, [loading, loadingMore, hasMore]);

  const handleCategoryClick = (cat: any) => {
    const newParams = new URLSearchParams(searchParams);

    if (selectedCategory === cat.id) {
      // Uncheck category -> go to all products
      if (categoryId) {
        navigate(`/products?${newParams.toString()}`);
      } else {
        newParams.delete('category_id');
        setSearchParams(newParams);
      }
    } else {
      // Check category -> navigate to specific category path
      newParams.delete('category_id');
      navigate(`/category/${cat.url_slug}?${newParams.toString()}`);
    }
    setIsMobileFiltersOpen(false);
  };

  const handleClearCategory = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('category_id');
    navigate(`/products?${newParams.toString()}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === 'price_asc') {
        next.set('sortBy', 'price');
        next.set('sortOrder', 'ASC');
      } else if (value === 'price_desc') {
        next.set('sortBy', 'price');
        next.set('sortOrder', 'DESC');
      } else if (value === 'newest') {
        next.set('sortBy', 'createdAt');
        next.set('sortOrder', 'DESC');
      } else {
        next.set('sortBy', 'relevance');
        next.set('sortOrder', 'DESC');
      }
      return next;
    });
  };

  const handleToggleSize = (size: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const current = next.get('sizes') ? next.get('sizes')!.split(',') : [];
      const updated = current.includes(size)
        ? current.filter((s) => s !== size)
        : [...current, size];

      if (updated.length > 0) {
        next.set('sizes', updated.join(','));
      } else {
        next.delete('sizes');
      }
      return next;
    }, { replace: true });
  };

  const handleToggleColor = (color: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const current = next.get('colors') ? next.get('colors')!.split(',') : [];
      const updated = current.includes(color)
        ? current.filter((c) => c !== color)
        : [...current, color];

      if (updated.length > 0) {
        next.set('colors', updated.join(','));
      } else {
        next.delete('colors');
      }
      return next;
    }, { replace: true });
  };

  const handleToggleFabric = (fabric: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const current = next.get('fabric') ? next.get('fabric')!.split(',') : [];
      const updated = current.includes(fabric)
        ? current.filter((f) => f !== fabric)
        : [...current, fabric];

      if (updated.length > 0) {
        next.set('fabric', updated.join(','));
      } else {
        next.delete('fabric');
      }
      return next;
    }, { replace: true });
  };



  const handleClearSizes = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('sizes');
      return next;
    }, { replace: true });
  };

  const handleClearColors = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('colors');
      return next;
    }, { replace: true });
  };

  const handleClearFabrics = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('fabric');
      return next;
    }, { replace: true });
  };



  const handleClearAllFilters = () => {
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    navigate('/products');
  };

  const pageTitle = isSalePage 
    ? 'Sale Collection' 
    : categoryId 
      ? `${categoryId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Collection` 
      : 'All Collections';

  const pageDescription = isSalePage
    ? 'Shop the biggest discounts on premium streetwear at ShivStyle. Heavy offers on limited pieces, pure cotton t-shirts, jackets, and accessories.'
    : categoryId
      ? `Discover premium ${categoryId.replace('-', ' ')} collection at ShivStyle. Handcrafted apparel, standard fits, and high-fashion aesthetics.`
      : 'Browse the entire collection of premium streetwear, tees, bottom wear, and accessories at ShivStyle Official.';

  return (
    <div className="bg-white min-h-screen pt-10 pb-20">
      <SEO 
        title={pageTitle}
        description={pageDescription}
        keywords={`shivstyle, ${pageTitle.toLowerCase()}, premium streetwear, clothing`}
      />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header & Mobile Filter Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-2">
              {isSalePage ? 'Sale Collection' : categoryId ? `${categoryId.replace('-', ' ')} Collection` : 'All Collections'}
            </h1>
            <p className="text-sm text-gray-500 font-medium">Showing {products.length} of {totalProducts} products</p>
          </div>

          <div className="flex items-center space-x-4 mt-6 md:mt-0 w-full md:w-auto">
            <button
              className="md:hidden flex items-center space-x-2 border border-black px-4 py-2 font-bold text-xs uppercase"
              onClick={() => setIsMobileFiltersOpen(true)}
            >
              <Filter size={16} />
              <span>Filters</span>
            </button>

            <div className="flex items-center space-x-2 w-full md:w-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 hidden md:inline">Sort by:</span>
              <div className="relative w-full md:w-48">
                <select
                  className="w-full appearance-none border border-gray-200 rounded-none bg-transparent px-4 py-2.5 pr-8 text-xs font-bold uppercase tracking-wide focus:outline-none focus:border-black"
                  onChange={handleSortChange}
                  value={sortBy === 'price' && sortOrder === 'ASC' ? 'price_asc' : sortBy === 'price' && sortOrder === 'DESC' ? 'price_desc' : sortBy === 'relevance' ? 'relevance' : 'newest'}
                >
                  <option value="newest">New Arrivals</option>
                  <option value="relevance">Best Selling</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-black" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-10">

          {/* Sidebar / Filters (Desktop & Mobile) */}
          <div className={`fixed inset-0 z-50 bg-white p-6 overflow-y-auto transition-transform duration-300 md:relative md:inset-auto md:bg-transparent md:p-0 md:w-64 md:flex-shrink-0 md:z-0 md:translate-x-0 ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex justify-between items-center mb-8 md:hidden">
              <h2 className="text-lg font-black uppercase tracking-widest">Filters</h2>
              <button onClick={() => setIsMobileFiltersOpen(false)}><X size={24} /></button>
            </div>

            {/* Active Filters Summary if any */}
            {(selectedSizes.length > 0 || selectedColors.length > 0 || selectedFabrics.length > 0 || minPriceParam || maxPriceParam || searchParam) && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Active Filters</span>
                  <button
                    onClick={handleClearAllFilters}
                    className="text-[10px] text-brand-accent uppercase font-bold hover:underline"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {searchParam && (
                    <span className="inline-flex items-center bg-gray-100 text-[10px] font-bold uppercase tracking-wider text-black px-2 py-1">
                      Search: {searchParam}
                    </span>
                  )}
                  {minPriceParam && (
                    <span className="inline-flex items-center bg-gray-100 text-[10px] font-bold uppercase tracking-wider text-black px-2 py-1">
                      Min: ₹{minPriceParam}
                    </span>
                  )}
                  {maxPriceParam && (
                    <span className="inline-flex items-center bg-gray-100 text-[10px] font-bold uppercase tracking-wider text-black px-2 py-1">
                      Max: ₹{maxPriceParam}
                    </span>
                  )}
                  {selectedSizes.map(s => (
                    <span key={s} className="inline-flex items-center bg-gray-100 text-[10px] font-bold uppercase tracking-wider text-black px-2 py-1">
                      Size: {s}
                      <button onClick={() => handleToggleSize(s)} className="ml-1.5 text-gray-400 hover:text-black">×</button>
                    </span>
                  ))}
                  {selectedColors.map(c => (
                    <span key={c} className="inline-flex items-center bg-gray-100 text-[10px] font-bold uppercase tracking-wider text-black px-2 py-1">
                      Color: {c}
                      <button onClick={() => handleToggleColor(c)} className="ml-1.5 text-gray-400 hover:text-black">×</button>
                    </span>
                  ))}
                  {selectedFabrics.map(f => (
                    <span key={f} className="inline-flex items-center bg-gray-100 text-[10px] font-bold uppercase tracking-wider text-black px-2 py-1">
                      Fabric: {f}
                      <button onClick={() => handleToggleFabric(f)} className="ml-1.5 text-gray-400 hover:text-black">×</button>
                    </span>
                  ))}

                </div>
              </div>
            )}

            {/* Search */}
            <div className="border-b border-gray-200 pb-5 mb-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-black mb-4">Search</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={handleSidebarSearchChange}
                  className="w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-black rounded-none"
                />
                <SearchIcon size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Categories Accordion */}
            <div className="border-b border-gray-200 py-5">
              <button
                onClick={() => toggleSection('category')}
                className="flex justify-between items-center w-full text-xs font-bold uppercase tracking-widest text-black hover:text-brand-accent transition-colors"
              >
                <span>Category</span>
                <div className="flex items-center space-x-2">
                  {selectedCategory && (
                    <span
                      onClick={(e) => { e.stopPropagation(); handleClearCategory(); }}
                      className="text-[10px] text-gray-400 hover:text-brand-accent lowercase font-bold mr-1"
                    >
                      clear
                    </span>
                  )}
                  {openSections.category ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </button>
              {openSections.category && (
                <ul className="space-y-4 mt-4">
                  {parentCategories.map((parent) => {
                    const children = getChildren(parent.id);
                    const isParentSelected = selectedCategory === parent.id;
                    
                    return (
                      <li key={parent.id} className="space-y-2">
                        <button
                          onClick={() => handleCategoryClick(parent)}
                          className="flex items-center space-x-3 w-full group text-left"
                        >
                          <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${isParentSelected ? 'bg-black border-black' : 'border-gray-300 group-hover:border-black'}`}>
                            {isParentSelected && <div className="w-2 h-2 bg-white" />}
                          </div>
                          <span className={`text-sm tracking-wide uppercase font-bold ${isParentSelected ? 'text-black font-extrabold' : 'text-gray-700 group-hover:text-black'}`}>
                            {parent.category_name}
                          </span>
                        </button>

                        {children.length > 0 && (
                          <ul className="pl-6 space-y-2 border-l border-gray-100 ml-2 mt-1">
                            {children.map((child) => {
                              const isChildSelected = selectedCategory === child.id;
                              return (
                                <li key={child.id}>
                                  <button
                                    onClick={() => handleCategoryClick(child)}
                                    className="flex items-center space-x-3 w-full group text-left"
                                  >
                                    <div className={`w-3.5 h-3.5 border flex items-center justify-center transition-colors ${isChildSelected ? 'bg-brand-accent border-brand-accent' : 'border-gray-200 group-hover:border-gray-400'}`}>
                                      {isChildSelected && <div className="w-1.5 h-1.5 bg-white" />}
                                    </div>
                                    <span className={`text-xs font-medium transition-colors ${isChildSelected ? 'text-brand-accent font-bold' : 'text-gray-500 group-hover:text-black'}`}>
                                      {child.category_name}
                                    </span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Price Accordion */}
            <div className="border-b border-gray-200 py-5">
              <button
                onClick={() => toggleSection('price')}
                className="flex justify-between items-center w-full text-xs font-bold uppercase tracking-widest text-black hover:text-brand-accent transition-colors"
              >
                <span>Price</span>
                <div className="flex items-center space-x-2">
                  {(minPriceInput || maxPriceInput) && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setMinPriceInput('');
                        setMaxPriceInput('');
                      }}
                      className="text-[10px] text-gray-400 hover:text-brand-accent lowercase font-bold mr-1"
                    >
                      clear
                    </span>
                  )}
                  {openSections.price ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </button>
              {openSections.price && (
                <div className="mt-5 flex flex-col space-y-3">
                  <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <span>Range</span>
                    <span className="text-black font-semibold">
                      ₹0 - ₹{Number(maxPriceInput || 10000).toLocaleString('en-IN')}{Number(maxPriceInput || 10000) >= 10000 ? '+' : ''}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={maxPriceInput || 10000}
                    onChange={(e) => {
                      setMinPriceInput('');
                      setMaxPriceInput(e.target.value);
                    }}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                    <span>₹0</span>
                    <span>₹10,000+</span>
                  </div>
                </div>
              )}
            </div>



            {/* Size Accordion */}
            <div className="border-b border-gray-200 py-5">
              <button
                onClick={() => toggleSection('size')}
                className="flex justify-between items-center w-full text-xs font-bold uppercase tracking-widest text-black hover:text-brand-accent transition-colors"
              >
                <span>Size</span>
                <div className="flex items-center space-x-2">
                  {selectedSizes.length > 0 && (
                    <span
                      onClick={(e) => { e.stopPropagation(); handleClearSizes(); }}
                      className="text-[10px] text-gray-400 hover:text-brand-accent lowercase font-bold mr-1"
                    >
                      clear
                    </span>
                  )}
                  {openSections.size ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </button>
              {openSections.size && (
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => handleToggleSize(size)}
                        className={`h-9 border flex items-center justify-center text-[10px] font-bold tracking-wider transition-all duration-200 ${isSelected ? 'bg-black border-black text-white' : 'border-gray-200 text-black hover:border-black'}`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Colour Accordion */}
            <div className="border-b border-gray-200 py-5">
              <button
                onClick={() => toggleSection('color')}
                className="flex justify-between items-center w-full text-xs font-bold uppercase tracking-widest text-black hover:text-brand-accent transition-colors"
              >
                <span>Colour</span>
                <div className="flex items-center space-x-2">
                  {selectedColors.length > 0 && (
                    <span
                      onClick={(e) => { e.stopPropagation(); handleClearColors(); }}
                      className="text-[10px] text-gray-400 hover:text-brand-accent lowercase font-bold mr-1"
                    >
                      clear
                    </span>
                  )}
                  {openSections.color ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </button>
              {openSections.color && (
                <div className="flex flex-wrap gap-2.5 mt-4">
                  {[
                    { name: 'White', bg: 'bg-white border border-gray-300' },
                    { name: 'Black', bg: 'bg-black' },
                    { name: 'Blue', bg: 'bg-blue-600' },
                    { name: 'Red', bg: 'bg-red-600' },
                    { name: 'Orange', bg: 'bg-orange-500' },
                    { name: 'Grey', bg: 'bg-gray-400' }
                  ].map((color) => {
                    const isSelected = selectedColors.includes(color.name);
                    return (
                      <button
                        key={color.name}
                        onClick={() => handleToggleColor(color.name)}
                        title={color.name}
                        className={`w-7 h-7 rounded-full ${color.bg} relative flex items-center justify-center transition-all hover:scale-110 ${isSelected ? 'ring-2 ring-black ring-offset-2' : ''}`}
                      >
                        {color.name === 'White' && isSelected && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                        {color.name !== 'White' && isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Fabric Accordion */}
            <div className="border-b border-gray-200 py-5">
              <button
                onClick={() => toggleSection('fabric')}
                className="flex justify-between items-center w-full text-xs font-bold uppercase tracking-widest text-black hover:text-brand-accent transition-colors"
              >
                <span>Fabric</span>
                <div className="flex items-center space-x-2">
                  {selectedFabrics.length > 0 && (
                    <span
                      onClick={(e) => { e.stopPropagation(); handleClearFabrics(); }}
                      className="text-[10px] text-gray-400 hover:text-brand-accent lowercase font-bold mr-1"
                    >
                      clear
                    </span>
                  )}
                  {openSections.fabric ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </button>
              {openSections.fabric && (
                <ul className="space-y-3 mt-4">
                  {['Cotton', 'Denim', 'Leather', 'Polyester'].map((fabric) => {
                    const isSelected = selectedFabrics.includes(fabric);
                    return (
                      <li key={fabric}>
                        <button
                          onClick={() => handleToggleFabric(fabric)}
                          className="flex items-center space-x-3 w-full group"
                        >
                          <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${isSelected ? 'bg-black border-black' : 'border-gray-300 group-hover:border-black'}`}>
                            {isSelected && <div className="w-2 h-2 bg-white" />}
                          </div>
                          <span className={`text-sm font-medium ${isSelected ? 'text-black font-bold' : 'text-gray-600 group-hover:text-black'}`}>
                            {fabric}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

          </div>

          {/* Main Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 animate-pulse">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex flex-col">
                    <div className="bg-gray-100 aspect-[3/4] mb-3"></div>
                    <div className="h-4 bg-gray-100 w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-100 w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Infinite Scroll Trigger Element with Skeleton Row */}
                <div ref={observerRef} className="w-full mt-10">
                  {loadingMore && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 animate-pulse pb-10">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex flex-col">
                          <div className="bg-gray-100 aspect-[3/4] mb-3"></div>
                          <div className="h-4 bg-gray-100 w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-100 w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 px-4 text-center border border-dashed border-gray-200">
                <SearchIcon size={48} className="text-gray-200 mb-6" strokeWidth={1} />
                <h2 className="text-xl font-black uppercase tracking-tight mb-2">No Products Found</h2>
                <p className="text-gray-500 max-w-md mx-auto text-sm">We couldn't find any products matching your current filters. Try adjusting your search or clearing the categories.</p>
                <button
                  onClick={handleClearAllFilters}
                  className="mt-8 bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-brand-accent transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
