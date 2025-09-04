# Cafe Tamarind - Project Structure

## 📁 Complete Project Structure

```
cafe-tamarind/
│
├── 📄 package.json                 # Root package.json with scripts
├── 📄 README.md                    # Project overview and setup instructions
├── 📄 setup.js                     # Automated setup script
├── 📄 PROJECT_STRUCTURE.md         # This file - detailed project structure
│
├── 🗄️ backend/                     # Backend API server
│   ├── 📄 package.json            # Backend dependencies
│   ├── 📄 server.js               # Main server entry point
│   ├── 📄 seed.js                 # Database seeding script
│   ├── 📄 .env                    # Environment variables
│   │
│   ├── 📁 config/
│   │   └── 📄 db.js               # MongoDB connection configuration
│   │
│   ├── 📁 models/                 # Mongoose database schemas
│   │   ├── 📄 User.js             # Admin user model
│   │   ├── 📄 MenuItem.js         # Menu item model
│   │   ├── 📄 Order.js            # Order model with customer info
│   │   └── 📄 Feedback.js         # Customer feedback model
│   │
│   ├── 📁 controllers/            # Business logic handlers
│   │   ├── 📄 authController.js   # Admin authentication
│   │   ├── 📄 menuController.js   # Menu CRUD operations
│   │   ├── 📄 orderController.js  # Order management
│   │   └── 📄 feedbackController.js # Feedback handling
│   │
│   ├── 📁 routes/                 # API route definitions
│   │   ├── 📄 authRoutes.js       # Admin authentication routes
│   │   ├── 📄 menuRoutes.js       # Menu API routes
│   │   ├── 📄 orderRoutes.js      # Order API routes
│   │   └── 📄 feedbackRoutes.js   # Feedback API routes
│   │
│   ├── 📁 middlewares/            # Express middleware
│   │   ├── 📄 authMiddleware.js   # JWT authentication
│   │   └── 📄 errorHandler.js     # Error handling
│   │
│   └── 📁 utils/                  # Utility functions
│       └── 📄 generateToken.js    # JWT token generation
│
└── 🎨 frontend/                    # React frontend application
    ├── 📄 package.json            # Frontend dependencies
    ├── 📄 tailwind.config.js      # Tailwind CSS configuration
    ├── 📄 postcss.config.js       # PostCSS configuration
    │
    ├── 📁 public/                 # Static assets
    │   └── 📄 index.html          # HTML template
    │
    └── 📁 src/                    # React source code
        ├── 📄 index.js            # React entry point
        ├── 📄 App.jsx             # Main App component
        │
        ├── 📁 pages/              # Page components
        │   ├── 📄 Home.jsx        # Menu page
        │   ├── 📄 Cart.jsx        # Shopping cart
        │   ├── 📄 Checkout.jsx    # Order checkout
        │   ├── 📄 OrderDetails.jsx # Order confirmation
        │   ├── 📄 CustomerOrders.jsx # Customer order history
        │   ├── 📄 AdminLogin.jsx  # Admin login
        │   ├── 📄 AdminDashboard.jsx # Admin dashboard
        │   └── 📄 AdminMenuManagement.jsx # Menu management
        │
        ├── 📁 components/         # Reusable components
        │   ├── 📄 Navbar.jsx      # Navigation bar
        │   ├── 📄 ThemeToggle.jsx # Dark/light mode toggle
        │   ├── 📄 MenuItemCard.jsx # Menu item display
        │   └── 📄 AdminRoute.jsx  # Admin route protection
        │
        ├── 📁 context/            # React context providers
        │   └── 📄 AppContext.jsx  # Theme and app state context
        │
        ├── 📁 store/              # State management
        │   └── 📄 useStore.js     # Zustand store for cart state
        │
        ├── 📁 services/           # API service layer
        │   └── 📄 api.js          # Centralized API calls
        │
        └── 📁 styles/             # Global styles
            └── 📄 globals.css     # Tailwind CSS and custom styles
```

## 🗄️ Database Schemas

### User Schema (Admin Only)
- **Fields**: name, email, phone, password, role, isActive
- **Features**: Password hashing, JWT methods, validation
- **Indexes**: email (unique), phone (unique)

### MenuItem Schema
- **Fields**: name, description, price, stock, category, availableFor, isAvailable, preparationTime
- **Features**: Meal time filtering, stock management, availability control
- **Indexes**: availableFor + isAvailable, category

### Order Schema
- **Fields**: customerName, customerPhone, items[], total, mealTime, status, specialInstructions, orderNumber
- **Features**: Auto-generated order numbers, status tracking, meal time validation
- **Indexes**: customerPhone + createdAt, status + mealTime, orderNumber (unique)

### Feedback Schema
- **Fields**: customerPhone, orderId, menuItemId, rating, comment, isAnonymous
- **Features**: Rating validation, unique feedback per order item
- **Indexes**: menuItemId + createdAt, customerPhone + createdAt, rating

## 🌐 API Endpoints

### Authentication Routes (`/api/auth`) - Admin Only
- `POST /login` - Admin login
- `GET /me` - Get current admin user (protected)

### Menu Routes (`/api/menu`)
- `GET /:mealTime?` - Get menu items (with optional meal time filter)
- `GET /item/:id` - Get single menu item
- `GET /categories` - Get menu categories
- `POST /` - Create menu item (admin only)
- `PUT /:id` - Update menu item (admin only)
- `DELETE /:id` - Delete menu item (admin only)

### Order Routes (`/api/orders`)
- `POST /` - Place new order (public)
- `GET /:orderId` - Get order details (public)
- `GET /customer/:phone` - Get customer orders by phone (public)
- `GET /admin/all` - Get all orders (admin only)
- `PUT /admin/:orderId` - Update order status (admin only)

### Feedback Routes (`/api/feedback`)
- `POST /` - Submit feedback (public)
- `GET /admin` - Get all feedback (admin only)

## 🛣️ React Router Routes

### Customer Routes
- `/` - Home/Menu page
- `/cart` - Shopping cart
- `/checkout` - Order checkout
- `/order/:orderId` - Order details
- `/orders/:phone` - Customer order history

### Admin Routes
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard (protected)
- `/admin/menu-management` - Menu management (protected)

## 🎨 Frontend Features

### Components
- **Navbar**: Responsive navigation with cart indicator
- **ThemeToggle**: Dark/light mode switching
- **MenuItemCard**: Menu item display with add to cart
- **AdminRoute**: Admin-only route protection

### State Management
- **Zustand Store**: Cart management and persistence
- **React Context**: Theme management, meal time selection

### Styling
- **Tailwind CSS**: Utility-first styling
- **Custom Components**: Reusable button, input, card styles
- **Dark Mode**: Complete dark/light theme support
- **Responsive Design**: Mobile-first approach

## 🔒 Security Features

### Backend Security
- JWT authentication for admin routes only
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet.js security headers

### Frontend Security
- Admin route protection
- Token-based authentication for admin
- Secure API calls
- Input validation
- XSS protection

## 📱 Mobile-First Design

### Responsive Features
- Mobile-optimized navigation
- Touch-friendly interfaces
- QR code accessibility
- Fast loading times
- Intuitive user experience

## 🚀 Getting Started

1. **Setup**: Run `node setup.js` for automated setup
2. **Database**: Ensure MongoDB is running
3. **Seed**: Run `cd backend && npm run seed` to populate data
4. **Start**: Run `npm run dev` to start both servers
5. **Access**: 
   - Customer: http://localhost:3006
   - Admin: http://localhost:3006/admin/login

## 🔑 Admin Credentials

After running the seed script:
- **Email**: admin@cafetamarind.com
- **Password**: password123

## 📋 Customer Flow

1. **Browse Menu**: Visit `/` to view menu items
2. **Add to Cart**: Click items to add to shopping cart
3. **Checkout**: Go to `/cart` then `/checkout`
4. **Place Order**: Enter name and phone number
5. **Order Confirmation**: View order at `/order/:orderId`
6. **Order History**: View orders by phone at `/orders/:phone`

## 👨‍💻 Admin Flow

1. **Login**: Visit `/admin/login` with admin credentials
2. **Dashboard**: Manage orders at `/admin/dashboard`
3. **Menu Management**: Manage menu items at `/admin/menu-management`
4. **Order Processing**: Update order statuses and manage inventory

This project provides a complete, production-ready QR-based ordering system for Cafe Tamarind with simplified customer authentication and comprehensive admin management.
