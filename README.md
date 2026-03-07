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
   git clone <your-repo-url>
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

