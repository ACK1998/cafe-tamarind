import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingCart, User, Search, Filter } from 'lucide-react';
import { STORAGE_KEYS } from '../config/constants';
import axios from 'axios';
import { formatPrice } from '../utils/currencyFormatter';
import useStore from '../store/useStore';

const AdminPlaceOrder = () => {
  const navigate = useNavigate();
  const { user, logout } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    mealTime: 'lunch',
    specialInstructions: ''
  });
  
  // Menu and cart state
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [useInHousePricing, setUseInHousePricing] = useState(false);

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('/api/menu', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`
        }
      });
      setMenuItems(response.data.data);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Failed to load menu items');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/menu/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`
        }
      });
      const categoryData = response.data.data;
      const validCategories = categoryData
        .filter(cat => typeof cat === 'string' && cat.trim() !== '')
        .sort();
      setCategories(validCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem._id === item._id);
      
      if (existingItem) {
        const updatedCart = prevCart.map(cartItem =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
        updateCartTotal(updatedCart);
        return updatedCart;
      } else {
        const newCart = [...prevCart, { ...item, quantity: 1 }];
        updateCartTotal(newCart);
        return newCart;
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => {
      const updatedCart = prevCart.filter(item => item._id !== itemId);
      updateCartTotal(updatedCart);
      return updatedCart;
    });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(prevCart => {
      const updatedCart = prevCart.map(item =>
        item._id === itemId ? { ...item, quantity } : item
      );
      updateCartTotal(updatedCart);
      return updatedCart;
    });
  };

  const updateCartTotal = (cartItems) => {
    const total = cartItems.reduce((sum, item) => {
      const unitPrice = useInHousePricing && item.inHousePrice != null ? item.inHousePrice : item.price;
      return sum + (unitPrice * item.quantity);
    }, 0);
    setCartTotal(total);
  };

  const clearCart = () => {
    setCart([]);
    setCartTotal(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form data
      if (!formData.customerName.trim() || !formData.customerPhone.trim()) {
        setError('Please fill in customer name and phone number.');
        return;
      }

      if (cart.length === 0) {
        setError('Please add at least one item to the order.');
        return;
      }

      const orderData = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        items: cart.map(item => ({
          menuItemId: item._id,
          qty: item.quantity
        })),
        mealTime: formData.mealTime,
        specialInstructions: formData.specialInstructions.trim(),
        createdBy: 'admin',
        pricingTier: useInHousePricing ? 'inhouse' : 'standard'
      };

      const response = await axios.post('/api/orders', orderData);
      
      setSuccess(`Order placed successfully! Order #${response.data.data.orderNumber}`);
      clearCart();
      setFormData({
        customerName: '',
        customerPhone: '',
        mealTime: 'lunch',
        specialInstructions: ''
      });
      
      // Redirect to admin dashboard after 2 seconds
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Order placement error:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
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
                  Place Order for Customer
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="btn-outline"
              >
                Dashboard
              </Link>
              <Link
                to="/admin/menu-management"
                className="btn-outline"
              >
                Menu Management
              </Link>
              <Link
                to="/admin/profile"
                className="btn-outline"
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="btn-outline"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Information Form */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <User className="w-5 h-5 mr-2 text-orange-500" />
                  Customer Information
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Customer Name */}
                  <div>
                    <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                      className="input w-full"
                      placeholder="Enter customer name"
                    />
                  </div>

                  {/* Customer Phone */}
                  <div>
                    <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="customerPhone"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      required
                      className="input w-full"
                      placeholder="Enter phone number"
                    />
                  </div>

                  {/* Meal Time */}
                  <div>
                    <label htmlFor="mealTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meal Time *
                    </label>
                    <select
                      id="mealTime"
                      name="mealTime"
                      value={formData.mealTime}
                      onChange={handleInputChange}
                      className="input w-full"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Special Instructions
                    </label>
                    <textarea
                      id="specialInstructions"
                      name="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={handleInputChange}
                      rows="3"
                      className="input w-full resize-none"
                      placeholder="Any special requests..."
                    />
                  </div>

                  {/* Error/Success Messages */}
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || cart.length === 0}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Placing Order...' : `Place Order - ${formatPrice(cartTotal)}`}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Menu and Cart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filter */}
            <div className="card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Search Menu Items
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="input-with-icon"
                    />
                  </div>
                  
                  <div className="relative min-w-0 sm:w-48">
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="input-with-right-icon appearance-none cursor-pointer"
                    >
                      <option value="All Categories">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={useInHousePricing}
                      onChange={(e) => {
                        setUseInHousePricing(e.target.checked);
                        updateCartTotal(cart);
                      }}
                    />
                    Use In-House Pricing
                  </label>
                </div>
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div key={item._id} className="card hover:shadow-lg transition-shadow">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-orange-600 dark:text-orange-400">
                          {formatPrice(item.price)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Stock: {item.stock}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => addToCart(item)}
                      disabled={!item.isAvailable || item.stock === 0}
                      className="w-full btn-outline text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4 mr-1 inline" />
                      Add to Order
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div className="card">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2 text-orange-500" />
                    Order Summary ({cart.length} items)
                  </h3>

                  <div className="space-y-3 mb-4">
                    {cart.map((item) => (
                      <div key={item._id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {formatPrice((useInHousePricing && item.inHousePrice != null) ? item.inHousePrice : item.price)} each
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatPrice(((useInHousePricing && item.inHousePrice != null) ? item.inHousePrice : item.price) * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                      <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={clearCart}
                    className="w-full btn-outline mt-4 text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                  >
                    Clear Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPlaceOrder;
