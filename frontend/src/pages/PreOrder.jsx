import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, ShoppingCart, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import useStore from '../store/useStore';
import { ordersAPI } from '../services/api';
import { formatPrice } from '../utils/currencyFormatter';

const PreOrder = () => {
  console.log('PreOrder component rendered'); // Debug log
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customer, setCustomer] = useState(null);
  
  // Pre-order form data
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    preOrderDate: '',
    preOrderTime: '',
    specialInstructions: ''
  });

  useEffect(() => {
    // Check if customer is logged in
    const customerData = localStorage.getItem('customerData');
    if (customerData) {
      const customerInfo = JSON.parse(customerData);
      setCustomer(customerInfo);
      setFormData(prev => ({
        ...prev,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form data
      if (!formData.customerName.trim() || !formData.customerPhone.trim()) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }

      if (!formData.preOrderDate || !formData.preOrderTime) {
        setError('Please select pre-order date and time.');
        setLoading(false);
        return;
      }

      // Combine date and time
      const preOrderDateTime = new Date(`${formData.preOrderDate}T${formData.preOrderTime}`);
      
      // Check if selected time is in the future
      if (preOrderDateTime <= new Date()) {
        setError('Pre-order date and time must be in the future.');
        setLoading(false);
        return;
      }

      // Check if pre-order is within 3 days (backend validation)
      const now = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      if (preOrderDateTime > threeDaysFromNow) {
        setError('Pre-orders can only be placed up to 3 days in advance.');
        setLoading(false);
        return;
      }

      const orderData = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        customerId: customer?._id,
        items: cart.map(item => ({
          menuItemId: item._id,
          qty: item.quantity
        })),
        mealTime: 'pre-order', // Special meal time for pre-orders
        specialInstructions: formData.specialInstructions.trim(),
        orderType: 'PREORDER',
        scheduledFor: preOrderDateTime.toISOString(),
        // Legacy fields for backward compatibility
        isPreOrder: true,
        preOrderDateTime: preOrderDateTime.toISOString(),
        createdBy: customer?.role === 'employee' ? 'admin' : 'customer',
        pricingTier: customer?.role === 'employee' ? 'inhouse' : 'standard'
      };

      console.log('Submitting pre-order:', orderData); // Debug log

      const response = await ordersAPI.create(orderData);
      
      console.log('Pre-order response:', response); // Debug log
      
      // Auto-login customer after successful pre-order
      if (!customer) {
        const customerData = response.data.data.customerData || {
          name: formData.customerName.trim(),
          phone: formData.customerPhone.trim(),
          _id: response.data.data.customerId || null
        };
        
        // Store customer data in localStorage
        localStorage.setItem('customerData', JSON.stringify(customerData));
        
        // If there's a customer token in the response, store it
        if (response.data.data.customerToken) {
          localStorage.setItem('customerToken', response.data.data.customerToken);
        }
        
        // Update customer state
        setCustomer(customerData);
        
        // Trigger a storage event to update Navbar
        window.dispatchEvent(new Event('storage'));
      }
      
      // Clear cart after successful order
      clearCart();
      
      // Redirect to order confirmation
      navigate(`/order/${response.data.data._id}`);
    } catch (err) {
      console.error('Pre-order error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to place pre-order. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30); // Allow pre-orders up to 30 days in advance
    return maxDate.toISOString().split('T')[0];
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Schedule Your Order
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Choose when you'd like your order to be ready
            </p>
          </div>

          <div className="card">
            <div className="p-6">
              <div className="text-center py-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-12 h-12 text-orange-500" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  No Items in Cart
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  You need to add items to your cart before scheduling a pre-order. 
                  Let's browse our pre-order menu and add some delicious items!
                </p>
                
                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/pre-order-menu')}
                    className="btn-primary inline-flex items-center"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Browse Pre-Order Menu
                  </button>
                  
                  <button
                    onClick={() => navigate('/cart')}
                    className="btn-outline inline-flex items-center ml-4"
                  >
                    View Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Schedule Your Order
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Choose when you'd like your order to be ready
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pre-order Form */}
          <div className="card">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                Pre-Order Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Name */}
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    className="input w-full"
                    placeholder="Enter your full name"
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
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Pre-order Date */}
                <div>
                  <label htmlFor="preOrderDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pickup Date *
                  </label>
                  <input
                    type="date"
                    id="preOrderDate"
                    name="preOrderDate"
                    value={formData.preOrderDate}
                    onChange={handleInputChange}
                    min={getMinDate()}
                    max={getMaxDate()}
                    required
                    className="input w-full"
                  />
                </div>

                {/* Pre-order Time */}
                <div>
                  <label htmlFor="preOrderTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pickup Time *
                  </label>
                  <input
                    type="time"
                    id="preOrderTime"
                    name="preOrderTime"
                    value={formData.preOrderTime}
                    onChange={handleInputChange}
                    min="08:00"
                    max="22:00"
                    required
                    className="input w-full"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Available hours: 8:00 AM - 10:00 PM
                  </p>
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
                    placeholder="Any special requests or dietary requirements..."
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Scheduling Order...' : 'Schedule Pre-Order'}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="card">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-orange-500" />
                Order Summary
              </h2>

              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item._id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                </div>

                {/* Scheduled Pickup Information */}
                {formData.preOrderDate && formData.preOrderTime && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h3 className="font-medium text-green-900 dark:text-green-100 mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Scheduled Pickup
                    </h3>
                    <div className="text-sm text-green-800 dark:text-green-200">
                      <p><strong>Date:</strong> {new Date(formData.preOrderDate).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {formData.preOrderTime}</p>
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Pre-Order Information</h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Orders will be prepared 15 minutes before pickup time</li>
                    <li>• Please arrive on time to ensure food quality</li>
                    <li>• Contact us if you need to modify your pickup time</li>
                    <li>• Cancellations accepted up to 2 hours before pickup</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreOrder;
