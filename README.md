# MERN Restaurant Booking System

A full-stack web application for restaurant table bookings, built with the MERN stack (MongoDB, Express.js, React, Node.js). This project allows customers to book tables, manage waitlists, and pre-order food, while providing restaurant owners and admins with management tools.

## Features

### Customer Features
- **Table Booking**: Browse restaurants, select dates/times, choose tables, and make reservations
- **Waitlist Management**: Join waitlists when tables are unavailable
- **Food Pre-Ordering**: Browse menus and pre-order food with bookings
- **User Authentication**: Secure login/registration system
- **Real-time Availability**: Dynamic table availability checking

### Restaurant Owner Features
- **Restaurant Management**: Add/edit restaurant details, menus, and table layouts
- **Booking Oversight**: View and manage bookings for their restaurants
- **Analytics**: Revenue tracking and booking statistics

### Admin Features
- **User Management**: Manage customers, owners, and admins
- **Restaurant Oversight**: Approve and monitor all restaurants
- **System Analytics**: Comprehensive dashboard with booking and revenue data
- **Waitlist Management**: Global waitlist monitoring and management

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API rate limiting with Upstash Redis

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind
- **Material-UI (MUI)** - React component library
- **Framer Motion** - Animation library
- **React Hot Toast** - Notification system
- **Konva.js** - Canvas-based table layout editor
- **Recharts** - Data visualization

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing
- **Nodemon** - Backend auto-restart during development

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

## 🔧 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Piash7224/Feastly-Software-Lab
   cd mern
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

## ⚙️ Setup

### Environment Variables

1. **Backend Configuration:**
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/restaurant-booking
   JWT_SECRET=your-super-secret-jwt-key-here
   UPSTASH_REDIS_REST_URL=your-upstash-redis-url
   UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-token
   ```

2. **MongoDB Setup:**
   - Start MongoDB service on your system
   - The application will connect to `mongodb://localhost:27017/restaurant-booking`

3. **Redis Setup (for Rate Limiting):**
   - Sign up for Upstash Redis (free tier available)
   - Add your REST URL and token to the `.env` file

### Database Initialization

The application will automatically create collections and indexes when you run it for the first time. You can also create an admin user by running:

```bash
cd backend
node src/createAdmin.js
```

## Running the Application

### Development Mode

**Important:** You need to run both the backend and frontend servers simultaneously for the application to work properly.

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5001`

2. **Start the frontend development server (in a new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173` (or next available port)

   **Note:** The frontend is configured with a proxy in `vite.config.js` to forward all `/api` requests to the backend server at `http://localhost:5001`. This allows the frontend to communicate with the backend seamlessly.

3. **Access the application:**
   - Open your browser and go to `http://localhost:5173` (or the port shown in the terminal)
   - The application should load with full functionality

### Production Build

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the backend in production:**
   ```bash
   cd backend
   npm start
   ```

   **Note:** In production, you'll need to serve the built frontend files (from `frontend/dist`) and configure your web server to proxy API requests to the backend.

## Project Structure

```
mern/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # Database connection
│   │   │   └── ustash.js          # Redis configuration
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── bookingController.js
│   │   │   ├── foodController.js
│   │   │   ├── orderController.js
│   │   │   ├── restaurantController.js
│   │   │   ├── searchController.js
│   │   │   ├── tableController.js
│   │   │   ├── waitlistController.js
│   │   │   └── admin/
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── rateLimiter.js
│   │   │   ├── roleMiddleware.js
│   │   │   └── upload.js
│   │   ├── models/
│   │   │   ├── Booking.js
│   │   │   ├── Food.js
│   │   │   ├── Order.js
│   │   │   ├── PreOrder.js
│   │   │   ├── Restaurant.js
│   │   │   ├── Table.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── foodRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── restaurantRoutes.js
│   │   │   ├── tableRoutes.js
│   │   │   └── waitlistRoutes.js
│   │   ├── uploads/               # File uploads directory
│   │   └── server.js              # Main server file
│   ├── createAdmin.js             # Admin user creation script
│   ├── debugAvailability.js       # Debug script
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminNavbar.jsx
│   │   │   ├── BookingTableLayout.jsx
│   │   │   ├── DashboardStats.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── MenuCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── RestaurantForm.jsx
│   │   │   ├── RestaurantList.jsx
│   │   │   ├── RestaurantSelector.jsx
│   │   │   └── TableLayoutEditor.jsx
│   │   ├── pages/
│   │   │   ├── AddRestaurant.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── ConfirmBooking.jsx
│   │   │   ├── CreatePage.jsx
│   │   │   ├── EditRestaurant.jsx
│   │   │   ├── Explore.jsx
│   │   │   ├── Food.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Payment.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Receipt.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── TableBooking.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── BookingManagement.jsx
│   │   │       ├── RestaurantManagement.jsx
│   │   │       ├── RevenueAnalytics.jsx
│   │   │       ├── UserOwnerManagement.jsx
│   │   │       └── WaitlistManagement.jsx
│   │   ├── Styles/
│   │   │   ├── bookingStyles.css
│   │   │   └── menuCard.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── eslint.config.js
├── design_assets/
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `POST /api/restaurants` - Create restaurant (owners only)
- `GET /api/restaurants/:id` - Get restaurant details
- `PUT /api/restaurants/:id` - Update restaurant (owners only)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/restaurant/:restaurantId` - Get bookings by restaurant
- `DELETE /api/bookings/:id` - Cancel booking

### Tables
- `GET /api/tables/restaurant/:restaurantId` - Get tables by restaurant
- `POST /api/tables` - Create table (owners only)

### Food/Menu
- `GET /api/foods/restaurant/:restaurantId` - Get menu items
- `POST /api/foods` - Add menu item (owners only)

### Admin
- `GET /api/admin/restaurants` - Get all restaurants (admin)
- `GET /api/admin/users` - Get all users (admin)
- `GET /api/admin/bookings` - Get all bookings (admin)

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Configured for cross-origin requests
- **Input Validation**: Server-side validation for all inputs
- **Role-based Access**: Different permissions for customers, owners, and admins

## Testing

To run ESLint for code quality checks:

```bash
cd frontend
npm run lint
```


# MERN Restaurant Booking System

A full-stack web application for restaurant table bookings, built with the MERN stack (MongoDB, Express.js, React, Node.js). This project allows customers to book tables, manage waitlists, and pre-order food, while providing restaurant owners and admins with management tools.

## 🚀 Features

### Customer Features
- **Table Booking**: Browse restaurants, select dates/times, choose tables, and make reservations
- **Waitlist Management**: Join waitlists when tables are unavailable
- **Food Pre-Ordering**: Browse menus and pre-order food with bookings
- **User Authentication**: Secure login/registration system
- **Real-time Availability**: Dynamic table availability checking

### Restaurant Owner Features
- **Restaurant Management**: Add/edit restaurant details, menus, and table layouts
- **Booking Oversight**: View and manage bookings for their restaurants
- **Analytics**: Revenue tracking and booking statistics

### Admin Features
- **User Management**: Manage customers, owners, and admins
- **Restaurant Oversight**: Approve and monitor all restaurants
- **System Analytics**: Comprehensive dashboard with booking and revenue data
- **Waitlist Management**: Global waitlist monitoring and management

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API rate limiting with Upstash Redis

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind
- **Material-UI (MUI)** - React component library
- **Framer Motion** - Animation library
- **React Hot Toast** - Notification system
- **Konva.js** - Canvas-based table layout editor
- **Recharts** - Data visualization

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing
- **Nodemon** - Backend auto-restart during development

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local installation or MongoDB Atlas account) - [Download here](https://www.mongodb.com/try/download/community)
- **Upstash Redis** account (for rate limiting, free tier available) - [Sign up here](https://console.upstash.com)
- **Git** - [Download here](https://git-scm.com/)

## 🔧 Installation & Setup

### **Step 1: Clone & Install Dependencies**

```bash
# Clone the repository
git clone <your-repo-url>
cd mern

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### **Step 2: Configure Backend Environment Variables**

Create a `.env` file in the `backend` directory with the following variables:

```env
# ========== DATABASE ==========
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/booking-app
# Or use local MongoDB: mongodb://localhost:27017/booking-app

# ========== JWT & SECURITY ==========
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# ========== SERVER ==========
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# ========== UPSTASH REDIS (for rate limiting) ==========
UPSTASH_REDIS_REST_URL=https://your-upstash-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token_here
```

**How to get Upstash Redis credentials:**
1. Go to https://console.upstash.com
2. Create a new Redis database (free tier available)
3. Copy REST URL and Token from the console
4. Add them to your `.env` file

**MongoDB Connection Options:**
- **Local:** `mongodb://localhost:27017/booking-app`
- **Atlas Cloud:** `mongodb+srv://user:password@cluster.mongodb.net/booking-app`

### **Step 3: Configure Frontend Environment Variables**

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

### **Step 4: Initialize Database (Optional)**

Create an admin user by running:

```bash
cd backend
node src/createAdmin.js
```

The application will automatically create collections and indexes on first run.

## 🚀 Running the Application

**Important:** You need to run both the backend and frontend servers simultaneously. Open two separate terminal windows.

### **Terminal 1 - Start Backend Server**

```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ Server is running on PORT: 5001
📁 Created uploads folder
MongoDB connected successfully
```

### **Terminal 2 - Start Frontend Development Server**

```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v7.1.6  ready in 123 ms
  ➜  Local:   http://localhost:5173/
```

### **Access the Application**

Open your browser and navigate to: **http://localhost:5173**

The application should load with full functionality. API requests will automatically be forwarded to the backend server running on port 5001.

### **Production Build**

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```
   This creates an optimized build in `frontend/dist/`

2. **Start backend in production:**
   ```bash
   cd backend
   NODE_ENV=production npm start
   ```

## 🧪 Testing the Setup

### **1. Test Backend Health**

```bash
curl http://localhost:5001/api/restaurants
```

Should return a JSON array (even if empty).

### **2. Test User Registration**

1. Navigate to `http://localhost:5173/register`
2. Create a test account with email and password
3. Check the browser console for any errors

### **3. Test User Login**

1. Navigate to `http://localhost:5173/login`
2. Use your test credentials
3. Should redirect to the home page with your name in the navbar

### **4. Verify API Configuration**

1. Open `http://localhost:5173` in your browser
2. Press `F12` to open DevTools
3. Go to the **Network** tab
4. Make any API request (e.g., login, register, load data)
5. Verify the request URL is `http://localhost:5001/api/...` (not hardcoded)
6. Check the **Headers** section shows your JWT token in the Authorization header

## 📁 Project Structure

```
mern/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # Database connection
│   │   │   └── ustash.js          # Redis configuration
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── bookingController.js
│   │   │   ├── foodController.js
│   │   │   ├── orderController.js
│   │   │   ├── restaurantController.js
│   │   │   ├── searchController.js
│   │   │   ├── tableController.js
│   │   │   ├── waitlistController.js
│   │   │   └── admin/
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── rateLimiter.js
│   │   │   ├── roleMiddleware.js
│   │   │   └── upload.js
│   │   ├── models/
│   │   │   ├── Booking.js
│   │   │   ├── Food.js
│   │   │   ├── Order.js
│   │   │   ├── PreOrder.js
│   │   │   ├── Restaurant.js
│   │   │   ├── Table.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── foodRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── restaurantRoutes.js
│   │   │   ├── tableRoutes.js
│   │   │   └── waitlistRoutes.js
│   │   ├── uploads/               # File uploads directory
│   │   └── server.js              # Main server file
│   ├── createAdmin.js             # Admin user creation script
│   ├── debugAvailability.js       # Debug script
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminNavbar.jsx
│   │   │   ├── BookingTableLayout.jsx
│   │   │   ├── DashboardStats.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── MenuCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── RestaurantForm.jsx
│   │   │   ├── RestaurantList.jsx
│   │   │   ├── RestaurantSelector.jsx
│   │   │   └── TableLayoutEditor.jsx
│   │   ├── pages/
│   │   │   ├── AddRestaurant.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── ConfirmBooking.jsx
│   │   │   ├── CreatePage.jsx
│   │   │   ├── EditRestaurant.jsx
│   │   │   ├── Explore.jsx
│   │   │   ├── Food.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Payment.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Receipt.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── TableBooking.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── BookingManagement.jsx
│   │   │       ├── RestaurantManagement.jsx
│   │   │       ├── RevenueAnalytics.jsx
│   │   │       ├── UserOwnerManagement.jsx
│   │   │       └── WaitlistManagement.jsx
│   │   ├── Styles/
│   │   │   ├── bookingStyles.css
│   │   │   └── menuCard.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── eslint.config.js
├── design_assets/
└── README.md
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `POST /api/restaurants` - Create restaurant (owners only)
- `GET /api/restaurants/:id` - Get restaurant details
- `PUT /api/restaurants/:id` - Update restaurant (owners only)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/restaurant/:restaurantId` - Get bookings by restaurant
- `DELETE /api/bookings/:id` - Cancel booking

### Tables
- `GET /api/tables/restaurant/:restaurantId` - Get tables by restaurant
- `POST /api/tables` - Create table (owners only)

### Food/Menu
- `GET /api/foods/restaurant/:restaurantId` - Get menu items
- `POST /api/foods` - Add menu item (owners only)

### Admin
- `GET /api/admin/restaurants` - Get all restaurants (admin)
- `GET /api/admin/users` - Get all users (admin)
- `GET /api/admin/bookings` - Get all bookings (admin)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Configured for cross-origin requests
- **Input Validation**: Server-side validation for all inputs
- **Role-based Access**: Different permissions for customers, owners, and admins

## ⚠️ Common Issues & Troubleshooting

### **Issue: "Cannot GET /api/restaurants"**

**Cause:** Backend is not running
**Solution:**
```bash
cd backend
npm run dev
```

### **Issue: "Connection refused localhost:5001"**

**Cause:** Port 5001 is already in use on your system
**Solutions:**
```bash
# Option 1: Kill the process using port 5001 (Windows PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5001).OwningProcess | Stop-Process

# Option 2: Use a different port in backend/.env
PORT=5002
```

### **Issue: "MONGO_URI is not defined"**

**Cause:** Backend `.env` file not created or MONGO_URI is missing
**Solutions:**
1. Create `backend/.env` file
2. Add valid MongoDB connection string
3. Restart backend: `npm run dev`

### **Issue: "Cannot find module 'dotenv'" or similar dependency errors**

**Solution:**
```bash
cd backend
npm install
# Then restart: npm run dev
```

### **Issue: 401 Unauthorized on protected routes**

**Cause:** JWT token not in localStorage or token expired
**Solutions:**
1. Clear localStorage in browser console: `localStorage.clear()`
2. Login again with valid credentials
3. Verify `JWT_SECRET` in backend `.env` is set correctly

### **Issue: "axios is not defined" or import errors**

**Cause:** Missing or incorrect import statement
**Solution:** Verify file imports at the top:
```javascript
import axiosInstance from "../api/axiosInstance.js";
```

### **Issue: CORS errors in browser console**

**Cause:** `FRONTEND_URL` in backend `.env` doesn't match your frontend URL
**Solution:**
```env
# If running frontend on different port:
FRONTEND_URL=http://localhost:YOUR_PORT
```

### **Issue: "Port 5173 already in use"**

**Solution:** Frontend will automatically use the next available port (5174, etc.). Check the terminal output for the actual URL.

### **Issue: File upload failing**

**Cause:** No `uploads` folder or permission issues
**Solution:** The backend automatically creates the `uploads` folder. If it fails, manually create:
```bash
mkdir backend/src/uploads
```

## 📦 Services Overview

| Service | Purpose | Configuration |
|---------|---------|---|
| **Express.js** | REST API backend | Running on `:5001` |
| **MongoDB** | Database | Configured via `MONGO_URI` |
| **Upstash Redis** | Rate limiting & caching | REST URL + Token |
| **JWT** | User authentication | Via `JWT_SECRET` |
| **node-cron** | Auto-seat waitlist | Runs every minute |
| **CORS** | Cross-origin requests | Enabled for `FRONTEND_URL` |
| **Multer** | File uploads | `/uploads` folder |

## 🔧 Key Features - Latest Update

### **Axios Configuration (Centralized)**
- ✅ Centralized axios instance: `frontend/src/api/axiosInstance.js`
- ✅ Automatic JWT token injection in all requests
- ✅ Automatic 401 error handling (redirects to login)
- ✅ Base URL configured from environment variables

### **Frontend Updates**
- ✅ All pages use centralized axios instance
- ✅ All components properly configured
- ✅ Admin pages fully integrated
- ✅ No hardcoded API URLs

### **Backend Configuration**
- ✅ CORS configured to use `FRONTEND_URL` env variable
- ✅ Environment variables properly loaded with dotenv
- ✅ Rate limiter middleware active
- ✅ JWT middleware in place
- ✅ Cron jobs for auto-seating waitlist

## 🚀 Production Deployment Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` in `.env` to a strong, unique value
- [ ] Use MongoDB Atlas (not localhost) for `MONGO_URI`
- [ ] Switch to Production Upstash Redis plan
- [ ] Set `NODE_ENV=production`
- [ ] Use your real domain for `FRONTEND_URL` (with HTTPS)
- [ ] Enable HTTPS on your backend server
- [ ] Set strong, unique environment variable values
- [ ] Configure proper database backups
- [ ] Set up monitoring and logging

```bash
cd frontend
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

If you have any questions or need help with the setup, please open an issue in the repository.

---

**Note:** This is a development project. For production deployment, additional security measures and optimizations should be implemented.