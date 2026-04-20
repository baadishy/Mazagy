import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingCart, ShieldCheck, Truck, MessageCircle, ChevronRight, ShoppingBag, Loader2, CheckCircle2, Send, Trash2, MapPin, Phone, Clock, Share2, Palette, Ruler } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { productService, orderService, reviewService, authService } from '../services/api';
import { Product, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { cn, formatWhatsAppNumber, formatDisplayPhone } from '../lib/utils';
import { CATEGORIES } from '../constants';
import { toast } from 'sonner';

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, toggleWishlist } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [sellerProfile, setSellerProfile] = useState<User | null>(null);
  const [sellerProductsCount, setSellerProductsCount] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [productRes, allProductsRes, reviewsRes] = await Promise.all([
          productService.getProduct(id),
          productService.getProducts(),
          reviewService.getReviews(id)
        ]);
        const productData = productRes.data;
        setProduct(productData);
        setReviews(reviewsRes.data);
        setSelectedImage(productData.images?.[0] || 'https://picsum.photos/seed/product/800/800');
        setRelatedProducts(allProductsRes.data.filter((p: Product) => p._id !== id).slice(0, 4));

        // Fetch seller details and product count
        const sellerId = typeof productData.sellerId === 'object' ? productData.sellerId._id : productData.sellerId;
        if (sellerId) {
          try {
            const sellerProductsRes = await productService.getSellerProducts(sellerId);
            const { products: fetchedProducts, seller: sellerData, sellerRating } = sellerProductsRes.data;
            
            setSellerProfile({
              ...sellerData,
              rating: sellerRating
            });
            setSellerProductsCount(fetchedProducts.length);
          } catch (err) {
            console.error('Failed to fetch seller details', err);
          }
        }
      } catch (err) {
        setError('فشل في تحميل تفاصيل المنتج');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    setSubmittingReview(true);
    try {
      await reviewService.createReview({
        productId: id,
        rating,
        comment
      });
      // Refresh reviews and product rating
      const [reviewsRes, productRes] = await Promise.all([
        reviewService.getReviews(id),
        productService.getProduct(id)
      ]);
      setReviews(reviewsRes.data);
      setProduct(productRes.data);
      setComment('');
      setRating(5);
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل في إضافة التقييم');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!id) return;
    try {
      await reviewService.deleteReview(reviewId);
      const [reviewsRes, productRes] = await Promise.all([
        reviewService.getReviews(id),
        productService.getProduct(id)
      ]);
      setReviews(reviewsRes.data);
      setProduct(productRes.data);
    } catch (err) {
      alert('فشل في حذف التقييم');
    }
  };

  const handleOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!product) return;

    if (product.colors?.length && !selectedColor) {
      toast.error('يرجى اختيار اللون أولاً');
      return;
    }

    if (product.sizes?.length && !selectedSize) {
      toast.error('يرجى اختيار المقاس أولاً');
      return;
    }

    setOrderLoading(true);
    try {
      await orderService.createOrder({
        productId: product._id,
        sellerId: typeof product.sellerId === 'object' ? product.sellerId._id : product.sellerId,
        buyerName: user.name,
        buyerPhone: user.phone,
        buyerAddress: user.location?.address || '',
        quantity: 1,
        selectedColor,
        selectedSize,
        price: product.isOnSale && product.salePrice ? product.salePrice : product.price,
        deliveryFee: product.deliveryAvailable ? product.deliveryFee : 0
      });
      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 5000);
    } catch (err) {
      alert('فشل في إتمام الطلب، يرجى المحاولة مرة أخرى');
    } finally {
      setOrderLoading(false);
    }
  };

  const handleShare = async () => {
    if (!product) return;
    
    const shareData = {
      title: product.name,
      text: product.description,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        setShareLoading(true);
        await navigator.clipboard.writeText(shareData.url);
        alert('تم نسخ رابط المنتج!');
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      } finally {
        setShareLoading(false);
      }
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!product) return;

    setIsTogglingWishlist(true);
    await toggleWishlist(product._id);
    setIsTogglingWishlist(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-black text-slate-900">المنتج غير موجود</h2>
        <Link to="/products" className="text-primary font-bold hover:underline">العودة للمتجر</Link>
      </div>
    );
  }

  const displayPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
  const categoryName = CATEGORIES.find(c => c.id === product.category)?.name || 'منتج';
  const isWishlisted = user?.wishlist?.includes(product._id);

  return (
    <div className="pb-20">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-xs text-secondary font-medium">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <ChevronRight className="w-3 h-3 rotate-180" />
          <Link to="/products" className="hover:text-primary">المنتجات</Link>
          <ChevronRight className="w-3 h-3 rotate-180" />
          <span className="text-slate-900">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100"
            >
              <img 
                src={selectedImage} 
                alt={product.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div className="grid grid-cols-4 gap-4">
              {product.images?.map((img, i) => (
                <button 
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {categoryName}
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleShare}
                  disabled={shareLoading}
                  className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-primary hover:bg-blue-50 transition-all"
                  title="مشاركة"
                >
                  {shareLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
                </button>
                <button 
                  onClick={handleWishlistToggle}
                  disabled={isTogglingWishlist}
                  title={isWishlisted ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                  className={cn(
                    "w-10 h-10 border rounded-full flex items-center justify-center transition-all",
                    isWishlisted 
                      ? "bg-red-50 border-red-100 text-red-500" 
                      : "border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50"
                  )}
                >
                  {isTogglingWishlist ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />}
                </button>
              </div>
            </div>

            <h1 className="text-4xl font-black text-slate-900">{product.name}</h1>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.averageRating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                ))}
                <span className="text-sm font-bold text-slate-900 mr-2">{product.averageRating || '0.0'}</span>
                <span className="text-sm text-secondary">({product.numReviews || 0} تقييم)</span>
              </div>
            </div>

            <div className="text-5xl font-black text-primary mb-2">{displayPrice} ج.م</div>

            {/* Selection Options */}
            <div className="flex flex-col gap-8 py-6 border-y border-slate-100 my-4">
              {(product.colors?.length || 0) > 0 && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-slate-900 font-black">
                    <Palette className="w-4 h-4 text-primary" />
                    <h3 className="text-sm">اختر اللون المفضل</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.colors?.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "px-5 py-2.5 rounded-2xl text-xs font-black border transition-all relative overflow-hidden group",
                          selectedColor === color 
                            ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200" 
                            : "bg-white text-slate-500 border-slate-200 hover:border-primary hover:text-primary"
                        )}
                      >
                        {color}
                        {selectedColor === color && (
                          <motion.div 
                            layoutId="color-check"
                            className="absolute inset-0 bg-primary/10 pointer-events-none"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(product.sizes?.length || 0) > 0 && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-slate-900 font-black">
                    <Ruler className="w-4 h-4 text-primary" />
                    <h3 className="text-sm">اختر المقاس المناسب</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes?.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "px-5 py-2.5 rounded-2xl text-xs font-black border transition-all relative overflow-hidden group",
                          selectedSize === size 
                            ? "bg-primary text-white border-primary shadow-xl shadow-primary/20" 
                            : "bg-white text-slate-500 border-slate-200 hover:border-primary hover:text-primary"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-slate-900">الوصف</h3>
              <p className="text-secondary leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
              {product.sellerId?.isLocked ? (
                <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl text-center">
                  <div className="flex items-center justify-center gap-2 text-rose-600 font-black mb-2">
                    <ShieldCheck className="w-5 h-5" />
                    المتجر متوقف مؤقتاً
                  </div>
                  <p className="text-secondary text-sm font-bold">عذراً، هذا البائع غير متاح حالياً لاستقبال الطلبات بسبب أعمال صيانة في الحساب.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleOrder}
                    disabled={orderLoading}
                    className="flex-1 bg-slate-900 text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                  >
                    {orderLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                    اطلب الآن
                  </button>
                  <a 
                    href={`https://wa.me/${formatWhatsAppNumber(product.sellerId?.phone || '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 border-2 border-primary text-primary h-14 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    تواصل عبر واتساب
                  </a>
                </div>
              )}
            </div>

            <AnimatePresence>
              {orderSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center gap-3 font-bold"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  تم إرسال طلبك بنجاح! سيقوم البائع بالتواصل معك قريباً.
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {product.deliveryAvailable ? `توصيل متاح (${product.deliveryFee} ج.م)` : 'توصيل غير متاح'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {product.deliveryAvailable ? 'توصيل سريع لباب المنزل' : 'يرجى التواصل مع البائع'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {product.warranty === '6 months' ? 'ضمان 6 أشهر' :
                     product.warranty === '1 year' ? 'ضمان لمدة عام' :
                     product.warranty === '2 years' ? 'ضمان لمدة عامين' :
                     product.warranty === '3 years' ? 'ضمان لمدة 3 سنوات' :
                     product.warranty === 'lifetime' ? 'ضمان مدى الحياة' : 'بدون ضمان'}
                  </div>
                  <div className="text-[10px] text-slate-500">ضمان جودة معتمد</div>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="mt-12 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 flex-1">
                  <div className="relative">
                    <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center font-black text-4xl text-primary border border-slate-100 shadow-sm overflow-hidden">
                      {typeof product.sellerId === 'object' ? (product.sellerId.name?.charAt(0) || 'S') : 'S'}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  </div>
                  
                  <div className="text-center md:text-right flex-1">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                      <h3 className="text-2xl font-black text-slate-900">
                        {typeof product.sellerId === 'object' ? product.sellerId.name : 'بائع'}
                      </h3>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-wider">موثوق</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mb-6">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{typeof product.sellerId === 'object' ? (product.sellerId.location?.address || 'القاهرة، مصر') : 'مصر'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Phone className="w-4 h-4 text-emerald-500" />
                        <span dir="ltr">{typeof product.sellerId === 'object' ? formatDisplayPhone(product.sellerId.phone) : ''}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto md:mx-0">
                      <div className="bg-slate-50 p-4 rounded-2xl text-center">
                        <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-black">
                            {sellerProfile?.rating !== undefined && sellerProfile.rating > 0 ? sellerProfile.rating.toFixed(1) : 'جديد'}
                          </span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400">التقييم</div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl text-center">
                        <div className="text-sm font-black text-slate-900 mb-1">
                          {sellerProductsCount || 0}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400">منتج</div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl text-center">
                        <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-black">سريع</span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400">الرد</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full lg:w-auto">
                  {product.sellerId?.isLocked ? (
                    <div className="bg-rose-50 text-rose-600 px-6 py-4 rounded-2xl text-xs font-black text-center border border-rose-100">
                      البائع متوقف مؤقتاً
                    </div>
                  ) : (
                    <>
                      <a 
                        href={`https://wa.me/${formatWhatsAppNumber(typeof product.sellerId === 'object' ? product.sellerId.phone : '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full lg:w-56 h-14 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-5 h-5" />
                        تواصل واتساب
                      </a>
                      <Link 
                        to={`/seller/${typeof product.sellerId === 'object' ? product.sellerId._id : product.sellerId}`} 
                        className="w-full lg:w-56 h-14 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-primary transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        زيارة المتجر
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black text-slate-900 mb-8">تقييمات العملاء</h2>
            
            {reviews.length === 0 ? (
              <div className="bg-slate-50 p-12 rounded-[2.5rem] text-center">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Star className="w-8 h-8 text-slate-200" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">لا توجد تقييمات بعد</h4>
                <p className="text-secondary text-sm">كن أول من يقيم هذا المنتج ويشارك تجربته</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
                          {review.userId?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{review.userId?.name}</div>
                          <div className="text-[10px] text-secondary">
                            {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{review.comment}</p>
                    {(user?._id === review.userId?._id || user?.role === 'admin' || user?.role === 'moderator') && (
                      <button 
                        onClick={() => handleDeleteReview(review._id)}
                        className="mt-4 text-xs text-rose-500 font-bold hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> حذف التقييم
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white sticky top-24">
              <h3 className="text-xl font-black mb-6">أضف تقييمك</h3>
              {user ? (
                <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/60 mb-2">التقييم</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star className={cn("w-6 h-6", s <= rating ? "fill-amber-400 text-amber-400" : "text-white/20")} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/60 mb-2">رأيك في المنتج</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                      placeholder="اكتب تجربتك هنا..."
                      className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full bg-primary text-white h-12 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    إرسال التقييم
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-white/60 mb-4">يرجى تسجيل الدخول لتتمكن من تقييم المنتج</p>
                  <Link to="/login" className="inline-block bg-white text-slate-900 px-6 py-2 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all">
                    تسجيل الدخول
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900">استكشف المزيد</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
