import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import useStore from '../store/useStore';
import ThemeToggle from './ThemeToggle';

const AdminHeader = React.memo(() => {
  const { user, logout } = useStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = useMemo(() => {
    return (path) => {
      if (path === '/admin/menu') {
        return location.pathname === '/admin/menu' || 
               location.pathname === '/admin/menu-customer' || 
               location.pathname === '/admin/menu-inhouse';
      }
      if (path === '/admin/orders') {
        return location.pathname === '/admin/orders' || 
               location.pathname === '/admin/orders-customer' || 
               location.pathname === '/admin/orders-inhouse';
      }
      return location.pathname === path;
    };
  }, [location.pathname]);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      {/* Top Bar - Logo, Company Name, User Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Cafe Tamarind Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Cafe Tamarind Admin
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Welcome back, {user?.name}
              </p>
            </div>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            <Link
              to="/admin/profile"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Profile
            </Link>
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors flex items-center"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Desktop Navigation Bar */}
      <div className="hidden md:block border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-2">
            <Link
              to="/admin/dashboard"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/admin/dashboard')
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/admin/orders-customer"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/admin/orders')
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Order Management
            </Link>
            <Link
              to="/admin/menu-customer"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/admin/menu')
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Menu Management
            </Link>
            <Link
              to="/admin/users"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/admin/users')
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              User Management
            </Link>
            <Link
              to="/admin/feedback"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/admin/feedback')
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Reviews
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/admin/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/admin/dashboard')
                  ? 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/admin/orders-customer"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/admin/orders')
                  ? 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Order Management
            </Link>
            <Link
              to="/admin/menu-customer"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/admin/menu')
                  ? 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Menu Management
            </Link>
            <Link
              to="/admin/users"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/admin/users')
                  ? 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              User Management
            </Link>
            <Link
              to="/admin/feedback"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/admin/feedback')
                  ? 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Reviews
            </Link>
            
            {/* Mobile Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="px-3 py-2">
                <ThemeToggle />
              </div>
              <Link
                to="/admin/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
});

export default AdminHeader;
