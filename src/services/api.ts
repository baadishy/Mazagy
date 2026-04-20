import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    
    // Retry on network errors or 503/504 status codes (transient server issues)
    // Only retry GET requests or specific safe requests to avoid duplicate side effects
    const isRetryable = !response || [503, 504].includes(response.status);
    const shouldRetry = isRetryable && config && !config._retry && config.method === 'get';

    if (shouldRetry) {
      config._retry = true;
      // Exponential backoff or simple delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return api(config);
    }

    if (error.message === 'Network Error') {
      console.warn('API Network Error - may be CORS, blocked request, or server restart', {
        url: error.config?.url,
        method: error.config?.method,
        origin: window.location.origin
      });
    }
    return Promise.reject(error);
  }
);

export const authService = {
  signup: (data: any) => api.post('/auth/signup', data),
  login: (data: any) => api.post('/auth/login', data),
  adminLogin: (data: { id: string; password: string }) => api.post('/auth/admin/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  getUser: (id: string) => api.get(`/auth/users/${id}`),
  toggleWishlist: (productId: string) => api.post(`/auth/wishlist/${productId}`),
  getWishlist: () => api.get('/auth/wishlist'),
  followSeller: (sellerId: string) => api.post(`/auth/follow/${sellerId}`),
  getAllUsers: () => api.get('/auth/admin/users'),
  toggleLock: (id: string) => api.post(`/auth/admin/users/${id}/toggle-lock`),
  acknowledgeRules: () => api.post('/auth/acknowledge-rules'),
  deleteUser: (id: string) => api.delete(`/auth/admin/users/${id}`),
  logout: () => api.post('/auth/logout'),
};

export const productService = {
  getProducts: () => api.get('/products'),
  getProduct: (id: string) => api.get(`/products/${id}`),
  createProduct: (data: any) => api.post('/products', data),
  updateProduct: (id: string, data: any) => api.put(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  getSellerProducts: (sellerId: string) => api.get(`/products/seller/${sellerId}`),
};

export const orderService = {
  createOrder: (data: any) => api.post('/orders', data),
  getOrders: () => api.get('/orders'),
  updateOrderStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }),
  cancelOrder: (id: string) => api.put(`/orders/${id}/cancel`),
  getStats: (sellerId?: string) => api.get('/orders/stats', { params: { sellerId } }),
  getAdminSellers: () => api.get('/orders/admin/sellers'),
  getPublicStats: () => api.get('/orders/public-stats'),
};

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
};

export const reviewService = {
  getReviews: (productId: string) => api.get(`/reviews/product/${productId}`),
  createReview: (data: { productId: string; rating: number; comment: string }) => api.post('/reviews', data),
  deleteReview: (id: string) => api.delete(`/reviews/${id}`),
};

export const settingsService = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data: any) => api.put('/settings', data),
  toggleSellerTrial: (sellerId: string, data: { isTrialActive: boolean; trialDurationDays?: number }) => 
    api.put(`/settings/seller-trial/${sellerId}`, data),
};

export default api;
