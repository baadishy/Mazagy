import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  DollarSign,
  Settings,
  Bell,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Plus,
  MoreHorizontal,
  LogOut,
  ChevronRight,
  Loader2,
  Edit,
  Trash2,
  Eye,
  Truck,
  ShieldCheck,
  MapPin,
  MessageCircle,
  Tag as TagIcon,
  PieChart as PieChartIcon,
  ArrowRight,
  BarChart3,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Clock,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { cn, formatWhatsAppNumber, formatDisplayPhone } from "../lib/utils";
import {
  orderService,
  productService,
  authService,
  settingsService,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { NotificationBell } from "../components/NotificationBell";
import { Logo } from "../components/Logo";

const DashboardContext = React.createContext<{
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}>({
  searchQuery: "",
  setSearchQuery: () => {},
});

export const useDashboard = () => React.useContext(DashboardContext);

export const DashboardLayout = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading, acknowledgeRules } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [ackLoading, setAckLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const isAdmin = user?.role === "admin" || user?.role === "moderator";
  const isAdminPath = location.pathname.startsWith("/admin");

  useEffect(() => {
    const fetchStats = async () => {
      if (user?.role === "seller" && !user?.hasSeenRules) {
        try {
          const res = await orderService.getPublicStats();
          setStats(res.data);
        } catch (error) {
          console.error("Failed to fetch stats", error);
        }
      }
    };
    fetchStats();
  }, [user]);

  const commissionPercent = stats
    ? (stats.commissionRate * 100).toFixed(0)
    : "...";
  const trialDays = stats ? stats.trialDurationDays : "...";

  useEffect(() => {
    if (
      !loading &&
      isAdminPath &&
      user?.role !== "admin" &&
      user?.role !== "moderator"
    ) {
      toast.error("غير مصرح لك بالدخول لهذه الصفحة");
      navigate("/login");
    }
  }, [user, loading, isAdminPath, navigate]);

  if (loading || (user?.role === "seller" && !user?.hasSeenRules && !stats)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const menuItems = [
    {
      name: "لوحة التحكم",
      icon: LayoutDashboard,
      path: isAdmin ? "/admin" : "/seller",
    },
    {
      name: "الطلبات",
      icon: ShoppingBag,
      path: isAdmin ? "/admin/orders" : "/seller/orders",
    },
    {
      name: "المنتجات",
      icon: Package,
      path: isAdmin ? "/admin/products" : "/seller/products",
    },
    {
      name: "الأرباح",
      icon: DollarSign,
      path: isAdmin ? "/admin/earnings" : "/seller/earnings",
    },
    ...(isAdmin
      ? [
          { name: "البائعين", icon: ShieldCheck, path: "/admin/sellers" },
          { name: "المستخدمين", icon: Users, path: "/admin/users" },
          { name: "إعدادات المنصة", icon: Settings, path: "/admin/settings" },
        ]
      : []),
    { name: "حسابي", icon: Users, path: "/profile" },
  ];

  return (
    <div
      className="min-h-screen bg-slate-50 flex flex-col md:flex-row"
      dir="rtl"
    >
      {/* Locked Overlay */}
      {user?.role === "seller" && user?.isLocked && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 max-w-lg w-full shadow-2xl relative overflow-hidden my-8"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 sm:h-2 bg-rose-500" />

            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-100 rounded-2xl sm:rounded-3xl flex items-center justify-center text-rose-600 mx-auto mb-6 sm:mb-8 shadow-inner">
              <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mb-3 sm:mb-4">
              حسابك متوقف مؤقتاً
            </h2>

            <p className="text-secondary text-sm sm:text-base leading-relaxed mb-6 sm:mb-10 text-center">
              لقد انتهت فترة السماح (شهر بعد الفترة التجريبية). يرجى إتمام عملية
              الدفع لتتمكن من الوصول إلى لوحة التحكم واستقبال الطلبات مرة أخرى.
            </p>

            <div className="bg-slate-50 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 mb-6 sm:mb-10 text-right">
              <span className="text-[10px] font-black text-primary block mb-3 uppercase tracking-widest">
                طريقة الدفع المقبولة
              </span>

              <div className="flex items-center gap-3 sm:gap-4 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-base sm:text-lg font-black text-slate-900 truncate">
                    إنستا باي (InstaPay)
                  </div>
                  <div
                    className="text-xs sm:text-sm font-bold text-slate-500 select-all"
                    dir="ltr"
                  >
                    01006763805
                  </div>
                </div>
              </div>

              <p className="text-[11px] sm:text-xs text-secondary leading-relaxed bg-white/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100">
                بمجرد إتمام التحويل، يرجى التواصل مع الإدارة على الرقم
                01559993943. سيقوم المسؤول بمراجعة الطلب وتفعيل حسابك يدوياً فور
                التأكد.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
              <button
                onClick={logout}
                className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" /> تسجيل الخروج
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2 rounded-xl font-bold text-xs sm:text-sm text-slate-400 hover:text-primary transition-all underline underline-offset-4 sm:underline-offset-8"
              >
                تحديث الصفحة بعد الدفع
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Rules Modal for New Sellers */}
      {user?.role === "seller" && !user?.hasSeenRules && (
        <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 text-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
          >
            <div className="p-8 md:p-12 space-y-8">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
                <ShieldCheck className="w-10 h-10" />
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 font-kufi">
                  أهلاً بك في أسرة بائعينا!
                </h2>
                <p className="text-secondary text-sm font-bold leading-relaxed">
                  نحن سعداء بانضمامك إلينا. للبدء بشكل صحيح، يرجى قراءة وفهم
                  قوانين المنصة الأساسية لضمان أفضل تجربة لك ولعملائك.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex-shrink-0 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm mb-1">
                      {trialDays} يوم تجربة مجانية
                    </h4>
                    <p className="text-[10px] text-secondary font-bold">
                      ابدأ متجرك بدون أي عمولات لمدة {trialDays} يوماً.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-2xl flex-shrink-0 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm mb-1">
                      عمولة بسيطة {commissionPercent}%
                    </h4>
                    <p className="text-[10px] text-secondary font-bold">
                      بعد انتهاء التجربة، يتم خصم {commissionPercent}% فقط من كل
                      طلب.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-start gap-4">
                  <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-2xl flex-shrink-0 flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm mb-1">
                      فترة سماح إضافية
                    </h4>
                    <p className="text-[10px] text-secondary font-bold">
                      شهر كامل بعد التجربة قبل قفل الحساب في حال عدم السداد.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-2xl flex-shrink-0 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm mb-1">
                      دفع عبر InstaPay
                    </h4>
                    <p className="text-[10px] text-secondary font-bold">
                      تحويل العمولات يتم بسهولة عبر تطبيق إنستا باي.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <button
                  disabled={ackLoading}
                  onClick={async () => {
                    setAckLoading(true);
                    try {
                      await acknowledgeRules();
                      toast.success(
                        "تمت الموافقة على القوانين، نتمنى لك تجارة رابحة!",
                      );
                    } catch (error) {
                      toast.error("حدث خطأ أثناء الموافقة");
                    } finally {
                      setAckLoading(false);
                    }
                  }}
                  className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                  {ackLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6" />
                  )}
                  أوافق على القوانين والبدء الآن
                </button>
                <Link
                  to="/seller/terms"
                  target="_blank"
                  className="text-sm text-secondary font-bold underline underline-offset-4 hover:text-primary transition-all block"
                >
                  قراءة الدليل الكامل والقوانين
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-56 lg:w-64 bg-white border-l border-slate-200 p-4 lg:p-6 flex-col gap-8 sticky top-0 h-screen overflow-y-auto">
        <Link to="/" className="flex items-center px-2">
          <Logo className="h-10" />
        </Link>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                location.pathname === item.path
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-secondary hover:bg-slate-50 hover:text-primary",
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-auto">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] overflow-x-auto no-scrollbar">
        <div className="flex items-center min-w-full px-2 py-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-all flex-1 min-w-[85px] py-2 relative shrink-0",
                  isActive ? "text-primary" : "text-slate-400",
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-xl transition-all duration-300",
                    isActive ? "bg-primary/10 scale-110" : "bg-transparent",
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-6 h-6",
                      isActive ? "stroke-[2.5px]" : "stroke-[2px]",
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-[11px] font-bold tracking-tight whitespace-nowrap px-1",
                    isActive ? "text-primary" : "text-slate-500",
                  )}
                >
                  {item.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute top-0 w-10 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-hidden min-w-0 pb-24 md:pb-8">
        {/* Top Bar */}
        <header className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="text-2xl font-black text-slate-900">{title}</h1>
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
              <input
                type="text"
                placeholder="بحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-48 xl:w-64"
              />
            </div>
            <NotificationBell />
            <Link
              to="/profile"
              className="w-10 h-10 bg-slate-200 rounded-xl overflow-hidden border-2 border-white shadow-sm"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "")}&background=random&size=100`}
                alt="User"
                className="w-full h-full object-cover"
              />
            </Link>
          </div>
        </header>

        <DashboardContext.Provider value={{ searchQuery, setSearchQuery }}>
          {children}
        </DashboardContext.Provider>
      </main>
    </div>
  );
};

const DashboardSettings = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsService.getSettings();
        setSettings(res.data);
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("فشل تحميل الإعدادات");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.updateSettings(settings);
      toast.success("تم تحديث الإعدادات بنجاح");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("فشل تحديث الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <h3 className="text-lg font-black text-slate-900 mb-8">إعدادات المنصة</h3>

      <form onSubmit={handleUpdate} className="max-w-2xl flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-secondary">
              نسبة العمولة العامة (%)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              max="25"
              placeholder="0"
              value={
                settings.globalCommissionRate === 0
                  ? ""
                  : Number(
                      (settings.globalCommissionRate * 100).toFixed(5),
                    ).toString()
              }
              onChange={(e) => {
                const rawValue = e.target.value;
                if (rawValue === "") {
                  setSettings({ ...settings, globalCommissionRate: 0 });
                  return;
                }

                const val = parseFloat(rawValue);
                if (isNaN(val)) return;

                if (val > 25) {
                  toast.error("الحد الأقصى للعمولة هو 25%");
                  return;
                }

                setSettings({ ...settings, globalCommissionRate: val / 100 });
              }}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-[10px] text-slate-400">
              تُطبق على جميع الطلبات الجديدة وتُحسب بمجرد قبول البائع للطلب (بحد
              أقصى 25%)
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-secondary">
              مدة الفترة التجريبية (بالأيام)
            </label>
            <input
              type="number"
              value={settings.trialDurationDays || 30}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  trialDurationDays: parseInt(e.target.value) || 30,
                })
              }
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl">
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              تفعيل نظام الفترة التجريبية
            </h4>
            <p className="text-[10px] text-secondary">
              عند تفعيل هذا الخيار، سيحصل البائعون الجدد على فترة تجريبية بدون
              عمولة
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setSettings({
                ...settings,
                isTrialEnabled: !settings.isTrialEnabled,
              })
            }
            className={cn(
              "w-12 h-6 rounded-full transition-all relative",
              settings.isTrialEnabled ? "bg-primary" : "bg-slate-200",
            )}
          >
            <div
              className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                settings.isTrialEnabled ? "left-1" : "left-7",
              )}
            />
          </button>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full md:w-fit px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-lg shadow-slate-200 hover:bg-primary transition-all disabled:opacity-50"
        >
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </form>
    </div>
  );
};

export const DashboardOrders = ({ sellerId }: { sellerId?: string }) => {
  const { user } = useAuth();
  const location = useLocation();
  const path = location.pathname;
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [confirmingAction, setConfirmingAction] = useState<{
    id: string;
    status: string;
    name: string;
  } | null>(null);
  const [viewingLogs, setViewingLogs] = useState<any[] | null>(null);
  const { searchQuery, setSearchQuery } = useDashboard();

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await orderService.getOrders();
      let fetchedOrders = Array.isArray(res.data) ? res.data : [];

      // If admin is viewing a specific seller's orders
      if (sellerId) {
        fetchedOrders = fetchedOrders.filter(
          (o: any) => o.sellerId?._id === sellerId || o.sellerId === sellerId,
        );
      }

      setOrders(fetchedOrders);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error("Error fetching orders:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [path]);

  const handleStatusUpdate = async () => {
    if (!confirmingAction) return;
    try {
      await orderService.updateOrderStatus(
        confirmingAction.id,
        confirmingAction.status,
      );
      setOrders(
        orders.map((o) =>
          o._id === confirmingAction.id
            ? { ...o, status: confirmingAction.status }
            : o,
        ),
      );

      const statusLabels: any = {
        confirmed: "تم تأكيد الطلب",
        rejected: "تم إلغاء الطلب",
        delivered: "تم توصيل الطلب",
      };
      toast.success(
        statusLabels[confirmingAction.status] || "تم تحديث الحالة بنجاح",
      );

      setConfirmingAction(null);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("فشل تحديث حالة الطلب");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  const filteredOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .filter((order) => {
      // Filter out cancelled orders from seller dashboard as requested
      if (order.status === "cancelled") return false;

      const matchesSearch =
        order.buyerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.productId?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        order._id?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === "active") {
        return ["pending", "confirmed"].includes(order.status);
      } else {
        return ["delivered", "rejected"].includes(order.status);
      }
    });

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
      <AnimatePresence>
        {viewingLogs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900">
                  سجل حالة الطلب
                </h3>
                <button
                  onClick={() => setViewingLogs(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              <div className="space-y-6 relative before:absolute before:right-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {viewingLogs.map((log, idx) => (
                  <div key={idx} className="relative pr-8">
                    <div className="absolute right-0 top-1.5 w-6 h-6 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center z-10">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-900">
                        {log.status === "pending"
                          ? "قيد الانتظار"
                          : log.status === "confirmed"
                            ? "تم التأكيد"
                            : log.status === "delivered"
                              ? "تم التوصيل"
                              : log.status === "rejected"
                                ? "مرفوض"
                                : "ملغي"}
                      </span>
                      <span className="text-[10px] text-secondary font-bold">
                        {new Date(log.timestamp).toLocaleString("ar-EG")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {confirmingAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6",
                  confirmingAction.status === "rejected"
                    ? "bg-rose-50 text-rose-500"
                    : confirmingAction.status === "confirmed"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-emerald-50 text-emerald-600",
                )}
              >
                {confirmingAction.status === "rejected" ? (
                  <Trash2 className="w-8 h-8" />
                ) : confirmingAction.status === "confirmed" ? (
                  <ShieldCheck className="w-8 h-8" />
                ) : (
                  <Truck className="w-8 h-8" />
                )}
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                هل أنت متأكد؟
              </h3>
              <p className="text-secondary text-sm font-bold mb-8">
                أنت على وشك تغيير حالة طلب {confirmingAction.name} إلى{" "}
                {confirmingAction.status === "confirmed"
                  ? "مؤكد"
                  : confirmingAction.status === "rejected"
                    ? "ملغى"
                    : "مكتمل"}
                .
                {confirmingAction.status === "confirmed"
                  ? " لا يمكنك التراجع عن هذا الإجراء أو إلغاء الطلب بعد التأكيد."
                  : " لا يمكن التراجع عن هذا الإجراء."}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleStatusUpdate}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-sm shadow-lg transition-all",
                    confirmingAction.status === "rejected"
                      ? "bg-rose-500 text-white shadow-rose-200 hover:bg-rose-600"
                      : "bg-slate-900 text-white shadow-slate-200 hover:bg-primary",
                  )}
                >
                  تأكيد الإجراء
                </button>
                <button
                  onClick={() => setConfirmingAction(null)}
                  className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-black text-slate-900">إدارة الطلبات</h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
              <input
                type="text"
                placeholder="بحث عن طلب، مشترٍ أو منتج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl pr-10 pl-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              onClick={fetchOrders}
              className="text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1 bg-primary/5 px-4 py-2 rounded-xl sm:bg-transparent sm:p-0"
            >
              <TrendingUp className="w-3 h-3 rotate-180" /> تحديث البيانات
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("active")}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-bold transition-all",
              activeTab === "active"
                ? "bg-white text-primary shadow-sm"
                : "text-secondary hover:text-primary",
            )}
          >
            الطلبات النشطة
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-bold transition-all",
              activeTab === "history"
                ? "bg-white text-primary shadow-sm"
                : "text-secondary hover:text-primary",
            )}
          >
            سجل الطلبات
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="text-secondary text-[10px] font-bold uppercase tracking-wider border-b border-slate-50">
              <th className="pb-4 px-4 font-bold">معرف الطلب</th>
              <th className="pb-4 px-4 font-bold">العميل</th>
              {user?.role === "admin" && (
                <th className="pb-4 px-4 font-bold">البائع</th>
              )}
              <th className="pb-4 px-4 font-bold">المنتج</th>
              <th className="pb-4 px-4 font-bold">السعر</th>
              <th className="pb-4 px-4 font-bold">العائد والعمولة</th>
              <th className="pb-4 px-4 font-bold">الحالة</th>
              <th className="pb-4 px-4 font-bold">التاريخ</th>
              <th className="pb-4 px-4 font-bold">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={user?.role === "admin" ? 8 : 7}
                  className="py-12 text-center text-secondary font-bold"
                >
                  لا توجد طلبات لعرضها
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order._id}
                  className="group hover:bg-slate-50 transition-colors"
                >
                  <td className="py-4 px-4 font-bold text-slate-500">
                    {order._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="py-4 px-4 overflow-hidden max-w-[200px]">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-900 block truncate">
                        {order.buyerName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] text-slate-500 font-bold"
                          dir="ltr"
                        >
                          {formatDisplayPhone(order.buyerPhone)}
                        </span>
                        <a
                          href={`https://wa.me/${formatWhatsAppNumber(order.buyerPhone)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-500 hover:text-emerald-600 transition-colors"
                          title="تواصل عبر واتساب"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-emerald-50" />
                        </a>
                      </div>
                      {(order.status === "confirmed" ||
                        order.status === "delivered") && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate" title={order.buyerAddress}>
                            {order.buyerAddress}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  {user?.role === "admin" && (
                    <td className="py-4 px-4">
                      <Link
                        to={`/seller/${order.sellerId?._id}`}
                        className="text-primary hover:underline font-bold"
                      >
                        {order.sellerId?.name || "بائع غير معروف"}
                      </Link>
                    </td>
                  )}
                  <td className="py-4 px-4 font-bold text-slate-900">
                    <div className="flex flex-col">
                      <span>{order.productId?.name}</span>
                      {(order.selectedColor || order.selectedSize) && (
                        <div className="flex gap-2 mt-1">
                          {order.selectedColor && (
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md border border-slate-200 uppercase font-black">
                              Color: {order.selectedColor}
                            </span>
                          )}
                          {order.selectedSize && (
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md border border-slate-200 uppercase font-black">
                              Size: {order.selectedSize}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 font-black text-slate-900">
                    {order.price} ج.م
                  </td>
                  <td className="py-4 px-4">
                    {order.status === "delivered" && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-rose-500">
                          العمولة: {order.commissionAmount?.toFixed(2)} ج.م
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600">
                          صافي الربح: {order.sellerEarning?.toFixed(2)} ج.م
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold",
                        order.status === "delivered"
                          ? "bg-emerald-50 text-emerald-600"
                          : order.status === "pending"
                            ? "bg-amber-50 text-amber-600"
                            : order.status === "rejected"
                              ? "bg-rose-50 text-rose-600"
                              : "bg-blue-50 text-blue-600",
                      )}
                    >
                      {order.status === "delivered"
                        ? "مكتمل"
                        : order.status === "pending"
                          ? "بانتظار الموافقة"
                          : order.status === "rejected"
                            ? "ملغى"
                            : "جاري التجهيز"}
                    </span>
                    {user?.role === "admin" && (
                      <button
                        onClick={() => setViewingLogs(order.statusLogs || [])}
                        className="p-1 hover:bg-slate-100 rounded-md transition-colors mr-1"
                        title="عرض السجل"
                      >
                        <BarChart3 className="w-3 h-3 text-slate-400" />
                      </button>
                    )}
                  </td>
                  <td className="py-4 px-4 text-secondary text-xs">
                    {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {user?.role !== "admin" ? (
                        <>
                          {order.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  setConfirmingAction({
                                    id: order._id,
                                    status: "confirmed",
                                    name: order.productId?.name,
                                  })
                                }
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700 transition-all shadow-md"
                              >
                                قبول الطلب
                              </button>
                              <button
                                onClick={() =>
                                  setConfirmingAction({
                                    id: order._id,
                                    status: "rejected",
                                    name: order.productId?.name,
                                  })
                                }
                                className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black hover:bg-rose-100 transition-all"
                              >
                                رفض
                              </button>
                            </>
                          )}
                          {order.status === "confirmed" && (
                            <>
                              <button
                                onClick={() =>
                                  setConfirmingAction({
                                    id: order._id,
                                    status: "delivered",
                                    name: order.productId?.name,
                                  })
                                }
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black hover:bg-emerald-700 transition-all shadow-md"
                              >
                                تم التوصيل
                              </button>
                            </>
                          )}
                          {(order.status === "delivered" ||
                            order.status === "rejected") && (
                            <span className="text-[10px] font-bold text-slate-400 italic">
                              لا توجد إجراءات
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 italic">
                          للمشاهدة فقط
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-secondary font-bold">
            لا توجد طلبات لعرضها
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order._id}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black text-slate-400 block">
                    #{order._id.slice(-6).toUpperCase()}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">
                    {order.productId?.name}
                  </h4>
                  {(order.selectedColor || order.selectedSize) && (
                    <div className="flex gap-2 mt-1">
                      {order.selectedColor && (
                        <span className="text-[8px] bg-white text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-200 uppercase font-black">
                          {order.selectedColor}
                        </span>
                      )}
                      {order.selectedSize && (
                        <span className="text-[8px] bg-white text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-200 uppercase font-black">
                          {order.selectedSize}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold",
                    order.status === "delivered"
                      ? "bg-emerald-50 text-emerald-600"
                      : order.status === "pending"
                        ? "bg-amber-50 text-amber-600"
                        : order.status === "rejected"
                          ? "bg-rose-50 text-rose-600"
                          : "bg-blue-50 text-blue-600",
                  )}
                >
                  {order.status === "delivered"
                    ? "مكتمل"
                    : order.status === "pending"
                      ? "بانتظار الموافقة"
                      : order.status === "rejected"
                        ? "ملغى"
                        : "جاري التجهيز"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-200/60">
                <div>
                  <span className="text-[10px] text-secondary block mb-0.5">
                    العميل
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-700">
                      {order.buyerName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] text-slate-500 font-bold"
                        dir="ltr"
                      >
                        {formatDisplayPhone(order.buyerPhone)}
                      </span>
                      <a
                        href={`https://wa.me/${formatWhatsAppNumber(order.buyerPhone)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-500"
                      >
                        <MessageCircle className="w-3 h-3 fill-emerald-50" />
                      </a>
                    </div>
                    {(order.status === "confirmed" ||
                      order.status === "delivered") && (
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        <span className="truncate">{order.buyerAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
                {user?.role === "admin" && (
                  <div>
                    <span className="text-[10px] text-secondary block mb-0.5">
                      البائع
                    </span>
                    <span className="text-xs font-bold text-primary">
                      {order.sellerId?.name}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-secondary block mb-0.5">
                    المبلغ
                  </span>
                  <span className="text-xs font-black text-primary">
                    {order.price} ج.م
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-secondary block mb-0.5">
                    التاريخ
                  </span>
                  <span className="text-xs text-slate-600">
                    {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                  </span>
                </div>
                {order.status === "delivered" && (
                  <div className="col-span-2 flex justify-between items-center bg-slate-100/50 p-3 rounded-xl mt-1">
                    <span className="text-[10px] font-bold text-rose-500">
                      العمولة: {order.commissionAmount?.toFixed(2)} ج.م
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600">
                      صافي الربح: {order.sellerEarning?.toFixed(2)} ج.م
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {user?.role !== "admin" ? (
                  <>
                    {order.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            setConfirmingAction({
                              id: order._id,
                              status: "confirmed",
                              name: order.productId?.name,
                            })
                          }
                          className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black shadow-md"
                        >
                          قبول الطلب
                        </button>
                        <button
                          onClick={() =>
                            setConfirmingAction({
                              id: order._id,
                              status: "rejected",
                              name: order.productId?.name,
                            })
                          }
                          className="flex-1 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black"
                        >
                          رفض
                        </button>
                      </>
                    )}
                    {order.status === "confirmed" && (
                      <>
                        <button
                          onClick={() =>
                            setConfirmingAction({
                              id: order._id,
                              status: "delivered",
                              name: order.productId?.name,
                            })
                          }
                          className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black shadow-md"
                        >
                          تم التوصيل
                        </button>
                      </>
                    )}
                    {(order.status === "delivered" ||
                      order.status === "rejected") && (
                      <div className="w-full text-center py-2 text-[10px] font-bold text-slate-400 italic">
                        لا توجد إجراءات متاحة
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full text-center py-2 text-[10px] font-bold text-slate-400 italic">
                    للمشاهدة فقط
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const DashboardProducts = ({ sellerId }: { sellerId?: string }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { user } = useAuth();
  const { searchQuery } = useDashboard();

  const fetchProducts = async () => {
    if (!user) return;
    try {
      const res = sellerId
        ? await productService.getSellerProducts(sellerId)
        : user.role === "admin"
          ? await productService.getProducts()
          : await productService.getSellerProducts(user.id);

      if ((sellerId || user.role !== "admin") && res.data.products) {
        setProducts(res.data.products);
      } else {
        setProducts(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const handleDeleteProduct = async (id: string) => {
    setDeletingId(id);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await productService.deleteProduct(deletingId);
      setProducts(products.filter((p) => p._id !== deletingId));
      setDeletingId(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      setDeleteError("فشل في حذف المنتج، يرجى المحاولة مرة أخرى");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-black text-slate-900">إدارة المنتجات</h3>
        {user?.role !== "admin" && (
          <Link
            to="/seller/add-product"
            className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> إضافة منتج جديد
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-secondary font-bold">
            لا توجد منتجات لعرضها
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col relative"
            >
              {/* Delete Confirmation Overlay */}
              <AnimatePresence>
                {deletingId === product._id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center gap-4"
                  >
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-2">
                      <Trash2 className="w-8 h-8" />
                    </div>
                    <h4 className="font-black text-slate-900">حذف المنتج؟</h4>
                    <p className="text-xs text-secondary font-bold">
                      هل أنت متأكد من رغبتك في حذف "{product.name}"؟ لا يمكن
                      التراجع عن هذا الإجراء.
                    </p>

                    {deleteError && (
                      <p className="text-[10px] text-rose-500 font-bold bg-rose-50 px-3 py-1 rounded-lg">
                        {deleteError}
                      </p>
                    )}

                    <div className="flex flex-col w-full gap-2 mt-2">
                      <button
                        onClick={confirmDelete}
                        className="w-full bg-rose-500 text-white py-3 rounded-xl text-xs font-black hover:bg-rose-600 transition-all shadow-lg shadow-rose-200"
                      >
                        تأكيد الحذف
                      </button>
                      <button
                        onClick={() => {
                          setDeletingId(null);
                          setDeleteError(null);
                        }}
                        className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl text-xs font-black hover:bg-slate-200 transition-all"
                      >
                        إلغاء
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="aspect-square relative overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {product.isOnSale && (
                    <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                      خصم{" "}
                      {Math.round(
                        (1 - product.salePrice / product.price) * 100,
                      )}
                      %
                    </span>
                  )}
                  {product.deliveryAvailable && (
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Truck className="w-3 h-3" /> توصيل
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-black text-slate-900 line-clamp-1 text-lg">
                      {product.name}
                    </h4>
                    {user?.role === "admin" && (
                      <Link
                        to={`/seller/${product.sellerId?._id}`}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        {product.sellerId?.name}
                      </Link>
                    )}
                  </div>
                  <p className="text-secondary text-xs line-clamp-2 leading-relaxed h-8">
                    {product.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                      السعر
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-black text-xl">
                        {product.isOnSale ? product.salePrice : product.price}{" "}
                        ج.م
                      </span>
                      {product.isOnSale && (
                        <span className="text-xs text-slate-400 line-through font-bold">
                          {product.price} ج.م
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                      التقييم
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-black">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-sm">
                        {product.averageRating || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-secondary" />
                    <span className="text-xs font-bold text-slate-700">
                      الضمان:
                    </span>
                  </div>
                  <span className="text-xs font-black text-primary">
                    {product.warranty === "6 months"
                      ? "6 أشهر"
                      : product.warranty === "1 year"
                        ? "سنة واحدة"
                        : product.warranty === "2 years"
                          ? "سنتان"
                          : product.warranty === "3 years"
                            ? "3 سنوات"
                            : product.warranty === "lifetime"
                              ? "مدى الحياة"
                              : "بدون ضمان"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2">
                  {user?.role !== "admin" && (
                    <Link
                      to={`/seller/edit-product/${product._id}`}
                      className="flex items-center justify-center gap-2 py-3 bg-white text-slate-900 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-all border border-slate-200"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <Link
                    to={`/product/${product._id}`}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-2xl text-xs font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/20",
                      user?.role === "admin" ? "col-span-3" : "",
                    )}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {user?.role === "admin" && (
                      <span className="ml-2">عرض التفاصيل</span>
                    )}
                  </Link>
                  {user?.role !== "admin" && (
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold hover:bg-rose-100 transition-all border border-rose-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const TrialBanner = ({ user, stats }: { user: any; stats: any }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (user?.role === "seller" && user?.trialEndDate) {
      const calculateTimeLeft = () => {
        const end = new Date(user.trialEndDate).getTime();
        const now = new Date().getTime();
        const diff = end - now;

        if (diff <= 0 || !user.isTrialActive) {
          setTimeLeft("منتهية");
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        setTimeLeft(`${days} يوم و ${hours} ساعة و ${minutes} دقيقة`);
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 60000);
      return () => clearInterval(timer);
    }
  }, [user]);

  if (!user?.trialEndDate) return null;

  const isTrialEnded =
    !user.isTrialActive ||
    (user.trialEndDate && new Date() > new Date(user.trialEndDate));

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12 mb-8 group shadow-2xl",
        isTrialEnded
          ? "bg-slate-50 border border-slate-200 shadow-slate-200/50"
          : "bg-slate-900 shadow-blue-900/10 text-white",
      )}
    >
      {/* Decorative Background */}
      {!isTrialEnded ? (
        <>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
        </>
      ) : (
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-slate-200/50 rounded-full blur-2xl" />
      )}

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
        <div className="flex-1">
          <div
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border",
              isTrialEnded
                ? "bg-slate-200/50 border-slate-300 text-slate-500"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
            )}
          >
            <ShieldCheck className="w-3 h-3" />{" "}
            {isTrialEnded ? "انتهت الفترة التجريبية" : "فترة تجريبية مجانية"}
          </div>
          <h2
            className={cn(
              "text-3xl sm:text-4xl font-black leading-tight mb-4",
              isTrialEnded ? "text-slate-900" : "text-white",
            )}
          >
            {isTrialEnded ? (
              <>
                انتهت فترة الـ 30 يوم المجانية! <br />
                <span className="text-primary">
                  حان وقت تفعيل نظام العمولات.
                </span>
              </>
            ) : (
              <>
                أهلاً بك في نظام التجارة الذكي! <br />
                <span className="text-primary">
                  أنت حالياً معفى من جميع العمولات.
                </span>
              </>
            )}
          </h2>
          <p
            className={cn(
              "text-sm font-bold leading-relaxed max-w-xl mb-8",
              isTrialEnded ? "text-slate-600" : "text-slate-400",
            )}
          >
            {isTrialEnded
              ? "لقد انتهت فترة الإعفاء من العمولات. من الآن فصاعداً، سيتم تطبيق القواعد والعمولات الموضحة أدناه على جميع الطلبات الجديدة لضمان استمرار تقديم أفضل خدمة لك."
              : "استمتع ببيع منتجاتك والحصول على أرباحك كاملة خلال الفترة التجريبية. بعد انتهاء هذه الفترة، سيتم تطبيق القواعد والعمولات المذكورة أدناه لضمان استمرارية جودة الخدمة."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={cn(
                "backdrop-blur-sm p-4 rounded-2xl border",
                isTrialEnded
                  ? "bg-white border-slate-200"
                  : "bg-white/5 border-white/10",
              )}
            >
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-1">
                الحالة الحالية
              </div>
              <div
                className={cn(
                  "text-lg font-black",
                  isTrialEnded ? "text-slate-900" : "text-white",
                )}
              >
                {isTrialEnded ? "خاضع للعمولة" : timeLeft}
              </div>
            </div>
            <div
              className={cn(
                "backdrop-blur-sm p-4 rounded-2xl border",
                isTrialEnded
                  ? "bg-white border-slate-200"
                  : "bg-white/5 border-white/10",
              )}
            >
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-1">
                العمولة الحالية
              </div>
              <div
                className={cn(
                  "text-lg font-black font-mono",
                  isTrialEnded ? "text-primary" : "text-emerald-400",
                )}
              >
                {isTrialEnded
                  ? `${(stats?.globalCommissionRate * 100 || 10).toFixed(0)}%`
                  : "0%"}
                <span className="text-[10px] text-slate-400 font-bold ml-2">
                  ({isTrialEnded ? "عمولة قياسية" : "إعفاء كامل"})
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "lg:w-80 backdrop-blur-sm p-8 rounded-[2rem] border self-start",
            isTrialEnded
              ? "bg-white border-slate-200"
              : "bg-white/5 border-white/10",
          )}
        >
          <h4
            className={cn(
              "font-black mb-6 flex items-center gap-2",
              isTrialEnded ? "text-slate-900" : "text-white",
            )}
          >
            <Settings className="w-5 h-5 text-primary" />{" "}
            {isTrialEnded
              ? "قواعد العمولات المطبقة"
              : "قواعد العمولات المستقبلية"}
          </h4>
          <ul className="space-y-4 text-right">
            <li className="flex items-start gap-3">
              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <div>
                <span className="text-slate-500 text-xs font-bold block">
                  نسبة العمولة
                </span>
                <span
                  className={cn(
                    "text-sm font-black",
                    isTrialEnded ? "text-slate-900" : "text-white",
                  )}
                >
                  {(stats?.globalCommissionRate * 100 || 10).toFixed(0)}% من سعر
                  المنتج
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <div>
                <span className="text-slate-500 text-xs font-bold block">
                  أرباح التوصيل
                </span>
                <span className="text-sm font-black text-emerald-600">
                  100% للبائع (بدون عمولة)
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <div>
                <span className="text-slate-500 text-xs font-bold block">
                  متى يتم حساب العمولة؟
                </span>
                <span
                  className={cn(
                    "text-sm font-black",
                    isTrialEnded ? "text-slate-900" : "text-white",
                  )}
                >
                  بمجرد قبولك وتأكيدك للطلب
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export const DashboardEarnings = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const location = useLocation();
  const path = location.pathname;
  const { searchQuery, setSearchQuery } = useDashboard();

  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (user?.role === "seller" && user?.trialEndDate) {
      const calculateTimeLeft = () => {
        const end = new Date(user.trialEndDate).getTime();
        const now = new Date().getTime();
        const diff = end - now;

        if (diff <= 0 || !user.isTrialActive) {
          setTimeLeft("منتهية");
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        setTimeLeft(`${days} يوم و ${hours} ساعة و ${minutes} دقيقة`);
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 60000); // Update every minute
      return () => clearInterval(timer);
    }
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user || (user.role !== "admin" && user.role !== "seller")) return;

      setLoading(true);
      try {
        const res = await orderService.getStats();
        setStats(res.data);
      } catch (error: any) {
        if (error.response?.status !== 401) {
          console.error("Error fetching stats:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [path, user]);

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  const filteredTransactions = (stats?.recentTransactions || []).filter(
    (tx: any) =>
      tx.product?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.buyer?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8"
    >
      <TrialBanner user={user} stats={stats} />

      {user?.role === "admin" && stats?.suspiciousSellers?.length > 0 && (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem]">
          <div className="flex items-center gap-3 mb-4 text-rose-600">
            <Bell className="w-5 h-5" />
            <h4 className="font-black">تنبيه: سلوك بائعين مشبوه</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.suspiciousSellers.map((seller: any) => (
              <div
                key={seller.id}
                className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {seller.name}
                  </span>
                  <Link
                    to={`/admin/sellers/${seller.id}`}
                    className="text-[10px] text-primary hover:underline font-bold"
                  >
                    عرض التفاصيل
                  </Link>
                </div>
                <div className="flex flex-wrap gap-1">
                  {seller.reasons.map((reason: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-[9px] bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full font-bold"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-white p-4 sm:p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1">
            إجمالي الأرباح
          </div>
          <div className="text-4xl font-black text-slate-900 tracking-tight">
            {stats?.totalEarnings?.toLocaleString() || 0} ج.م
          </div>
          <div className="flex flex-col gap-1 mt-3">
            <div className="text-[10px] text-slate-500 font-bold flex justify-between">
              <span>مبيعات المنتجات:</span>
              <span>
                {stats?.totalProductEarnings?.toLocaleString() || 0} ج.م
              </span>
            </div>
            <div className="text-[10px] text-emerald-600 font-bold flex justify-between">
              <span>أرباح التوصيل:</span>
              <span>
                {stats?.totalDeliveryEarnings?.toLocaleString() || 0} ج.م
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white p-4 sm:p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all group"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1">
            الطلبات المكتملة
          </div>
          <div className="text-4xl font-black text-slate-900 tracking-tight">
            {stats?.delivered || 0}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white p-4 sm:p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-rose-500/5 transition-all group"
        >
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <PieChartIcon className="w-6 h-6" />
          </div>
          <div className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1">
            عمولة المنصة المستحقة
          </div>
          <div className="text-4xl font-black text-slate-900 tracking-tight">
            {stats?.totalCommission?.toLocaleString() || 0} ج.م
          </div>
          <div className="text-[10px] text-rose-500 mt-2 font-bold whitespace-nowrap overflow-hidden text-ellipsis">
            تُحسب بمجرد قبول الطلب وتخصم من إجمالي مبيعاتك
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white p-4 sm:p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 transition-all group"
        >
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1">
            إجمالي الطلبات
          </div>
          <div className="text-4xl font-black text-slate-900 tracking-tight">
            {stats?.totalOrders || 0}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white p-4 sm:p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all group"
        >
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Truck className="w-6 h-6" />
          </div>
          <div className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1">
            أرباح التوصيل
          </div>
          <div className="text-4xl font-black text-slate-900 tracking-tight">
            {stats?.totalDeliveryEarnings?.toLocaleString() || 0} ج.م
          </div>
          <div className="text-[10px] text-purple-500 mt-2 font-bold">
            من {stats?.delivered || 0} طلب تم توصيله
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Earnings Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white p-4 sm:p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[400px] flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                تحليل الأرباح
              </h3>
              <p className="text-secondary text-[10px] font-bold uppercase tracking-wider">
                آخر 7 أيام
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-[10px] font-bold text-slate-500">
                المبيعات اليومية
              </span>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.earningsByDay || []}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }}
                  tickFormatter={(value) => `${value} ج.م`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                    fontWeight: "bold",
                    fontFamily: "inherit",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#141414"
                  strokeWidth={4}
                  dot={{
                    r: 4,
                    fill: "#141414",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Order Status Distribution */}
        <motion.div
          variants={itemVariants}
          className="bg-white p-4 sm:p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[400px] flex flex-col"
        >
          <h3 className="text-lg font-black text-slate-900 mb-8">
            توزيع الحالات
          </h3>
          <div className="flex-1 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.ordersByStatus || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {(stats?.ordersByStatus || []).map(
                    (entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ),
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-900">
                {stats?.totalOrders || 0}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                إجمالي الطلبات
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {(stats?.ordersByStatus || []).map((status: any) => (
              <div key={status.name} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: status.color }}
                ></div>
                <span className="text-xs font-bold text-slate-600">
                  {status.name}
                </span>
                <span className="text-xs font-black text-slate-900 mr-auto">
                  {status.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sales by Category Pie Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white p-4 sm:p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[400px] flex flex-col"
        >
          <h3 className="text-lg font-black text-slate-900 mb-8">
            المبيعات حسب الفئة
          </h3>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.salesByCategory || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {(stats?.salesByCategory || []).map(
                    (entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ),
                  )}
                </Pie>
                <Tooltip formatter={(value: number) => `${value} ج.م`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 max-h-[100px] overflow-y-auto">
            {(stats?.salesByCategory || []).map((cat: any) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                ></div>
                <span className="text-[10px] font-bold text-slate-600 truncate">
                  {cat.name}
                </span>
                <span className="text-[10px] font-black text-slate-900 mr-auto">
                  {cat.value} ج.م
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Review Distribution Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white p-4 sm:p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[400px] flex flex-col"
        >
          <h3 className="text-lg font-black text-slate-900 mb-8">
            توزيع التقييمات
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.reviewDistribution || []}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="rating"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }}
                  tickFormatter={(value) => `${value} نجوم`}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#fbbf24"
                  radius={[10, 10, 0, 0]}
                  barSize={40}
                  animationDuration={2000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <span className="text-[10px] font-bold text-slate-500">
                عدد المراجعات
              </span>
            </div>
          </div>
        </motion.div>

        {/* Top Products Bar Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white p-4 sm:p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm lg:col-span-2 h-[400px] flex flex-col"
        >
          <h3 className="text-lg font-black text-slate-900 mb-8">
            أداء المنتجات
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.topProducts || []}
                layout="vertical"
                margin={{ left: 40 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f1f5f9"
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="#141414"
                  radius={[0, 10, 10, 0]}
                  barSize={20}
                  animationDuration={2000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Rules and Commission Info for all sellers */}
        {user?.role === "seller" && !user?.isTrialActive && (
          <motion.div
            variants={itemVariants}
            className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm col-span-full"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <ShieldCheck className="w-5 h-5 transition-transform group-hover:scale-110" />
              </div>
              <h3 className="text-sm font-black text-slate-900">
                سياسة العمولات والأرباح
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                <span className="text-[10px] text-secondary font-black block mb-1 uppercase tracking-wider">
                  نسبة المنصة الأساسية
                </span>
                <span className="text-sm font-black text-slate-900">
                  {((stats?.globalCommissionRate || 0) * 100).toFixed(0)}% من
                  القيمة
                </span>
              </div>
              <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/50">
                <span className="text-[10px] text-emerald-600 font-black block mb-1 uppercase tracking-wider">
                  أرباح التوصيل
                </span>
                <span className="text-sm font-black text-emerald-600">
                  100% للبائع (0% عمولة)
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                <span className="text-[10px] text-secondary font-black block mb-1 uppercase tracking-wider">
                  قاعدة الاستحقاق
                </span>
                <span className="text-sm font-black text-slate-900">
                  بمجرد قبول وتأكيد الطلب
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Transactions Table */}
        <motion.div
          variants={itemVariants}
          className="bg-white p-4 sm:p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm lg:col-span-2"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h3 className="text-lg font-black text-slate-900">أحدث العمليات</h3>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-secondary" />
                <input
                  type="text"
                  placeholder="بحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg pr-8 pl-3 py-1.5 text-[10px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Link
                to="/seller/orders"
                className="text-xs font-bold text-primary hover:underline shrink-0"
              >
                عرض الكل
              </Link>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="text-secondary text-[10px] font-bold uppercase tracking-wider border-b border-slate-50">
                  <th className="pb-4 px-4 font-bold">المنتج</th>
                  <th className="pb-4 px-4 font-bold">العميل</th>
                  <th className="pb-4 px-4 font-bold">المبلغ</th>
                  <th className="pb-4 px-4 font-bold text-rose-500">
                    عمولة المنصة
                  </th>
                  <th className="pb-4 px-4 font-bold">التاريخ</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredTransactions.map((tx: any) => (
                  <tr
                    key={tx.id}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {tx.product}
                    </td>
                    <td className="py-4 px-4 text-secondary">{tx.buyer}</td>
                    <td className="py-4 px-4 font-black text-slate-900">
                      {tx.amount} ج.م
                    </td>
                    <td className="py-4 px-4 font-bold text-rose-500">
                      {tx.commission || 0} ج.م
                    </td>
                    <td className="py-4 px-4 text-secondary text-xs">
                      {new Date(tx.date).toLocaleDateString("ar-EG")}
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-slate-400 font-bold italic"
                    >
                      لا توجد عمليات مطابقة للبحث
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3">
            {filteredTransactions.map((tx: any) => (
              <div
                key={tx.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900 text-xs">
                    {tx.product}
                  </h4>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-black text-slate-900">
                      {tx.amount} ج.م
                    </span>
                    <span className="text-[9px] font-bold text-rose-500">
                      العمولة: {tx.commission || 0} ج.م
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-secondary">{tx.buyer}</span>
                  <span className="text-slate-400">
                    {new Date(tx.date).toLocaleDateString("ar-EG")}
                  </span>
                </div>
              </div>
            ))}
            {filteredTransactions.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs font-bold italic">
                لا توجد عمليات مطابقة للبحث
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {user?.role === "admin" && (
        <motion.div
          variants={itemVariants}
          className="bg-slate-900 p-12 rounded-[3rem] text-white relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-primary/30 transition-colors"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2 opacity-60">
              عمولة المنصة الإجمالية (
              {(stats?.globalCommissionRate * 100)?.toFixed(0) || 10}%)
            </h3>
            <div className="text-6xl font-black tracking-tighter mb-4">
              {stats?.totalCommission?.toLocaleString() || 0} ج.م
            </div>
            <p className="text-sm opacity-60 max-w-md font-bold">
              هذه هي الأرباح الصافية للمنصة من جميع العمليات المكتملة بنجاح.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export const DashboardUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { searchQuery, setSearchQuery } = useDashboard();
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      const res = await authService.getAllUsers();
      setUsers(res.data);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error("Error fetching users:", error);
        toast.error("فشل في تحميل قائمة المستخدمين");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (id === currentUser?.id) {
      toast.error("لا يمكنك حذف حسابك الخاص");
      return;
    }

    if (
      !window.confirm(
        "هل أنت متأكد من رغبتك في حذف هذا المستخدم؟ سيتم حذف جميع بياناته نهائياً.",
      )
    ) {
      return;
    }

    try {
      await authService.deleteUser(id);
      setUsers(users.filter((u) => u._id !== id));
      toast.success("تم حذف المستخدم بنجاح");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("فشل في حذف المستخدم");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h3 className="text-lg font-black text-slate-900">إدارة المستخدمين</h3>
        <div className="relative w-full sm:w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
          <input
            type="text"
            placeholder="بحث عن مستخدم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl pr-10 pl-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="text-secondary text-[10px] font-bold uppercase tracking-wider border-b border-slate-50">
              <th className="pb-4 px-4 font-bold">المستخدم</th>
              <th className="pb-4 px-4 font-bold">البريد الإلكتروني</th>
              <th className="pb-4 px-4 font-bold">الدور</th>
              <th className="pb-4 px-4 font-bold">تاريخ الانضمام</th>
              <th className="pb-4 px-4 font-bold">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-secondary font-bold"
                >
                  لا يوجد مستخدمون لعرضهم
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="group hover:bg-slate-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center text-[10px] font-bold text-primary">
                        {user?.name?.charAt(0) || "U"}
                      </div>
                      <span className="font-bold text-slate-900">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-secondary">{user.email}</td>
                  <td className="py-4 px-4">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold",
                        user.role === "admin"
                          ? "bg-purple-50 text-purple-600"
                          : user.role === "seller"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-slate-50 text-slate-600",
                      )}
                    >
                      {user.role === "admin"
                        ? "مدير"
                        : user.role === "seller"
                          ? "بائع"
                          : "مشتري"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-secondary text-xs">
                    {new Date(user.createdAt).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="py-4 px-4 text-left">
                    <div className="flex items-center justify-end gap-2">
                      {user.role === "seller" && (
                        <Link
                          to={`/seller/${user._id}`}
                          className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="حذف المستخدم"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-secondary font-bold">
            لا يوجد مستخدمون لعرضهم
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white flex items-center justify-center text-[10px] font-bold text-primary border border-slate-100">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {user.name}
                    </h4>
                    <span className="text-[10px] text-secondary">
                      {user.email}
                    </span>
                  </div>
                </div>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold",
                    user.role === "admin"
                      ? "bg-purple-50 text-purple-600"
                      : user.role === "seller"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-slate-50 text-slate-600",
                  )}
                >
                  {user.role === "admin"
                    ? "مدير"
                    : user.role === "seller"
                      ? "بائع"
                      : "مشتري"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                <span className="text-[10px] text-secondary">
                  انضم في:{" "}
                  {new Date(user.createdAt).toLocaleDateString("ar-EG")}
                </span>
                <div className="flex items-center gap-2">
                  {user.role === "seller" && (
                    <Link
                      to={`/seller/${user._id}`}
                      className="p-2 text-primary bg-white border border-slate-200 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  )}
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="p-2 text-rose-500 bg-white border border-slate-200 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const DashboardSellerDetail = ({ sellerId }: { sellerId: string }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sellerInfo, setSellerInfo] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, sellersRes] = await Promise.all([
          orderService.getStats(sellerId),
          orderService.getAdminSellers(),
        ]);
        setStats(statsRes.data);
        const info = sellersRes.data.find((s: any) => s._id === sellerId);
        setSellerInfo(info);
      } catch (error) {
        console.error("Error fetching seller details:", error);
        toast.error("فشل في تحميل بيانات البائع");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sellerId]);

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Link
          to="/admin/sellers"
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-black text-slate-900">
            تفاصيل البائع: {sellerInfo?.name}
          </h2>
          <p className="text-secondary text-sm font-bold">
            {sellerInfo?.email} • {sellerInfo?.phone}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-secondary text-[10px] font-bold uppercase tracking-wider mb-1">
            إجمالي المبيعات
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.totalEarnings || 0} ج.م
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-secondary text-[10px] font-bold uppercase tracking-wider mb-1">
            العمولة المستحقة
          </div>
          <div className="text-2xl font-black text-primary">
            {sellerInfo?.commission || 0} ج.م
          </div>
          {sellerInfo?.isTrialActive && (
            <div className="text-[9px] text-emerald-600 font-bold mt-1">
              فترة تجريبية نشطة
            </div>
          )}
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-secondary text-[10px] font-bold uppercase tracking-wider mb-1">
            الطلبات المكتملة
          </div>
          <div className="text-2xl font-black text-emerald-500">
            {stats?.delivered || 0}
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-secondary text-[10px] font-bold uppercase tracking-wider mb-1">
              الفترة التجريبية
            </div>
            <div className="text-xl font-black text-slate-900">
              {sellerInfo?.isTrialActive ? "نشطة" : "غير نشطة"}
            </div>
            {sellerInfo?.isTrialActive && sellerInfo?.trialEndDate && (
              <div className="text-[9px] text-slate-500 font-bold mt-1">
                تنتهي في:{" "}
                {new Date(sellerInfo.trialEndDate).toLocaleDateString("ar-EG")}
              </div>
            )}
          </div>
          <button
            onClick={async () => {
              try {
                const res = await settingsService.toggleSellerTrial(sellerId, {
                  isTrialActive: !sellerInfo.isTrialActive,
                });
                setSellerInfo(res.data);
                toast.success("تم تحديث حالة الفترة التجريبية");
              } catch (error) {
                toast.error("فشل تحديث الفترة التجريبية");
              }
            }}
            className={cn(
              "mt-4 py-2 rounded-xl text-[10px] font-black transition-all",
              sellerInfo?.isTrialActive
                ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
            )}
          >
            {sellerInfo?.isTrialActive
              ? "إيقاف الفترة التجريبية"
              : "تفعيل فترة تجريبية (30 يوم)"}
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-secondary text-[10px] font-bold uppercase tracking-wider mb-1">
              حالة الحساب
            </div>
            <div
              className={cn(
                "text-xl font-black",
                sellerInfo?.isLocked ? "text-rose-500" : "text-emerald-500",
              )}
            >
              {sellerInfo?.isLocked ? "مغلق" : "نشط"}
            </div>
            {sellerInfo?.subscriptionLockDate && (
              <div className="text-[9px] text-slate-500 font-bold mt-1">
                تاريخ القفل التلقائي:{" "}
                {new Date(sellerInfo.subscriptionLockDate).toLocaleDateString(
                  "ar-EG",
                )}
              </div>
            )}
          </div>
          <button
            onClick={async () => {
              try {
                const res = await authService.toggleLock(sellerId);
                setSellerInfo({ ...sellerInfo, isLocked: res.data.isLocked });
                toast.success(
                  res.data.isLocked ? "تم قفل الحساب" : "تم تفعيل الحساب",
                );
              } catch (error) {
                toast.error("فشل تغيير حالة الحساب");
              }
            }}
            className={cn(
              "mt-4 py-2 rounded-xl text-[10px] font-black transition-all",
              sellerInfo?.isLocked
                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                : "bg-rose-50 text-rose-600 hover:bg-rose-100",
            )}
          >
            {sellerInfo?.isLocked ? "تفعيل الحساب (فتح)" : "قفل الحساب (تعطيل)"}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="text-lg font-black text-slate-900 mb-4 px-4">
            منتجات البائع
          </h3>
          <DashboardProducts sellerId={sellerId} />
        </section>
        <section>
          <h3 className="text-lg font-black text-slate-900 mb-4 px-4">
            طلبات البائع
          </h3>
          <DashboardOrders sellerId={sellerId} />
        </section>
      </div>
    </div>
  );
};

export const DashboardSellers = () => {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = useDashboard();
  const { user: currentUser } = useAuth();

  const fetchSellers = async () => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      const res = await orderService.getAdminSellers();
      setSellers(res.data);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error("Error fetching sellers:", error);
        toast.error("فشل في تحميل قائمة البائعين");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleDeleteSeller = async (id: string) => {
    if (
      !window.confirm(
        "هل أنت متأكد من رغبتك في حذف هذا البائع؟ سيتم حذف جميع منتجاته أيضاً.",
      )
    )
      return;
    try {
      await authService.deleteUser(id);
      setSellers(sellers.filter((s) => s._id !== id));
      toast.success("تم حذف البائع بنجاح");
    } catch (error) {
      console.error("Error deleting seller:", error);
      toast.error("فشل في حذف البائع");
    }
  };

  const handleToggleLock = async (id: string) => {
    try {
      const res = await authService.toggleLock(id);
      setSellers(
        sellers.map((s) =>
          s._id === id ? { ...s, isLocked: res.data.isLocked } : s,
        ),
      );
      toast.success(
        res.data.isLocked ? "تم قفل حساب البائع" : "تم إلغاء قفل حساب البائع",
      );
    } catch (error) {
      console.error("Error toggling lock:", error);
      toast.error("فشل في تغيير حالة قفل الحساب");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  const filteredSellers = sellers.filter(
    (seller) =>
      seller.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.phone?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h3 className="text-lg font-black text-slate-900">إدارة البائعين</h3>
        <div className="relative w-full sm:w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
          <input
            type="text"
            placeholder="بحث عن بائع..."
            value={searchQuery}
            onChange={(e) => {}} // Search handled by context
            className="w-full bg-slate-50 border border-slate-100 rounded-xl pr-10 pl-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="text-secondary text-[10px] font-bold uppercase tracking-wider border-b border-slate-50">
              <th className="pb-4 px-4 font-bold">البائع</th>
              <th className="pb-4 px-4 font-bold">التواصل</th>
              <th className="pb-4 px-4 font-bold">إجمالي المبيعات</th>
              <th className="pb-4 px-4 font-bold">العمولة المستحقة</th>
              <th className="pb-4 px-4 font-bold">حالة الدفع</th>
              <th className="pb-4 px-4 font-bold">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredSellers.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-secondary font-bold"
                >
                  لا يوجد بائعون لعرضهم
                </td>
              </tr>
            ) : (
              filteredSellers.map((seller) => (
                <tr
                  key={seller._id}
                  className="group hover:bg-slate-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center text-xs font-bold text-primary">
                        {seller?.name?.charAt(0) || "S"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 block">
                            {seller.name}
                          </span>
                          {seller.isTrialActive && (
                            <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-black">
                              تجريبي
                            </span>
                          )}
                          {seller.isLocked && (
                            <span className="text-[8px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-full font-black flex items-center gap-0.5">
                              <Lock className="w-2 h-2" /> متوقف
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-secondary">
                          {seller.location?.address || "لا يوجد موقع"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-600">
                        {seller.email}
                      </span>
                      <span className="text-xs text-slate-600 font-bold">
                        {seller.phone}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-black text-slate-900">
                    {seller.totalSales?.toLocaleString() || 0} ج.م
                  </td>
                  <td className="py-4 px-4 font-black text-primary">
                    {seller.commission?.toLocaleString() || 0} ج.م
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold",
                        seller.paymentStatus === "paid"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600",
                      )}
                    >
                      {seller.paymentStatus === "paid" ? "تم الدفع" : "معلق"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-left">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/sellers/${seller._id}`}
                        className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors"
                        title="لوحة تحكم البائع"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/seller/${seller._id}`}
                        className="p-2 text-secondary hover:bg-slate-100 rounded-lg transition-colors"
                        title="عرض المتجر"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleToggleLock(seller._id)}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          seller.isLocked
                            ? "text-emerald-500 hover:bg-emerald-50"
                            : "text-amber-500 hover:bg-amber-50",
                        )}
                        title={seller.isLocked ? "فك القفل" : "قفل الحساب"}
                      >
                        {seller.isLocked ? (
                          <Unlock className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteSeller(seller._id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="حذف البائع"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {filteredSellers.map((seller) => (
          <div
            key={seller._id}
            className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center text-xs font-bold text-primary border border-slate-100">
                  {seller?.name?.charAt(0) || "S"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      {seller.name}
                    </h4>
                    {seller.isTrialActive && (
                      <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-black">
                        تجريبي
                      </span>
                    )}
                    {seller.isLocked && (
                      <span className="text-[8px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-full font-black flex items-center gap-0.5">
                        <Lock className="w-2 h-2" /> متوقف
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-secondary">
                    {seller.email}
                  </span>
                </div>
              </div>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold",
                  seller.paymentStatus === "paid"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-amber-50 text-amber-600",
                )}
              >
                {seller.paymentStatus === "paid" ? "تم الدفع" : "معلق"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-200/60">
              <div>
                <span className="text-[10px] text-secondary block mb-0.5">
                  المبيعات
                </span>
                <span className="text-xs font-black text-slate-900">
                  {seller.totalSales?.toLocaleString() || 0} ج.م
                </span>
              </div>
              <div>
                <span className="text-[10px] text-secondary block mb-0.5">
                  العمولة
                </span>
                <span className="text-xs font-black text-primary">
                  {seller.commission?.toLocaleString() || 0} ج.م
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-secondary font-bold">
                {seller.phone}
              </span>
              <div className="flex items-center gap-2">
                <Link
                  to={`/admin/sellers/${seller._id}`}
                  className="p-2 text-primary bg-white border border-slate-200 rounded-lg"
                >
                  <BarChart3 className="w-4 h-4" />
                </Link>
                <Link
                  to={`/seller/${seller._id}`}
                  className="p-2 text-secondary bg-white border border-slate-200 rounded-lg"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleToggleLock(seller._id)}
                  className={cn(
                    "p-2 bg-white border border-slate-200 rounded-lg",
                    seller.isLocked ? "text-emerald-500" : "text-amber-500",
                  )}
                >
                  {seller.isLocked ? (
                    <Unlock className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDeleteSeller(seller._id)}
                  className="p-2 text-rose-500 bg-white border border-slate-200 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DashboardPage = () => {
  const location = useLocation();
  const path = location.pathname;
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user || (user.role !== "admin" && user.role !== "seller")) return;

      setLoading(true);
      try {
        const res = await orderService.getStats();
        setStats(res.data);
      } catch (error: any) {
        if (error.response?.status !== 401) {
          console.error("Error fetching stats:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [path, user]);

  if (path.includes("/orders")) return <DashboardOrders />;
  if (path.includes("/products")) return <DashboardProducts />;
  if (path.includes("/earnings")) return <DashboardEarnings />;
  if (path.includes("/users")) return <DashboardUsers />;
  if (path.includes("/settings")) return <DashboardSettings />;

  const sellerMatch = path.match(/\/admin\/sellers\/([^\/]+)/i);
  if (sellerMatch && sellerMatch[1] !== "sellers")
    return <DashboardSellerDetail sellerId={sellerMatch[1]} />;

  if (path.includes("/sellers")) return <DashboardSellers />;

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  const isAdmin = user?.role === "admin";

  const dashboardStats = [
    {
      title: isAdmin ? "إجمالي مبيعات البائعين" : "إجمالي المبيعات",
      value: `${stats?.totalEarnings || 0} ج.م`,
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      title: isAdmin ? "إجمالي المستخدمين" : "الطلبات المعلقة",
      value: isAdmin ? stats?.totalUsers || 0 : stats?.pending || 0,
      icon: isAdmin ? Users : ShoppingBag,
      color: isAdmin ? "text-purple-500" : "text-rose-500",
      bg: isAdmin ? "bg-purple-50" : "bg-rose-50",
    },
    {
      title: isAdmin ? "إجمالي البائعين" : "الطلبات المكتملة",
      value: isAdmin ? stats?.totalSellers || 0 : stats?.delivered || 0,
      icon: isAdmin ? ShieldCheck : TrendingUp,
      color: isAdmin ? "text-blue-500" : "text-blue-500",
      bg: isAdmin ? "bg-blue-50" : "bg-blue-50",
    },
    {
      title: isAdmin ? "إجمالي المنتجات" : "إجمالي الطلبات",
      value: isAdmin ? stats?.totalProducts || 0 : stats?.totalOrders || 0,
      icon: isAdmin ? Package : Package,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    ...(!isAdmin
      ? [
          {
            title: "عمولة المنصة المستحقة",
            value: `${stats?.totalCommission || 0} ج.م`,
            icon: PieChartIcon,
            color: "text-rose-500",
            bg: "bg-rose-50",
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-8">
      <TrialBanner user={user} stats={stats} />

      {/* Stats Grid */}
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 gap-6",
          isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3 xl:grid-cols-5",
        )}
      >
        {dashboardStats.map((stat, idx) => (
          <div
            key={stat.title}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  stat.bg,
                  stat.color,
                )}
              >
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="text-secondary text-xs font-bold mb-1">
              {stat.title}
            </div>
            <div className="text-2xl font-black text-slate-900">
              {stat.value}
            </div>

            {/* Breakdown for Total Sales card (index 0) */}
            {idx === 0 && (
              <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-slate-50">
                <div className="text-[10px] text-slate-500 font-bold flex justify-between">
                  <span>
                    {isAdmin ? "مبيعات المنتجات:" : "أرباح المنتجات:"}
                  </span>
                  <span>
                    {stats?.totalProductEarnings?.toLocaleString() || 0} ج.م
                  </span>
                </div>
                <div className="text-[10px] text-emerald-600 font-bold flex justify-between">
                  <span>أرباح التوصيل:</span>
                  <span>
                    {stats?.totalDeliveryEarnings?.toLocaleString() || 0} ج.م
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 mb-4">
          أهلاً بك، {user?.name}
        </h3>
        <p className="text-secondary text-sm">
          {isAdmin
            ? "أنت في لوحة تحكم المدير. يمكنك من هنا إدارة جميع جوانب المنصة، من المستخدمين والمنتجات إلى الطلبات والإحصائيات."
            : "أهلاً بك في لوحة التحكم الخاصة بك. هنا يمكنك متابعة أداء متجرك وإدارة طلباتك ومنتجاتك بكل سهولة."}
        </p>
      </div>

      {!isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-rose-600 p-4 sm:p-6 lg:p-8 rounded-[2.5rem] text-white">
            <h4 className="text-sm font-bold opacity-60 mb-2">
              عمولة المنصة المستحقة
            </h4>
            <div className="text-4xl font-black">
              {stats?.totalCommission || 0} ج.م
            </div>
            <p className="text-[10px] opacity-70 mt-4 font-bold leading-relaxed">
              هذا المبلغ يتم استقطاعه من إجمالي مبيعات منتجاتك بنسبة{" "}
              {((stats?.globalCommissionRate || 0) * 100).toFixed(0)}% لصالح
              المنصة.
            </p>
          </div>
          <div className="bg-emerald-600 p-4 sm:p-6 lg:p-8 rounded-[2.5rem] text-white">
            <h4 className="text-sm font-bold opacity-60 mb-2">
              صافي أرباح المنتجات
            </h4>
            <div className="text-4xl font-black">
              {(stats?.totalProductEarnings || 0) -
                (stats?.totalCommission || 0) || 0}{" "}
              ج.م
            </div>
            <p className="text-[10px] opacity-70 mt-4 font-bold">
              صافي الربح المتبقي لك بعد خصم عمولة المنصة (لا يشمل أرباح
              التوصيل).
            </p>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 p-4 sm:p-6 lg:p-8 rounded-[2.5rem] text-white">
            <h4 className="text-sm font-bold opacity-60 mb-2">
              إجمالي عمولة المنصة
            </h4>
            <div className="text-4xl font-black">
              {stats?.totalCommission || 0} ج.م
            </div>
            <p className="text-[10px] opacity-40 mt-4 font-bold">
              تُحسب العمولة بنسبة{" "}
              {((stats?.globalCommissionRate || 0) * 100).toFixed(0)}% فور قبول
              البائع للطلب
            </p>
          </div>
          <div className="bg-primary p-4 sm:p-6 lg:p-8 rounded-[2.5rem] text-white">
            <h4 className="text-sm font-bold opacity-60 mb-2">
              المنتجات النشطة
            </h4>
            <div className="text-4xl font-black">
              {stats?.totalProducts || 0}
            </div>
            <Link
              to="/admin/products"
              className="text-[10px] font-bold underline mt-4 block"
            >
              إدارة المنتجات
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
