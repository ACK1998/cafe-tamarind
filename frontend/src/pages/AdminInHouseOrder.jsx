import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingCart, User, Search, Home } from 'lucide-react';
import { STORAGE_KEYS } from '../config/constants';
import axios from 'axios';
import { formatPrice } from '../utils/currencyFormatter';
import useStore from '../store/useStore';
import { ledgerAPI } from '../services/api';

const AdminInHouseOrder = () => {
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
  const [employeeLedger, setEmployeeLedger] = useState(null);
  const [employeeLedgerLoading, setEmployeeLedgerLoading] = useState(false);
  const [employeeLedgerError, setEmployeeLedgerError] = useState('');
  const [employeeLedgerRequestKey, setEmployeeLedgerRequestKey] = useState(0);
  const [settlementAmount, setSettlementAmount] = useState('');
  const [employeeSettlementNote, setEmployeeSettlementNote] = useState('');
  const [employeeSettlementMethod, setEmployeeSettlementMethod] = useState('cash');
  const [employeeSettlementLoading, setEmployeeSettlementLoading] = useState(false);
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const lastEmployeeSettlement = employeeLedger?.settlements?.length
    ? employeeLedger.settlements[employeeLedger.settlements.length - 1]
    : null;
  const getLedgerPeriodLabel = (ledger) => {
    if (!ledger?.periodYear || !ledger?.periodMonth) return '';
    const periodDate = new Date(ledger.periodYear, ledger.periodMonth - 1);
    return periodDate.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  };

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  useEffect(() => {
    const phone = formData.customerPhone.trim();
    if (!phone || phone.length < 4) {
      setEmployeeLedger(null);
      setEmployeeLedgerError('');
      setSettlementAmount('');
      return;
    }

    let isCancelled = false;
    setEmployeeLedgerLoading(true);
    setEmployeeLedgerError('');

    const timeoutId = setTimeout(async () => {
      try {
        const response = await ledgerAPI.lookupEmployeeLedger({
          phone,
          month: currentMonth,
          year: currentYear
        });

        if (isCancelled) {
          return;
        }

        const ledgers = response?.data?.data || [];
        const currentLedger = ledgers.find(
          (entry) => entry.periodMonth === currentMonth && entry.periodYear === currentYear
        ) || ledgers[0] || null;

        setEmployeeLedger(currentLedger || null);
      } catch (err) {
        if (isCancelled) {
          return;
        }

        console.error('Error fetching employee ledger:', err);
        setEmployeeLedger(null);
        setEmployeeLedgerError(err.response?.data?.message || 'Unable to fetch employee credit balance');
      } finally {
        if (!isCancelled) {
          setEmployeeLedgerLoading(false);
        }
      }
    }, 400);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [formData.customerPhone, employeeLedgerRequestKey, currentMonth, currentYear]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      setError('Authentication required. Please log in again.');
      logout();
      return null;
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError('');
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await axios.get('/api/menu/inhouse', { headers });
      setMenuItems(response.data.data);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load menu items';
      setError(errorMessage);
      
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await axios.get('/api/menu/categories', { headers });
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
      // Use in-house pricing (inHousePrice if available, otherwise price)
      const unitPrice = item.inHousePrice != null ? item.inHousePrice : item.price;
      return sum + (unitPrice * item.quantity);
    }, 0);
    setCartTotal(total);
  };

  const refreshEmployeeLedger = () => {
    setEmployeeLedgerRequestKey(prev => prev + 1);
  };

  const handleEmployeeSettlement = async () => {
    if (!employeeLedger || employeeLedger.balance <= 0) {
      return;
    }

    const parsedAmount = Number(settlementAmount);

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setEmployeeLedgerError('Enter a valid settlement amount greater than zero.');
      return;
    }

    if (parsedAmount > employeeLedger.balance) {
      setEmployeeLedgerError('Settlement amount cannot exceed outstanding balance.');
      return;
    }

    try {
      setEmployeeSettlementLoading(true);
      setEmployeeLedgerError('');

      await ledgerAPI.recordEmployeeSettlement(employeeLedger._id, {
        amount: parsedAmount,
        note: employeeSettlementNote.trim() || undefined,
        paymentMethod: employeeSettlementMethod || undefined
      });

      setEmployeeSettlementNote('');
      setSettlementAmount('');
      setEmployeeSettlementMethod('cash');
      refreshEmployeeLedger();
      setSuccess('Employee settlement recorded successfully.');
    } catch (err) {
      console.error('Employee ledger settlement error:', err);
      setEmployeeLedgerError(err.response?.data?.message || 'Failed to record settlement');
    } finally {
      setEmployeeSettlementLoading(false);
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
        pricingTier: 'inhouse' // In-house pricing
      };

      const response = await axios.post('/api/orders', orderData);
      
      setSuccess(`In-house order placed successfully! Order #${response.data.data.orderNumber}`);
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

      refreshEmployeeLedger();
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
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getItemPrice = (item) => {
    return item.inHousePrice != null ? item.inHousePrice : item.price;
  };

  const getPriceDisplay = (item) => {
    const inHousePrice = getItemPrice(item);
    if (item.inHousePrice != null && item.inHousePrice !== item.price) {
      return (
        <div className="text-right">
          <span className="text-lg font-bold text-green-600 dark:text-green-400">
            {formatPrice(inHousePrice)}
          </span>
          <div className="text-xs text-gray-500 line-through">
            {formatPrice(item.price)}
          </div>
        </div>
      );
    }
    return (
      <span className="text-lg font-bold text-green-600 dark:text-green-400">
        {formatPrice(inHousePrice)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  In-House Order
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Place orders for in-house users with in-house pricing
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
            <div className="flex items-center justify-between">
              <p className="text-red-800">{error}</p>
              <button 
                onClick={fetchMenuItems}
                className="btn-primary text-sm"
              >
                Retry
              </button>
            </div>
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
                  <ShoppingCart className="w-5 h-5 mr-2 text-green-500" />
                  In-House Menu (Half & Full Portions)
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
                          ? 'bg-green-500 text-white'
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
                            ? 'bg-green-500 text-white'
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
                  {loading ? (
                    <div className="col-span-2 text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600 dark:text-gray-300">Loading menu items...</p>
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-gray-600 dark:text-gray-300">
                        {error ? 'Failed to load menu items' : 'No menu items found'}
                      </p>
                      {error && (
                        <button 
                          onClick={fetchMenuItems}
                          className="mt-2 btn-primary text-sm"
                        >
                          Try Again
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredItems.map((item) => (
                      <div
                        key={item._id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </h3>
                          {getPriceDisplay(item)}
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
                            className="btn-primary text-sm px-3 py-1"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </button>
                        </div>
                      </div>
                    ))
                  )}
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
                  <User className="w-4 h-4 mr-2 text-green-500" />
                  In-House User Information
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      User Name *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                      className="input w-full"
                      placeholder="Enter user name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      required
                      className="input w-full"
                      placeholder="Enter phone number"
                    />
                  </div>

              {formData.customerPhone.trim() !== '' && (
                <div className="mt-4">
                  <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          Employee Credit Balance
                        </p>
                        <p className="text-2xl font-semibold text-green-900 dark:text-green-100">
                          {employeeLedger ? formatPrice(employeeLedger.balance || 0) : '—'}
                        </p>
                        {employeeLedger && (
                          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                            {getLedgerPeriodLabel(employeeLedger) || 'Current cycle'}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={refreshEmployeeLedger}
                        className="btn-outline text-sm"
                        disabled={employeeLedgerLoading}
                      >
                        Refresh
                      </button>
                    </div>

                    {employeeLedgerLoading && (
                      <div className="mt-4 flex items-center text-sm text-green-800 dark:text-green-200">
                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-green-600 mr-2" />
                        Loading ledger details...
                      </div>
                    )}

                    {!employeeLedgerLoading && employeeLedgerError && (
                      <p className="mt-3 text-sm text-red-700 dark:text-red-300">
                        {employeeLedgerError}
                      </p>
                    )}

                    {!employeeLedgerLoading && !employeeLedgerError && !employeeLedger && (
                      <p className="mt-3 text-sm text-green-800 dark:text-green-200">
                        No credit balance recorded for this employee yet.
                      </p>
                    )}

                    {!employeeLedgerLoading && employeeLedger && (
                      <div className="mt-4 space-y-3 text-sm text-green-900 dark:text-green-100">
                        <div className="flex justify-between">
                          <span>Total Orders</span>
                          <span>{formatPrice(employeeLedger.totalOrdersAmount || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Payments</span>
                          <span>{formatPrice(employeeLedger.totalPaymentsAmount || 0)}</span>
                        </div>
                        {lastEmployeeSettlement && (
                          <div className="text-xs text-green-700 dark:text-green-300">
                            Last settlement: {new Date(lastEmployeeSettlement.recordedAt).toLocaleString()} ({formatPrice(lastEmployeeSettlement.amount)} - {lastEmployeeSettlement.type})
                          </div>
                        )}

                        {employeeLedger.settlements && employeeLedger.settlements.length > 0 && (
                          <div className="max-h-28 overflow-y-auto border border-green-200 dark:border-green-700 rounded-md p-2 text-xs">
                            {employeeLedger.settlements
                              .slice()
                              .reverse()
                              .map((settlement, index) => (
                                <div key={index} className="flex justify-between py-1">
                                  <span>
                                    {new Date(settlement.recordedAt).toLocaleDateString()} ({settlement.type})
                                  </span>
                                  <span>{formatPrice(settlement.amount)}</span>
                                </div>
                              ))}
                          </div>
                        )}

                        {employeeLedger.balance > 0 ? (
                          <div className="grid gap-3 md:grid-cols-3">
                            <div>
                              <label className="block text-xs font-medium mb-1">
                                Settlement Amount
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={settlementAmount}
                                onChange={(e) => setSettlementAmount(e.target.value)}
                                className="input text-sm"
                                placeholder="Enter amount"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">
                                Payment Method
                              </label>
                              <select
                                value={employeeSettlementMethod}
                                onChange={(e) => setEmployeeSettlementMethod(e.target.value)}
                                className="input text-sm"
                              >
                                <option value="cash">Cash</option>
                                <option value="salary">Salary Adjustment</option>
                                <option value="upi">UPI</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div className="md:col-span-3">
                              <label className="block text-xs font-medium mb-1">
                                Payment Note (optional)
                              </label>
                              <textarea
                                value={employeeSettlementNote}
                                onChange={(e) => setEmployeeSettlementNote(e.target.value)}
                                rows={2}
                                className="input w-full text-sm"
                                placeholder="Add details about this settlement"
                              />
                            </div>
                            <div className="md:col-span-3 flex justify-end">
                              <button
                                type="button"
                                onClick={handleEmployeeSettlement}
                                className="btn-primary text-sm"
                                disabled={employeeSettlementLoading}
                              >
                                {employeeSettlementLoading ? 'Recording...' : 'Record Settlement'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-green-700 dark:text-green-300">
                            No outstanding balance remaining for this period.
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
                </form>
              </div>
            </div>

            {/* Cart */}
            <div className="card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <ShoppingCart className="w-4 h-4 mr-2 text-green-500" />
                  Order Cart (In-House Pricing)
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
                            {formatPrice(getItemPrice(item))} × {item.quantity}
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
                        <span className="text-xl font-bold text-green-600 dark:text-green-400">
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
                          {loading ? 'Placing Order...' : 'Place In-House Order'}
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

export default AdminInHouseOrder;
