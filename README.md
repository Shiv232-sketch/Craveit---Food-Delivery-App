# 🔥 CraveIt Backend — REST API

Node.js + Express + MongoDB backend for CraveIt food ordering app.

## 📁 Folder Structure

```
craveit-backend/
├── server.js                  ← Entry point
├── .env.example               ← Copy to .env and fill values
├── package.json
└── src/
    ├── config/
    │   ├── db.js              ← MongoDB connection
    │   └── cloudinary.js      ← Image upload config
    ├── models/
    │   ├── User.js
    │   ├── Menu.js            ← Category + MenuItem
    │   ├── Order.js
    │   └── Coupon.js
    ├── controllers/
    │   ├── authController.js
    │   ├── menuController.js
    │   ├── orderController.js
    │   ├── paymentController.js
    │   ├── couponController.js
    │   └── adminController.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── menuRoutes.js
    │   ├── orderRoutes.js
    │   ├── paymentRoutes.js
    │   ├── couponRoutes.js
    │   └── adminRoutes.js
    └── middleware/
        └── authMiddleware.js
```

---

## ⚡ Setup & Run

### 1. Install dependencies
```bash
npm install
```

### 2. Create .env file
```bash
cp .env.example .env
```
Fill in your values in `.env`:
- `MONGO_URI` — from MongoDB Atlas
- `JWT_SECRET` — any random long string
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — from Razorpay dashboard
- `CLOUDINARY_*` — from Cloudinary dashboard

### 3. Start the server
```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Server runs at **http://localhost:5000**

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login |
| GET | /api/auth/me | Protected | Get current user |
| PUT | /api/auth/update-profile | Protected | Update name/phone |
| POST | /api/auth/add-address | Protected | Add delivery address |

### Menu
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/menu/categories | Public | Get all categories |
| POST | /api/menu/categories | Admin | Create category |
| GET | /api/menu/items | Public | Get menu items (filter by category, isVeg, search) |
| GET | /api/menu/items/:id | Public | Get single item |
| POST | /api/menu/items | Admin | Add menu item (with image upload) |
| PUT | /api/menu/items/:id | Admin | Update menu item |
| DELETE | /api/menu/items/:id | Admin | Delete menu item |
| PUT | /api/menu/items/:id/toggle | Admin | Toggle availability |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/orders/place | Protected | Place new order |
| GET | /api/orders/my-orders | Protected | Get my orders |
| GET | /api/orders/:id | Protected | Get order by ID |
| PUT | /api/orders/:id/status | Admin | Update order status |
| POST | /api/orders/:id/verify-otp | Protected | Verify delivery OTP |
| GET | /api/orders/refresh-otp/:id | Protected | Refresh OTP |

### Payment (Razorpay)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/payment/create-order | Protected | Create Razorpay order |
| POST | /api/payment/verify | Protected | Verify payment signature |

### Coupons
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/coupons/validate | Protected | Validate a coupon code |
| GET | /api/coupons | Admin | Get all coupons |
| POST | /api/coupons | Admin | Create coupon |
| PUT | /api/coupons/:id | Admin | Update coupon |
| DELETE | /api/coupons/:id | Admin | Delete coupon |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/admin/dashboard | Admin | Stats (orders, revenue, users) |
| GET | /api/admin/orders | Admin | All orders with filters |
| GET | /api/admin/users | Admin | All customers |

---

## 🔐 Authentication

Send JWT token in every protected request header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔌 Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_order` | Client → Server | Join order room for live updates |
| `join_admin` | Client → Server | Admin joins for new order alerts |
| `order_status_update` | Server → Client | Real-time status change |
| `new_order` | Server → Admin | New order notification |

---

## 🌱 Create First Admin

After registering a user, go to MongoDB Atlas and manually change `role` from `"customer"` to `"admin"` in the `users` collection.

---

## 👨‍💻 Author
Shiv Kumar Vishwakarma 
