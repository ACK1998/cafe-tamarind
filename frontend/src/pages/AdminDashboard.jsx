import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import useStore from '../store/useStore';
import { STORAGE_KEYS } from '../config/constants';
import AdminHeader from '../components/AdminHeader';
import { formatPrice } from '../utils/currencyFormatter';
import { ordersAPI } from '../services/api';

const AdminDashboard = () => {
  const { user, logout } = useStore();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    preparing: 0,
    ready: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Add a small delay to prevent rapid API calls
    const timer = setTimeout(() => {
      fetchOrders();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();
      
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
      await ordersAPI.updateStatus(orderId, newStatus);
      
      // Refresh orders
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
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
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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



        {/* Orders List */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Orders
              </h2>
              <button
                onClick={fetchOrders}
                className="btn-outline"
              >
                Refresh
              </button>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Loading orders...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button
                  onClick={fetchOrders}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">No orders found</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order._id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              Order #{order.orderNumber}
                            </h3>
                            <span className={`status-badge ${getStatusColor(order.status)} flex items-center`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </span>
                            {order.createdBy === 'admin' && (
                              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 text-xs rounded-full font-medium">
                                Placed by Admin
                              </span>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            <p>Customer: {order.customerName} ({order.customerPhone})</p>
                            <p>Items: {order.items.length} • Total: {formatPrice(order.total)}</p>
                            <p>Meal Time: {order.mealTime} • Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                            {order.isPreOrder && order.preOrderDateTime && (
                              <p className="text-blue-600 dark:text-blue-400">
                                📅 Pre-order for: {new Date(order.preOrderDateTime).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateOrderStatus(order._id, 'confirmed')}
                              className="btn-primary text-sm"
                            >
                              Confirm
                            </button>
                          )}
                          
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => updateOrderStatus(order._id, 'preparing')}
                              className="btn-primary text-sm"
                            >
                              Start Preparing
                            </button>
                          )}
                          
                          {order.status === 'preparing' && (
                            <button
                              onClick={() => updateOrderStatus(order._id, 'ready')}
                              className="btn-primary text-sm"
                            >
                              Mark Ready
                            </button>
                          )}
                          
                          {order.status === 'ready' && (
                            <button
                              onClick={() => updateOrderStatus(order._id, 'completed')}
                              className="btn-primary text-sm"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
