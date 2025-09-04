import React, { useState } from 'react';
import { Plus, Minus, ShoppingCart, Star } from 'lucide-react';
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
    <div className="menu-item-card group">
      {/* Card Image Placeholder */}
      <div className="relative h-52 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl font-bold">
              {item.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        
        {/* Stock indicator */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium shadow-sm ${
            isAvailable 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
          }`}>
            {isAvailable ? `In Stock (${item.stock})` : 'Out of Stock'}
          </span>
        </div>

        {/* Rating badge */}
        {item.rating && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/95 dark:bg-gray-800/95 px-3 py-1.5 rounded-full shadow-sm">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {item.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 space-y-4">
        {/* Item Name */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
          {item.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Portion Information - Only for Employees */}
        {isEmployee() && item.portion && item.portion !== 'Regular' && (
          <div className="flex justify-start">
            <span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-sm rounded-full font-medium border border-orange-200 dark:border-orange-800">
              {item.portion} Portion
            </span>
          </div>
        )}

        {/* Price and Preparation Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatPrice(item.inHousePrice || item.price)}
            </span>
            {item.preparationTime && (
              <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                {item.preparationTime} min
              </span>
            )}
          </div>
        </div>

        {/* Category Badge */}
        {item.category && (
          <div className="flex justify-start">
            <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full font-medium">
              {item.category}
            </span>
          </div>
        )}

        {/* Quantity Controls or Add Button */}
        <div className="flex justify-center pt-2">
          {quantity > 0 ? (
            <div className="quantity-control">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="quantity-btn focus-ring"
                disabled={!isAvailable}
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <span className="w-12 text-center font-medium text-gray-900 dark:text-white text-lg">
                {quantity}
              </span>
              
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="quantity-btn focus-ring"
                disabled={!isAvailable || quantity >= item.stock}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={!isAvailable}
              data-item-id={dataItemId}
              className={`btn-primary flex items-center gap-3 px-6 py-3 text-base font-medium ${
                isAdding ? 'animate-pulse-slow' : ''
              } ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
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
