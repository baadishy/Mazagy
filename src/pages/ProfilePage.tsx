import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, Mail, Phone, MapPin, Lock, Save, ChevronLeft, ShoppingBag, CreditCard, Package, TrendingUp, Star, Loader2, CheckCircle2, AlertCircle, Map as MapIcon, Bell, Trash2, Check, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { orderService, notificationService } from '../services/api';
import { Order } from '../types';
import { useLocation } from 'react-router-dom';
import { cn, isEgyptianPhone } from '../lib/utils';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Fix Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationPicker = ({ position, setPosition, setAddress }: { position: [number, number], setPosition: (pos: [number, number]) => void, setAddress: (addr: string) => void }) => {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ar`);
        const data = await response.json();
        if (data.display_name) {
          setAddress(data.display_name);
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
      }
    },
  });

  return (
    <Marker position={position} />
  );
};

import { ProductCard } from '../components/ProductCard';

export const ProfilePage = () => {
  const { user, updateProfile, getWishlist, logout, loading: authLoading } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'orders' | 'earnings' | 'wishlist' | 'notifications'>('info');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<{ totalEarnings: number; totalOrders: number; commission: number; totalCommission: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'notifications') {
      setActiveTab('notifications');
    }
  }, [location.search]);

  // Prepare chart data
  const chartData = orders
    .filter(o => o.status === 'delivered')
    .reduce((acc: any[], order) => {
      const date = new Date(order.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.sales += order.price;
      } else {
        acc.push({ date, sales: order.price });
      }
      return acc;
    }, [])
    .slice(-7); // Last 7 days with sales

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.location?.address || '');
  const [position, setPosition] = useState<[number, number]>([user?.location?.lat || 24.7136, user?.location?.lng || 46.6753]);
  const [showMap, setShowMap] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.location?.address || '');
      if (user.location?.lat && user.location?.lng) {
        setPosition([user.location.lat, user.location.lng]);
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const ordersRes = await orderService.getOrders();
        setOrders(ordersRes.data);

        if (user.role === 'seller' || user.role === 'admin' || user.role === 'moderator') {
          const statsRes = await orderService.getStats();
          setEarnings(statsRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch profile data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (activeTab === 'wishlist' && user) {
        try {
          setWishlistLoading(true);
          const res = await getWishlist();
          setWishlistProducts(res.data);
        } catch (err) {
          console.error('Failed to fetch wishlist', err);
        } finally {
          setWishlistLoading(false);
        }
      }
    };
    fetchWishlist();
  }, [activeTab, user, getWishlist]);

  useEffect(() => {
    const fetchNotifications = async (retryCount = 0) => {
      if (activeTab === 'notifications' && user) {
        try {
          if (retryCount === 0) setNotificationsLoading(true);
          const res = await notificationService.getNotifications();
          setNotifications(res.data);
        } catch (err: any) {
          if (err.message === 'Network Error' && retryCount < 3) {
            console.warn(`Retrying profile notifications fetch (${retryCount + 1})...`);
            setTimeout(() => fetchNotifications(retryCount + 1), 2000);
          } else {
            console.error('Failed to fetch notifications', err);
          }
        } finally {
          if (retryCount === 0 || retryCount >= 3) setNotificationsLoading(false);
        }
      }
    };
    fetchNotifications();
  }, [activeTab, user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      setLoading(true);
      await orderService.cancelOrder(orderId);
      const ordersRes = await orderService.getOrders();
      setOrders(ordersRes.data);
      toast.success('تم إلغاء الطلب بنجاح');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل في إلغاء الطلب');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    
    if (!isEgyptianPhone(phone)) {
      setError('يرجى إدخال رقم هاتف مصري صحيح (عشرة أرقام تبدأ بـ 01)');
      return;
    }

    try {
      await updateProfile({ 
        name, 
        phone, 
        location: { address, lat: position[0], lng: position[1] }
      });
      setSuccess('تم تحديث الملف الشخصي بنجاح');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحديث الملف الشخصي');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (newPassword !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }
    try {
      await updateProfile({ currentPassword, password: newPassword });
      setSuccess('تم تحديث كلمة المرور بنجاح');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحديث كلمة المرور');
    }
  };

  if (authLoading && !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-black text-slate-900">يرجى تسجيل الدخول أولاً</h2>
        <Link to="/login" className="bg-primary text-white px-8 py-3 rounded-2xl font-bold">تسجيل الدخول</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex items-center gap-4 mb-12">
        <Link to="/" className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-black text-slate-900">الملف الشخصي</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar / Avatar */}
        <div className="lg:col-span-1 flex flex-col items-center gap-8">
          <div className="relative group">
            <div className="w-48 h-48 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl shadow-slate-200">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=200`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black text-slate-900">{user.name}</h2>
            <p className="text-secondary text-sm">عضو منذ {new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase">
              {user.role === 'seller' ? 'بائع معتمد' : user.role === 'admin' ? 'مدير النظام' : user.role === 'moderator' ? 'مشرف النظام' : 'مشتري'}
            </span>
          </div>
          
          <div className="w-full flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('info')}
              className={`w-full py-3 px-6 rounded-2xl font-bold text-sm text-right flex items-center gap-3 transition-all ${activeTab === 'info' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-50 text-secondary'}`}
            >
              <UserIcon className="w-4 h-4" /> المعلومات الشخصية
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full py-3 px-6 rounded-2xl font-bold text-sm text-right flex items-center gap-3 transition-all ${activeTab === 'security' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-50 text-secondary'}`}
            >
              <Lock className="w-4 h-4" /> الأمان وكلمة المرور
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full py-3 px-6 rounded-2xl font-bold text-sm text-right flex items-center gap-3 transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-50 text-secondary'}`}
            >
              <Package className="w-4 h-4" /> {user.role === 'seller' ? 'طلبات البيع' : 'طلباتي'}
            </button>
            <button 
              onClick={() => setActiveTab('wishlist')}
              className={`w-full py-3 px-6 rounded-2xl font-bold text-sm text-right flex items-center gap-3 transition-all ${activeTab === 'wishlist' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-50 text-secondary'}`}
            >
              <Star className="w-4 h-4" /> قائمة الرغبات
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`w-full py-3 px-6 rounded-2xl font-bold text-sm text-right flex items-center gap-3 transition-all ${activeTab === 'notifications' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-50 text-secondary'}`}
            >
              <Bell className="w-4 h-4" /> التنبيهات
            </button>
            {(user.role === 'seller' || user.role === 'admin' || user.role === 'moderator') && (
              <button 
                onClick={() => setActiveTab('earnings')}
                className={`w-full py-3 px-6 rounded-2xl font-bold text-sm text-right flex items-center gap-3 transition-all ${activeTab === 'earnings' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-50 text-secondary'}`}
              >
                <TrendingUp className="w-4 h-4" /> الأرباح والإحصائيات
              </button>
            )}
            <div className="h-px bg-slate-100 my-4" />
            <button 
              onClick={logout}
              className="w-full py-3 px-6 rounded-2xl font-bold text-sm text-right flex items-center gap-3 transition-all text-rose-500 hover:bg-rose-50"
            >
              <LogOut className="w-4 h-4" /> تسجيل الخروج
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'info' && (
              <motion.div 
                key="info"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-8"
              >
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                  <h3 className="text-lg font-black text-slate-900 mb-8">تعديل المعلومات الشخصية</h3>
                  
                  {success && (
                    <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center gap-3 font-bold">
                      <CheckCircle2 className="w-5 h-5" />
                      {success}
                    </div>
                  )}

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3 font-bold">
                      <AlertCircle className="w-5 h-5" />
                      {error}
                    </div>
                  )}

                  <form className="grid grid-cols-1 sm:grid-cols-2 gap-6" onSubmit={handleUpdateProfile}>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-secondary px-2">الاسم الكامل</label>
                      <div className="relative">
                        <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-50 border-none rounded-2xl pr-10 pl-4 py-3 text-sm focus:ring-2 focus:ring-primary/20" 
                        />
                      </div>
                    </div>
                    {/* Phone Number Field */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-secondary px-2">رقم الهاتف / واتساب</label>
                      <div className="relative">
                        <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                        <input 
                          type="text" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          dir="ltr"
                          className="w-full bg-slate-50 border-none rounded-2xl pr-10 pl-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 text-right" 
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-secondary px-2">العنوان</label>
                      <div className="relative">
                        <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                        <input 
                          type="text" 
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full bg-slate-50 border-none rounded-2xl pr-10 pl-4 py-3 text-sm focus:ring-2 focus:ring-primary/20" 
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 flex flex-col gap-2">
                      <label className="text-xs font-bold text-secondary px-2 flex items-center justify-between">
                        الموقع على الخريطة
                        <button 
                          type="button" 
                          onClick={() => setShowMap(!showMap)}
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <MapIcon className="w-3 h-3" />
                          {showMap ? 'إخفاء الخريطة' : 'تحديد على الخريطة'}
                        </button>
                      </label>
                      
                      {showMap && (
                        <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                          <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <LocationPicker position={position} setPosition={setPosition} setAddress={setAddress} />
                          </MapContainer>
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-2 pt-4">
                      <button 
                        type="submit"
                        className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                      >
                        <Save className="w-5 h-5" /> حفظ التغييرات
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div 
                key="security"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50"
              >
                <h3 className="text-lg font-black text-slate-900 mb-8">تغيير كلمة المرور</h3>
                
                {success && (
                  <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center gap-3 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    {success}
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3 font-bold">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                )}

                <form className="flex flex-col gap-6" onSubmit={handleUpdatePassword}>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-secondary px-2">كلمة المرور الحالية</label>
                    <div className="relative">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                      <input 
                        type="password" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="********" 
                        className="w-full bg-slate-50 border-none rounded-2xl pr-10 pl-4 py-3 text-sm focus:ring-2 focus:ring-primary/20" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-secondary px-2">كلمة المرور الجديدة</label>
                      <div className="relative">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="********" 
                          className="w-full bg-slate-50 border-none rounded-2xl pr-10 pl-4 py-3 text-sm focus:ring-2 focus:ring-primary/20" 
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-secondary px-2">تأكيد كلمة المرور</label>
                      <div className="relative">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                        <input 
                          type="password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="********" 
                          className="w-full bg-slate-50 border-none rounded-2xl pr-10 pl-4 py-3 text-sm focus:ring-2 focus:ring-primary/20" 
                        />
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/20">
                    تحديث كلمة المرور
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div 
                key="orders"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-8"
              >
                {/* Active Orders */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-slate-900">{user.role === 'seller' ? 'طلبات البيع النشطة' : 'طلباتي النشطة'}</h3>
                  </div>
                  
                  {loading ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  ) : orders.filter(o => !['delivered', 'rejected', 'cancelled'].includes(o.status)).length > 0 ? (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-right">
                          <thead>
                            <tr className="text-secondary text-xs font-bold border-b border-slate-100">
                              <th className="pb-4 pr-4">رقم الطلب</th>
                              <th className="pb-4">المنتج</th>
                              <th className="pb-4">التاريخ</th>
                              <th className="pb-4">المبلغ</th>
                              <th className="pb-4">الحالة</th>
                              <th className="pb-4 pl-4"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.filter(o => !['delivered', 'rejected', 'cancelled'].includes(o.status)).map((order) => (
                              <tr key={order._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <td className="py-4 pr-4 font-bold text-xs">{order._id.slice(-6).toUpperCase()}</td>
                                <td className="py-4 text-sm font-bold text-slate-900">{order.productId?.name || 'منتج غير متوفر'}</td>
                                <td className="py-4 text-xs text-secondary">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
                                <td className="py-4 text-sm font-black text-primary">ج.م {order.price}</td>
                                <td className="py-4">
                                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-600">
                                    {order.status === 'pending' ? 'قيد الانتظار' : 'جاري التنفيذ'}
                                  </span>
                                </td>
                                <td className="py-4 pl-4 text-left">
                                  {order.status === 'pending' && user.role === 'buyer' && (
                                    <button 
                                      onClick={() => handleCancelOrder(order._id)}
                                      className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors"
                                    >
                                      إلغاء الطلب
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards */}
                      <div className="md:hidden flex flex-col gap-4">
                        {orders.filter(o => !['delivered', 'rejected', 'cancelled'].includes(o.status)).map((order) => (
                          <div key={order._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black text-slate-400">#{order._id.slice(-6).toUpperCase()}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-600">
                                {order.status === 'pending' ? 'قيد الانتظار' : 'جاري التنفيذ'}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm">{order.productId?.name || 'منتج غير متوفر'}</h4>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                              <span className="text-xs text-secondary">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-black text-primary">ج.م {order.price}</span>
                                {order.status === 'pending' && user.role === 'buyer' && (
                                  <button 
                                    onClick={() => handleCancelOrder(order._id)}
                                    className="text-red-500 hover:text-red-700 text-[10px] font-bold transition-colors"
                                  >
                                    إلغاء
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center text-secondary">لا توجد طلبات نشطة حالياً</div>
                  )}
                </div>

                {/* Order History */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-slate-900">سجل الطلبات (المكتملة والمرفوضة والملغاة)</h3>
                  </div>
                  
                  {loading ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  ) : orders.filter(o => ['delivered', 'rejected', 'cancelled'].includes(o.status)).length > 0 ? (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-right">
                          <thead>
                            <tr className="text-secondary text-xs font-bold border-b border-slate-100">
                              <th className="pb-4 pr-4">رقم الطلب</th>
                              <th className="pb-4">المنتج</th>
                              <th className="pb-4">التاريخ</th>
                              <th className="pb-4">المبلغ</th>
                              <th className="pb-4 pl-4">الحالة</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.filter(o => ['delivered', 'rejected', 'cancelled'].includes(o.status)).map((order) => (
                              <tr key={order._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <td className="py-4 pr-4 font-bold text-xs">{order._id.slice(-6).toUpperCase()}</td>
                                <td className="py-4 text-sm font-bold text-slate-900">{order.productId?.name || 'منتج غير متوفر'}</td>
                                <td className="py-4 text-xs text-secondary">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
                                <td className="py-4 text-sm font-black text-primary">ج.م {order.price}</td>
                                <td className="py-4 pl-4">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                    order.status === 'delivered' ? 'bg-green-100 text-green-600' : 
                                    order.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                    'bg-slate-100 text-slate-600'
                                  }`}>
                                    {order.status === 'delivered' ? 'مكتمل' : 
                                     order.status === 'rejected' ? 'مرفوض' : 'ملغي'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards */}
                      <div className="md:hidden flex flex-col gap-4">
                        {orders.filter(o => ['delivered', 'rejected', 'cancelled'].includes(o.status)).map((order) => (
                          <div key={order._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black text-slate-400">#{order._id.slice(-6).toUpperCase()}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-600' : 
                                order.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {order.status === 'delivered' ? 'مكتمل' : 
                                 order.status === 'rejected' ? 'مرفوض' : 'ملغي'}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm">{order.productId?.name || 'منتج غير متوفر'}</h4>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                              <span className="text-xs text-secondary">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                              <span className="text-sm font-black text-primary">ج.م {order.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center text-secondary">لا يوجد سجل طلبات حالياً</div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'wishlist' && (
              <motion.div 
                key="wishlist"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-6"
              >
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                  <h3 className="text-lg font-black text-slate-900 mb-8">قائمة الرغبات</h3>
                  
                  {wishlistLoading ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  ) : wishlistProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {wishlistProducts.map((product) => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-secondary">قائمة الرغبات فارغة حالياً</div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div 
                key="notifications"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900">التنبيهات</h3>
                  {notifications.length > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" /> تحديد الكل كمقروء
                    </button>
                  )}
                </div>

                {notificationsLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : notifications.length === 0 ? (
                  <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-8 h-8 text-slate-300" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">لا توجد تنبيهات</h4>
                    <p className="text-secondary text-sm">ستظهر التنبيهات هنا عندما تتوفر عروض جديدة أو يتوفر منتج في المخزون</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {notifications.map((notification) => (
                      <div 
                        key={notification._id}
                        className={cn(
                          "bg-white p-6 rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center gap-6 group",
                          notification.read ? "border-slate-100 opacity-75" : "border-blue-100 shadow-lg shadow-blue-500/5 ring-1 ring-blue-50"
                        )}
                      >
                        <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100">
                          <img 
                            src={notification.productId?.images?.[0] || 'https://picsum.photos/seed/product/200/200'} 
                            alt="" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                              notification.type === 'sale' ? "bg-rose-100 text-rose-600" : 
                              notification.type === 'order_update' ? "bg-blue-100 text-blue-600" :
                              notification.type === 'new_product' ? "bg-amber-100 text-amber-600" :
                              "bg-emerald-100 text-emerald-600"
                            )}>
                              {notification.type === 'sale' ? 'عرض خاص' : 
                               notification.type === 'order_update' ? 'تحديث الطلب' :
                               notification.type === 'new_product' ? 'منتج جديد' :
                               'توفر في المخزون'}
                            </span>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            )}
                          </div>
                          <h4 className="text-slate-900 font-bold mb-1">{notification.message}</h4>
                          <p className="text-xs text-secondary font-medium">
                            {new Date(notification.createdAt).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="flex gap-2 self-end sm:self-center">
                          {!notification.read && (
                            <button 
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                              title="تحديد كمقروء"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteNotification(notification._id)}
                            className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {notification.productId && (
                            <Link 
                              to={`/product/${notification.productId?._id || notification.productId}`}
                              className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'earnings' && (user.role === 'seller' || user.role === 'admin' || user.role === 'moderator') && (
              <motion.div 
                key="earnings"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50">
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">ج.م {earnings?.totalEarnings || 0}</div>
                    <div className="text-xs font-bold text-secondary">إجمالي الأرباح</div>
                    {earnings?.totalCommission > 0 && (
                      <div className="text-[10px] text-slate-400 mt-1">خصم 10% عمولة (ج.م {earnings?.totalCommission || 0})</div>
                    )}
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">{earnings?.totalOrders || 0}</div>
                    <div className="text-xs font-bold text-secondary">المنتجات المباعة</div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                      <Star className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">4.9</div>
                    <div className="text-xs font-bold text-secondary">تقييم المتجر</div>
                  </div>
                </div>

                {(user.role === 'admin' || user.role === 'moderator') && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-secondary">عمولة المنصة (10%)</div>
                        <div className="text-2xl font-black text-primary">ج.م {earnings?.commission || 0}</div>
                      </div>
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                  <h3 className="text-lg font-black text-slate-900 mb-8">إحصائيات المبيعات</h3>
                  <div className="h-64 w-full">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                            dx={-10}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '16px', 
                              border: 'none', 
                              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="sales" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorSales)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-secondary text-sm italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        لا توجد بيانات مبيعات كافية لعرض الرسم البياني
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

