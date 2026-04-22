import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Smartphone,
  CreditCard,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/api';

const SellerTermsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await orderService.getPublicStats();
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const commissionPercent = stats ? (stats.commissionRate * 100).toFixed(0) : '10';
  const trialDays = stats ? stats.trialDurationDays : '30';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 shadow-inner" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex p-3 bg-primary/10 rounded-2xl text-primary"
          >
            <ShieldCheck className="w-8 h-8" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-black text-slate-900 font-kufi"
          >
            دليل وقوانين البائعين
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-secondary max-w-2xl mx-auto font-bold"
          >
            نحن هنا لنساعدك على النجاح وتنمية تجارتك. إليك كل ما تحتاج معرفته عن كيفية عمل نظامنا والعمولات وفترات السماح.
          </motion.p>
        </div>

        {/* Rule Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit relative z-10">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 relative z-10">الفترة التجريبية المجانية</h3>
            <p className="text-secondary text-sm leading-relaxed font-bold relative z-10">
              يحصل كل بائع جديد على فترة تجريبية مجانية مدتها <span className="text-emerald-600">{trialDays} يوماً</span>. خلال هذه الفترة، يمكنك إضافة عدد غير محدود من المنتجات واستقبال الطلبات بدون أي عمولة للمنصة.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit relative z-10">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 relative z-10">نظام العمولة</h3>
            <p className="text-secondary text-sm leading-relaxed font-bold relative z-10">
              بعد انتهاء الفترة التجريبية، يتم تطبيق عمولة بسيطة هي <span className="text-amber-600">{commissionPercent}%</span> على كل طلب يتم تأكيده أو توصيله من خلال المنصة. وتستخدم هذه العمولة لتطوير المنصة وتحسين حركة الزيارات لمتجرك.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl w-fit relative z-10">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 relative z-10">فترة السماح والقفل</h3>
            <p className="text-secondary text-sm leading-relaxed font-bold relative z-10">
              نمنحك <span className="text-rose-600">30 يوماً إضافية (فترة سماح)</span> بعد انتهاء التجربة لتدبير أمورك. إذا لم يتم تسديد مستحقات المنصة خلال هذه الفترة، سيتم قفل حسابك تلقائياً وسيتوقف استقبال الطلبات حتى يتم السداد.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <div className="p-3 bg-primary/10 text-primary rounded-xl w-fit relative z-10">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 relative z-10">طريقة الدفع (InstaPay)</h3>
            <p className="text-secondary text-sm leading-relaxed font-bold relative z-10">
              لتسهيل المعاملات، يتم الدفع للمنصة حصرياً عبر تطبيق إنستا باي على العنوان أو الرقم التالي: <br />
              <span className="text-primary font-black dir-ltr inline-block mt-1">01006763805</span>
            </p>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-black text-slate-900 font-kufi">أسئلة شائعة</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { 
                q: "ماذا يحدث إذا لم أسدد العمولة بعد شهر السماح؟", 
                a: "سيتم إخفاء أزرار الطلب من منتجاتك ولن تظهر في نتائج البحث بشكل بارز حتى يتم فتح الحساب." 
              },
              { 
                q: "هل يمكنني إلغاء الفترة التجريبية؟", 
                a: "الفترة التجريبية تبدأ تلقائياً وهي مصلحة لك لتجربة النظام، لا حاجة لإلغائها." 
              },
              { 
                q: "كيف أعرف كم علي من المستحقات؟", 
                a: "ستظهر لك تنبيهات في لوحة التحكم الخاصة بك توضح إجمالي العمولات المستحقة وتاريخ القفل القادم." 
              }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm"
              >
                <h4 className="font-black text-slate-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  {item.q}
                </h4>
                <p className="text-secondary text-sm font-bold leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-slate-900 text-white p-10 rounded-[3rem] text-center space-y-6 shadow-xl shadow-slate-200"
        >
          <div className="text-3xl font-black font-kufi">جاهز للبدء؟</div>
          <p className="text-slate-400 font-bold max-w-xl mx-auto">انضم الآن لأسرة البائعين وابدأ في عرض منتجاتك لمئات المشترين يومياً.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              to="/signup?role=seller" 
              className="px-10 h-14 bg-primary text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-primary/90 transition-all w-full sm:w-auto"
            >
              <CheckCircle2 className="w-5 h-5" />
              سجل كبائع الآن
            </Link>
            <Link 
              to="/" 
              className="px-10 h-14 bg-white/10 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-white/20 transition-all w-full sm:w-auto"
            >
              العودة للرئيسية
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SellerTermsPage;
