import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, MessageCircle, ShoppingBag, Loader2, Truck, CheckCircle2, ShoppingCart, Share2 } from 'lucide-react';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { cn, formatWhatsAppNumber } from '../lib/utils';
import { orderService } from '../services/api';
import { CATEGORIES } from '../constants';

interface ProductCardProps {
  product: Product;
  view?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, view = 'grid' }) => {
  const { user, toggleWishlist } = useAuth();
  const navigate = useNavigate();
  const [isToggling, setIsToggling] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  
  const isWishlisted = user?.wishlist?.includes(product._id);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    setIsToggling(true);
    await toggleWishlist(product._id);
    setIsToggling(false);
  };

  const handleOrder = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
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
        price: product.isOnSale && product.salePrice ? product.salePrice : product.price,
        deliveryFee: product.deliveryAvailable ? product.deliveryFee : 0
      });
      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 3000);
    } catch (err) {
      console.error('Order failed:', err);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareData = {
      title: product.name,
      text: product.description,
      url: `${window.location.origin}/product/${product._id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
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

  const mainImage = product.images?.[0] || 'https://picsum.photos/seed/product/400/400';
  const displayPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
  const oldPrice = product.isOnSale && product.salePrice ? product.price : undefined;
  const categoryName = CATEGORIES.find(c => c.id === product.category)?.name || 'منتج';

  if (view === 'list') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 flex flex-col sm:flex-row p-2"
      >
        <Link to={`/product/${product._id}`} className="block relative w-full sm:w-56 aspect-square overflow-hidden rounded-[1.5rem] bg-slate-50 shrink-0">
          <img 
            src={mainImage} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          {oldPrice && (
            <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-red-500/20">
              -{Math.round(((oldPrice - displayPrice) / oldPrice) * 100)}%
            </div>
          )}
        </Link>
        
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                {categoryName}
              </span>
              {product.deliveryAvailable && (
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  توصيل
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-[10px] font-black">{product.averageRating || '0.0'}</span>
            </div>
          </div>

          <Link to={`/product/${product._id}`} className="block text-2xl font-black text-slate-900 mb-1 hover:text-primary transition-colors leading-tight">
            {product.name}
          </Link>
          
          <Link to={`/seller/${typeof product.sellerId === 'object' ? product.sellerId._id : product.sellerId}`} className="inline-block text-xs font-bold text-slate-400 hover:text-primary transition-colors mb-4">
            بواسطة: <span className="text-slate-600">{typeof product.sellerId === 'object' ? product.sellerId.name : 'بائع'}</span>
          </Link>

          <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed">
            {product.description}
          </p>
          
          <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{displayPrice} ج.م</span>
              {oldPrice && (
                <span className="text-sm text-slate-400 line-through font-bold">{oldPrice} ج.م</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleShare}
                disabled={shareLoading}
                className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:border-primary hover:text-primary flex items-center justify-center transition-all"
                title="مشاركة"
              >
                {shareLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
              </button>

              <button 
                onClick={handleWishlistToggle}
                disabled={isToggling}
                title={isWishlisted ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border",
                  isWishlisted 
                    ? "bg-red-50 border-red-100 text-red-500" 
                    : "bg-white border-slate-100 text-slate-400 hover:border-red-200 hover:text-red-500"
                )}
              >
                {isToggling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />}
              </button>
              
              <button 
                onClick={handleOrder}
                disabled={orderLoading || orderSuccess}
                className={cn(
                  "h-12 px-8 rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-xl",
                  orderSuccess 
                    ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                    : "bg-slate-900 text-white hover:bg-primary shadow-slate-900/10"
                )}
              >
                {orderLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : orderSuccess ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
                {orderSuccess ? 'تم الطلب' : 'اطلب الآن'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 flex flex-col"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-50 m-2 rounded-[2rem]">
        <Link to={`/product/${product._id}`} className="block w-full h-full">
          <img 
            src={mainImage} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
        </Link>
        
        {/* Floating Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-0 md:translate-x-12 md:group-hover:translate-x-0 transition-transform duration-500">
          <button 
            onClick={handleShare}
            disabled={shareLoading}
            className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all shadow-lg"
            title="مشاركة"
          >
            {shareLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={handleWishlistToggle}
            disabled={isToggling}
            title={isWishlisted ? "إزالة من المفضلة" : "إضافة للمفضلة"}
            className={cn(
              "w-10 h-10 backdrop-blur-md rounded-2xl flex items-center justify-center transition-all shadow-lg",
              isWishlisted 
                ? "bg-red-500 text-white" 
                : "bg-white/90 text-slate-600 hover:bg-white hover:text-red-500"
            )}
          >
            {isToggling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />}
          </button>
          <a 
            href={`https://wa.me/${formatWhatsAppNumber(product.sellerId?.phone)}`}
            target="_blank"
            rel="noreferrer"
            className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
        </div>

        {oldPrice && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-red-500/20">
            -{Math.round(((oldPrice - displayPrice) / oldPrice) * 100)}%
          </div>
        )}

        {/* Quick View Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-500">
          <button 
            onClick={handleOrder}
            disabled={orderLoading || orderSuccess}
            className={cn(
              "w-full h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2 backdrop-blur-md shadow-xl transition-all",
              orderSuccess 
                ? "bg-emerald-500 text-white" 
                : "bg-white/95 text-slate-900 hover:bg-primary hover:text-white"
            )}
          >
            {orderLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : orderSuccess ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
            {orderSuccess ? 'تم الطلب' : 'اطلب الآن'}
          </button>
        </div>
      </div>
      
      <div className="p-6 pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Star className={cn("w-3.5 h-3.5", product.averageRating > 0 ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
            <span className="text-xs font-black text-slate-900">{product.averageRating || '0.0'}</span>
            {product.numReviews > 0 && (
              <span className="text-[10px] text-slate-400 font-bold">({product.numReviews})</span>
            )}
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {categoryName}
          </span>
        </div>

        <Link to={`/product/${product._id}`} className="block text-xl font-black text-slate-900 mb-1 hover:text-primary transition-colors line-clamp-1 leading-tight">
          {product.name}
        </Link>
        
        <Link to={`/seller/${typeof product.sellerId === 'object' ? product.sellerId._id : product.sellerId}`} className="block text-[11px] font-bold text-slate-400 hover:text-primary transition-colors mb-4">
          بواسطة: <span className="text-slate-600">{typeof product.sellerId === 'object' ? product.sellerId.name : 'بائع'}</span>
        </Link>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            {oldPrice && (
              <span className="text-[10px] text-slate-400 line-through font-bold mb-0.5">{oldPrice} ج.م</span>
            )}
            <span className="text-2xl font-black text-slate-900 leading-none">{displayPrice} ج.م</span>
          </div>
          
          {product.deliveryAvailable && (
            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              <Truck className="w-3 h-3" />
              توصيل
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};



