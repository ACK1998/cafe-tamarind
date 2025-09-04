import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import useStore from '../store/useStore';

const AdminHeader = React.memo(() => {
  const { user, logout } = useStore();
  const location = useLocation();

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
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
          
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/dashboard"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/admin/dashboard')
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/admin/orders-customer"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/admin/orders')
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Order Management
            </Link>
            <Link
              to="/admin/menu-customer"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/admin/menu')
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Menu Management
            </Link>
            <Link
              to="/admin/users"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/admin/users')
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              User Management
            </Link>
            <Link
              to="/admin/profile"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/admin/profile')
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Profile
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors flex items-center"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});

export default AdminHeader;
