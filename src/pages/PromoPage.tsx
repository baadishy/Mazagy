import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowLeft,
  ArrowRight,
  Package,
  Users,
  CheckCircle2,
  Play,
  Pause,
  Rocket,
  Globe,
  MessageCircle,
  DollarSign,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";

const scenes = [
  {
    id: 1,
    title: "مستقبلك التجاري يبدأ هنا",
    subtitle: "المنصة الأقوى والأذكى لنمو تجارتك في مصر",
    icon: Rocket,
    color: "from-blue-600 to-indigo-700",
    highlights: ["سرعة فائقة", "تصميم عصري", "سهولة تامة"],
  },
  {
    id: 2,
    title: "تجربة تسوق بلا حدود",
    subtitle: "تصفح آلاف المنتجات بلمسة واحدة مع واجهة مستخدم مذهلة",
    icon: ShoppingBag,
    color: "from-emerald-500 to-teal-600",
    highlights: ["قائمة المفضلة", "تتبع الطلبات", "تقييمات شفافة"],
  },
  {
    id: 3,
    title: "تواصل مباشر عبر واتساب",
    subtitle:
      "ربط فوري بين البائع والمشتري عبر واتساب لإتمام الصفقات بسرعة الصاروخ",
    icon: MessageCircle,
    color: "from-emerald-400 to-emerald-600",
    highlights: ["دردشة فورية", "تأكيد يدوي", "ثقة متبادلة"],
  },
  {
    id: 4,
    title: "سداد ذكي عبر InstaPay",
    subtitle: "نظام دفع محلي آمن وسريع يضمن حقوق الجميع ويسهل العمليات المالية",
    icon: DollarSign,
    color: "from-purple-500 to-indigo-600",
    highlights: ["تحويل لحظي", "تفعيل آلي", "أمان تام"],
  },
  {
    id: 5,
    title: "قوة التحكم للبائعين",
    subtitle: "لوحة تحكم ذكية، إحصائيات دقيقة، وإدارة كاملة لمنتجاتك",
    icon: TrendingUp,
    color: "from-slate-800 to-slate-900",
    highlights: ["إدارة المخزون", "تحليل الأرباح", "فترة تجريبية مجانية"],
  },
  {
    id: 6,
    title: "نظام عمولة عادل وشفاف",
    subtitle: "نحن شركاؤك في النجاح، نوفر لك كافة الأدوات لتنمو بسرعة",
    icon: ShieldCheck,
    color: "from-amber-500 to-orange-600",
    highlights: ["إشعارات التحديث", "دعم فني متواصل", "أمان وحماية"],
  },
  {
    id: 7,
    title: "جاهز للانطلاق؟",
    subtitle: "انضم إلى مئات التجار والآلاف من المشترين اليوم",
    icon: Globe,
    color: "from-indigo-600 to-purple-700",
    highlights: ["ابدأ مجاناً", "لا حاجة لخبرة برمجية", "تفعيل فوري"],
  },
];

export const PromoPage: React.FC = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentScene((prev) => (prev + 1) % scenes.length);
      }, 6000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const scene = scenes[currentScene];
  const Icon = scene.icon;

  return (
    <div
      className="h-[100dvh] w-full bg-slate-950 font-sans overflow-hidden select-none relative"
      dir="rtl"
    >
      {/* Dynamic Immersive Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className={`absolute inset-0 bg-gradient-to-br ${scene.color} transition-all duration-1000`}
        />
      </AnimatePresence>

      {/* Decorative Animated Particles/Shapes - Optimized for performance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-overlay">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -40, 0],
              x: [0, 20, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15 + i * 5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 1,
            }}
            className="absolute"
            style={{
              top: `${20 + i * 20}%`,
              left: `${Math.random() * 100}%`,
              willChange: "transform",
            }}
          >
            <div className="w-64 h-64 rounded-full bg-white/5 blur-[100px]" />
          </motion.div>
        ))}
      </div>

      {/* Vignette Overlay for focus */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none z-[1]" />

      {/* Top Navbar */}
      <nav className="absolute top-0 left-0 right-0 p-4 md:p-6 lg:p-8 flex justify-between items-start z-50">
        <div className="bg-white/10 backdrop-blur-xl rounded-[1.5rem] p-2 md:p-3 border border-white/20 shadow-2xl hover:bg-white/15 transition-all">
          <Link to="/" className="hover:scale-105 transition-transform block">
            <Logo className="h-8 md:h-12" variant="light" />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2.5 md:p-3 bg-white/20 backdrop-blur-2xl rounded-full border border-white/30 text-white hover:bg-white/40 transition-all shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <Play className="w-4 h-4 md:w-5 md:h-5 ml-0.5" />
            )}
          </button>
          <Link
            to="/signup"
            className="hidden sm:block px-6 py-2.5 md:px-8 md:py-3 bg-white text-slate-900 rounded-full font-black text-xs md:text-sm hover:translate-y-[-2px] active:translate-y-0 transition-all shadow-xl"
          >
            اشترك الآن
          </Link>
        </div>
      </nav>

      {/* Main Content Area (Scene) */}
      <main
        className="relative z-10 h-full w-full flex flex-col items-center justify-center pt-24 md:pt-32 lg:pt-40 pb-20 md:pb-28 lg:pb-32 px-4 md:px-10 lg:px-20 overflow-hidden"
        style={{ willChange: "transform" }}
      >
        <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-24 items-center">
          {/* Text Content */}
          <div
            className="order-2 md:order-1 text-center md:text-right space-y-4 md:space-y-8"
            style={{ willChange: "transform, opacity" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScene}
                initial={{ opacity: 0, x: 60, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -60, filter: "blur(10px)" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4 md:space-y-6"
                style={{ willChange: "transform, opacity, filter" }}
              >
                <div className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] md:text-xs font-black text-white uppercase border border-white/10">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>برؤية مستقبلية متكاملة</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight md:leading-[1.1] font-kufi drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  {scene.title}
                </h1>

                <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/90 font-bold max-w-xl mx-auto md:mx-0 leading-relaxed drop-shadow-lg">
                  {scene.subtitle}
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4 pt-2 md:pt-6">
                  {scene.highlights.map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="px-4 md:px-6 py-2 md:py-3.5 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center gap-2 md:gap-4 hover:bg-white/20 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      <span className="text-[10px] sm:text-xs md:text-sm lg:text-base font-black text-white">
                        {h}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Visual Content (Animated Illustration Area) */}
          <div
            className="order-1 md:order-2 flex justify-center items-center relative transform scale-75 sm:scale-85 md:scale-100 lg:scale-110 xl:scale-125 transition-transform duration-700"
            style={{ willChange: "transform" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScene}
                initial={{ opacity: 0, scale: 0.7, rotateY: -30 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 1.2, rotateY: 30 }}
                transition={{ type: "spring", stiffness: 60, damping: 15 }}
                className="relative"
                style={{ willChange: "transform, opacity" }}
              >
                {/* Visual Depth Glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${scene.color} opacity-30 blur-[100px] rounded-full scale-150`}
                />

                {/* Main Icon Illustration */}
                <motion.div
                  animate={{
                    y: [0, -15, 0],
                    rotateX: [0, 3, 0],
                    rotateY: [0, -3, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className={`relative w-40 h-40 sm:w-56 sm:h-56 md:w-96 md:h-96 bg-white/10 backdrop-blur-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] rounded-[3rem] md:rounded-[4rem] border border-white/20 flex items-center justify-center text-white`}
                >
                  <Icon className="w-20 h-20 sm:w-28 sm:h-28 md:w-48 md:h-48 drop-shadow-2xl" />
                  <div className="absolute inset-0 rounded-[3rem] md:rounded-[4rem] bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                </motion.div>

                {/* Floating Accents */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-6 -right-6 w-12 h-12 md:w-32 md:h-32 bg-white/20 backdrop-blur-3xl shadow-2xl rounded-2xl md:rounded-3xl flex items-center justify-center p-3 md:p-6 border border-white/30"
                >
                  <TrendingUp className="w-full h-full text-white" />
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute -bottom-6 -left-6 w-12 h-12 md:w-32 md:h-32 bg-white/20 backdrop-blur-3xl shadow-2xl rounded-2xl md:rounded-3xl flex items-center justify-center p-3 md:p-6 border border-white/30"
                >
                  <Users className="w-full h-full text-white" />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Modern Slim Progress Navigation */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-2 z-50 px-4">
        {scenes.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentScene(i);
              setIsPlaying(false);
            }}
            className="group relative h-6 flex items-center px-1"
          >
            <div
              className={`h-0.5 md:h-1 rounded-full transition-all duration-500 overflow-hidden ${i === currentScene ? "w-10 md:w-16 bg-white/30" : "w-3 md:w-4 bg-white/10 group-hover:bg-white/30"}`}
            >
              {i === currentScene && isPlaying && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 6, ease: "linear" }}
                  className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                />
              )}
              {i === currentScene && !isPlaying && (
                <div className="h-full w-full bg-white" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Background Stylized Branding */}
      <div className="absolute bottom-6 left-6 opacity-5 select-none pointer-events-none hidden lg:block">
        <span className="text-[10rem] font-black text-white whitespace-nowrap tracking-tighter">
          PREMIUM
        </span>
      </div>

      {/* Global CSS to fix potential scroll issues */}
      <style>{`
        body { overflow: hidden !important; }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
};
