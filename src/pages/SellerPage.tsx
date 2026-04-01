import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, MapPin, Star, ShoppingBag, Phone, ArrowRight, ChevronRight, ShieldCheck, Loader2, UserPlus, UserMinus } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { motion } from 'motion/react';
import { productService, authService } from '../services/api';
import { Product, User } from '../types';
import { formatWhatsAppNumber, formatDisplayPhone, cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export const SellerPage = () => {
  const { sellerId } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [seller, setSeller] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followLoading, setFollowLoading] = useState(false);
  const { user, setFollowingSellers, followingSellers } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (sellerId && followingSellers) {
      setIsFollowing(followingSellers.includes(sellerId));
    }
  }, [sellerId, followingSellers]);

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!sellerId) return;
      try {
        setLoading(true);
        const response = await productService.getSellerProducts(sellerId);
        const { products: fetchedProducts = [], seller: sellerData, sellerRating, totalReviews } = response.data;
        setProducts(fetchedProducts);
        setSeller({
          ...sellerData,
          rating: sellerRating,
          numReviews: totalReviews
        });
      } catch (err) {
        setError('فشل في تحميل بيانات البائع');
      } finally {
        setLoading(false);
      }
    };
    fetchSellerData();
  }, [sellerId]);

  const handleFollow = async () => {
    if (!user) {
      alert('يرجى تسجيل الدخول لمتابعة المتجر');
      return;
    }
    if (!sellerId || followLoading) return;
    
    setFollowLoading(true);
    try {
      const res = await authService.followSeller(sellerId);
      setFollowingSellers(res.data);
      setIsFollowing(res.data.includes(sellerId));
    } catch (error) {
      console.error('Error following seller:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!seller && !loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-black text-slate-900">البائع غير موجود أو ليس لديه منتجات</h2>
        <Link to="/products" className="text-primary font-bold hover:underline">العودة للمتجر</Link>
      </div>
    );
  }

  return (
    <div className="pb-20 bg-slate-50/30">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-xs text-secondary font-medium">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <ChevronRight className="w-3 h-3 rotate-180" />
          <Link to="/products" className="hover:text-primary">المنتجات</Link>
          <ChevronRight className="w-3 h-3 rotate-180" />
          <span className="text-slate-900">{seller?.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4">
        {/* Responsive Seller Header */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden mb-8">
          <div className="h-32 lg:h-48 bg-slate-900 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[100px] -ml-32 -mb-32 rounded-full"></div>
          </div>
          
          <div className="px-6 lg:px-12 pb-8 -mt-16 lg:-mt-24 relative z-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-end gap-6 lg:gap-10">
              {/* Avatar */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-32 h-32 lg:w-48 lg:h-48 bg-white rounded-[2.5rem] lg:rounded-[3.5rem] flex items-center justify-center text-5xl lg:text-7xl font-black border-4 lg:border-8 border-white shadow-2xl text-slate-900 shrink-0"
              >
                {seller?.name?.charAt(0) || 'S'}
              </motion.div>
              
              {/* Info */}
              <div className="flex-1 text-center lg:text-right pb-2">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6 mb-4 justify-center lg:justify-start overflow-hidden">
                  <h1 className="text-3xl lg:text-5xl font-black text-slate-900 font-kufi truncate max-w-full">{seller?.name}</h1>
                    <div className="flex items-center justify-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-100 font-geometric">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{seller?.rating || 0}</span>
                        <span className="text-[10px] text-amber-400 font-medium mr-1">({seller?.numReviews || 0})</span>
                      </div>
                      <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100 font-kufi">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>بائع موثوق</span>
                      </div>
                    </div>
                </div>
                
                <p className="text-secondary text-sm lg:text-base max-w-2xl leading-relaxed mb-0 lg:mb-2 font-kufi">
                  نحن نقدم أفضل المنتجات العالمية بجودة مضمونة وأسعار تنافسية. نسعى دائماً لتوفير تجربة تسوق فريدة لعملائنا.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:pb-4">
                <a 
                  href={`https://wa.me/${formatWhatsAppNumber(seller?.phone || '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-primary text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-kufi text-sm sm:text-base w-full sm:px-8"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="whitespace-nowrap">تواصل عبر واتساب</span>
                </a>
                <button 
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={cn(
                    "h-14 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border font-kufi text-sm sm:text-base w-full sm:px-8",
                    isFollowing 
                      ? "bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100" 
                      : "bg-slate-900 text-white border-slate-900 hover:bg-slate-800",
                    followLoading && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {followLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    isFollowing ? <UserMinus className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />
                  )}
                  <span className="whitespace-nowrap">{isFollowing ? 'إلغاء المتابعة' : 'متابعة المتجر'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Stats & Location */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6 lg:sticky lg:top-8 lg:h-fit">
            {/* Stats Card */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
              <h3 className="text-lg font-black text-slate-900 mb-6">إحصائيات المتجر</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-secondary font-kufi">المنتجات</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 font-geometric">{products.length}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                      <Phone className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-secondary font-kufi">رقم الهاتف</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 font-geometric py-1 leading-normal whitespace-nowrap" dir="ltr">
                    {formatDisplayPhone(seller?.phone || '')}
                  </span>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
              <h3 className="text-lg font-black text-slate-900 mb-6">الموقع</h3>
              <div className="flex items-start gap-3 text-secondary text-xs leading-relaxed">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>{seller?.location?.address}</span>
              </div>
            </div>
          </aside>

          {/* Main Content - Products */}
          <main className="flex-1">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-6 lg:p-8 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-1">منتجات المتجر</h2>
                  <p className="text-secondary text-xs lg:text-sm font-medium">استكشف جميع المنتجات المعروضة من قبل {seller?.name}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {products.length === 0 && (
              <div className="py-24 text-center bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">لا توجد منتجات حالياً</h3>
                <p className="text-secondary text-sm max-w-xs mx-auto">هذا البائع ليس لديه منتجات معروضة في الوقت الحالي.</p>
                <Link to="/products" className="inline-flex items-center gap-2 text-primary font-black mt-8 hover:gap-3 transition-all text-sm">
                  استكشف منتجات أخرى
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
