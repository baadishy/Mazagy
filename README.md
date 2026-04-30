# Platform Documentation: Mazagy Multivendor Marketplace

## 1. Introduction

This platform is a high-performance, mobile-first marketplace designed for sellers to showcase products and for buyers to discover and purchase them via a streamlined checkout process. It features comprehensive admin controls, seller-specific growth tools, and a real-time analytics dashboard.

---

## 2. Technical Stack

- **Frontend**: React 18+, Vite, Tailwind CSS, `motion` (animations).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Icons & UI**: Lucide-React, Shadcn/UI (inferred), Sonner (Toasts).
- **Charts**: Recharts.
- **Authentication**: JWT-based session management with secure cookies.

---

## 3. User Roles & Permissions

### 👤 Buyer

- **Product Discovery**: Browse by categories, tags, or search.
- **Ordering**: Direct purchase via a simple form (Name, Phone, Address).
- **Personalization**: Follow specific sellers, manage a wishlist.
- **Ratings**: Add and view reviews on products.

### 🏪 Seller

- **Trial System**: Automatic 30-day free trial (no commission taken during this period).
- **Subscription Model**: After trial ends, account enters a "grace period." If acknowledgment/payment isn't detected, the dashboard locks automatically.
- **Inventory Management**: Add, edit, and delete products with support for variants (Size, Color).
- **Order Management**: Process orders through states: _Pending_, _Confirmed_, _Delivered_, and _Rejected_.
- **Earnings Dashboard**: Track total sales, commission paid, and net profit with clean visualizations.
- **Social Integration**: Direct WhatsApp links for every customer order.

### 🛡️ Admin / Moderator

- **Platform Control**: Set global commission rates, toggle the trial system worldwide.
- **User Management**: Extension of seller trials, manual account locking/unlocking.
- **Analytics**: High-level view of all platform transactions, total revenue, and seller performance.
- **System Updates**: Ability to force commission update notifications that sellers must acknowledge.

---

## 4. Key Features

### 💎 Seller Growth & Retention

- **Commission Acknowledgment Modal**: A high-impact modal that appears only once when the admin changes the commission rate. Sellers must confirm they've seen the update before continuing.
- **Automatic Account Locking**: A safety mechanism that locks the seller dashboard if the subscription or commission rules are ignored after the grace period.
- **Arabic Language First (RTL)**: The entire interface is designed with a native RTL layout (Right-to-Left) and polished Arabic typography (Kufi/Sans).

### 📦 Order Workflow

1. **Creation**: Buyer submits phone and address.
2. **Notification**: Seller receives an in-app alert immediately.
3. **Sequence**:
   - `Pending` (Initial)
   - `Confirmed` (Seller accepts - buyer address becomes visible)
   - `Delivered` (Transaction complete - earnings calculated)
   - `Rejected/Cancelled` (Order halted)
4. **Logs**: Every status change is timestamped and recorded in an order log for transparency.

### 📊 Professional Dashboards

- **Visual Analytics**: Interactive bar charts and line graphs showing sales trends.
- **Status Cards**: Quick view of active orders, pending commission, and top-selling products.
- **Mobile Navigation**: A streamlined bottom-nav interface for mobile users, making it feel like a native app.

---

## 5. Security & Stability

- **Secure Authentication**: Passwords hashed with Bcrypt, sessions protected by HTTP-only cookies.
- **Robust Acknowledgment Persistence**: Commission updates use millisecond-precision timestamping and a 2-second safety buffer to ensure notifications are never erroneously repeated.
- **Backend Validation**: Strict role checks on all API endpoints to prevent unauthorized access.

---

## 6. Project Structure

- `/server/routes`: API endpoints (Auth, Orders, Products, Settings).
- `/server/models`: Mongoose schemas (Defining the data architecture).
- `/src/pages`: Main application views (Storefront and Dashboards).
- `/src/context`: Auth and state management.
- `/src/components`: Reusable UI elements and layouts.

---

## 7. Configuration

Primary configuration (Commission, Trial days) is managed via the **Admin Dashboard** under the **Platform Settings** tab.
