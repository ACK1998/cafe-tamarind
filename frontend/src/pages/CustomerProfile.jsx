import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, LogOut, ArrowLeft, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { STORAGE_KEYS } from '../config/constants';
import axios from 'axios';

// Top-right Notification Component
const Notification = ({ isOpen, onClose, title, message, type = 'info' }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'success':
        return 'text-green-800 dark:text-green-200';
      default:
        return 'text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-sm w-full">
      <div className={`${getBgColor()} border rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1">
            <h4 className={`font-medium ${getTextColor()}`}>{title}</h4>
            <p className={`text-sm mt-1 ${getTextColor()}`}>{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomerProfile = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const showNotification = (title, message, type = 'info') => {
    setNotification({ isOpen: true, title, message, type });
  };

  const closeNotification = () => {
    setNotification({ isOpen: false, title: '', message: '', type: 'info' });
  };

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.CUSTOMER_TOKEN);
    const customerData = localStorage.getItem('customerData');

    if (!token || !customerData) {
      navigate('/login');
      return;
    }

    setCustomer(JSON.parse(customerData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_TOKEN);
    localStorage.removeItem('customerData');
    
    // Trigger a storage event to update Navbar
    window.dispatchEvent(new Event('storage'));
    
    showNotification('Success', 'Logged out successfully', 'success');
    navigate('/');
  };

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      {/* Top-right Notification */}
      <Notification
        isOpen={notification.isOpen}
        onClose={closeNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
      
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Menu
          </Link>
        </div>

        {/* Profile Section */}
        <div className="card mb-8 animate-fade-in">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              My Profile
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-white">{customer.phone}</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Link
                to="/"
                className="flex-1 btn-primary text-center"
              >
                New Order
              </Link>
              <Link
                to={`/orders/${customer.phone}`}
                className="flex-1 btn-outline text-center"
              >
                View Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
