# Page Organization Structure

This document outlines the organized page structure for the SportsLine E-commerce Platform, with pages categorized by user roles and functionality.

## 📁 Folder Structure

```
client/src/pages/
├── auth/                    # Authentication pages
│   ├── Login.js
│   └── Register.js
├── customer/                # Customer-specific pages
│   ├── Dashboard.js         # Customer dashboard
│   ├── Products.js          # Product browsing with filters
│   ├── ProductDetail.js     # Detailed product view
│   ├── Cart.js             # Shopping cart
│   ├── Orders.js           # Order history
│   └── Wishlist.js         # Customer wishlist
├── admin/                   # Admin management pages
│   ├── AdminDashboard.js    # Admin overview
│   ├── AdminProducts.js     # Product management
│   ├── AdminOrders.js       # Order management
│   ├── AdminCustomers.js    # Customer management
│   ├── AdminBulkOrders.js   # Bulk order management
│   └── ProductForm.js       # Product creation/editing
├── Owner/                   # Owner/Business analytics pages
│   ├── Analytics.js         # Business analytics
│   └── Inventory.js         # Inventory management
├── Home.js                  # Public homepage
├── Profile.js               # User profile (shared)
├── Checkout.js              # Checkout process
├── Orders.js                # Order details (shared)
├── OrderDetail.js           # Individual order view
├── BulkJerseyOrder.js       # Bulk jersey ordering
├── BulkOrders.js            # Bulk order listing
└── BulkOrderDetail.js       # Bulk order details
```

## 🎯 Page Categories by User Role

### 🔓 Public Pages (No Authentication Required)
- **Home.js** - Landing page with featured products and company info
- **customer/Products.js** - Product catalog with search and filtering
- **customer/ProductDetail.js** - Individual product details
- **auth/Login.js** - User login
- **auth/Register.js** - User registration

### 👤 Customer Pages (Customer Authentication Required)
- **customer/Dashboard.js** - Customer overview with quick stats and recent orders
- **customer/Cart.js** - Shopping cart management
- **customer/Orders.js** - Order history and tracking
- **customer/Wishlist.js** - Saved products for later
- **Profile.js** - Account settings and personal information
- **Checkout.js** - Multi-step checkout process
- **OrderDetail.js** - Detailed view of specific orders
- **BulkJerseyOrder.js** - Team jersey ordering form
- **BulkOrders.js** - Bulk order history
- **BulkOrderDetail.js** - Detailed bulk order view

### 🛡️ Admin Pages (Admin Authentication Required)
- **admin/AdminDashboard.js** - Admin overview with system metrics
- **admin/AdminProducts.js** - Product management (CRUD operations)
- **admin/ProductForm.js** - Product creation and editing form
- **admin/AdminOrders.js** - Order processing and management
- **admin/AdminCustomers.js** - Customer account management
- **admin/AdminBulkOrders.js** - Bulk order approval and processing

### 👑 Owner Pages (Owner/Super Admin Authentication Required)
- **Owner/Analytics.js** - Business intelligence and sales analytics
- **Owner/Inventory.js** - Advanced inventory management and tracking

## 🔄 Route Organization in App.js

### Public Routes
```javascript
<Route path="/" element={<Home />} />
<Route path="/products" element={<CustomerProducts />} />
<Route path="/products/:id" element={<CustomerProductDetail />} />
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
```

### Protected Customer Routes
```javascript
<Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
<Route path="/cart" element={<ProtectedRoute><CustomerCart /></ProtectedRoute>} />
<Route path="/orders" element={<ProtectedRoute><CustomerOrders /></ProtectedRoute>} />
<Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
<Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
<Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
<Route path="/bulk-jersey-order" element={<ProtectedRoute><BulkJerseyOrder /></ProtectedRoute>} />
```

### Admin Routes
```javascript
<Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
<Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
<Route path="/admin/products/new" element={<AdminRoute><ProductForm /></AdminRoute>} />
<Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
<Route path="/admin/customers" element={<AdminRoute><AdminCustomers /></AdminRoute>} />
```

### Owner Routes
```javascript
<Route path="/owner/analytics" element={<AdminRoute><OwnerAnalytics /></AdminRoute>} />
<Route path="/owner/inventory" element={<AdminRoute><OwnerInventory /></AdminRoute>} />
```

## 🎨 Page Features by Category

### Customer Pages Features
- **Responsive Design** - Mobile-first approach for all customer-facing pages
- **Real-time Updates** - Live cart updates, inventory status
- **Advanced Filtering** - Product search, category filters, price ranges
- **Wishlist Management** - Save and manage favorite products
- **Order Tracking** - Real-time order status and progress
- **Customization Options** - Jersey personalization (names, numbers)
- **Bulk Ordering** - Team jersey orders with file uploads

### Admin Pages Features
- **Data Tables** - Sortable, filterable data grids
- **CRUD Operations** - Full create, read, update, delete functionality
- **Status Management** - Order and product status updates
- **File Management** - Image and document uploads
- **Customer Support** - Customer account management
- **Bulk Operations** - Mass updates and actions

### Owner Pages Features
- **Analytics Dashboard** - Sales metrics, trends, and KPIs
- **Advanced Reporting** - Revenue analysis, customer insights
- **Inventory Control** - Stock management, low stock alerts
- **Business Intelligence** - Performance metrics and forecasting

## 🔐 Access Control

### Route Protection
- **ProtectedRoute** - Requires user authentication
- **AdminRoute** - Requires admin role authentication
- **Role-based Access** - Different features based on user role

### Permission Levels
1. **Public** - No authentication required
2. **Customer** - Basic user authentication
3. **Admin** - Admin role required
4. **Owner** - Super admin/owner role required

## 📱 Responsive Design

All pages are designed with mobile-first approach:
- **Breakpoints**: xs (0px), sm (600px), md (900px), lg (1200px), xl (1536px)
- **Adaptive Layouts** - Grid systems that adjust to screen size
- **Touch-friendly** - Optimized for mobile interactions
- **Progressive Enhancement** - Core functionality works on all devices

## 🎯 Navigation Structure

### Customer Navigation
- Home → Products → Product Detail → Cart → Checkout
- Dashboard → Orders → Order Details
- Profile → Wishlist
- Bulk Jersey Order → Bulk Orders → Bulk Order Details

### Admin Navigation
- Admin Dashboard → Products/Orders/Customers/Bulk Orders
- Product Management → Product Form (Create/Edit)
- Order Processing → Order Details

### Owner Navigation
- Analytics Dashboard → Detailed Reports
- Inventory Management → Stock Control

## 🔄 State Management

### Context Providers
- **AuthContext** - User authentication state
- **CartContext** - Shopping cart state
- **ThemeContext** - UI theme preferences

### Local State
- Component-specific state for forms, filters, and UI interactions
- API data caching for improved performance

This organization ensures clear separation of concerns, role-based access control, and maintainable code structure while providing an excellent user experience for all user types.
