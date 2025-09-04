import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import { ROUTES } from './config/constants';

// Customer Pages
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PreOrder from './pages/PreOrder';
import PreOrderMenu from './pages/PreOrderMenu';
import OrderDetails from './pages/OrderDetails';
import CustomerOrders from './pages/CustomerOrders';
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegister from './pages/CustomerRegister';
import CustomerProfile from './pages/CustomerProfile';
import FoodItemDetail from './pages/FoodItemDetail';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminPlaceOrder from './pages/AdminPlaceOrder';
import AdminCustomerOrder from './pages/AdminCustomerOrder';
import AdminInHouseOrder from './pages/AdminInHouseOrder';
import AdminProfile from './pages/AdminProfile';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminOrders from './pages/AdminOrders';
import AdminMenu from './pages/AdminMenu';
import AdminFeedback from './pages/AdminFeedback';

// Components
import AdminRoute from './components/AdminRoute';
import Footer from './components/Footer';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Routes>
              {/* Customer Routes */}
              <Route path={ROUTES.HOME} element={<Home />} />
              <Route path={ROUTES.CART} element={<Cart />} />
              <Route path={ROUTES.CHECKOUT} element={<Checkout />} />
              <Route path="/pre-order" element={<PreOrder />} />
              <Route path="/pre-order-menu" element={<PreOrderMenu />} />
              <Route path="/order/:orderId" element={<OrderDetails />} />
              <Route path="/orders/:phone" element={<CustomerOrders />} />
              <Route path="/item/:itemId" element={<FoodItemDetail />} />
              <Route path={ROUTES.LOGIN} element={<CustomerLogin />} />
              <Route path={ROUTES.REGISTER} element={<CustomerRegister />} />
              <Route path="/customer/register" element={<CustomerRegister />} />
              <Route path={ROUTES.PROFILE} element={<CustomerProfile />} />
              
              {/* Admin Routes */}
              <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />
              <Route 
                path={ROUTES.ADMIN_DASHBOARD} 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />


              <Route 
                path="/admin/place-order" 
                element={
                  <AdminRoute>
                    <AdminPlaceOrder />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/place-order-customer" 
                element={
                  <AdminRoute>
                    <AdminCustomerOrder />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/place-order-inhouse" 
                element={
                  <AdminRoute>
                    <AdminInHouseOrder />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/profile" 
                element={
                  <AdminRoute>
                    <AdminProfile />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <AdminRoute>
                    <AdminUserManagement />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/orders" 
                element={
                  <AdminRoute>
                    <AdminOrders />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/orders-customer" 
                element={
                  <AdminRoute>
                    <AdminOrders />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/orders-inhouse" 
                element={
                  <AdminRoute>
                    <AdminOrders />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/menu" 
                element={
                  <AdminRoute>
                    <AdminMenu />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/menu-customer" 
                element={
                  <AdminRoute>
                    <AdminMenu />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/menu-inhouse" 
                element={
                  <AdminRoute>
                    <AdminMenu />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/feedback" 
                element={
                  <AdminRoute>
                    <AdminFeedback />
                  </AdminRoute>
                } 
              />
            </Routes>
            <Footer />
          </div>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
