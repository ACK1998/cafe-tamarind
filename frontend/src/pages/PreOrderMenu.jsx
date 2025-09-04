import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Filter, Search, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import MenuItemCard from '../components/MenuItemCard';
import useStore from '../store/useStore';
import { API_CONFIG } from '../config/constants';
import axios from 'axios';

const PreOrderMenu = () => {
  const navigate = useNavigate();
  const { cart } = useStore();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'in-stock', 'out-of-stock'

  useEffect(() => {
    fetchPreOrderMenu();
    fetchCategories();
  }, [selectedCategory]);

  const fetchPreOrderMenu = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      
      // Check user role and fetch appropriate menu
      let userRole = 'customer';
      try {
        const customerData = localStorage.getItem('customerData');
        if (customerData) {
          const user = JSON.parse(customerData);
          userRole = user.role || 'customer';
        }
      } catch (e) {
        console.error('Error parsing customer data:', e);
      }
      
      // Fetch appropriate menu based on user role
      const endpoint = userRole === 'employee' ? '/menu/inhouse' : '/menu/customer';
      const response = await axios.get(`${API_CONFIG.BASE_URL}${endpoint}`, { params });
      setMenuItems(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching pre-order menu:', err);
      setError('Failed to load pre-order menu');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/menu/categories`);
      setCategories(response.data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };



  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Stock filtering logic
    let matchesStock = true;
    if (stockFilter === 'in-stock') {
      matchesStock = item.stock > 0;
    } else if (stockFilter === 'out-of-stock') {
      matchesStock = item.stock === 0;
    }
    
    return matchesCategory && matchesSearch && matchesStock;
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading pre-order menu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </button>
          
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Pre-Order Menu
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Schedule your favorite dishes for pickup
              </p>
            </div>
            
            {/* Schedule Pre-Order Button */}
            {cart.length > 0 && (
              <button
                onClick={() => navigate('/pre-order')}
                className="btn-primary inline-flex items-center ml-4"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Pre-Order ({cart.length})
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-with-icon"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline inline-flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Category Filters
            </button>
          </div>

          {/* Stock Filter - Always Visible */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Filter by Stock</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStockFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  stockFilter === 'all' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Items
              </button>
              <button
                onClick={() => setStockFilter('in-stock')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  stockFilter === 'in-stock' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                In Stock
              </button>
              <button
                onClick={() => setStockFilter('out-of-stock')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  stockFilter === 'out-of-stock' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Out of Stock
              </button>
            </div>
          </div>

          {/* Category Filter - Collapsible */}
          {showFilters && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Filter by Category</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === '' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Menu Items */}
        {Object.keys(groupedItems).length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
              <Clock className="w-12 h-12 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              No Pre-Order Items Found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              {searchTerm 
                ? `No items match "${searchTerm}" in the pre-order menu.`
                : 'No items are currently available for pre-order.'
              }
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Browse Regular Menu
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="card">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {category}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((item) => (
                      <MenuItemCard
                        key={item._id}
                        item={item}
                        dataItemId={item._id}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pre-Order Information */}
        <div className="mt-8 card">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-500" />
              Pre-Order Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">How Pre-Orders Work</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Select items from our pre-order menu</li>
                  <li>• Choose your preferred pickup date and time</li>
                  <li>• Orders are prepared 15 minutes before pickup</li>
                  <li>• Available pickup hours: 8:00 AM - 10:00 PM</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Important Notes</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Please arrive on time to ensure food quality</li>
                  <li>• Contact us if you need to modify pickup time</li>
                  <li>• Cancellations accepted up to 2 hours before pickup</li>
                  <li>• Pre-orders can be scheduled up to 30 days in advance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreOrderMenu;
