import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingBag, 
  ChevronLeft, 
  Search, 
  Loader2,
  Sparkles,
  Shirt,
  Watch,
  Footprints,
  Smartphone,
  Home,
  Palette,
  MoreHorizontal
} from 'lucide-react';
import { CATEGORIES } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { motion } from 'motion/react';
import { productService } from '../services/api';
import { Product } from '../types';

const IconMap: { [key: string]: any } = {
  Sparkles,
  Shirt,
  Watch,
  ShoppingBag,
  Footprints,
  Smartphone,
  Home,
  Palette,
  MoreHorizontal
};

export const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const saleProducts = products.filter(p => p.isOnSale);
  const latestProducts = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const topRatedProducts = [...products].sort((a, b) => b.averageRating - a.averageRating).slice(0, 4);

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-8">
        <div className="relative rounded-[2rem] overflow-hidden bg-slate-50 min-h-[500px] flex flex-col md:flex-row items-center">
          <div className="flex-1 p-8 md:p-16 z-10 text-right">
            <motion.h1 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-7xl font-black text-slate-900 leading-tight mb-6"
            >
              أفضل تشكيلة <br /> <span className="text-primary">من أجلك</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-600 text-lg mb-10 max-w-md ml-auto"
            >
              اكتشف روعة التصميم وأفضل جودة في مجموعتنا الجديدة لعام 2026. تسوق الآن واحصل على أفضل العروض.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link 
                to="/products" 
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary transition-all group"
              >
                ابدأ التسوق
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
          
          <div className="flex-1 relative w-full h-[300px] md:h-full">
            <motion.img 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              src="https://picsum.photos/seed/fashion/1000/1000" 
              alt="Hero"
              className="w-full h-full object-cover opacity-90"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-slate-50 via-transparent to-transparent md:block hidden"></div>
          </div>

          {/* Floating Search Bar */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] md:w-auto bg-white/80 backdrop-blur-md p-2 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center gap-2 border border-white/50">
            <div className="flex items-center gap-4 px-6 py-3 border-l border-slate-200 w-full md:w-auto flex-1">
              <div className="text-right w-full">
                <div className="text-[10px] font-bold text-slate-400 uppercase">ابحث عن</div>
                <input 
                  type="text" 
                  placeholder="ماذا تبحث عنه اليوم؟" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="text-sm font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 w-full text-right placeholder:text-slate-300"
                />
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4 px-6 py-3 border-l border-slate-200 w-full md:w-auto">
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase">الماركة</div>
                <div className="text-sm font-bold text-slate-900">كل الماركات</div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4 px-6 py-3 w-full md:w-auto">
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase">السعر</div>
                <div className="text-sm font-bold text-slate-900">جميع الأسعار</div>
              </div>
            </div>
            <button 
              onClick={handleSearch}
              className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-primary transition-colors shrink-0"
            >
              <Search className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>


      {/* Categories */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-slate-900">التصنيفات</h2>
          <Link to="/products" className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
            عرض الكل <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {CATEGORIES.map((cat, idx) => {
            const Icon = IconMap[cat.icon] || ShoppingBag;
            return (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                onClick={() => navigate(`/products?category=${cat.id}`)}
                className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center gap-4 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all cursor-pointer border border-transparent hover:border-slate-100 group"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Icon className="w-8 h-8" />
                </div>
                <span className="font-bold text-slate-800">{cat.name}</span>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Top Rated Section */}
      {topRatedProducts.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div className="text-right">
              <h2 className="text-3xl font-black text-slate-900 mb-2">الأعلى تقييماً</h2>
              <p className="text-slate-500 text-sm font-bold">المنتجات التي نالت إعجاب عملائنا</p>
            </div>
            <Link to="/products" className="group flex items-center gap-2 text-primary font-black text-sm">
              عرض الكل
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {topRatedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {saleProducts.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900">تخفيضات العام الجديد</h2>
            <div className="flex gap-2">
              <button className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors">
                <ChevronLeft className="w-5 h-5 rotate-180" />
              </button>
              <button className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {saleProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* All Collection */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-slate-900">كل المجموعة</h2>
          <Link to="/products" className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
            عرض الكل <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {latestProducts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-secondary font-bold">لا توجد منتجات متاحة حالياً</div>
          ) : (
            latestProducts.map((product) => (
              <ProductCard key={`all-${product._id}`} product={product} />
            ))
          )}
        </div>
      </section>
    </div>
  );
};
