import React from 'react';
import { Clock, Zap } from 'lucide-react';

const OrderTypeSelector = ({ 
  orderType, 
  onOrderTypeChange, 
  disabled = false 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Order Type
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Order Now Option */}
        <button
          type="button"
          onClick={() => onOrderTypeChange('NOW')}
          disabled={disabled}
          className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
            orderType === 'NOW'
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              orderType === 'NOW'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}>
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className={`font-medium ${
                orderType === 'NOW'
                  ? 'text-orange-700 dark:text-orange-300'
                  : 'text-gray-900 dark:text-white'
              }`}>
                Order Now
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Get your order ready immediately
              </p>
            </div>
          </div>
          
          {orderType === 'NOW' && (
            <div className="absolute top-2 right-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            </div>
          )}
        </button>

        {/* Pre-Order Option */}
        <button
          type="button"
          onClick={() => onOrderTypeChange('PREORDER')}
          disabled={disabled}
          className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
            orderType === 'PREORDER'
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              orderType === 'PREORDER'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className={`font-medium ${
                orderType === 'PREORDER'
                  ? 'text-orange-700 dark:text-orange-300'
                  : 'text-gray-900 dark:text-white'
              }`}>
                Pre-Order
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Schedule for future pickup
              </p>
            </div>
          </div>
          
          {orderType === 'PREORDER' && (
            <div className="absolute top-2 right-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default OrderTypeSelector;
