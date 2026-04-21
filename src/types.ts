export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "buyer" | "seller" | "admin" | "moderator";
  wishlist: string[];
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  rating?: number;
  numReviews?: number;
  isTrialActive?: boolean;
  trialEndDate?: string;
  isLocked?: boolean;
  subscriptionLockDate?: string;
  hasSeenRules?: boolean;
  hasUnacknowledgedCommission?: boolean;
  commissionRate?: number;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  sellerId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    location?: {
      address: string;
      lat: number;
      lng: number;
    };
    isLocked?: boolean;
  };
  images: string[];
  colors?: string[];
  sizes?: string[];
  isOnSale: boolean;
  salePrice?: number;
  saleStart?: string;
  saleEnd?: string;
  deliveryAvailable: boolean;
  deliveryFee: number;
  warranty: string;
  category: string;
  averageRating: number;
  numReviews: number;
  createdAt: string;
}

export interface Order {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  sellerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  price: number;
  deliveryFee: number;
  status: "pending" | "confirmed" | "rejected" | "delivered";
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}
