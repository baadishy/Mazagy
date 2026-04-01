import React, { useState, useEffect } from 'react';
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
  Tag as TagIcon,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
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
  Pie
} from 'recharts';
import { cn } from '../lib/utils';
import { orderService, productService, authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from '../components/NotificationBell';
import { Logo } from '../components/Logo';

const DashboardContext = React.createContext<{ searchQuery: string; setSearchQuery: (q: string) => void }>({
  searchQuery: '',
  setSearchQuery: () => {},
});

export const useDashboard = () => React.useContext(DashboardContext);

export const DashboardLayout = ({ children, title }: { children: React.ReactNode, title: string }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const isAdmin = user?.role === 'admin';
  const isAdminPath = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (!loading && isAdminPath && user?.role !== 'admin') {
      toast.error('غير مصرح لك بالدخول لهذه الصفحة');
      navigate('/admin/login');
    }
  }, [user, loading, isAdminPath, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const menuItems = [
    { name: 'لوحة التحكم', icon: LayoutDashboard, path: isAdmin ? '/admin' : '/seller' },
    { name: 'الطلبات', icon: ShoppingBag, path: isAdmin ? '/admin/orders' : '/seller/orders' },
    { name: 'المنتجات', icon: Package, path: isAdmin ? '/admin/products' : '/seller/products' },
    { name: 'الأرباح', icon: DollarSign, path: isAdmin ? '/admin/earnings' : '/seller/earnings' },
    ...(isAdmin ? [
      { name: 'البائعين', icon: ShieldCheck, path: '/admin/sellers' },
      { name: 'المستخدمين', icon: Users, path: '/admin/users' }
    ] : []),
    { name: 'الإعدادات', icon: Settings, path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row" dir="rtl">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-l border-slate-200 p-6 flex-col gap-8 sticky top-0 h-screen overflow-y-auto">
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
                  : "text-secondary hover:bg-slate-50 hover:text-primary"
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around z-50 shadow-2xl">
        {menuItems.slice(0, 4).map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
              location.pathname === item.path ? "text-primary" : "text-secondary"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-bold">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-hidden min-w-0 pb-24 md:pb-8">
        {/* Top Bar */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-slate-900">{title}</h1>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
              <input 
                type="text" 
                placeholder="بحث..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
              />
            </div>
            <NotificationBell />
            <Link to="/profile" className="w-10 h-10 bg-slate-200 rounded-xl overflow-hidden border-2 border-white shadow-sm">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=random&size=100`} alt="User" className="w-full h-full object-cover" />
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

export const DashboardOrders = ({ sellerId }: { sellerId?: string }) => {
  const { user } = useAuth();
  const location = useLocation();
  const path = location.pathname;
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [confirmingAction, setConfirmingAction] = useState<{ id: string, status: string, name: string } | null>(null);
  const { searchQuery, setSearchQuery } = useDashboard();

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await orderService.getOrders();
      let fetchedOrders = Array.isArray(res.data) ? res.data : [];
      
      // If admin is viewing a specific seller's orders
      if (sellerId) {
        fetchedOrders = fetchedOrders.filter((o: any) => o.sellerId?._id === sellerId || o.sellerId === sellerId);
      }
      
      setOrders(fetchedOrders);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Error fetching orders:', error);
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
      await orderService.updateOrderStatus(confirmingAction.id, confirmingAction.status);
      setOrders(orders.map(o => o._id === confirmingAction.id ? { ...o, status: confirmingAction.status } : o));
      
      const statusLabels: any = {
        'confirmed': 'تم تأكيد الطلب',
        'rejected': 'تم إلغاء الطلب',
        'delivered': 'تم توصيل الطلب'
      };
      toast.success(statusLabels[confirmingAction.status] || 'تم تحديث الحالة بنجاح');
      
      setConfirmingAction(null);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('فشل تحديث حالة الطلب');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const filteredOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .filter(order => {
    // Filter out cancelled orders from seller dashboard as requested
    if (order.status === 'cancelled') return false;

    const matchesSearch = 
      order.buyerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order._id?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'active') {
      return ['pending', 'confirmed'].includes(order.status);
    } else {
      return ['delivered', 'rejected'].includes(order.status);
    }
  });

  return (
    <div className="bg-white p-4 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
      <AnimatePresence>
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
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6",
                confirmingAction.status === 'rejected' ? "bg-rose-50 text-rose-500" : 
                confirmingAction.status === 'confirmed' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
              )}>
                {confirmingAction.status === 'rejected' ? <Trash2 className="w-8 h-8" /> : 
                 confirmingAction.status === 'confirmed' ? <ShieldCheck className="w-8 h-8" /> : <Truck className="w-8 h-8" />}
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">هل أنت متأكد؟</h3>
              <p className="text-secondary text-sm font-bold mb-8">
                أنت على وشك تغيير حالة طلب {confirmingAction.name} إلى {
                  confirmingAction.status === 'confirmed' ? 'مؤكد' : 
                  confirmingAction.status === 'rejected' ? 'ملغى' : 'مكتمل'
                }.
                {confirmingAction.status !== 'confirmed' && ' لا يمكن التراجع عن هذا الإجراء.'}
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleStatusUpdate}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-sm shadow-lg transition-all",
                    confirmingAction.status === 'rejected' ? "bg-rose-500 text-white shadow-rose-200 hover:bg-rose-600" : 
                    "bg-slate-900 text-white shadow-slate-200 hover:bg-primary"
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
            onClick={() => setActiveTab('active')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-bold transition-all",
              activeTab === 'active' ? "bg-white text-primary shadow-sm" : "text-secondary hover:text-primary"
            )}
          >
            الطلبات النشطة
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-bold transition-all",
              activeTab === 'history' ? "bg-white text-primary shadow-sm" : "text-secondary hover:text-primary"
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
              {user?.role === 'admin' && <th className="pb-4 px-4 font-bold">البائع</th>}
              <th className="pb-4 px-4 font-bold">المنتج</th>
              <th className="pb-4 px-4 font-bold">السعر</th>
              <th className="pb-4 px-4 font-bold">الحالة</th>
              <th className="pb-4 px-4 font-bold">التاريخ</th>
              <th className="pb-4 px-4 font-bold">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={user?.role === 'admin' ? 8 : 7} className="py-12 text-center text-secondary font-bold">لا توجد طلبات لعرضها</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-500">{order._id.slice(-6).toUpperCase()}</td>
                  <td className="py-4 px-4 font-bold text-slate-900">{order.buyerName}</td>
                  {user?.role === 'admin' && (
                    <td className="py-4 px-4">
                      <Link to={`/seller/${order.sellerId?._id}`} className="text-primary hover:underline font-bold">
                        {order.sellerId?.name || 'بائع غير معروف'}
                      </Link>
                    </td>
                  )}
                  <td className="py-4 px-4 font-bold text-slate-900">{order.productId?.name}</td>
                  <td className="py-4 px-4 font-black text-slate-900">{order.price} ج.م</td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold",
                      order.status === 'delivered' ? "bg-emerald-50 text-emerald-600" :
                      order.status === 'pending' ? "bg-amber-50 text-amber-600" :
                      order.status === 'rejected' ? "bg-rose-50 text-rose-600" :
                      "bg-blue-50 text-blue-600"
                    )}>
                      {order.status === 'delivered' ? 'مكتمل' : 
                       order.status === 'pending' ? 'معلق' : 
                       order.status === 'rejected' ? 'ملغى' : 'مؤكد'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-secondary text-xs">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {order.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => setConfirmingAction({ id: order._id, status: 'confirmed', name: order.productId?.name })}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black hover:bg-blue-100 transition-all"
                          >
                            تأكيد
                          </button>
                          <button 
                            onClick={() => setConfirmingAction({ id: order._id, status: 'rejected', name: order.productId?.name })}
                            className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black hover:bg-rose-100 transition-all"
                          >
                            إلغاء
                          </button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <>
                          <button 
                            onClick={() => setConfirmingAction({ id: order._id, status: 'delivered', name: order.productId?.name })}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black hover:bg-emerald-100 transition-all"
                          >
                            توصيل
                          </button>
                          <button 
                            onClick={() => setConfirmingAction({ id: order._id, status: 'rejected', name: order.productId?.name })}
                            className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black hover:bg-rose-100 transition-all"
                          >
                            إلغاء
                          </button>
                        </>
                      )}
                      {(order.status === 'delivered' || order.status === 'rejected') && (
                        <span className="text-[10px] font-bold text-slate-400 italic">لا توجد إجراءات</span>
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
          <div className="py-12 text-center text-secondary font-bold">لا توجد طلبات لعرضها</div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black text-slate-400 block">#{order._id.slice(-6).toUpperCase()}</span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{order.productId?.name}</h4>
                </div>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold",
                  order.status === 'delivered' ? "bg-emerald-50 text-emerald-600" :
                  order.status === 'pending' ? "bg-amber-50 text-amber-600" :
                  order.status === 'rejected' ? "bg-rose-50 text-rose-600" :
                  "bg-blue-50 text-blue-600"
                )}>
                  {order.status === 'delivered' ? 'مكتمل' : 
                   order.status === 'pending' ? 'معلق' : 
                   order.status === 'rejected' ? 'ملغى' : 'مؤكد'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-200/60">
                <div>
                  <span className="text-[10px] text-secondary block mb-0.5">العميل</span>
                  <span className="text-xs font-bold text-slate-700">{order.buyerName}</span>
                </div>
                {user?.role === 'admin' && (
                  <div>
                    <span className="text-[10px] text-secondary block mb-0.5">البائع</span>
                    <span className="text-xs font-bold text-primary">{order.sellerId?.name}</span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-secondary block mb-0.5">المبلغ</span>
                  <span className="text-xs font-black text-primary">{order.price} ج.م</span>
                </div>
                <div>
                  <span className="text-[10px] text-secondary block mb-0.5">التاريخ</span>
                  <span className="text-xs text-slate-600">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {order.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => setConfirmingAction({ id: order._id, status: 'confirmed', name: order.productId?.name })}
                      className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black"
                    >
                      تأكيد
                    </button>
                    <button 
                      onClick={() => setConfirmingAction({ id: order._id, status: 'rejected', name: order.productId?.name })}
                      className="flex-1 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black"
                    >
                      إلغاء
                    </button>
                  </>
                )}
                {order.status === 'confirmed' && (
                  <>
                    <button 
                      onClick={() => setConfirmingAction({ id: order._id, status: 'delivered', name: order.productId?.name })}
                      className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black"
                    >
                      توصيل
                    </button>
                    <button 
                      onClick={() => setConfirmingAction({ id: order._id, status: 'rejected', name: order.productId?.name })}
                      className="flex-1 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black"
                    >
                      إلغاء
                    </button>
                  </>
                )}
                {(order.status === 'delivered' || order.status === 'rejected') && (
                  <div className="w-full text-center py-2 text-[10px] font-bold text-slate-400 italic">لا توجد إجراءات متاحة</div>
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
        : user.role === 'admin' 
          ? await productService.getProducts() 
          : await productService.getSellerProducts(user.id);
      
      if ((sellerId || user.role !== 'admin') && res.data.products) {
        setProducts(res.data.products);
      } else {
        setProducts(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
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
      setProducts(products.filter(p => p._id !== deletingId));
      setDeletingId(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      setDeleteError('فشل في حذف المنتج، يرجى المحاولة مرة أخرى');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-black text-slate-900">إدارة المنتجات</h3>
        <Link to="/seller/add-product" className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> إضافة منتج جديد
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-secondary font-bold">لا توجد منتجات لعرضها</div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col relative">
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
                  <p className="text-xs text-secondary font-bold">هل أنت متأكد من رغبتك في حذف "{product.name}"؟ لا يمكن التراجع عن هذا الإجراء.</p>
                  
                  {deleteError && (
                    <p className="text-[10px] text-rose-500 font-bold bg-rose-50 px-3 py-1 rounded-lg">{deleteError}</p>
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
                    خصم {Math.round((1 - product.salePrice / product.price) * 100)}%
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
                  <h4 className="font-black text-slate-900 line-clamp-1 text-lg">{product.name}</h4>
                  {user?.role === 'admin' && (
                    <Link to={`/seller/${product.sellerId?._id}`} className="text-[10px] font-bold text-primary hover:underline">
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
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">السعر</span>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-black text-xl">
                      {product.isOnSale ? product.salePrice : product.price} ج.م
                    </span>
                    {product.isOnSale && (
                      <span className="text-xs text-slate-400 line-through font-bold">
                        {product.price} ج.م
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">التقييم</span>
                  <div className="flex items-center gap-1 text-amber-500 font-black">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-sm">{product.averageRating || 0}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-secondary" />
                  <span className="text-xs font-bold text-slate-700">الضمان:</span>
                </div>
                <span className="text-xs font-black text-primary">
                  {product.warranty === 'no warranty' ? 'بدون ضمان' : 
                   product.warranty === '6 months' ? '6 أشهر' :
                   product.warranty === '1 year' ? 'سنة واحدة' :
                   product.warranty === '2 years' ? 'سنتان' :
                   product.warranty === '3 years' ? '3 سنوات' : 'مدى الحياة'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2">
                <Link 
                  to={`/seller/edit-product/${product._id}`}
                  className="flex items-center justify-center gap-2 py-3 bg-white text-slate-900 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-all border border-slate-200"
                >
                  <Edit className="w-3.5 h-3.5" />
                </Link>
                <Link 
                  to={`/product/${product._id}`}
                  className="flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-2xl text-xs font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/20"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Link>
                <button 
                  onClick={() => handleDeleteProduct(product._id)}
                  className="flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold hover:bg-rose-100 transition-all border border-rose-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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

export const DashboardEarnings = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const location = useLocation();
  const path = location.pathname;
  const { searchQuery, setSearchQuery } = useDashboard();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user || (user.role !== 'admin' && user.role !== 'seller')) return;
      
      setLoading(true);
      try {
        const res = await orderService.getStats();
        setStats(res.data);
      } catch (error: any) {
        if (error.response?.status !== 401) {
          console.error('Error fetching stats:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [path, user]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const filteredTransactions = (stats?.recentTransactions || []).filter((tx: any) => 
    tx.product?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.buyer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1">إجمالي الأرباح</div>
          <div className="text-4xl font-black text-slate-900 tracking-tight">{stats?.totalEarnings?.toLocaleString() || 0} ج.م</div>
          <div className="flex flex-col gap-1 mt-3">
            <div className="text-[10px] text-slate-500 font-bold flex justify-between">
              <span>مبيعات المنتجات:</span>
              <span>{stats?.totalProductEarnings?.toLocaleString() || 0} ج.م</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-bold flex justify-between">
              <span>أرباح التوصيل:</span>
              <span>{stats?.totalDeliveryEarnings?.toLocaleString() || 0} ج.م</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all group">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1">الطلبات المكتملة</div>
          <div className="text-4xl font-black text-slate-900 tracking-tight">{stats?.delivered || 0}</div>
          <div className="text-[10px] text-emerald-500 mt-2 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12% عن الشهر الماضي
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 transition-all group">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1">إجمالي الطلبات</div>
          <div className="text-4xl font-black text-slate-900 tracking-tight">{stats?.totalOrders || 0}</div>
          <div className="text-[10px] text-slate-400 mt-2 font-bold">نشاط مرتفع هذا الأسبوع</div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all group">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Truck className="w-6 h-6" />
          </div>
          <div className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1">أرباح التوصيل</div>
          <div className="text-4xl font-black text-slate-900 tracking-tight">{stats?.totalDeliveryEarnings?.toLocaleString() || 0} ج.م</div>
          <div className="text-[10px] text-purple-500 mt-2 font-bold">من {stats?.delivered || 0} طلب تم توصيله</div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Earnings Chart */}
        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900">تحليل الأرباح</h3>
              <p className="text-secondary text-[10px] font-bold uppercase tracking-wider">آخر 7 أيام</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-[10px] font-bold text-slate-500">المبيعات اليومية</span>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.earningsByDay || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  tickFormatter={(value) => `${value} ج.م`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    fontFamily: 'inherit'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#141414" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#141414', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Order Status Distribution */}
        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[400px] flex flex-col">
          <h3 className="text-lg font-black text-slate-900 mb-8">توزيع الحالات</h3>
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
                  {(stats?.ordersByStatus || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-900">{stats?.totalOrders || 0}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">إجمالي الطلبات</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {(stats?.ordersByStatus || []).map((status: any) => (
              <div key={status.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }}></div>
                <span className="text-xs font-bold text-slate-600">{status.name}</span>
                <span className="text-xs font-black text-slate-900 mr-auto">{status.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sales by Category Pie Chart */}
        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[400px] flex flex-col">
          <h3 className="text-lg font-black text-slate-900 mb-8">المبيعات حسب الفئة</h3>
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
                  {(stats?.salesByCategory || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value} ج.م`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 max-h-[100px] overflow-y-auto">
            {(stats?.salesByCategory || []).map((cat: any) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                <span className="text-[10px] font-bold text-slate-600 truncate">{cat.name}</span>
                <span className="text-[10px] font-black text-slate-900 mr-auto">{cat.value} ج.م</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Review Distribution Chart */}
        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[400px] flex flex-col">
          <h3 className="text-lg font-black text-slate-900 mb-8">توزيع التقييمات</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.reviewDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="rating" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  tickFormatter={(value) => `${value} نجوم`}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
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
              <span className="text-[10px] font-bold text-slate-500">عدد المراجعات</span>
            </div>
          </div>
        </motion.div>

        {/* Top Products Bar Chart */}
        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm lg:col-span-2 h-[400px] flex flex-col">
          <h3 className="text-lg font-black text-slate-900 mb-8">أداء المنتجات</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.topProducts || []} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
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

        {/* Recent Transactions Table */}
        <motion.div variants={itemVariants} className="bg-white p-4 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm lg:col-span-2">
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
              <Link to="/seller/orders" className="text-xs font-bold text-primary hover:underline shrink-0">عرض الكل</Link>
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
                  <th className="pb-4 px-4 font-bold">التاريخ</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredTransactions.map((tx: any) => (
                  <tr key={tx.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">{tx.product}</td>
                    <td className="py-4 px-4 text-secondary">{tx.buyer}</td>
                    <td className="py-4 px-4 font-black text-slate-900">{tx.amount} ج.م</td>
                    <td className="py-4 px-4 text-secondary text-xs">{new Date(tx.date).toLocaleDateString('ar-EG')}</td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-bold italic">لا توجد عمليات مطابقة للبحث</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3">
            {filteredTransactions.map((tx: any) => (
              <div key={tx.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900 text-xs">{tx.product}</h4>
                  <span className="text-xs font-black text-primary">{tx.amount} ج.م</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-secondary">{tx.buyer}</span>
                  <span className="text-slate-400">{new Date(tx.date).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>
            ))}
            {filteredTransactions.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs font-bold italic">لا توجد عمليات مطابقة للبحث</div>
            )}
          </div>
        </motion.div>
      </div>

      {user?.role === 'admin' && (
        <motion.div 
          variants={itemVariants}
          className="bg-slate-900 p-12 rounded-[3rem] text-white relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-primary/30 transition-colors"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2 opacity-60">عمولة المنصة الإجمالية (10%)</h3>
            <div className="text-6xl font-black tracking-tighter mb-4">{stats?.totalCommission?.toLocaleString() || 0} ج.م</div>
            <p className="text-sm opacity-60 max-w-md font-bold">هذه هي الأرباح الصافية للمنصة من جميع العمليات المكتملة بنجاح.</p>
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
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      const res = await authService.getAllUsers();
      setUsers(res.data);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Error fetching users:', error);
        toast.error('فشل في تحميل قائمة المستخدمين');
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
      toast.error('لا يمكنك حذف حسابك الخاص');
      return;
    }
    
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا المستخدم؟ سيتم حذف جميع بياناته نهائياً.')) {
      return;
    }

    try {
      await authService.deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
      toast.success('تم حذف المستخدم بنجاح');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('فشل في حذف المستخدم');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white p-4 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
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
                <td colSpan={5} className="py-12 text-center text-secondary font-bold">لا يوجد مستخدمون لعرضهم</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center text-[10px] font-bold text-primary">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <span className="font-bold text-slate-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-secondary">{user.email}</td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold",
                      user.role === 'admin' ? "bg-purple-50 text-purple-600" : 
                      user.role === 'seller' ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-600"
                    )}>
                      {user.role === 'admin' ? 'مدير' : user.role === 'seller' ? 'بائع' : 'مشتري'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-secondary text-xs">{new Date(user.createdAt).toLocaleDateString('ar-EG')}</td>
                  <td className="py-4 px-4 text-left">
                    <div className="flex items-center justify-end gap-2">
                      {user.role === 'seller' && (
                        <Link to={`/seller/${user._id}`} className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors">
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
          <div className="py-12 text-center text-secondary font-bold">لا يوجد مستخدمون لعرضهم</div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white flex items-center justify-center text-[10px] font-bold text-primary border border-slate-100">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{user.name}</h4>
                    <span className="text-[10px] text-secondary">{user.email}</span>
                  </div>
                </div>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold",
                  user.role === 'admin' ? "bg-purple-50 text-purple-600" : 
                  user.role === 'seller' ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-600"
                )}>
                  {user.role === 'admin' ? 'مدير' : user.role === 'seller' ? 'بائع' : 'مشتري'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                <span className="text-[10px] text-secondary">انضم في: {new Date(user.createdAt).toLocaleDateString('ar-EG')}</span>
                <div className="flex items-center gap-2">
                  {user.role === 'seller' && (
                    <Link to={`/seller/${user._id}`} className="p-2 text-primary bg-white border border-slate-200 rounded-lg">
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
          orderService.getAdminSellers()
        ]);
        setStats(statsRes.data);
        const info = sellersRes.data.find((s: any) => s._id === sellerId);
        setSellerInfo(info);
      } catch (error) {
        console.error('Error fetching seller details:', error);
        toast.error('فشل في تحميل بيانات البائع');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sellerId]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Link to="/admin/sellers" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-black text-slate-900">تفاصيل البائع: {sellerInfo?.name}</h2>
          <p className="text-secondary text-sm font-bold">{sellerInfo?.email} • {sellerInfo?.phone}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-secondary text-[10px] font-bold uppercase tracking-wider mb-1">إجمالي المبيعات</div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalEarnings || 0} ج.م</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-secondary text-[10px] font-bold uppercase tracking-wider mb-1">العمولة المستحقة</div>
          <div className="text-2xl font-black text-primary">{sellerInfo?.commission || 0} ج.م</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-secondary text-[10px] font-bold uppercase tracking-wider mb-1">الطلبات المكتملة</div>
          <div className="text-2xl font-black text-emerald-500">{stats?.delivered || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-secondary text-[10px] font-bold uppercase tracking-wider mb-1">الطلبات المعلقة</div>
          <div className="text-2xl font-black text-amber-500">{stats?.pending || 0}</div>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="text-lg font-black text-slate-900 mb-4 px-4">منتجات البائع</h3>
          <DashboardProducts sellerId={sellerId} />
        </section>
        <section>
          <h3 className="text-lg font-black text-slate-900 mb-4 px-4">طلبات البائع</h3>
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
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      const res = await orderService.getAdminSellers();
      setSellers(res.data);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Error fetching sellers:', error);
        toast.error('فشل في تحميل قائمة البائعين');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleDeleteSeller = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا البائع؟ سيتم حذف جميع منتجاته أيضاً.')) return;
    try {
      await authService.deleteUser(id);
      setSellers(sellers.filter(s => s._id !== id));
      toast.success('تم حذف البائع بنجاح');
    } catch (error) {
      console.error('Error deleting seller:', error);
      toast.error('فشل في حذف البائع');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const filteredSellers = sellers.filter(seller => 
    seller.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seller.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seller.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white p-4 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
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
                <td colSpan={6} className="py-12 text-center text-secondary font-bold">لا يوجد بائعون لعرضهم</td>
              </tr>
            ) : (
              filteredSellers.map((seller) => (
                <tr key={seller._id} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center text-xs font-bold text-primary">
                        {seller?.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{seller.name}</span>
                        <span className="text-[10px] text-secondary">{seller.location?.address || 'لا يوجد موقع'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-600">{seller.email}</span>
                      <span className="text-xs text-slate-600 font-bold">{seller.phone}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-black text-slate-900">{seller.totalSales?.toLocaleString() || 0} ج.م</td>
                  <td className="py-4 px-4 font-black text-primary">{seller.commission?.toLocaleString() || 0} ج.م</td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold",
                      seller.paymentStatus === 'paid' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {seller.paymentStatus === 'paid' ? 'تم الدفع' : 'معلق'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-left">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/sellers/${seller._id}`} className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors" title="لوحة تحكم البائع">
                        <BarChart3 className="w-4 h-4" />
                      </Link>
                      <Link to={`/seller/${seller._id}`} className="p-2 text-secondary hover:bg-slate-100 rounded-lg transition-colors" title="عرض المتجر">
                        <Eye className="w-4 h-4" />
                      </Link>
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
          <div key={seller._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center text-xs font-bold text-primary border border-slate-100">
                  {seller?.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{seller.name}</h4>
                  <span className="text-[10px] text-secondary">{seller.email}</span>
                </div>
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold",
                seller.paymentStatus === 'paid' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
              )}>
                {seller.paymentStatus === 'paid' ? 'تم الدفع' : 'معلق'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-200/60">
              <div>
                <span className="text-[10px] text-secondary block mb-0.5">المبيعات</span>
                <span className="text-xs font-black text-slate-900">{seller.totalSales?.toLocaleString() || 0} ج.م</span>
              </div>
              <div>
                <span className="text-[10px] text-secondary block mb-0.5">العمولة</span>
                <span className="text-xs font-black text-primary">{seller.commission?.toLocaleString() || 0} ج.م</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-secondary font-bold">{seller.phone}</span>
              <div className="flex items-center gap-2">
                <Link to={`/admin/sellers/${seller._id}`} className="p-2 text-primary bg-white border border-slate-200 rounded-lg">
                  <BarChart3 className="w-4 h-4" />
                </Link>
                <Link to={`/seller/${seller._id}`} className="p-2 text-secondary bg-white border border-slate-200 rounded-lg">
                  <Eye className="w-4 h-4" />
                </Link>
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
      if (!user || (user.role !== 'admin' && user.role !== 'seller')) return;

      setLoading(true);
      try {
        const res = await orderService.getStats();
        setStats(res.data);
      } catch (error: any) {
        if (error.response?.status !== 401) {
          console.error('Error fetching stats:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [path, user]);

  if (path.includes('/orders')) return <DashboardOrders />;
  if (path.includes('/products')) return <DashboardProducts />;
  if (path.includes('/earnings')) return <DashboardEarnings />;
  if (path.includes('/users')) return <DashboardUsers />;
  
  const sellerMatch = path.match(/\/admin\/sellers\/([^\/]+)/i);
  if (sellerMatch && sellerMatch[1] !== 'sellers') return <DashboardSellerDetail sellerId={sellerMatch[1]} />;
  
  if (path.includes('/sellers')) return <DashboardSellers />;

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const isAdmin = user?.role === 'admin';

  const dashboardStats = [
    { 
      title: isAdmin ? 'إجمالي مبيعات المنصة' : 'إجمالي المبيعات', 
      value: `${stats?.totalEarnings || 0} ج.م`, 
      trend: '+10%', 
      isUp: true, 
      icon: DollarSign, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50' 
    },
    { 
      title: isAdmin ? 'إجمالي المستخدمين' : 'الطلبات المعلقة', 
      value: isAdmin ? (stats?.totalUsers || 0) : (stats?.pending || 0), 
      trend: isAdmin ? '+12%' : '-2%', 
      isUp: isAdmin ? true : false, 
      icon: isAdmin ? Users : ShoppingBag, 
      color: isAdmin ? 'text-purple-500' : 'text-rose-500', 
      bg: isAdmin ? 'bg-purple-50' : 'bg-rose-50' 
    },
    { 
      title: isAdmin ? 'إجمالي البائعين' : 'الطلبات المكتملة', 
      value: isAdmin ? (stats?.totalSellers || 0) : (stats?.delivered || 0), 
      trend: '+5%', 
      isUp: true, 
      icon: isAdmin ? ShieldCheck : TrendingUp, 
      color: isAdmin ? 'text-blue-500' : 'text-blue-500', 
      bg: isAdmin ? 'bg-blue-50' : 'bg-blue-50' 
    },
    { 
      title: isAdmin ? 'إجمالي المنتجات' : 'إجمالي الطلبات', 
      value: isAdmin ? (stats?.totalProducts || 0) : (stats?.totalOrders || 0), 
      trend: '+3%', 
      isUp: true, 
      icon: isAdmin ? Package : Package, 
      color: 'text-amber-500', 
      bg: 'bg-amber-50' 
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="text-secondary text-xs font-bold mb-1">{stat.title}</div>
            <div className="text-2xl font-black text-slate-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 mb-4">أهلاً بك، {user?.name}</h3>
        <p className="text-secondary text-sm">
          {isAdmin 
            ? 'أنت في لوحة تحكم المدير. يمكنك من هنا إدارة جميع جوانب المنصة، من المستخدمين والمنتجات إلى الطلبات والإحصائيات.'
            : 'أهلاً بك في لوحة التحكم الخاصة بك. هنا يمكنك متابعة أداء متجرك وإدارة طلباتك ومنتجاتك بكل سهولة.'}
        </p>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
            <h4 className="text-sm font-bold opacity-60 mb-2">إجمالي عمولة المنصة</h4>
            <div className="text-4xl font-black">{stats?.totalCommission || 0} ج.م</div>
            <p className="text-[10px] opacity-40 mt-4 font-bold">يتم احتساب العمولة بناءً على نسبة 0% حالياً (معطلة)</p>
          </div>
          <div className="bg-primary p-8 rounded-[2.5rem] text-white">
            <h4 className="text-sm font-bold opacity-60 mb-2">المنتجات النشطة</h4>
            <div className="text-4xl font-black">{stats?.totalProducts || 0}</div>
            <Link to="/admin/products" className="text-[10px] font-bold underline mt-4 block">إدارة المنتجات</Link>
          </div>
        </div>
      )}
    </div>
  );
};
