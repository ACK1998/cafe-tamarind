import React from 'react';
import { useLocation } from 'react-router-dom';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';

const Footer = () => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return null; // Don't show footer on admin routes
  }

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
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
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Experience the finest flavors and exceptional service at Cafe Tamarind. 
                Your favorite cafe for delicious food and memorable moments.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Links
              </h3>
              <div className="space-y-2">
                <a 
                  href="/" 
                  className="block text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors text-sm"
                >
                  Menu
                </a>
                <a 
                  href="/pre-order-menu" 
                  className="block text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors text-sm"
                >
                  Pre-Order
                </a>
                <a 
                  href="/login" 
                  className="block text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors text-sm"
                >
                  Sign In
                </a>
              </div>
            </div>

            {/* Social Media & Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Connect With Us
              </h3>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com/cafetamarind"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-100 hover:bg-blue-50 dark:bg-gray-700 dark:hover:bg-blue-900/20 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com/_cafe_tamarind_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-100 hover:bg-pink-50 dark:bg-gray-700 dark:hover:bg-pink-900/20 text-gray-600 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-100 hover:bg-green-50 dark:bg-gray-700 dark:hover:bg-green-900/20 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>📧 info@cafetamarind.com</p>
                <p>📞 +91 12345 67890</p>
                <p>📍 Your Location, City, State</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6">
            {/* Copyright */}
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © {currentYear} Cafe Tamarind. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm">
                <a 
                  href="/privacy" 
                  className="text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
                >
                  Privacy Policy
                </a>
                <a 
                  href="/terms" 
                  className="text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
