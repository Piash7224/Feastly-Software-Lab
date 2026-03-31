# 🚀 Project Setup Guide - 5 Month Recovery

After 5 months away, follow this guide to get your MERN booking application running properly with all services configured.

---

## 📋 Prerequisites

- **Node.js** (v14+) and **npm** installed
- **MongoDB** (local or Atlas account)
- **Upstash Redis** account (for rate limiting)
- **Git** configured

---

## ✅ Step-by-Step Setup

### **1. Install Dependencies**

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### **2. Configure Backend Environment Variables**

Create/update `backend/.env` with MongoDB URI, JWT secret, and Upstash credentials:

```env
# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db-name

# JWT Secret
JWT_SECRET=your-super-secret-key-change-this-in-production

# Server Config
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://your-upstash-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

**How to get Upstash credentials:**
1. Go to https://console.upstash.com
2. Create a new Redis database
3. Copy REST URL and Token from the console

### **3. Configure Frontend Environment Variables**

Create/update `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

---

## 🏃 Running the Application

### **Terminal 1 - Backend Server**

```bash
cd backend
npm run dev
```

Expected output:
```
✅ Server is running on PORT: 5001
📁 Created uploads folder
MongoDB connected successfully
```

### **Terminal 2 - Frontend Server**

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v7.1.6  ready in 123 ms

  ➜  Local:   http://localhost:5173/
```

---

## 🔧 Key Changes Made (5-Month Recovery)

### **Axios Configuration**
- Centralized axios instance: `frontend/src/api/axiosInstance.js`
- Automatic JWT token injection via interceptors
- Automatic 401 error handling (redirects to login)
- Base URL configured from environment variables

### **All Frontend Files Updated**
- ✅ Pages: Booking, Login, Register, Food, Profile, Table Booking, User Management, Add/Edit Restaurant
- ✅ Admin Pages: Dashboard, Restaurant Management, Booking Management, Revenue Analytics, Waitlist Management
- ✅ Components: Restaurant List, Restaurant Selector, Dashboard Stats
- ✅ Root Booking.js file

### **Backend Server Configuration**
- ✅ CORS configured to use `FRONTEND_URL` env variable
- ✅ Environment variables properly loaded with dotenv
- ✅ Rate limiter middleware active
- ✅ JWT middleware in place
- ✅ Cron jobs for auto-seating waitlist

---

## 🧪 Testing the Setup

### **1. Test Backend Health**

```bash
curl http://localhost:5001/api/restaurants
```

Should return a JSON array (even if empty).

### **2. Test User Registration**

1. Navigate to `http://localhost:5173/register`
2. Create a test account with email and password
3. Check browser console for errors

### **3. Test User Login**

1. Navigate to `http://localhost:5173/login`
2. Use your test credentials
3. Should redirect to home page with navbar showing name

### **4. Check API Calls in Browser DevTools**

1. Open `http://localhost:5173`
2. Press `F12` (DevTools)
3. Go to **Network** tab
4. Make any API request
5. Verify URL is `http://localhost:5001/api/...` (not hardcoded)
6. Check **Authorization** header has your JWT token

---

## ⚠️ Common Issues & Solutions

### **Issue: "Cannot GET /api/restaurants"**

**Cause:** Backend is not running
**Solution:**
```bash
cd backend
npm run dev
```

### **Issue: "Connection refused localhost:5001"**

**Cause:** Port 5001 is in use
**Solutions:**
```bash
# Option 1: Kill process on port 5001
# On Windows (PowerShell):
Get-Process -Id (Get-NetTCPConnection -LocalPort 5001).OwningProcess | Stop-Process

# Option 2: Change PORT in backend/.env
PORT=5002
```

### **Issue: "MONGO_URI is not defined"**

**Cause:** Backend/.env not created or DB connection string missing
**Solutions:**
```bash
# 1. Create backend/.env
# 2. Add MONGO_URI=mongodb://...
# 3. Restart backend: npm run dev
```

### **Issue: 401 Unauthorized on protected routes**

**Cause:** JWT token not in localStorage or expired
**Solutions:**
- Clear localStorage: `localStorage.clear()` in browser console
- Login again
- Check backend JWT_SECRET matches frontend

### **Issue: "axios is not defined" or similar errors**

**Cause:** You edited a file and accidentally removed the import
**Solution:** Ensure first few lines have:
```javascript
import axiosInstance from "../api/axiosInstance.js";
```

### **Issue: CORS errors**

**Cause:** FRONTEND_URL in backend/.env doesn't match your frontend URL
**Solution:**
```env
# If running frontend on different port:
FRONTEND_URL=http://localhost:YOUR_PORT
```

---

## 📦 Services Overview

| Service | Purpose | Status |
|---------|---------|--------|
| **Express.js** | REST API backend | ✅ Running on :5001 |
| **MongoDB** | Database | ✅ Connected via MONGO_URI |
| **Upstash Redis** | Rate limiting & caching | ✅ Configured |
| **JWT** | User authentication | ✅ Active |
| **node-cron** | Scheduled tasks (waitlist) | ✅ Running every minute |
| **CORS** | Cross-origin requests | ✅ Enabled for frontend |
| **Multer** | File uploads | ✅ /uploads folder |

---

## 🚀 Production Deployment

Before deploying to production:

1. **Change JWT_SECRET** in `.env`
2. **Use Atlas MongoDB** (not localhost)
3. **Use Production Upstash plan**
4. **Set `NODE_ENV=production`**
5. **Use secure FRONTEND_URL** (real domain, HTTPS)
6. **Enable HTTPS** on your backend

---

## 📞 Troubleshooting

If you still have issues:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Restart both servers** (Ctrl+C, then npm run dev)
3. **Check all .env files** are created with correct values
4. **Check browser DevTools Network tab** for failed requests
5. **Check backend console** for error messages

---

## ✨ Next Steps

- [ ] Verify all services are running
- [ ] Test user registration/login flow
- [ ] Test admin dashboard
- [ ] Test restaurant booking
- [ ] Check waitlist auto-seating (cron job)
- [ ] Load test with multiple concurrent users

Good luck! 🎉
