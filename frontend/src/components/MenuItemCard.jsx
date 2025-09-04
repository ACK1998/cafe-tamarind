import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, ShoppingCart, Star, Clock } from 'lucide-react';
import useStore from '../store/useStore';
import { formatPrice } from '../utils/currencyFormatter';

const MenuItemCard = ({ item, onAddToCart, dataItemId }) => {
  const { cart, addToCart, removeFromCart, updateQuantity } = useStore();
  const [isAdding, setIsAdding] = useState(false);

  const cartItem = cart.find(cartItem => cartItem._id === item._id);
  const quantity = cartItem ? cartItem.quantity : 0;

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

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(item);
    
    // Trigger animation feedback
    if (onAddToCart) {
      onAddToCart();
    }
    
    setTimeout(() => setIsAdding(false), 300);
  };



  const handleQuantityChange = (newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(item._id);
    } else {
      updateQuantity(item._id, newQuantity);
    }
  };

  const isAvailable = item.isAvailable && item.stock > 0;


  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 group">
      {/* Card Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-600">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
            <span className="text-white text-2xl font-bold">
              {item.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        
        {/* Stock indicator */}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm backdrop-blur-sm ${
            isAvailable 
              ? 'bg-emerald-100/90 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700/50'
              : 'bg-red-100/90 text-red-700 border border-red-200/50 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700/50'
          }`}>
            {isAvailable ? `${item.stock} left` : 'Sold Out'}
          </span>
        </div>

        {/* Rating badge */}
        {item.rating && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 dark:bg-gray-800/95 px-2.5 py-1 rounded-lg shadow-sm backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {item.rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({item.reviewCount})
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 space-y-4">
        {/* Item Name & Category */}
        <div className="space-y-2">
          <Link to={`/item/${item._id}`}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 cursor-pointer line-clamp-1">
              {item.name}
            </h3>
          </Link>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {item.category}
            </span>
            {item.preparationTime && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                {item.preparationTime} min
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {item.description || 'Deliciously prepared with fresh ingredients'}
        </p>

        {/* Portion Information - Only for Employees */}
        {isEmployee() && item.portion && item.portion !== 'Regular' && (
          <div className="flex justify-start">
            <span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-sm rounded-full font-medium border border-orange-200 dark:border-orange-800">
              {item.portion} Portion
            </span>
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {formatPrice(isEmployee() && item.inHousePrice ? item.inHousePrice : item.price)}
              </span>
            </div>
          </div>
        </div>


        {/* Add to Cart Section */}
        <div className="pt-4">
          {quantity > 0 ? (
            <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 border border-orange-100 dark:border-orange-800">
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                {quantity} in cart
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 border border-orange-200 dark:border-orange-700 flex items-center justify-center text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
                  disabled={!isAvailable}
                >
                  <Minus className="w-4 h-4" />
                </button>
                
                <span className="w-8 text-center font-bold text-orange-700 dark:text-orange-300">
                  {quantity}
                </span>
                
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 border border-orange-200 dark:border-orange-700 flex items-center justify-center text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
                  disabled={!isAvailable || quantity >= item.stock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={!isAvailable}
              data-item-id={dataItemId}
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                !isAvailable 
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              } ${isAdding ? 'animate-pulse' : ''}`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{!isAvailable ? 'Unavailable' : 'Add to Cart'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
    </div>
  );
};

export default MenuItemCard;
