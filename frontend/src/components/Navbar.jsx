import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, LogIn, User, LogOut, Clock, Package } from 'lucide-react';
// import { useApp } from '../context/AppContext';
import useStore from '../store/useStore';
import ThemeToggle from './ThemeToggle';
import { STORAGE_KEYS, ROUTES } from '../config/constants';
import { storage } from '../utils/helpers';

const Navbar = () => {
  const { cart } = useStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [customer, setCustomer] = useState(null);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    const customerData = storage.get('customerData');
    if (customerData) {
      setCustomer(customerData);
    }
  }, []);

  // Listen for storage changes to update customer state
  useEffect(() => {
    const handleStorageChange = () => {
      const customerData = storage.get('customerData');
      if (customerData) {
        setCustomer(customerData);
      } else {
        setCustomer(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    storage.remove(STORAGE_KEYS.CUSTOMER_TOKEN);
    storage.remove('customerData');
    setCustomer(null);
    
    // Trigger a storage event to update other components
    window.dispatchEvent(new Event('storage'));
  };

  if (isAdminRoute) {
    return null; // Don't show navbar on admin routes
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Cafe Tamarind Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Cafe Tamarind
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to={ROUTES.HOME}
              className={`text-sm font-medium transition-colors ${
                location.pathname === ROUTES.HOME
                  ? 'text-orange-500 dark:text-orange-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              Menu
            </Link>
            
            <Link
              to="/pre-order-menu"
              className={`text-sm font-medium transition-colors flex items-center ${
                location.pathname === '/pre-order-menu'
                  ? 'text-orange-500 dark:text-orange-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4 mr-1" />
              Pre-Order
            </Link>
            
            <Link
              to={ROUTES.CART}
              className="relative text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            {customer ? (
              <>
                <Link
                  to={`/orders/${customer.phone}`}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors flex items-center"
                >
                  <Package className="w-4 h-4 mr-1" />
                  Orders
                </Link>
                <Link
                  to={ROUTES.PROFILE}
                  className={`text-sm font-medium transition-colors flex items-center ${
                    location.pathname === ROUTES.PROFILE
                      ? 'text-orange-500 dark:text-orange-400'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                  style={{
                    color: location.pathname === ROUTES.PROFILE ? '#f97316' : undefined
                  }}
                >
                  <User className="w-4 h-4 mr-1" />
                  {customer.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors flex items-center"
                  style={{
                    color: '#dc2626'
                  }}
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to={ROUTES.LOGIN}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors flex items-center"
              >
                <LogIn className="w-4 h-4 mr-1" />
                Sign In
              </Link>
            )}
            
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to={ROUTES.HOME}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location.pathname === ROUTES.HOME
                    ? 'text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Menu
              </Link>
              
              <Link
                to="/pre-order-menu"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center ${
                  location.pathname === '/pre-order-menu'
                    ? 'text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Clock className="w-4 h-4 mr-2" />
                Pre-Order
              </Link>
              
              <Link
                to={ROUTES.CART}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Cart ({cartItemCount})
              </Link>
              
              {customer ? (
                <>
                  <Link
                    to={`/orders/${customer.phone}`}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors flex items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Orders
                  </Link>
                  <Link
                    to={ROUTES.PROFILE}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center ${
                      location.pathname === ROUTES.PROFILE
                        ? 'text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                    }`}
                    style={{
                      color: location.pathname === ROUTES.PROFILE ? '#f97316' : undefined
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {customer.name}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors flex items-center"
                    style={{
                      color: '#dc2626'
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to={ROUTES.LOGIN}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              )}
              
              {/* Theme Toggle for Mobile */}
              <div className="px-3 py-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
