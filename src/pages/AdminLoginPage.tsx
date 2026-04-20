import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Shield, Lock, User as UserIcon, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export const AdminLoginPage = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !password) {
      toast.error('يرجى إدخال المعرف وكلمة المرور');
      return;
    }

    setLoading(true);
    try {
      await adminLogin({ id, password });
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
              <Shield className="text-white w-8 h-8" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">دخول المدير</h1>
          <p className="text-center text-gray-500 text-sm mb-8">يرجى إدخال بيانات الاعتماد الخاصة بك للوصول إلى لوحة التحكم</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">معرف المدير (MongoDB ID)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm"
                  placeholder="65f1a2b3c4d5e6f7a8b9c0d2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">كلمة المرور</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'جاري التحميل...' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-50 flex justify-center">
            <button 
              onClick={() => navigate('/')}
              className="text-sm text-gray-400 hover:text-black flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة للمتجر
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Secure Admin Access • v1.0</p>
        </div>
      </motion.div>
    </div>
  );
};
