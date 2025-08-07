# SportsLine E-commerce Website

A comprehensive full-stack e-commerce website for sports products built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Material UI.

## 🚀 Features

### Customer Module
- ✅ User authentication (login/register) with JWT
- ✅ Customer dashboard and profile management
- ✅ Shopping cart functionality with real-time updates
- ✅ Product catalog (sports kits, jerseys, trophies, equipment, accessories)
- ✅ Product search, filtering, and sorting
- ✅ Order placement and tracking
- ✅ **Bulk Jersey Ordering System:**
  - Custom jersey design upload (PDF format)
  - Manual entry form for jersey details (player names, numbers, sizes)
  - Bulk order management and tracking
  - Design approval workflow

### Admin Module
- ✅ Admin authentication and comprehensive dashboard
- ✅ Product management (CRUD operations)
- ✅ Order management and status tracking
- ✅ Bulk jersey order processing and approval
- ✅ Customer management and analytics
- ✅ Sales analytics and reporting
- ✅ File upload management

## 🛠 Tech Stack

- **Frontend:** React.js 18, Material UI 5, React Router, Axios, React Hook Form
- **Backend:** Node.js, Express.js, JWT Authentication, Multer
- **Database:** MongoDB with Mongoose ODM
- **File Upload:** Secure PDF handling with validation
- **Styling:** Material UI with responsive design
- **State Management:** React Context API
- **Form Validation:** Yup schema validation
- **Notifications:** React Toastify

## 📁 Project Structure

```
sportsline-ecommerce/
├── client/                 # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── layout/     # Layout components (Navbar, Footer)
│   │   │   └── common/     # Common components (ProtectedRoute, etc.)
│   │   ├── pages/          # Page components
│   │   │   ├── auth/       # Authentication pages
│   │   │   └── admin/      # Admin pages
│   │   ├── context/        # React context providers
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── App.js
│   └── package.json
├── server/                 # Express backend
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── uploads/           # File uploads directory
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration files
│   └── server.js
└── package.json           # Root package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sportsline-ecommerce
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install all dependencies (client + server)
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp server/.env.example server/.env
   ```

   Edit `server/.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/sportsline
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
   JWT_EXPIRE=30d
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   ADMIN_EMAIL=admin@sportsline.com
   ADMIN_PASSWORD=admin123
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the development servers**
   ```bash
   # Start both client and server concurrently
   npm run dev

   # Or start them separately:
   # Terminal 1 - Start server
   npm run server

   # Terminal 2 - Start client
   npm run client
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

## 🔧 Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/sportsline

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
JWT_EXPIRE=30d

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Admin Configuration
ADMIN_EMAIL=admin@sportsline.com
ADMIN_PASSWORD=admin123

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Customer login
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Product Endpoints
- `GET /api/products` - Get all products (with filtering, search, pagination)
- `GET /api/products/categories` - Get product categories
- `GET /api/products/brands` - Get product brands
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Shopping Cart & Order Endpoints
- `GET /api/orders/cart` - Get user cart
- `POST /api/orders/cart` - Add item to cart
- `PUT /api/orders/cart/:itemId` - Update cart item
- `DELETE /api/orders/cart/:itemId` - Remove item from cart
- `DELETE /api/orders/cart` - Clear cart
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status (Admin only)
- `PUT /api/orders/:id/cancel` - Cancel order

### Bulk Jersey Order Endpoints
- `GET /api/bulk-orders` - Get bulk jersey orders
- `GET /api/bulk-orders/:id` - Get bulk order by ID
- `POST /api/bulk-orders` - Create bulk jersey order
- `PUT /api/bulk-orders/:id/status` - Update bulk order status (Admin only)
- `PUT /api/bulk-orders/:id/assign` - Assign bulk order to admin (Admin only)
- `PUT /api/bulk-orders/:id/priority` - Update bulk order priority (Admin only)

### File Upload Endpoints
- `POST /api/upload/jersey-design` - Upload jersey design PDFs
- `POST /api/upload/product-images` - Upload product images (Admin only)
- `POST /api/upload/avatar` - Upload user avatar
- `DELETE /api/upload/:type/:filename` - Delete uploaded file
- `GET /api/upload/:type/:filename/info` - Get file information

### Admin Endpoints
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/customers` - Get all customers
- `GET /api/admin/customers/:id` - Get customer details
- `PUT /api/admin/customers/:id/status` - Update customer status
- `GET /api/admin/analytics/sales` - Get sales analytics

### User Management Endpoints
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId` - Update user profile
- `GET /api/users/:userId/wishlist` - Get user wishlist
- `POST /api/users/:userId/wishlist` - Add item to wishlist
- `DELETE /api/users/:userId/wishlist/:productId` - Remove item from wishlist

## 🗄️ Database Schema

### User Model
- Personal information (name, email, phone, address)
- Authentication (password, role, status)
- Shopping cart and wishlist
- Timestamps and activity tracking

### Product Model
- Product details (name, description, category, brand)
- Pricing and inventory management
- Variants (size, color, price)
- Images and specifications
- SEO and customization options
- Sales tracking and ratings

### Order Model
- Customer and order details
- Items with product references
- Shipping and billing addresses
- Pricing breakdown
- Payment and shipping information
- Status tracking and timeline

### Bulk Jersey Order Model
- Team and contact information
- Jersey specifications and customization
- Player details and requirements
- Custom design file uploads
- Pricing with bulk discounts
- Production timeline and status tracking

## 🔐 Default Admin Account

After setting up the database, you can create an admin account using the credentials specified in your `.env` file:

- **Email:** admin@sportsline.com (or your ADMIN_EMAIL)
- **Password:** admin123 (or your ADMIN_PASSWORD)

## 🚀 Deployment

### Production Build
```bash
# Build the client for production
npm run build

# Start the production server
npm start
```

### Environment Setup for Production
1. Set `NODE_ENV=production` in your environment variables
2. Use a production MongoDB database (MongoDB Atlas recommended)
3. Set a strong JWT secret
4. Configure proper CORS settings
5. Set up file upload storage (AWS S3, Cloudinary, etc.)

## 🧪 Testing

```bash
# Run server tests
cd server && npm test

# Run client tests
cd client && npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page for existing solutions
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- Material UI for the excellent component library
- MongoDB for the flexible database solution
- The React and Node.js communities for their amazing tools and resources
