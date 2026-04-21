import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export const CommissionChangeModal: React.FC = () => {
  const { user, acknowledgeCommission } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!user || user.role !== "seller" || !user.hasUnacknowledgedCommission)
    return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await acknowledgeCommission();
      toast.success("تم تأكيد استلام التحديث بنجاح");
    } catch (error) {
      toast.error("فشل في تأكيد التحديث، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white rounded-[2rem] sm:rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 my-auto"
          dir="rtl"
        >
          {/* Header */}
          <div className="bg-slate-900 p-6 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl opacity-50" />

            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/20 border border-primary/30 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-6 sm:mb-8 relative z-10"
            >
              <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10" />
            </motion.div>

            <h2 className="text-2xl sm:text-4xl font-black text-white mb-3 sm:mb-4 relative z-10 font-kufi leading-tight">
              تحديث هام لسياسة العمولات
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg font-bold relative z-10">
              يرجى العلم بأنه تم تحديث نسبة العمولة العامة للمنصة
            </p>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-12 space-y-6 sm:space-y-8">
            <div className="flex flex-row items-center justify-center gap-4 sm:gap-12">
              <div className="text-center group">
                <div className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-2 group-hover:text-primary transition-colors">
                  النسبة الجديدة
                </div>
                <div className="text-4xl sm:text-7xl font-black text-primary font-mono tracking-tighter">
                  {Math.round((user.commissionRate || 0) * 100)}%
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-8 sm:w-12 h-1 bg-slate-100 rounded-full mb-2 sm:mb-4" />
                <ShieldAlert className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 animate-pulse" />
                <div className="w-8 sm:w-12 h-1 bg-slate-100 rounded-full mt-2 sm:mb-4" />
              </div>

              <div className="text-center group">
                <div className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-2 group-hover:text-slate-900 transition-colors">
                  حالة الاستحقاق
                </div>
                <div className="text-lg sm:text-2xl font-black text-slate-900 font-kufi">
                  فعال الآن
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 space-y-3 sm:space-y-4">
              <h4 className="font-black text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                ماذا يعني هذا بالنسبة لك؟
              </h4>
              <p className="text-slate-600 text-xs sm:text-sm font-bold leading-relaxed">
                هذا التحديث يسري على جميع الطلبات التي يتم قبولها من قبلك
                ابتداءً من تاريخ التغيير. الهدف من هذا التحديث هو الاستمرار في
                تقديم أفضل تجربة بيع وتوفير ميزات تقنية جديدة لنمو متجرك وتطوير
                خدمات التوصيل.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full h-14 sm:h-16 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 group relative overflow-hidden"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 sm:w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span>أوافق وأؤكد استلام التحديث</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-center text-[9px] sm:text-[10px] text-slate-400 font-bold">
                بالضغط على الزر أعلاه، فإنك تقر بعلمك وموافقتك على نسبة العمولة
                الجديدة المطبقة.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
