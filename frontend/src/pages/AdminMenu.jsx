import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Utensils, Users, Building, Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { STORAGE_KEYS } from '../config/constants';
import { formatPrice } from '../utils/currencyFormatter';
import AdminHeader from '../components/AdminHeader';
import { menuAPI } from '../services/api';

const AdminMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuType, setMenuType] = useState('customer'); // 'customer' or 'inhouse'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    inHousePrice: '',
    category: '',
    stock: 0,
    image: '',
    isAvailable: true,
    availableForPreOrder: false,
    portion: 'Regular',
    availableFor: [],
    preparationTime: 15
  });

  // Detect menu type from URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('menu-inhouse')) {
      setMenuType('inhouse');
    } else if (path.includes('menu-customer')) {
      setMenuType('customer');
    }
  }, [location.pathname]);

  useEffect(() => {
    // Add a small delay to prevent rapid API calls
    const timer = setTimeout(() => {
      fetchMenuItems();
      fetchCategories();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [menuType]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const type = menuType === 'customer' ? 'CUSTOMER' : 'INHOUSE';
      
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      console.log('Admin token:', token); // Debug log
      
      if (!token) {
        setError('No admin token found. Please login again.');
        setLoading(false);
        return;
      }
      
      const response = await menuAPI.getByType(type);
      setMenuItems(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching menu items:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
        // Redirect to login if token is invalid
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        window.location.href = '/admin/login';
      } else {
        setError('Failed to load menu items');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Use the general categories endpoint (public route)
      const response = await menuAPI.getCategories();
      setCategories(response.data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Fallback: extract categories from menu items
      if (menuItems.length > 0) {
        const uniqueCategories = [...new Set(menuItems.map(item => item.category))];
        setCategories(uniqueCategories);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that at least one meal time is selected
    if (formData.availableFor.length === 0) {
      setError('Please select at least one meal time');
      return;
    }
    
    // Validate price for customer menu items
    if (menuType === 'customer' && (!formData.price || formData.price <= 0)) {
      setError('Please enter a valid price');
      return;
    }
    
    // Validate in-house price for in-house menu items
    if (menuType === 'inhouse' && (!formData.inHousePrice || formData.inHousePrice <= 0)) {
      setError('Please enter a valid in-house price');
      return;
    }
    
    // Validate preparation time
    if (!formData.preparationTime || formData.preparationTime < 1) {
      setError('Please enter a valid preparation time (minimum 1 minute)');
      return;
    }
    
    try {
      // Add type to formData based on menuType and ensure proper data types
      const submitData = {
        ...formData,
        type: menuType === 'customer' ? 'CUSTOMER' : 'INHOUSE',
        stock: parseInt(formData.stock),
        preparationTime: parseInt(formData.preparationTime)
      };
      
      // Handle price fields based on menu type
      if (menuType === 'customer') {
        submitData.price = parseFloat(formData.price);
      } else if (menuType === 'inhouse') {
        submitData.price = parseFloat(formData.inHousePrice);
        submitData.inHousePrice = parseFloat(formData.inHousePrice);
      }
      
      if (editingItem) {
        await menuAPI.update(editingItem._id, submitData);
      } else {
        await menuAPI.create(submitData);
      }
      
      setShowAddModal(false);
      setEditingItem(null);
      resetForm();
      fetchMenuItems();
      setError(''); // Clear any previous errors
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save menu item');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await menuAPI.delete(itemId);
      fetchMenuItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete menu item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    
    // Update menu type based on the item being edited
    if (item.type === 'INHOUSE') {
      setMenuType('inhouse');
    } else if (item.type === 'CUSTOMER') {
      setMenuType('customer');
    }
    
    // Determine which price to use based on menu type
    let priceValue = item.price || 0;
    let inHousePriceValue = item.inHousePrice || '';
    
    // For in-house items, use inHousePrice as the main price if available
    if (item.type === 'INHOUSE') {
      if (item.inHousePrice) {
        priceValue = item.inHousePrice;
        inHousePriceValue = item.inHousePrice;
      } else {
        // If no inHousePrice, use the regular price
        priceValue = item.price || 0;
        inHousePriceValue = item.price || 0;
      }
    }
    

    
    setFormData({
      name: item.name,
      description: item.description,
      price: priceValue,
      inHousePrice: inHousePriceValue,
      category: item.category,
      stock: item.stock || 0,
      image: item.image || '',
      isAvailable: item.isAvailable,
      availableForPreOrder: item.availableForPreOrder || false,
      portion: item.portion || 'Regular',
      availableFor: item.availableFor || [],
      preparationTime: item.preparationTime || 15
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      inHousePrice: '',
      category: '',
      stock: 0,
      image: '',
      isAvailable: true,
      availableForPreOrder: false,
      portion: 'Regular',
      availableFor: [],
      preparationTime: 15
    });
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Menu Type Selection */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Menu Management
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div 
              className={`card cursor-pointer transition-all ${
                menuType === 'customer' 
                  ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                  : 'hover:shadow-lg'
              }`}
              onClick={() => navigate('/admin/menu-customer')}
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${
                    menuType === 'customer' 
                      ? 'bg-orange-100 dark:bg-orange-800' 
                      : 'bg-blue-100 dark:bg-blue-800'
                  }`}>
                    <Users className={`w-8 h-8 ${
                      menuType === 'customer' 
                        ? 'text-orange-600 dark:text-orange-400' 
                        : 'text-blue-600 dark:text-blue-400'
                    }`} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Customer Menu
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Manage customer-facing menu items
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div 
              className={`card cursor-pointer transition-all ${
                menuType === 'inhouse' 
                  ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                  : 'hover:shadow-lg'
              }`}
              onClick={() => navigate('/admin/menu-inhouse')}
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${
                    menuType === 'inhouse' 
                      ? 'bg-orange-100 dark:bg-orange-800' 
                      : 'bg-purple-100 dark:bg-purple-800'
                  }`}>
                    <Building className={`w-8 h-8 ${
                      menuType === 'inhouse' 
                        ? 'text-orange-600 dark:text-orange-400' 
                        : 'text-purple-600 dark:text-purple-400'
                    }`} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      In-House Menu
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Manage staff and internal menu items
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Categories</option>
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))
              ) : (
                <option value="" disabled>Loading categories...</option>
              )}
            </select>
          </div>
          
          <button
            onClick={() => {
              setEditingItem(null);
              resetForm();
              setShowAddModal(true);
            }}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Menu Item
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="message error mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item._id} className="card">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.category}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {item.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatPrice(item.price)}
                    </span>
                    {menuType === 'inhouse' && item.portion && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {item.portion}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.isAvailable
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    {item.availableForPreOrder && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Pre-Order
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Stock Information */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Stock:
                    </span>
                    <span className={`text-sm font-medium ${
                      item.stock > 10 
                        ? 'text-green-600 dark:text-green-400' 
                        : item.stock > 0 
                        ? 'text-yellow-600 dark:text-yellow-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {item.stock} units
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No menu items found
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-t-xl">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-colors"
                  placeholder="Enter item name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-colors"
                  rows="4"
                  placeholder="Enter item description"
                  required
                />
              </div>
              
              {menuType === 'customer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-colors"
                    placeholder="0.00"
                    required
                  />
                </div>
              )}
              
              {menuType === 'inhouse' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.inHousePrice || ''}
                    onChange={(e) => setFormData({...formData, inHousePrice: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-colors"
                    placeholder="0.00"
                    required
                  />

                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-colors"
                  required
                >
                  <option value="">Select a category</option>
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Loading categories...</option>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-colors"
                  placeholder="0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preparation Time (minutes) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({...formData, preparationTime: parseInt(e.target.value) || 15})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-colors"
                  placeholder="15"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Available For (Meal Times) *
                </label>
                <div className="space-y-3">
                  {['breakfast', 'lunch', 'dinner'].map((mealTime) => (
                    <div key={mealTime} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={`availableFor-${mealTime}`}
                        checked={formData.availableFor.includes(mealTime)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              availableFor: [...formData.availableFor, mealTime]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              availableFor: formData.availableFor.filter(time => time !== mealTime)
                            });
                          }
                        }}
                        className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <label htmlFor={`availableFor-${mealTime}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {mealTime}
                      </label>
                    </div>
                  ))}
                </div>
                {formData.availableFor.length === 0 && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    Please select at least one meal time
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Portion *
                </label>
                <select
                  value={formData.portion}
                  onChange={(e) => setFormData({...formData, portion: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-colors"
                  required
                >
                  <option value="Half">Half</option>
                  <option value="Full">Full</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Regular">Regular</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-colors"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Available
                  </label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <input
                    type="checkbox"
                    id="availableForPreOrder"
                    checked={formData.availableForPreOrder}
                    onChange={(e) => setFormData({...formData, availableForPreOrder: e.target.checked})}
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="availableForPreOrder" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pre-Order Available
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 text-sm"
                >
                  {editingItem ? 'Update' : 'Add'} Item
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenu;
