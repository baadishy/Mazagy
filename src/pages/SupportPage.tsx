import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2, Globe, ShieldCheck, Zap } from 'lucide-react';
import { orderService } from '../services/api';
import { Logo } from '../components/Logo';

export const SupportPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await orderService.getPublicStats();
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-12"
        >
          {/* Header with Logo */}
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Logo className="scale-150 origin-center" variant="dark" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black text-slate-900">من نحن</h1>
              <p className="text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
                نحن نسعى لتقديم أفضل تجربة تسوق إلكتروني في مصر والوطن العربي، مع التركيز على الجودة والسرعة ورضا العملاء.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-slate-50">
            <div className="text-center space-y-2">
              <div className="text-4xl font-black text-primary">{stats?.totalOrders || 0}</div>
              <div className="text-sm font-bold text-slate-900 uppercase tracking-wider">طلب مكتمل</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-black text-primary">{stats?.buyersCount || 0}</div>
              <div className="text-sm font-bold text-slate-900 uppercase tracking-wider">مشتري</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-black text-primary">{stats?.sellersCount || 0}</div>
              <div className="text-sm font-bold text-slate-900 uppercase tracking-wider">بائع</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-black text-primary">100%</div>
              <div className="text-sm font-bold text-slate-900 uppercase tracking-wider">جودة مضمونة</div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-6 rounded-3xl flex flex-col items-center text-center gap-3 border border-slate-100">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-900">تغطية واسعة</div>
                <div className="text-[10px] text-secondary font-bold uppercase mt-1">نصل إليك في كل مكان</div>
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl flex flex-col items-center text-center gap-3 border border-slate-100">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-900">تسوق آمن</div>
                <div className="text-[10px] text-secondary font-bold uppercase mt-1">حماية كاملة لبياناتك</div>
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl flex flex-col items-center text-center gap-3 border border-slate-100">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-900">سرعة فائقة</div>
                <div className="text-[10px] text-secondary font-bold uppercase mt-1">توصيل سريع وموثوق</div>
              </div>
            </div>
          </div>

          {/* Vision */}
          <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10">
            <h3 className="text-xl font-black text-slate-900 mb-4">رؤيتنا</h3>
            <p className="text-secondary text-sm leading-relaxed">
              نحن نؤمن بأن الجودة والشفافية هما أساس النجاح. في متجرنا، نحرص على اختيار كل منتج بعناية فائقة لضمان رضاكم التام. هدفنا هو بناء علاقة ثقة طويلة الأمد مع كل عميل من خلال تقديم أفضل المنتجات والخدمات.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
