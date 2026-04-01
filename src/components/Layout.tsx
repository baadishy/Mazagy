import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, LayoutDashboard, Bell, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './NotificationBell';
import { Logo } from './Logo';
import { CATEGORIES } from '../constants';

export const Header = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'الرئيسية', path: '/' },
    { name: 'المنتجات', path: '/products' },
    { name: 'التصنيفات', path: '/products' },
    { name: 'من نحن', path: '/support' },
  ];

  if (user?.role === 'seller' || user?.role === 'admin') {
    navLinks.push({ name: 'لوحة التاجر', path: '/seller' });
  }

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-slate-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center py-2">
          <Logo showText={true} className="scale-75 origin-right" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === link.path ? "text-primary" : "text-secondary"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/products" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <Search className="w-5 h-5 text-secondary" />
          </Link>
          <NotificationBell />
          {(user?.role === 'seller' || user?.role === 'admin') && (
            <Link to="/seller" className="p-2 hover:bg-slate-100 rounded-full transition-colors" title="لوحة التاجر">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </Link>
          )}
          <Link to={user ? "/profile" : "/login"} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <User className="w-5 h-5 text-secondary" />
          </Link>
          {user && (
            <button 
              onClick={logout}
              className="p-2 hover:bg-rose-50 text-rose-500 rounded-full transition-colors hidden sm:flex"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
          <button 
            className="md:hidden p-2 hover:bg-slate-100 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-lg font-medium text-secondary hover:text-primary py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {user && (
            <button 
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              className="text-lg font-bold text-rose-500 hover:text-rose-600 py-2 text-right flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" /> تسجيل الخروج
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="flex items-center mb-6">
            <Logo showText={true} className="scale-90 origin-right" />
          </Link>
          <p className="text-secondary text-sm leading-relaxed">
            وجهتك الأولى للتسوق الفاخر. نوفر لك أفضل المنتجات العالمية بأسعار تنافسية وجودة مضمونة.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-6">التصنيفات</h4>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm text-secondary">
            {CATEGORIES.map(cat => (
              <li key={cat.id}>
                <Link to={`/products?category=${cat.id}`} className="hover:text-primary">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">روابط سريعة</h4>
          <ul className="space-y-4 text-sm text-secondary">
            <li><Link to="/" className="hover:text-primary">الرئيسية</Link></li>
            <li><Link to="/products" className="hover:text-primary">كل المنتجات</Link></li>
            <li><Link to="/products?sale=true" className="hover:text-primary text-rose-500 font-bold">العروض والتخفيضات</Link></li>
            <li><Link to="/support" className="hover:text-primary">من نحن</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">اشترك في نشرتنا</h4>
          <p className="text-secondary text-sm mb-4">احصل على آخر العروض والمنتجات الجديدة مباشرة في بريدك.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="بريدك الإلكتروني" 
              className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
              اشتراك
            </button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-slate-200 text-center text-secondary text-xs">
        &copy; {new Date().getFullYear()} مزاجي. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
};
