import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2, Package } from 'lucide-react';
import Navbar from '../components/Navbar';
import useStore from '../store/useStore';
import { formatPrice } from '../utils/currencyFormatter';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, removeFromCart, updateQuantity, clearCart } = useStore();

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

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-6 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-orange-500" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Your Cart is Empty
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              Looks like you haven't added any delicious items to your cart yet. 
              Let's fix that!
            </p>
            
            <button
              onClick={() => navigate('/')}
              className="btn-primary inline-flex items-center"
            >
              <Package className="w-5 h-5 mr-2" />
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="btn-outline inline-flex items-center mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Your Cart
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {cart.length} item{cart.length !== 1 ? 's' : ''} in your cart
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClearCart}
            className="btn-secondary inline-flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="xl:col-span-2 animate-slide-in-left">
            <div className="card">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Cart Items
                </h2>

                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div 
                      key={item._id} 
                      className="flex flex-col sm:flex-row sm:items-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-all duration-300 gap-4"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Item Image */}
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl flex items-center justify-center mr-4">
                        <span className="text-orange-600 dark:text-orange-400 text-lg font-bold">
                          {item.name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                          {isEmployee() && item.portion && item.portion !== 'Regular' && (
                            <span className="ml-2 inline-block px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs rounded-full font-medium border border-orange-200 dark:border-orange-800">
                              {item.portion}
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {formatPrice(item.inHousePrice || item.price)} per item
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          className="quantity-btn focus-ring"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          className="quantity-btn focus-ring"
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item._id)}
                        className="text-red-500 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
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



                {/* Items Summary */}
                <div className="space-y-2 mb-4">
                  {cart.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        {item.name}
                        {isEmployee() && item.portion && item.portion !== 'Regular' && (
                          <span className="ml-1 text-orange-600 dark:text-orange-400">
                            ({item.portion})
                          </span>
                        )}
                        {' '}× {item.quantity}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatPrice((item.inHousePrice || item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">{formatPrice(cartTotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Tax</span>
                    <span className="text-gray-900 dark:text-white">{formatPrice(0)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-orange-600 dark:text-orange-400">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <p className="text-sm text-green-700 dark:text-green-300 text-center">
                    Free delivery on orders above {formatPrice(200)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mt-6">
                  <button
                    onClick={handleCheckout}
                    className="w-full btn-primary"
                  >
                    Order Now
                  </button>
                  
                  <button
                    onClick={() => navigate('/')}
                    className="w-full btn-outline"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
