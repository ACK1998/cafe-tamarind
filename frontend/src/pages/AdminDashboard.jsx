import React, { useState, useEffect, useMemo } from 'react';
import { Package, Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminHeader from '../components/AdminHeader';
import { formatPrice } from '../utils/currencyFormatter';
import { printKot, printBill } from '../utils/printUtils';
import { ordersAPI } from '../services/api';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    preparing: 0,
    ready: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

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
      // Fetch all orders with a high limit (1000) to get all data for client-side pagination
      const response = await ordersAPI.getAll({ page: 1, limit: 1000 });
      
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
      const response = await ordersAPI.updateStatus(orderId, newStatus);
      const updatedOrder = response?.data?.data;

      if (newStatus === 'confirmed' && updatedOrder) {
        printKot(updatedOrder);
      }

      if (newStatus === 'completed' && updatedOrder) {
        await printBill(updatedOrder);
      }
      
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
      case 'paid':
        return 'status-paid';
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
      case 'paid':
        return <CheckCircle className="w-4 h-4 lucide" />;
      case 'pending':
        return <Clock className="w-4 h-4 lucide" />;
      default:
        return <AlertCircle className="w-4 h-4 lucide" />;
    }
  };

  // Paginate orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return orders.slice(startIndex, startIndex + pageSize);
  }, [orders, currentPage, pageSize]);

  const totalPages = Math.ceil(orders.length / pageSize);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 admin-dashboard">
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="card hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg icon-container">
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400 lucide" />
                  <span className="text-lg" style={{ display: 'none' }}>📦</span>
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">Total Orders</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg icon-container">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400 lucide" />
                  <span className="text-lg" style={{ display: 'none' }}>⏰</span>
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">Pending</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg icon-container">
                  <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 lucide" />
                  <span className="text-lg" style={{ display: 'none' }}>👨‍🍳</span>
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">Preparing</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.preparing}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg icon-container">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 lucide" />
                  <span className="text-lg" style={{ display: 'none' }}>✅</span>
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">Ready</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.ready}</p>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Orders List */}
        <div className="card">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Orders
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Total: {orders.length} orders
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
                <button
                  onClick={fetchOrders}
                  className="btn-outline text-sm sm:text-base self-start sm:self-auto"
                >
                  Refresh
                </button>
              </div>
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
              <>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-300">No orders found</p>
                    </div>
                  ) : (
                    paginatedOrders.map((order) => (
                    <div
                      key={order._id}
                      className={`border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 admin-order-card ${order.status}`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                              Order #{order.orderNumber}
                            </h3>
                            <span className={`status-badge ${getStatusColor(order.status)} flex items-center text-xs`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </span>
                            {order.createdBy === 'admin' && (
                              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 text-xs rounded-full font-medium whitespace-nowrap">
                                Admin Placed
                              </span>
                            )}
                          </div>
                          
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 space-y-1.5">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span className="font-medium">Customer:</span>
                              <span className="truncate">{order.customerName} ({order.customerPhone})</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                              <span><span className="font-medium">Items:</span> {order.items.length}</span>
                              <span><span className="font-medium">Total:</span> {formatPrice(order.total)}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                              <span><span className="font-medium">Meal:</span> {order.mealTime}</span>
                              <span><span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            {order.items?.length > 0 && (
                              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-3">
                                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2 font-medium">
                                  Items
                                </p>
                                <ul className="space-y-1">
                                  {order.items.map((item, index) => (
                                    <li
                                      key={`${item.menuItemId || item.name}-${index}`}
                                      className="flex items-center justify-between text-xs sm:text-sm text-gray-700 dark:text-gray-200"
                                    >
                                      <span className="truncate pr-3">{item.name}</span>
                                      <span className="font-semibold text-gray-900 dark:text-white">×{item.qty}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {order.isPreOrder && order.preOrderDateTime && (
                              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                                <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-medium">
                                  📅 Pre-order for: {new Date(order.preOrderDateTime).toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 lg:min-w-[260px]">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => printKot(order)}
                              className="btn-outline text-xs sm:text-sm px-3 py-2 whitespace-nowrap flex-1 min-w-[110px]"
                            >
                              Print KOT
                            </button>
                            <button
                              onClick={async () => await printBill(order)}
                              className="btn-outline text-xs sm:text-sm px-3 py-2 whitespace-nowrap flex-1 min-w-[110px]"
                            >
                              Print Bill
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order._id, 'paid')}
                              className="btn-primary text-xs sm:text-sm px-3 py-2 whitespace-nowrap flex-1 min-w-[110px] disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={order.status === 'paid' || order.status === 'cancelled'}
                            >
                              Paid
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, orders.length)} of {orders.length} orders
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 dark:text-white"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-2 rounded-lg text-sm ${
                                currentPage === pageNum
                                  ? 'bg-orange-500 text-white'
                                  : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 dark:text-white'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 dark:text-white"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
