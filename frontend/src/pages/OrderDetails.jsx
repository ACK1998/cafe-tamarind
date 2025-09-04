import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Clock, ArrowLeft, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import { ordersAPI } from '../services/api';
import { formatPrice } from '../utils/currencyFormatter';

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getById(orderId);
      setOrder(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

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
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Order not found'}</p>
            <Link to="/" className="btn-primary">
              Back to Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link
            to="/"
            className="btn-outline inline-flex items-center mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Order Details
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Order #{order.orderNumber}
            </p>
          </div>
        </div>

        {/* Order Status */}
        <div className="card mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Order Status
              </h2>
              <div className={`status-badge ${getStatusColor(order.status)} flex items-center`}>
                {getStatusIcon(order.status)}
                <span className="ml-1 capitalize">{order.status}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-300">Order Date</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300">Meal Time</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {order.mealTime}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pre-order Information */}
        {order.isPreOrder && order.preOrderDateTime && (
          <div className="card mb-6">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pre-order Information
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-300">Pre-order Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(order.preOrderDateTime).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">Pre-order Time</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(order.preOrderDateTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> Your order will be prepared for {new Date(order.preOrderDateTime).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Customer Information */}
        <div className="card mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Customer Information
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-300">Name</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.customerName}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300">Phone</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.customerPhone}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="card mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Order Items
            </h2>
            
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Qty: {item.qty} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatPrice(item.total)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        {order.specialInstructions && (
          <div className="card mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Special Instructions
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {order.specialInstructions}
              </p>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="card">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Order Summary
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                <span className="text-gray-900 dark:text-white">{formatPrice(order.total)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Tax</span>
                <span className="text-gray-900 dark:text-white">₹0</span>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-primary-600 dark:text-primary-400">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            to="/"
            className="flex-1 btn-outline text-center"
          >
            Order Again
          </Link>
          <Link
            to={`/orders/${order.customerPhone}`}
            className="flex-1 btn-primary text-center"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
