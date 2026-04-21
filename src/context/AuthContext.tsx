import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: 'buyer' | 'seller' | 'admin' | 'moderator' | 'user';
  wishlist: string[];
  followingSellers: string[];
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  isTrialActive?: boolean;
  trialEndDate?: string;
  isLocked?: boolean;
  subscriptionLockDate?: string;
  hasSeenRules?: boolean;
  hasUnacknowledgedCommission?: boolean;
  commissionRate?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  adminLogin: (data: { id: string; password: string }) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  getWishlist: () => Promise<any>;
  acknowledgeRules: () => Promise<void>;
  acknowledgeCommission: () => Promise<void>;
  followingSellers: string[];
  setFollowingSellers: (sellers: string[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authService.getProfile();
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (data: any) => {
    const response = await authService.login(data);
    setUser(response.data.user);
  };

  const adminLogin = async (data: { id: string; password: string }) => {
    const response = await authService.adminLogin(data);
    setUser(response.data.user);
  };

  const signup = async (data: any) => {
    const response = await authService.signup(data);
    setUser(response.data.user);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  const updateProfile = async (data: any) => {
    await authService.updateProfile(data);
    const response = await authService.getProfile();
    setUser(response.data);
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) return;
    try {
      const response = await authService.toggleWishlist(productId);
      setUser({ ...user, wishlist: response.data });
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const getWishlist = async () => {
    return await authService.getWishlist();
  };

  const acknowledgeRules = async () => {
    if (!user) return;
    try {
      await authService.acknowledgeRules();
      setUser({ ...user, hasSeenRules: true });
    } catch (error) {
      console.error('Error acknowledging rules:', error);
      throw error;
    }
  };

  const setFollowingSellers = (sellers: string[]) => {
    if (user) {
      setUser({ ...user, followingSellers: sellers });
    }
  };

  const acknowledgeCommission = async () => {
    if (!user) return;
    try {
      await authService.acknowledgeCommission();
      setUser({ ...user, hasUnacknowledgedCommission: false });
    } catch (error) {
      console.error('Error acknowledging commission:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      adminLogin,
      signup, 
      logout, 
      updateProfile, 
      toggleWishlist, 
      getWishlist,
      acknowledgeRules,
      acknowledgeCommission,
      followingSellers: user?.followingSellers || [],
      setFollowingSellers
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
