import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8 text-rose-500">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4">الصفحة غير موجودة</h1>
        <p className="text-secondary mb-10 max-w-md mx-auto">
          عذراً، يبدو أن الصفحة التي تبحث عنها غير موجودة أو تم نقلها. يرجى العودة للصفحة الرئيسية.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/20"
        >
          <Home className="w-5 h-5" />
          العودة للرئيسية
        </Link>
      </motion.div>
    </div>
  );
};
