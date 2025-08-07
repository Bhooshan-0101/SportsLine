# 🏀 SportsLine - Sports Event Management & Merchandise Web Application

**SportsLine** is a full-stack web application designed to streamline the sales and management of sports merchandise and event bookings. Built during my internship at **Softionik Solutions (OPC) Pvt. Ltd.**, the platform addresses the challenges of manual inventory tracking and event scheduling by offering an integrated, user-friendly solution for both customers and administrators.

---

## 📌 Features

### 👤 User Module
- **User Registration & Login** with JWT-based authentication
- **Product Catalog** with search and filtering
- **Shopping Cart & Checkout**
- **Bulk Jersey Orders** for teams/clubs
- **Event Booking** with real-time availability checks
- **Profile Management** with image uploads and address updates
- **Order & Booking Tracking**
- **Wishlist & Notifications**

### 🛠️ Admin Module
- **Admin Dashboard** with real-time KPIs and analytics
- **Product Management** (CRUD operations with image uploads)
- **Event Management** (schedule, reschedule, limits)
- **Order & Booking Management** with status updates
- **User Management** and role-based access control

---

## 🧑‍💻 Tech Stack

| Layer         | Technology                    |
|---------------|-------------------------------|
| Frontend      | React.js, HTML, CSS           |
| Backend       | Node.js, Express.js           |
| Database      | MongoDB (MongoDB Atlas)       |
| Authentication| JWT (JSON Web Tokens)         |
|   |                        |
| Version Control | Git, GitHub                 |
| API Testing   | Postman                       |
|      |              |

---

## 🔄 System Architecture

A **Client–Server architecture** where:

- Frontend communicates with backend via **RESTful APIs**
- MongoDB handles data persistence
- JWT ensures secure session management

---

## 📷 Screenshots

> Include actual screenshots here (Login, Product Catalog, Admin Dashboard, Cart, Checkout, etc.)

---

## 🧪 Testing

- **Manual Testing** for UI validation and exploratory testing
- **API Testing** via Postman
- **Unit & Integration Testing** for key components (frontend and backend)

---

## 📂 Project Structure

```bash
SportsLine/
├── client/                 # React.js frontend
│   └── components/
│   └── pages/
├── server/                 # Node.js + Express backend
│   └── routes/
│   └── controllers/
│   └── models/
├── uploads/                # Uploaded images
├── .env                    # Environment variables
├── package.json
└── README.md
