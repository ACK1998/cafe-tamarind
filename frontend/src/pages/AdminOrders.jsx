import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, AlertCircle, Users, Building, ShoppingCart, Eye, Info, X } from 'lucide-react';
import useStore from '../store/useStore';
import { STORAGE_KEYS } from '../config/constants';
import AdminHeader from '../components/AdminHeader';
import { formatPrice } from '../utils/currencyFormatter';
import { ordersAPI, menuAPI } from '../services/api';
import { printKot, printBill } from '../utils/printUtils';

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

const AdminOrders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useStore();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    preparing: 0,
    ready: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderType, setOrderType] = useState('customer'); // 'customer' or 'inhouse'
  const [viewMode, setViewMode] = useState('place'); // 'view' or 'place'
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    mealTime: 'lunch',
    specialInstructions: ''
  });
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  // Detect order type from URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('orders-inhouse')) {
      setOrderType('inhouse');
    } else if (path.includes('orders-customer')) {
      setOrderType('customer');
    }
  }, [location.pathname]);

  const showNotification = (title, message, type = 'info') => {
    setNotification({ isOpen: true, title, message, type });
  };

  const closeNotification = () => {
    setNotification({ isOpen: false, title: '', message: '', type: 'info' });
  };

  useEffect(() => {
    // Add a small delay to prevent rapid API calls
    const timer = setTimeout(() => {
      if (viewMode === 'view') {
        fetchOrders();
      } else {
        fetchMenuItems();
        fetchCategories();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [orderType, viewMode]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = orderType === 'customer' 
        ? await ordersAPI.getAdminCustomerOrders()
        : await ordersAPI.getAdminInHouseOrders();
      
      const ordersData = response.data.data;
      setOrders(ordersData);
      
      // Calculate stats
      const statsData = {
        total: ordersData.length,
        pending: ordersData.filter(order => order.status === 'pending').length,
        preparing: ordersData.filter(order => order.status === 'preparing').length,
        ready: ordersData.filter(order => order.status === 'ready').length
      };
      setStats(statsData);
      
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await ordersAPI.updateStatus(orderId, newStatus);
      const updatedOrder = response?.data?.data;

      if (newStatus === 'confirmed' && updatedOrder) {
        printKot(updatedOrder);
      }

      if (newStatus === 'completed' && updatedOrder) {
        printBill(updatedOrder);
      }
      
      // Refresh orders
      fetchOrders();
      showNotification('Success', 'Order status updated successfully', 'success');
    } catch (err) {
      console.error('Error updating order status:', err);
      showNotification('Error', 'Failed to update order status', 'error');
    }
  };

  const fetchMenuItems = async () => {
    try {
      const type = orderType === 'customer' ? 'CUSTOMER' : 'INHOUSE';
      
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      console.log('🔍 Debug - Token:', token ? 'Token exists' : 'No token found');
      console.log('🔍 Debug - Type:', type);
      
      const response = await menuAPI.getByType(type);
      setMenuItems(response.data.data);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching menu items:', err);
      console.error('Error response:', err.response?.data);
      setError('Failed to load menu items');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await menuAPI.getCategories();
      setCategories(response.data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => 
      cartItem._id === item._id && cartItem.portion === item.portion
    );

    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem._id === item._id && cartItem.portion === item.portion
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const updateCartQuantity = (index, quantity) => {
    if (quantity <= 0) {
      removeFromCart(index);
    } else {
      setCart(cart.map((item, i) => 
        i === index ? { ...item, quantity } : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemQuantity = (item) => {
    const existingItem = cart.find(cartItem => 
      cartItem._id === item._id && cartItem.portion === item.portion
    );
    return existingItem ? existingItem.quantity : 0;
  };

  const handlePlaceOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      showNotification('Error', 'Please fill in customer name and phone number', 'error');
      return;
    }

    if (cart.length === 0) {
      showNotification('Error', 'Please add items to cart', 'error');
      return;
    }

    try {
      const orderData = {
        customerName: customerInfo.name.trim(),
        customerPhone: customerInfo.phone.trim(),
        mealTime: customerInfo.mealTime,
        specialInstructions: customerInfo.specialInstructions.trim(),
        items: cart.map(item => ({
          menuItemId: item._id,
          qty: item.quantity
        })),
        createdBy: 'admin',
        pricingTier: orderType === 'inhouse' ? 'inhouse' : 'standard',
        orderType: 'NOW'
      };

      const response = await ordersAPI.createAdmin(orderData);
      const createdOrder = response?.data?.data;

      showNotification('Success', 'Order placed successfully!', 'success');
      setCart([]);
      setCustomerInfo({
        name: '',
        phone: '',
        mealTime: 'lunch',
        specialInstructions: ''
      });
      setViewMode('view');

      if (createdOrder) {
        printKot(createdOrder);
      }
    } catch (err) {
      console.error('Error placing order:', err);
      showNotification('Error', 'Failed to place order', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'confirmed':
        return 'status-confirmed';
      case 'preparing':
        return 'status-preparing';
      case 'ready':
        return 'status-ready';
      case 'completed':
        return 'status-completed';
      case 'paid':
        return 'status-paid';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
      case 'completed':
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading && viewMode === 'view') {
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
      {/* Top-right Notification */}
      <Notification
        isOpen={notification.isOpen}
        onClose={closeNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
      
      {/* Admin Header */}
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header and Mode Toggle */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Order Management
            </h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('view')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'view'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                View Orders
              </button>
              <button
                onClick={() => setViewMode('place')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'place'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <ShoppingCart className="w-4 h-4 inline mr-2" />
                Place Orders
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div 
              className={`card cursor-pointer transition-all ${
                orderType === 'customer' 
                  ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                  : 'hover:shadow-lg'
              }`}
              onClick={() => navigate('/admin/orders-customer')}
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${
                    orderType === 'customer' 
                      ? 'bg-orange-100 dark:bg-orange-800' 
                      : 'bg-blue-100 dark:bg-blue-800'
                  }`}>
                    <Users className={`w-8 h-8 ${
                      orderType === 'customer' 
                        ? 'text-orange-600 dark:text-orange-400' 
                        : 'text-blue-600 dark:text-blue-400'
                    }`} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Customer Orders
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Manage customer pickup and delivery orders
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div 
              className={`card cursor-pointer transition-all ${
                orderType === 'inhouse' 
                  ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                  : 'hover:shadow-lg'
              }`}
              onClick={() => navigate('/admin/orders-inhouse')}
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${
                    orderType === 'inhouse' 
                      ? 'bg-orange-100 dark:bg-orange-800' 
                      : 'bg-purple-100 dark:bg-purple-800'
                  }`}>
                    <Building className={`w-8 h-8 ${
                      orderType === 'inhouse' 
                        ? 'text-orange-600 dark:text-orange-400' 
                        : 'text-purple-600 dark:text-purple-400'
                    }`} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      In-House Orders
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Manage dine-in and staff orders
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Preparing</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.preparing}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Ready</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.ready}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="message error mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Conditional Content */}
        {viewMode === 'view' ? (
          /* View Orders Mode */
          <div className="card">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {orderType === 'customer' ? 'Customer Orders' : 'In-House Orders'}
            </h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No {orderType === 'customer' ? 'customer' : 'in-house'} orders found
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          #{order.orderNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {order.customerName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {order.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {order.items.length} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {formatPrice(order.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => printKot(order)}
                              className="btn-outline px-3 py-1 text-xs"
                            >
                              Print KOT
                            </button>
                            <button
                              onClick={() => printBill(order)}
                              className="btn-outline px-3 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!['ready', 'completed', 'paid'].includes(order.status)}
                            >
                              Print Bill
                            </button>
                            <button
                              onClick={() => {
                                const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'paid'];
                                const currentIndex = statusFlow.indexOf(order.status);
                                if (currentIndex !== -1 && currentIndex < statusFlow.length - 1) {
                                  updateOrderStatus(order._id, statusFlow[currentIndex + 1]);
                                }
                              }}
                              className="btn-primary px-3 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={['paid', 'cancelled'].includes(order.status)}
                            >
                              {order.status === 'pending' && 'Confirm'}
                              {order.status === 'confirmed' && 'Start Prep'}
                              {order.status === 'preparing' && 'Mark Ready'}
                              {order.status === 'ready' && 'Complete'}
                              {order.status === 'completed' && 'Mark Paid'}
                              {order.status === 'paid' && 'Paid'}
                              {order.status === 'cancelled' && 'Cancelled'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        ) : (
          /* Place Orders Mode */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Menu Section */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <ShoppingCart className="w-6 h-6 text-orange-500 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {orderType === 'customer' ? 'Customer Menu (Full Portions Only)' : 'In-House Menu (Half & Full Portions)'}
                    </h2>
                  </div>

                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search menu items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                      />
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Menu Items Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {menuItems
                      .filter(item => {
                        const matchesSearch = (searchTerm === '') || (item.name?.toLowerCase().includes(searchTerm.toLowerCase()));
                        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
                        return matchesSearch && matchesCategory;
                      })
                      .sort((a, b) => {
                        const aInStock = (a.isAvailable ?? true) && a.stock > 0;
                        const bInStock = (b.isAvailable ?? true) && b.stock > 0;

                        if (aInStock !== bInStock) {
                          return aInStock ? -1 : 1;
                        }

                        if (aInStock && bInStock && a.category !== b.category) {
                          return (a.category || '').localeCompare(b.category || '');
                        }

                        return (a.name || '').localeCompare(b.name || '');
                      })
                      .map((item) => {
                        const inStock = (item.isAvailable ?? true) && item.stock > 0;
                        const displayPrice = orderType === 'inhouse' && item.inHousePrice ? item.inHousePrice : item.price;

                        return (
                          <div key={item._id} className="card p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                                {orderType === 'inhouse' && item.portion && (
                                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                    {item.portion} Portion
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="text-lg font-bold text-gray-900 dark:text-white block">
                                  {formatPrice(displayPrice)}
                                </span>
                                <span
                                  className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    inStock
                                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                  }`}
                                >
                                  {inStock ? `${item.stock} in stock` : 'Out of stock'}
                                </span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => addToCart(item)}
                              className={`w-full btn-primary text-sm py-2 ${!inStock ? 'opacity-60 cursor-not-allowed' : ''}`}
                              disabled={!inStock}
                            >
                              {getItemQuantity(item) > 0 && inStock
                                ? `+ Add (${getItemQuantity(item)})`
                                : inStock
                                  ? '+ Add'
                                  : 'Unavailable'}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info and Cart */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="card">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Users className="w-6 h-6 text-blue-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {orderType === 'customer' ? 'Customer Information' : 'In-House User Information'}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {orderType === 'customer' ? 'Customer Name' : 'User Name'} *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        placeholder={`Enter ${orderType === 'customer' ? 'customer' : 'user'} name`}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        placeholder="Enter phone number"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Meal Time
                      </label>
                      <select
                        value={customerInfo.mealTime}
                        onChange={(e) => setCustomerInfo({...customerInfo, mealTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Special Instructions
                      </label>
                      <textarea
                        value={customerInfo.specialInstructions}
                        onChange={(e) => setCustomerInfo({...customerInfo, specialInstructions: e.target.value})}
                        placeholder="Any special instructions..."
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Cart */}
              <div className="card">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <ShoppingCart className="w-6 h-6 text-green-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Order Cart ({orderType === 'customer' ? 'Customer Pricing' : 'In-House Pricing'})
                    </h3>
                  </div>

                  {cart.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No items in cart</p>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {item.name} {item.portion && item.portion !== 'Regular' ? `(${item.portion})` : ''}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatPrice(item.price)} x {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateCartQuantity(index, item.quantity - 1)}
                              className="w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(index, item.quantity + 1)}
                              className="w-6 h-6 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatPrice(getCartTotal())}
                          </span>
                        </div>
                        <button
                          onClick={handlePlaceOrder}
                          className="w-full btn-primary py-3"
                        >
                          Place Order
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
