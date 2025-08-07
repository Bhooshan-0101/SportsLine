# API Documentation

Complete API documentation for the SportsLine E-commerce Platform.

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow this format:
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123",
  "phone": "+1-555-123-4567"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "token": "jwt_token"
  }
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

### Admin Login
```http
POST /auth/admin/login
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "AdminPass123"
}
```

### Get Current User
```http
GET /auth/me
```
*Requires authentication*

### Update Profile
```http
PUT /auth/profile
```
*Requires authentication*

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1-555-987-6543",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  }
}
```

### Change Password
```http
PUT /auth/change-password
```
*Requires authentication*

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

## Product Endpoints

### Get All Products
```http
GET /products
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)
- `search` (string): Search term
- `category` (string): Product category
- `brand` (string): Product brand
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `sort` (string): Sort option (price_asc, price_desc, name_asc, name_desc, newest, popular)
- `inStock` (boolean): Filter by stock availability

**Example:**
```http
GET /products?category=jerseys&minPrice=20&maxPrice=100&sort=price_asc&page=1&limit=12
```

### Get Product by ID
```http
GET /products/:id
```

### Create Product
```http
POST /products
```
*Requires admin authentication*

**Request Body:**
```json
{
  "name": "Soccer Jersey",
  "description": "Professional soccer jersey",
  "shortDescription": "High-quality soccer jersey",
  "category": "jerseys",
  "subcategory": "soccer",
  "brand": "SportsBrand",
  "price": 45.99,
  "comparePrice": 59.99,
  "sku": "SJ001",
  "inventory": {
    "trackQuantity": true,
    "quantity": 100,
    "lowStockThreshold": 10
  },
  "variants": [
    {
      "name": "Size",
      "options": ["S", "M", "L", "XL"]
    },
    {
      "name": "Color",
      "options": ["Red", "Blue", "Green"]
    }
  ],
  "specifications": [
    {
      "name": "Material",
      "value": "100% Polyester"
    }
  ],
  "tags": ["soccer", "jersey", "sports"],
  "isActive": true,
  "isFeatured": false,
  "isCustomizable": true,
  "customizationOptions": {
    "allowNamePrint": true,
    "allowNumberPrint": true,
    "maxNameLength": 15,
    "numberRange": {
      "min": 1,
      "max": 99
    }
  }
}
```

### Update Product
```http
PUT /products/:id
```
*Requires admin authentication*

### Delete Product
```http
DELETE /products/:id
```
*Requires admin authentication*

### Get Product Categories
```http
GET /products/categories
```

### Get Product Brands
```http
GET /products/brands
```

## Cart Endpoints

### Get Cart
```http
GET /orders/cart
```
*Requires authentication*

### Add to Cart
```http
POST /orders/cart
```
*Requires authentication*

**Request Body:**
```json
{
  "productId": "product_id",
  "quantity": 2,
  "size": "L",
  "color": "Red",
  "customization": {
    "playerName": "SMITH",
    "playerNumber": "10"
  }
}
```

### Update Cart Item
```http
PUT /orders/cart/:itemId
```
*Requires authentication*

**Request Body:**
```json
{
  "quantity": 3
}
```

### Remove from Cart
```http
DELETE /orders/cart/:itemId
```
*Requires authentication*

### Clear Cart
```http
DELETE /orders/cart
```
*Requires authentication*

## Order Endpoints

### Get User Orders
```http
GET /orders
```
*Requires authentication*

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by order status

### Get Order by ID
```http
GET /orders/:id
```
*Requires authentication*

### Create Order
```http
POST /orders
```
*Requires authentication*

**Request Body:**
```json
{
  "shippingAddress": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "phone": "+1-555-123-4567"
  },
  "billingAddress": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "paymentMethod": "credit_card",
  "shippingMethod": "standard",
  "notes": "Please handle with care"
}
```

### Update Order Status
```http
PUT /orders/:id/status
```
*Requires admin authentication*

**Request Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "1234567890",
  "note": "Order shipped via FedEx"
}
```

### Cancel Order
```http
PUT /orders/:id/cancel
```
*Requires authentication*

**Request Body:**
```json
{
  "reason": "Changed mind"
}
```

## Bulk Order Endpoints

### Get Bulk Orders
```http
GET /bulk-orders
```
*Requires authentication*

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status

### Get Bulk Order by ID
```http
GET /bulk-orders/:id
```
*Requires authentication*

### Create Bulk Order
```http
POST /bulk-orders
```
*Requires authentication*

**Request Body:**
```json
{
  "teamName": "City Football Club",
  "contactPerson": {
    "name": "John Coach",
    "email": "coach@cityfc.com",
    "phone": "+1-555-123-4567",
    "position": "Head Coach"
  },
  "jerseyDetails": {
    "style": "home",
    "color": {
      "primary": "Blue",
      "secondary": "White"
    },
    "material": "polyester",
    "sizes": [
      { "size": "S", "quantity": 5 },
      { "size": "M", "quantity": 10 },
      { "size": "L", "quantity": 8 },
      { "size": "XL", "quantity": 2 }
    ]
  },
  "playerDetails": [
    {
      "playerName": "SMITH",
      "jerseyNumber": "10",
      "size": "L",
      "position": "Forward"
    }
  ],
  "customDesign": {
    "hasCustomDesign": true,
    "designNotes": "Team logo on chest, sponsor on back"
  },
  "shippingAddress": {
    "name": "City Football Club",
    "street": "456 Sports Ave",
    "city": "Sports City",
    "state": "SC",
    "zipCode": "12345"
  },
  "urgency": "standard",
  "budget": {
    "min": 1000,
    "max": 1500
  },
  "notes": "Need jerseys for upcoming tournament"
}
```

### Update Bulk Order Status
```http
PUT /bulk-orders/:id/status
```
*Requires admin authentication*

**Request Body:**
```json
{
  "status": "approved",
  "note": "Design approved, moving to production"
}
```

### Assign Bulk Order
```http
PUT /bulk-orders/:id/assign
```
*Requires admin authentication*

**Request Body:**
```json
{
  "adminId": "admin_user_id"
}
```

## Admin Endpoints

### Get Dashboard Data
```http
GET /admin/dashboard
```
*Requires admin authentication*

### Get All Customers
```http
GET /admin/customers
```
*Requires admin authentication*

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search by name or email

### Get Customer by ID
```http
GET /admin/customers/:id
```
*Requires admin authentication*

### Update Customer Status
```http
PUT /admin/customers/:id/status
```
*Requires admin authentication*

**Request Body:**
```json
{
  "isActive": false
}
```

### Get Sales Analytics
```http
GET /admin/analytics/sales
```
*Requires admin authentication*

**Query Parameters:**
- `startDate` (string): Start date (YYYY-MM-DD)
- `endDate` (string): End date (YYYY-MM-DD)
- `period` (string): Period (day, week, month, year)

## File Upload Endpoints

### Upload Jersey Design
```http
POST /upload/jersey-design
```
*Requires authentication*

**Request:** Multipart form data with files

### Upload Product Images
```http
POST /upload/product-images
```
*Requires admin authentication*

**Request:** Multipart form data with files

### Upload Avatar
```http
POST /upload/avatar
```
*Requires authentication*

**Request:** Multipart form data with single file

### Delete File
```http
DELETE /upload/:type/:filename
```
*Requires appropriate authentication*

## Wishlist Endpoints

### Get Wishlist
```http
GET /users/:userId/wishlist
```
*Requires authentication*

### Add to Wishlist
```http
POST /users/:userId/wishlist
```
*Requires authentication*

**Request Body:**
```json
{
  "productId": "product_id"
}
```

### Remove from Wishlist
```http
DELETE /users/:userId/wishlist/:productId
```
*Requires authentication*

## Health Check

### API Health
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "API is healthy",
  "timestamp": "2023-12-25T10:30:00.000Z",
  "uptime": 3600
}
```

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity (validation errors)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **File Upload**: 10 requests per hour per user

## Pagination

All list endpoints support pagination:
- Default page size: 12 items
- Maximum page size: 100 items
- Page numbers start from 1

**Pagination Response:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 150,
    "pages": 13,
    "hasNext": true,
    "hasPrev": false
  }
}
```
