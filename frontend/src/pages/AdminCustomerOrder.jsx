import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingCart, User, Search, Users } from 'lucide-react';
import { STORAGE_KEYS } from '../config/constants';
import axios from 'axios';
import { formatPrice } from '../utils/currencyFormatter';
import useStore from '../store/useStore';
import { ledgerAPI, userAPI } from '../services/api';
import { printKot } from '../utils/printUtils';

const AdminCustomerOrder = () => {
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
    specialInstructions: '',
    parcelCharge: ''
  });
  
  // Menu and cart state
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [customerLedger, setCustomerLedger] = useState(null);
  const [customerLedgerLoading, setCustomerLedgerLoading] = useState(false);
  const [customerLedgerError, setCustomerLedgerError] = useState('');
  const [ledgerRequestKey, setLedgerRequestKey] = useState(0);
  const [settlementNote, setSettlementNote] = useState('');
  const [settlementMethod, setSettlementMethod] = useState('cash');
  const [settlementLoading, setSettlementLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const lastCustomerSettlement = customerLedger?.settlements?.length
    ? customerLedger.settlements[customerLedger.settlements.length - 1]
    : null;

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
    fetchCustomers();
  }, []);

  useEffect(() => {
    const phone = formData.customerPhone.trim();
    if (!phone || phone.length < 4) {
      setCustomerLedger(null);
      setCustomerLedgerError('');
      setCustomerLedgerLoading(false);
      return;
    }

    let isCancelled = false;
    setCustomerLedgerLoading(true);
    setCustomerLedgerError('');

    const timeoutId = setTimeout(async () => {
      try {
        const response = await ledgerAPI.getCustomerLedgerByPhone(phone);
        if (isCancelled) return;

        const ledgers = response?.data?.data || [];
        const openLedger = ledgers.find((entry) => entry.status === 'open') || ledgers[0] || null;
        setCustomerLedger(openLedger || null);
      } catch (err) {
        if (isCancelled) return;
        console.error('Error fetching customer ledger:', err);
        setCustomerLedger(null);
        setCustomerLedgerError(err.response?.data?.message || 'Unable to fetch outstanding balance');
      } finally {
        if (!isCancelled) {
          setCustomerLedgerLoading(false);
        }
      }
    }, 400);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [formData.customerPhone, ledgerRequestKey]);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('/api/menu/customer', {
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

  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);
      const response = await userAPI.getByRole('customer');
      
      // Handle different possible response structures
      let customersList = [];
      if (response?.data?.data) {
        customersList = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (response?.data && Array.isArray(response.data)) {
        customersList = response.data;
      } else if (Array.isArray(response)) {
        customersList = response;
      }
      
      // Ensure customers have required fields
      const validCustomers = customersList.filter(cust => cust && (cust._id || cust.id) && cust.name);
      setCustomers(validCustomers);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  };

  const handleCustomerSelect = (customerId) => {
    if (customerId === '') {
      // Clear selection
      setSelectedCustomerId('');
      setFormData(prev => ({
        ...prev,
        customerName: '',
        customerPhone: ''
      }));
    } else {
      // Find the selected customer
      const selectedCustomer = customers.find(cust => (cust._id || cust.id) === customerId);
      if (selectedCustomer) {
        setSelectedCustomerId(customerId);
        setFormData(prev => ({
          ...prev,
          customerName: selectedCustomer.name || '',
          customerPhone: selectedCustomer.phone || ''
        }));
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      // Update cart total when parcel charge changes
      if (name === 'parcelCharge') {
        const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const parcelCharge = parseFloat(value) || 0;
        setCartTotal(cartSubtotal + parcelCharge);
      }
      return updated;
    });
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
    const cartSubtotal = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity); // Use customer pricing
    }, 0);
    const parcelCharge = parseFloat(formData.parcelCharge) || 0;
    setCartTotal(cartSubtotal + parcelCharge);
  };

  const refreshCustomerLedger = () => {
    setLedgerRequestKey(prev => prev + 1);
  };

  const handleCustomerLedgerSettlement = async () => {
    if (!customerLedger || customerLedger.balance <= 0) {
      return;
    }

    try {
      setSettlementLoading(true);
      setCustomerLedgerError('');

      await ledgerAPI.settleCustomerLedger(customerLedger._id, {
        note: settlementNote.trim() || undefined,
        paymentMethod: settlementMethod || undefined
      });

      setSettlementNote('');
      setSettlementMethod('cash');
      refreshCustomerLedger();
      setSuccess('Customer balance settled successfully.');
    } catch (err) {
      console.error('Customer ledger settlement error:', err);
      setCustomerLedgerError(err.response?.data?.message || 'Failed to settle balance');
    } finally {
      setSettlementLoading(false);
    }
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
      // Validate form data - customer name and phone are optional
      if (cart.length === 0) {
        setError('Please add at least one item to the order.');
        return;
      }

      const orderData = {
        customerName: formData.customerName.trim() || undefined,
        customerPhone: formData.customerPhone.trim() || undefined,
        items: cart.map(item => ({
          menuItemId: item._id,
          qty: item.quantity
        })),
        mealTime: formData.mealTime,
        specialInstructions: formData.specialInstructions.trim(),
        parcelCharge: formData.parcelCharge ? parseFloat(formData.parcelCharge) : 0,
        createdBy: 'admin',
        pricingTier: 'customer' // Customer pricing
      };

      const response = await axios.post('/api/orders', orderData);
      const createdOrder = response?.data?.data;
      
      setSuccess(`Customer order placed successfully! Order #${createdOrder.orderNumber}`);
      clearCart();
      setFormData({
        customerName: '',
        customerPhone: '',
        mealTime: 'lunch',
        specialInstructions: '',
        parcelCharge: ''
      });

      // Print KOT automatically
      if (createdOrder) {
        printKot(createdOrder);
      }

      refreshCustomerLedger();
      
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

  const filteredItems = menuItems
    .filter(item => {
      const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      const aInStock = (a.isAvailable ?? true) && a.stock > 0;
      const bInStock = (b.isAvailable ?? true) && b.stock > 0;

      if (aInStock !== bInStock) {
        return aInStock ? -1 : 1;
      }

      if (aInStock && bInStock && a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }

      return a.name.localeCompare(b.name);
    });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Customer Order
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Place orders for customers with customer pricing
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/admin/dashboard" className="btn-outline">
                Dashboard
              </Link>
              <Link to="/admin/menu-customer" className="btn-outline">
                Customer Menu
              </Link>
              <button onClick={logout} className="btn-outline">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2 text-blue-500" />
                  Customer Menu (Full Portions Only)
                </h2>

                {/* Search and Filter */}
                <div className="mb-6 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="input-with-icon w-full pl-10"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCategoryChange('All Categories')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === 'All Categories'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryChange(category)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedCategory === category
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Menu Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredItems.map((item) => {
                    const inStock = (item.isAvailable ?? true) && item.stock > 0;

                    return (
                      <div
                        key={item._id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </h3>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400 block">
                              {formatPrice(item.price)}
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
                        
                        {item.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            {item.description}
                          </p>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {item.category}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            className={`btn-primary text-sm px-3 py-1 flex items-center ${
                              !inStock ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                            disabled={!inStock}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            {inStock ? 'Add' : 'Unavailable'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Order Form and Cart */}
          <div className="space-y-6">
            {/* Customer Information Form */}
            <div className="card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <User className="w-4 h-4 mr-2 text-blue-500" />
                  Customer Information
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Customer Name
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => handleCustomerSelect(e.target.value)}
                      className="input w-full"
                      disabled={customersLoading}
                    >
                      <option value="">
                        {customersLoading 
                          ? 'Loading customers...' 
                          : customers.length === 0 
                            ? 'No customers available' 
                            : 'Select a customer or enter manually'}
                      </option>
                      {customers.map((customer) => {
                        const customerId = customer._id || customer.id;
                        const customerName = customer.name || 'Unknown';
                        const customerPhone = customer.phone || 'No phone';
                        return (
                          <option key={customerId} value={customerId}>
                            {customerName} ({customerPhone})
                          </option>
                        );
                      })}
                    </select>
                    {customersLoading && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Loading customers...
                      </p>
                    )}
                    {!customersLoading && customers.length === 0 && (
                      <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                        No customers available. Customers will appear here once they are registered. Click "Refresh" to reload.
                      </p>
                    )}
                    {/* Allow manual entry as well */}
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={(e) => {
                        setSelectedCustomerId('');
                        handleInputChange(e);
                      }}
                      className="input w-full mt-2"
                      placeholder="Or enter name manually"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      className="input w-full"
                      placeholder="Enter phone number"
                    />
                  </div>

                {formData.customerPhone.trim() !== '' && (
                  <div className="mt-4">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Customer Balance
                          </p>
                          <p className="text-2xl font-semibold text-blue-900 dark:text-blue-100">
                            {customerLedger ? formatPrice(customerLedger.balance || 0) : '—'}
                          </p>
                          {customerLedger?.status === 'settled' && customerLedger.balance === 0 && (
                            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                              Balance settled
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={refreshCustomerLedger}
                          className="btn-outline text-sm"
                          disabled={customerLedgerLoading}
                        >
                          Refresh
                        </button>
                      </div>

                      {customerLedgerLoading && (
                        <div className="mt-4 flex items-center text-sm text-blue-800 dark:text-blue-200">
                          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600 mr-2" />
                          Loading ledger details...
                        </div>
                      )}

                      {!customerLedgerLoading && customerLedgerError && (
                        <p className="mt-3 text-sm text-red-700 dark:text-red-300">
                          {customerLedgerError}
                        </p>
                      )}

                      {!customerLedgerLoading && !customerLedgerError && !customerLedger && (
                        <p className="mt-3 text-sm text-blue-800 dark:text-blue-200">
                          No outstanding balance for this phone number.
                        </p>
                      )}

                      {!customerLedgerLoading && customerLedger && (
                        <div className="mt-4 space-y-3 text-sm text-blue-900 dark:text-blue-100">
                          <div className="flex justify-between">
                            <span>Total Orders</span>
                            <span>{formatPrice(customerLedger.totalOrdersAmount || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Payments</span>
                            <span>{formatPrice(customerLedger.totalPaymentsAmount || 0)}</span>
                          </div>
                          {lastCustomerSettlement && (
                            <div className="text-xs text-blue-700 dark:text-blue-200">
                              Last settlement: {new Date(lastCustomerSettlement.recordedAt).toLocaleString()} ({formatPrice(lastCustomerSettlement.amount)})
                            </div>
                          )}

                          {customerLedger.balance > 0 ? (
                            <div className="grid gap-3 md:grid-cols-3">
                              <div className="md:col-span-1">
                                <label className="block text-xs font-medium mb-1">
                                  Payment Method
                                </label>
                                <select
                                  value={settlementMethod}
                                  onChange={(e) => setSettlementMethod(e.target.value)}
                                  className="input text-sm"
                                >
                                  <option value="cash">Cash</option>
                                  <option value="upi">UPI</option>
                                  <option value="card">Card</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium mb-1">
                                  Payment Note (optional)
                                </label>
                                <textarea
                                  value={settlementNote}
                                  onChange={(e) => setSettlementNote(e.target.value)}
                                  rows={2}
                                  className="input w-full text-sm"
                                  placeholder="Add details about this payment"
                                />
                              </div>
                              <div className="md:col-span-3 flex justify-end">
                                <button
                                  type="button"
                                  onClick={handleCustomerLedgerSettlement}
                                  className="btn-primary text-sm"
                                  disabled={settlementLoading}
                                >
                                  {settlementLoading ? 'Recording...' : `Mark Paid (${formatPrice(customerLedger.balance)})`}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-green-700 dark:text-green-300">
                              No outstanding balance remaining.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Meal Time
                    </label>
                    <select
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Special Instructions
                    </label>
                    <textarea
                      name="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={handleInputChange}
                      rows={3}
                      className="input w-full"
                      placeholder="Any special instructions..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Parcel Charge
                    </label>
                    <input
                      type="number"
                      name="parcelCharge"
                      value={formData.parcelCharge}
                      onChange={handleInputChange}
                      className="input w-full"
                      placeholder="Enter parcel charge"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </form>
              </div>
            </div>

            {/* Cart */}
            <div className="card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <ShoppingCart className="w-4 h-4 mr-2 text-blue-500" />
                  Order Cart
                </h3>

                {cart.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No items in cart
                  </p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="btn-outline text-sm px-2 py-1"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="btn-outline text-sm px-2 py-1"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          Total:
                        </span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {formatPrice(cartTotal)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={clearCart}
                          className="btn-outline w-full"
                        >
                          Clear Cart
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={loading || cart.length === 0}
                          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Placing Order...' : 'Print KOT'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomerOrder;
