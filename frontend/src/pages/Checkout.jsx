import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, User, Phone, Shield, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import OTPVerification from '../components/OTPVerification';
import useStore from '../store/useStore';
import { useApp } from '../context/AppContext';
import { authAPI, ordersAPI } from '../services/api';
import { FEATURE_CONFIG } from '../config/constants';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useStore();
  const { mealTime } = useApp();
  const [customer, setCustomer] = useState(null);

  // Check if user is employee
  const isEmployee = () => {
    try {
      const customerData = localStorage.getItem('customerData');
      if (customerData) {
        const user = JSON.parse(customerData);
        return user.role === 'employee';
      }
    } catch (e) {
      console.error('Error parsing customer data:', e);
    }
    return false;
  };
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    mealTime: mealTime || 'breakfast',
    specialInstructions: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showOTP, setShowOTP] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);

  useEffect(() => {
    // Check if customer is logged in
    const customerData = localStorage.getItem('customerData');
    if (customerData) 
      {
      const customerInfo = JSON.parse(customerData);
      setCustomer(customerInfo);
      setFormData(prev => ({
        ...prev,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone
      }));
    }
  }, []);

  if (cart.length === 0) {
    navigate('/');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerName.trim() || !formData.customerPhone.trim()) {
      setError('Name and phone number are required');
      return;
    }

    setError('');

    // Check if OTP is disabled in configuration
    if (!FEATURE_CONFIG.OTP_ENABLED) {
      // Skip OTP verification and place order directly
      await placeOrder();
      return;
    }

    // Generate OTP
    try {
      setLoading(true);
      const response = await authAPI.generateOTP(formData.customerPhone);
      
      // Check if OTP is disabled on backend
      if (response.data.data?.otpDisabled) {
        await placeOrder();
        return;
      }
      
      setShowOTP(true);
      setError('');
    } catch (err) {
      console.error('OTP generation error:', err);
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (otp) => {
    setOtpLoading(true);
    setOtpError('');
    setOtpSuccess(false);

    try {
      console.log('🔍 Verifying OTP:', otp, 'for phone:', formData.customerPhone);
      
      // Verify OTP with backend
      const verifyResponse = await authAPI.verifyOTP(formData.customerPhone, otp);
      console.log('✅ OTP verification response:', verifyResponse);
      
      // Show success message
      console.log('✅ OTP verified successfully!');
      setOtpSuccess(true);
      setOtpError(''); // Clear any previous errors
      
      // Wait a moment to show success message
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // If OTP is verified, place the order
      console.log('📦 Proceeding to place order...');
      await placeOrder();
    } catch (err) {
      console.error('❌ OTP verification error:', err);
      console.error('❌ Error response:', err.response?.data);
      
      let errorMessage = err.response?.data?.message || 'OTP verification failed. Please try again.';
      
      // Provide more helpful error messages
      if (errorMessage.includes('Invalid OTP')) {
        errorMessage = 'The OTP you entered is incorrect. Please check the code and try again.';
      } else if (errorMessage.includes('expired')) {
        errorMessage = 'The OTP has expired. Please request a new code.';
      } else if (errorMessage.includes('attempts')) {
        errorMessage = 'Too many failed attempts. Please request a new OTP.';
      }
      
      setOtpError(errorMessage);
      setOtpSuccess(false);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOTPResend = async () => {
    try {
      await authAPI.generateOTP(formData.customerPhone);
      // Success message could be shown here
    } catch (err) {
      console.error('Resend failed:', err);
      throw err;
    }
  };

  const placeOrder = async () => {
    setLoading(true);
    setError('');

    try {
      // Check if cart has items
      if (!cart || cart.length === 0) {
        throw new Error('Cart is empty. Please add items before placing order.');
      }

      // Validate cart items
      const validCartItems = cart.filter(item => item._id && item.quantity > 0);
      if (validCartItems.length === 0) {
        throw new Error('No valid items in cart. Please add items before placing order.');
      }

      console.log('🛒 Valid cart items:', validCartItems);
      console.log('🍽️ Meal time from form:', formData.mealTime);

      // Validate meal time
      const validMealTimes = ['breakfast', 'lunch', 'dinner', 'pre-order'];
      const finalMealTime = formData.mealTime && validMealTimes.includes(formData.mealTime) ? formData.mealTime : 'breakfast';
      console.log('🍽️ Final meal time:', finalMealTime);

      const orderData = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        customerId: customer?._id, // Include customer ID if logged in
        items: validCartItems.map(item => ({
          menuItemId: item._id,
          qty: item.quantity
        })),
        mealTime: finalMealTime,
        specialInstructions: formData.specialInstructions.trim() || '',
        orderType: 'NOW',
        createdBy: customer?.role === 'employee' ? 'admin' : 'customer',
        pricingTier: customer?.role === 'employee' ? 'inhouse' : 'standard'
      };

      console.log('📦 Order data:', orderData);
      console.log('🛒 Cart items:', cart);

      const token = localStorage.getItem('customerToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      console.log('🔑 Headers:', headers);

      console.log('📦 Sending order to backend...');
      console.log('📦 Order data being sent:', JSON.stringify(orderData, null, 2));
      console.log('📦 Headers being sent:', headers);
      console.log('📦 API URL:', '/api/orders');
      
      let response;
      try {
        response = await ordersAPI.create(orderData, headers);
        console.log('✅ Order placement response:', response);
        console.log('✅ Response data:', response.data);
      } catch (apiError) {
        console.error('❌ API Error:', apiError);
        console.error('❌ API Error Response:', apiError.response?.data);
        console.error('❌ API Error Status:', apiError.response?.status);
        throw apiError;
      }
      
      // Validate response
      if (!response.data || !response.data.success) {
        throw new Error('Order placement failed: Invalid response from server');
      }
      
      if (!response.data.data || !response.data.data._id) {
        throw new Error('Order placement failed: No order ID received');
      }
      
      // Auto-login customer after successful order
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
      
      // Show success message before redirecting
      console.log('✅ Order placed successfully!');
      console.log('✅ Order ID:', response.data.data._id);
      console.log('✅ Redirecting to order confirmation page...');
      
      // Show success message to user
      setOtpSuccess(true);
      setOtpError('');
      
      // Add a small delay to show success message
      setTimeout(() => {
        // Redirect to order confirmation
        try {
          console.log('🚀 Navigating to order page:', `/order/${response.data.data._id}`);
          navigate(`/order/${response.data.data._id}`);
        } catch (navError) {
          console.error('❌ Navigation error:', navError);
          // Fallback: redirect to home page
          navigate('/');
        }
      }, 2000);
    } catch (err) {
      console.error('❌ Order placement error:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      
      let errorMessage = 'Failed to place order. Please try again.';
      
      // Check for specific error types
      if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Invalid order data. Please check your details.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Order service not available. Please try again later.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Provide more helpful error messages
      if (errorMessage.includes('validation')) {
        errorMessage = 'Please check your order details and try again.';
      } else if (errorMessage.includes('stock')) {
        errorMessage = 'Some items are out of stock. Please update your cart.';
      } else if (errorMessage.includes('not available')) {
        errorMessage = 'Some items are not available for the selected meal time.';
      } else if (errorMessage.includes('empty')) {
        errorMessage = 'Your cart is empty. Please add items before placing order.';
      }
      
      console.log('📝 Final error message:', errorMessage);
      
      // Show error in OTP component
      setOtpError(errorMessage);
      setOtpSuccess(false);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCheckout = () => {
    setShowOTP(false);
    setOtpError('');
  };

  if (showOTP) {
    return (
      <OTPVerification
        phoneNumber={formData.customerPhone}
        onVerify={handleOTPVerify}
        onResend={handleOTPResend}
        onBack={handleBackToCheckout}
        isLoading={otpLoading}
        error={otpError}
        success={otpSuccess ? 'OTP verified successfully! Placing your order...' : null}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8 animate-fade-in">
          <button
            onClick={() => navigate('/cart')}
            className="btn-outline inline-flex items-center mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Secure Checkout
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Complete your order with verification
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="animate-slide-in-left">
            <div className="card">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Order Information
                </h2>

                                  <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Name */}
                  <div className="form-group">
                    <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        id="customerName"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        required
                        className="input-with-icon"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="form-group">
                    <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        id="customerPhone"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        required
                        className="input-with-icon"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      We'll send a verification code to this number
                    </p>
                  </div>

                  {/* Meal Time Selection */}
                  <div className="form-group">
                    <label htmlFor="mealTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meal Time *
                    </label>
                    <select
                      id="mealTime"
                      name="mealTime"
                      value={formData.mealTime}
                      onChange={handleInputChange}
                      required
                      className="input"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Select the meal time for your order
                    </p>
                  </div>

                  {/* Special Instructions */}
                  <div className="form-group">
                    <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Special Instructions
                    </label>
                    <textarea
                      id="specialInstructions"
                      name="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={handleInputChange}
                      rows={3}
                      className="input"
                      placeholder="Any special requests or dietary requirements..."
                    />
                  </div>

                  {/* Security Notice */}
                  <div className="form-group">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                        <div>
                          <h3 className="text-sm font-medium text-green-900 dark:text-green-100">
                            Secure Ordering
                          </h3>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Your information is protected with end-to-end encryption
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="message error">
                      <p>{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="loading-spinner w-4 h-4"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Place Order Now</span>
                      </div>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="animate-slide-in-right">
            <div className="card sticky top-24">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h2>

                {/* Order Type and Meal Time */}
                <div className="mb-4 space-y-3">
                                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                       <span className="font-medium">Order Type:</span> Order Now
                      </p>
                    </div>
                  
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Meal Time:</span> {formData.mealTime.charAt(0).toUpperCase() + formData.mealTime.slice(1)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-6">
                  {cart.map((item) => (
                    <div key={item._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                          {isEmployee() && item.portion && item.portion !== 'Regular' && (
                            <span className="ml-2 inline-block px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs rounded-full font-medium border border-orange-200 dark:border-orange-800">
                              {item.portion}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          Qty: {item.quantity} × ₹{(item.inHousePrice || item.price).toFixed(0)}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ₹{((item.inHousePrice || item.price) * item.quantity).toFixed(0)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">₹{cartTotal.toFixed(0)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Tax</span>
                    <span className="text-gray-900 dark:text-white">₹0</span>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-orange-600 dark:text-orange-400">
                        ₹{cartTotal.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                    Free delivery on orders above ₹200
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 text-center mt-1">
                    By placing this order, you agree to our terms and conditions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
