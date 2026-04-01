import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, ChevronDown, LayoutGrid, List, Star, X, Loader2 } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { productService } from '../services/api';
import { Product } from '../types';

export const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [onlySale, setOnlySale] = useState(searchParams.get('sale') === 'true');

  const brands = ['هيرميس', 'شانيل', 'رولكس', 'هكس'];
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
      if (searchInput) {
        setSearchParams(prev => {
          prev.set('search', searchInput);
          return prev;
        });
      } else {
        setSearchParams(prev => {
          prev.delete('search');
          return prev;
        });
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchInput, setSearchParams]);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    setOnlySale(searchParams.get('sale') === 'true');
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getProducts();
        setProducts(response.data);
      } catch (err) {
        setError('فشل في تحميل المنتجات');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesRating = selectedRating === null || (product.averageRating || 0) >= selectedRating;
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.some(brand => product.name.includes(brand));
      const matchesSale = !onlySale || product.isOnSale;
      
      return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesBrand && matchesSale;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, searchQuery, selectedCategory, priceRange, selectedRating, selectedBrands, sortBy]);

  const clearFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange([0, 2000]);
    setSelectedRating(null);
    setSelectedBrands([]);
    setOnlySale(false);
    setSearchParams({});
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 flex flex-col gap-10">
            <div>
              <h3 className="text-lg font-black text-slate-900 mb-6">التصنيفات</h3>
              <div className="flex flex-col gap-3">
                {[{ id: 'all', name: 'الكل' }, ...CATEGORIES].map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSearchParams(prev => {
                        if (cat.id === 'all') prev.delete('category');
                        else prev.set('category', cat.id);
                        return prev;
                      });
                    }}
                    className={cn(
                      "text-right text-sm font-bold transition-all px-4 py-2 rounded-xl",
                      selectedCategory === cat.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-secondary hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 mb-6">نطاق السعر</h3>
              <div className="px-2">
                <input 
                  type="range" 
                  min="0" 
                  max="2000" 
                  step="50"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full accent-primary h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex items-center justify-between mt-4 text-xs font-bold text-secondary">
                  <span>EGP 0</span>
                  <span className="text-primary font-black text-sm">EGP {priceRange[1]}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 mb-6">العروض</h3>
              <button 
                onClick={() => {
                  const newValue = !onlySale;
                  setOnlySale(newValue);
                  setSearchParams(prev => {
                    if (newValue) prev.set('sale', 'true');
                    else prev.delete('sale');
                    return prev;
                  });
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
                  onlySale ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm" : "bg-white border-slate-200 text-secondary hover:border-primary"
                )}
              >
                <span className="text-sm font-bold">منتجات في العرض</span>
                <div className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                  onlySale ? "bg-rose-500 border-rose-500" : "border-slate-200"
                )}>
                  {onlySale && <X className="w-3 h-3 text-white" />}
                </div>
              </button>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 mb-6">الماركات</h3>
              <div className="flex flex-wrap gap-2">
                {brands.map(brand => (
                  <button 
                    key={brand}
                    onClick={() => toggleBrand(brand)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                      selectedBrands.includes(brand) ? "bg-slate-900 text-white border-slate-900" : "bg-white text-secondary border-slate-200 hover:border-primary"
                    )}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 mb-6">التقييم</h3>
              <div className="flex flex-col gap-3">
                {[5, 4, 3, 2].map(rating => (
                  <button 
                    key={rating}
                    onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                    className={cn(
                      "flex items-center gap-2 text-sm font-bold transition-all px-3 py-2 rounded-xl",
                      selectedRating === rating ? "bg-amber-50 text-amber-600" : "text-secondary hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={cn("w-3 h-3", s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                      ))}
                    </div>
                    <span>أو أكثر</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header & Controls */}
          <div className="flex flex-col gap-8 mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">استكشف منتجاتنا</h1>
                <p className="text-secondary text-sm">تم العثور على {filteredProducts.length} منتج</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                  <input 
                    type="text" 
                    placeholder="ابحث عن منتج..." 
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl pr-12 pl-12 py-3 text-sm focus:ring-2 focus:ring-primary/20"
                  />
                  {searchInput && (
                    <button 
                      onClick={() => {
                        setSearchInput('');
                        setSearchQuery('');
                        setSearchParams(prev => {
                          prev.delete('search');
                          return prev;
                        });
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors text-secondary hover:text-primary"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden p-3 bg-white border border-slate-200 rounded-2xl text-secondary hover:text-primary transition-all"
                >
                  <Filter className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-y border-slate-100 py-4 gap-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-bold text-secondary">
                  ترتيب حسب: 
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="newest">الأحدث</option>
                    <option value="popularity">الأكثر شعبية</option>
                    <option value="price-low">السعر: من الأقل</option>
                    <option value="price-high">السعر: من الأعلى</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white text-primary shadow-sm" : "text-secondary")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white text-primary shadow-sm" : "text-secondary")}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Grid/List */}
          <div className={cn(
            "grid gap-8",
            viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
          )}>
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, i) => (
                <ProductCard key={`${product._id}-${i}`} product={product} view={viewMode} />
              ))}
            </AnimatePresence>
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <Search className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">لا توجد نتائج</h3>
                <p className="text-secondary">جرب تغيير معايير البحث أو الفلاتر</p>
                <button 
                  onClick={clearFilters}
                  className="mt-6 text-primary font-bold hover:underline"
                >
                  إعادة ضبط الفلاتر
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <div className="flex items-center justify-center mt-20 gap-2">
              <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-secondary hover:bg-slate-50 disabled:opacity-50" disabled>
                <ChevronDown className="w-4 h-4 rotate-90" />
              </button>
              <button className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-lg shadow-primary/20">1</button>
              <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-secondary hover:bg-slate-50">2</button>
              <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-secondary hover:bg-slate-50">3</button>
              <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-secondary hover:bg-slate-50">
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white z-[70] lg:hidden p-8 flex flex-col gap-10 overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">الفلاتر</h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={clearFilters}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    مسح الكل
                  </button>
                  <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-slate-50 rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 mb-6">التصنيفات</h3>
                <div className="flex flex-wrap gap-2">
                  {[{ id: 'all', name: 'الكل' }, ...CATEGORIES].map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSearchParams(prev => {
                          if (cat.id === 'all') prev.delete('category');
                          else prev.set('category', cat.id);
                          return prev;
                        });
                      }}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold border transition-all",
                        selectedCategory === cat.id ? "bg-primary text-white border-primary" : "bg-white text-secondary border-slate-200"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 mb-6">نطاق السعر</h3>
                <div className="px-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="2000" 
                    step="50"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-primary h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex items-center justify-between mt-4 text-xs font-bold text-secondary">
                    <span>0 ج.م</span>
                    <span className="text-primary font-black text-sm">{priceRange[1]} ج.م</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 mb-6">العروض</h3>
                <button 
                  onClick={() => {
                    const newValue = !onlySale;
                    setOnlySale(newValue);
                    setSearchParams(prev => {
                      if (newValue) prev.set('sale', 'true');
                      else prev.delete('sale');
                      return prev;
                    });
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
                    onlySale ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm" : "bg-white border-slate-200 text-secondary hover:border-primary"
                  )}
                >
                  <span className="text-sm font-bold">منتجات في العرض</span>
                  <div className={cn(
                    "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                    onlySale ? "bg-rose-500 border-rose-500" : "border-slate-200"
                  )}>
                    {onlySale && <X className="w-3 h-3 text-white" />}
                  </div>
                </button>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 mb-6">الماركات</h3>
                <div className="flex flex-wrap gap-2">
                  {brands.map(brand => (
                    <button 
                      key={brand}
                      onClick={() => toggleBrand(brand)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                        selectedBrands.includes(brand) ? "bg-slate-900 text-white border-slate-900" : "bg-white text-secondary border-slate-200"
                      )}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-slate-100">
                <button 
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold"
                >
                  عرض النتائج
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

