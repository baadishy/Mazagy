import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async (retryCount = 0) => {
    if (!user) return;
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n: any) => !n.read).length);
    } catch (error: any) {
      // If it's a network error and we haven't retried too much, try again after a delay
      if (error.message === 'Network Error' && retryCount < 3) {
        console.warn(`Retrying notification fetch (${retryCount + 1})...`);
        setTimeout(() => fetchNotifications(retryCount + 1), 2000);
      } else {
        console.error('Error fetching notifications:', error);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
      if (!notifications.find(n => n._id === id)?.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-100 rounded-full transition-colors relative"
      >
        <Bell className="w-5 h-5 text-secondary" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed inset-x-4 sm:inset-x-auto sm:ltr:right-4 sm:rtl:left-4 top-20 w-auto sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
              style={{ transformOrigin: 'top' }}
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-black text-slate-900">التنبيهات</h3>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] font-bold text-primary hover:underline"
                    >
                      تحديد الكل كمقروء
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)}>
                    <X className="w-4 h-4 text-secondary" />
                  </button>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm text-secondary font-medium">لا توجد تنبيهات حالياً</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map((notification) => (
                      <div 
                        key={notification._id}
                        className={cn(
                          "p-4 flex gap-3 group transition-colors hover:bg-slate-50/50",
                          !notification.read && "bg-blue-50/30"
                        )}
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                          <img 
                            src={notification.productId?.images?.[0] || 'https://picsum.photos/seed/product/100/100'} 
                            alt="" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                              "px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider",
                              notification.type === 'sale' ? "bg-rose-100 text-rose-600" : 
                              notification.type === 'order_update' ? "bg-blue-100 text-blue-600" :
                              notification.type === 'new_product' ? "bg-amber-100 text-amber-600" :
                              "bg-emerald-100 text-emerald-600"
                            )}>
                              {notification.type === 'sale' ? 'عرض' : 
                               notification.type === 'order_update' ? 'طلب' :
                               notification.type === 'new_product' ? 'جديد' :
                               'مخزون'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-900 font-bold leading-relaxed mb-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-secondary font-medium">
                              {new Date(notification.createdAt).toLocaleDateString('ar-EG', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.read && (
                                <button 
                                  onClick={() => handleMarkAsRead(notification._id)}
                                  className="p-1 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                  title="تحديد كمقروء"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                              <button 
                                onClick={() => handleDelete(notification._id)}
                                className="p-1 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                                title="حذف"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                  <Link 
                    to="/profile?tab=notifications" 
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    عرض جميع التنبيهات
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
