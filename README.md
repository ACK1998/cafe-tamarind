# 🍽️ Cafe Tamarind QR Ordering System

A modern, mobile-first, responsive web application for Cafe Tamarind, accessible via QR code. Features a customer-facing frontend and a secure admin backend with professional UI/UX design.

## ✨ Features

### 🎨 **Professional UI/UX**
- **Consistent Design System** with standardized spacing and typography
- **Smooth Animations** with professional transitions and micro-interactions
- **Modern Date Picker** using `react-datepicker` with Indian localization
- **Responsive Design** optimized for mobile, tablet, and desktop
- **Dark/Light Mode** with seamless theme switching
- **Professional Typography** with proper hierarchy and spacing

### 📱 **Customer Features**
- **QR Code Access** - Mobile-optimized for easy QR scanning
- **Menu Browsing** - Filter by meal time (Breakfast/Lunch/Dinner)
- **Search & Filter** - Find items by name, description, or category
- **Pre-order System** - Schedule orders for future dates/times
- **Shopping Cart** - Add items with quantity controls
- **Secure Checkout** - OTP verification for order confirmation
- **Order Tracking** - View order status and history

### 🔐 **Admin Features**
- **Secure Login** - JWT-based authentication
- **Order Management** - View and update order status
- **Menu Management** - CRUD operations for menu items
- **Feedback System** - View customer ratings and reviews
- **Dashboard Analytics** - Order statistics and insights

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React DatePicker** - Professional date/time picker component

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Bcryptjs** - Password hashing

### Development Tools
- **Concurrently** - Run frontend and backend simultaneously
- **Nodemon** - Auto-restart server on file changes
- **ESLint** - Code linting and formatting

## 📦 Dependencies

### Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "zustand": "^4.3.0",
  "axios": "^1.3.0",
  "lucide-react": "^0.263.0",
  "react-datepicker": "^4.16.0"
}
```

### Backend Dependencies
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.0.0",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3",
  "express-validator": "^6.14.0",
  "cors": "^2.8.5",
  "helmet": "^6.0.0",
  "express-rate-limit": "^6.7.0"
}
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd cafe-tamarind
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration
Create `.env` file in the backend directory:
```env
PORT=5006
MONGODB_URI=mongodb://localhost:27017/cafe-tamarind
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:3006
```

### 4. Database Setup
```bash
cd backend
npm run seed
```

This will create:
- Admin user: `admin@cafetamarind.com` / `password123`
- Sample menu items with Indian pricing

### 5. Start Development Servers
```bash
# From root directory
npm run dev
```

This starts both servers:
- Frontend: http://localhost:3006
- Backend: http://localhost:5006

## 📱 Usage

### Customer Flow
1. **Access via QR Code** - Scan QR code to open menu
2. **Browse Menu** - Select meal time and browse items
3. **Add to Cart** - Add items with quantity controls
4. **Pre-order** (Optional) - Schedule for future date/time
5. **Checkout** - Enter name and phone number
6. **OTP Verification** - Verify phone number with 4-digit code
7. **Order Confirmation** - View order details and tracking

### Admin Flow
1. **Login** - Use admin credentials
2. **Dashboard** - View pending orders and statistics
3. **Menu Management** - Add/edit/delete menu items
4. **Order Management** - Update order status
5. **Feedback** - View customer ratings and reviews

## 🎨 UI/UX Features

### Professional Design System
- **Consistent Spacing** - Using Tailwind's spacing scale (p-4, m-2, gap-3)
- **Typography Hierarchy** - Proper text sizes and font weights
- **Color Palette** - Orange theme with professional gradients
- **Component Consistency** - Unified card, button, and input styles

### Modern Date Picker
- **React DatePicker Integration** - Professional date/time selection
- **Indian Localization** - dd/mm/yyyy format
- **Time Selection** - 15-minute intervals for pre-orders
- **Custom Styling** - Tailwind CSS overrides for consistency
- **Accessibility** - Keyboard navigation and screen reader support

### Responsive Design
- **Mobile-First** - Optimized for QR code access
- **Tablet Support** - Adaptive layouts for medium screens
- **Desktop Experience** - Enhanced layouts for larger screens
- **Touch-Friendly** - Proper touch targets and gestures

### Animations & Interactions
- **Smooth Transitions** - CSS transitions with cubic-bezier easing
- **Micro-interactions** - Hover effects and loading states
- **Staggered Animations** - Sequential loading for grid items
- **Loading States** - Skeleton screens and spinners

## 🔧 Development

### Project Structure
```
cafe-tamarind/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── store/          # Zustand state management
│   │   ├── services/       # API services
│   │   └── index.css       # Global styles
│   └── package.json
├── backend/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── middlewares/       # Express middlewares
│   ├── config/           # Configuration files
│   └── server.js         # Main server file
└── package.json
```

### Key Components

#### DatePicker Component
```jsx
import CustomDatePicker from '../components/DatePicker';

<CustomDatePicker
  selected={date}
  onChange={setDate}
  minDate={new Date()}
  maxDate={maxDate}
  showTimeSelect={true}
  timeIntervals={15}
  dateFormat="dd/MM/yyyy"
/>
```

#### Professional Styling
```css
/* Consistent spacing with Tailwind */
.card {
  @apply bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary {
  @apply bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-xl shadow-md;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
```

### Backend Deployment
```bash
cd backend
npm start
```

### Environment Variables
Set production environment variables:
- `MONGODB_URI` - Production MongoDB connection
- `JWT_SECRET` - Strong JWT secret key
- `CORS_ORIGIN` - Production frontend URL

## 📊 API Endpoints

### Public Endpoints
- `GET /api/menu/:mealTime` - Get menu items by meal time
- `GET /api/menu/categories` - Get menu categories
- `POST /api/orders` - Place new order
- `GET /api/orders/:orderId` - Get order details
- `GET /api/orders/customer/:phone` - Get customer orders

### Protected Endpoints (Admin)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current admin
- `GET /api/orders/admin/all` - Get all orders
- `PUT /api/orders/admin/:orderId` - Update order status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@cafetamarind.com
- Phone: +91-1234567890

---

**Built with ❤️ for Cafe Tamarind**
