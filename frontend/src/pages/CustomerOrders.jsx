import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Package, ArrowLeft, AlertCircle, CheckCircle, Info, X, Star, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import ReviewModal from '../components/ReviewModal';
import { STORAGE_KEYS } from '../config/constants';
import { customerAPI, feedbackAPI } from '../services/api';
import { formatPrice } from '../utils/currencyFormatter';

// Top-right Notification Component
const Notification = ({ isOpen, onClose, title, message, type = 'info' }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'success':
        return 'text-green-800 dark:text-green-200';
      default:
        return 'text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-sm w-full">
      <div className={`${getBgColor()} border rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1">
            <h4 className={`font-medium ${getTextColor()}`}>{title}</h4>
            <p className={`text-sm mt-1 ${getTextColor()}`}>{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomerOrders = () => {
  const { phone } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    order: null
  });
  const [orderReviews, setOrderReviews] = useState({});

  const showNotification = (title, message, type = 'info') => {
    setNotification({ isOpen: true, title, message, type });
  };

  const closeNotification = () => {
    setNotification({ isOpen: false, title: '', message: '', type: 'info' });
  };

  const openReviewModal = (order, e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    setReviewModal({
      isOpen: true,
      order
    });
  };

  const closeReviewModal = () => {
    setReviewModal({
      isOpen: false,
      order: null
    });
  };

  const handleReviewSubmitted = () => {
    showNotification(
      'Reviews Submitted!',
      'Thank you for your feedback. Your reviews help us improve.',
      'success'
    );
    // Refresh orders to update review status
    fetchOrders();
  };

  const openUpdateReviewModal = (order, e) => {
    e.preventDefault();
    e.stopPropagation();
    setReviewModal({
      isOpen: true,
      order,
      isUpdate: true
    });
  };

  const renderExistingReviews = (orderId) => {
    const reviews = orderReviews[orderId] || [];
    if (reviews.length === 0) return null;

    // Group reviews by menu item
    const reviewsByItem = reviews.reduce((acc, review) => {
      const itemId = review.menuItemId._id;
      if (!acc[itemId]) {
        acc[itemId] = {
          itemName: review.menuItemId.name,
          food: null,
          service: null
        };
      }
      if (review.reviewType === 'food') {
        acc[itemId].food = review;
      } else if (review.reviewType === 'service') {
        acc[itemId].service = review;
      }
      return acc;
    }, {});

    return (
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              Your Reviews
            </h4>
            <button
              onClick={(e) => openUpdateReviewModal(orders.find(o => o._id === orderId), e)}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Update Reviews
            </button>
          </div>
          
          {Object.values(reviewsByItem).map((itemReviews, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="font-medium text-sm text-gray-900 dark:text-white mb-2">
                {itemReviews.itemName}
              </p>
              <div className="space-y-2 text-xs">
                {itemReviews.food && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Food:</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= itemReviews.food.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-gray-600 dark:text-gray-300">
                        ({itemReviews.food.rating})
                      </span>
                    </div>
                  </div>
                )}
                {itemReviews.service && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Service:</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= itemReviews.service.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-gray-600 dark:text-gray-300">
                        ({itemReviews.service.rating})
                      </span>
                    </div>
                  </div>
                )}
                {(itemReviews.food?.comment || itemReviews.service?.comment) && (
                  <p className="text-gray-600 dark:text-gray-300 italic">
                    "{itemReviews.food?.comment || itemReviews.service?.comment}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const checkOrderReviews = async (orderId) => {
    try {
      const response = await feedbackAPI.getOrderFeedback(orderId, phone);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching order reviews:', error);
      return [];
    }
  };

  // Load existing reviews when orders are fetched
  const loadOrderReviews = async (orders) => {
    const reviewsData = {};
    for (const order of orders) {
      if (order.status === 'completed') {
        const reviews = await checkOrderReviews(order._id);
        if (reviews.length > 0) {
          reviewsData[order._id] = reviews;
        }
      }
    }
    setOrderReviews(reviewsData);
  };

  useEffect(() => {
    fetchOrders();
  }, [phone]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Use the customerAPI service which has proper configuration
      const response = await customerAPI.getOrders();
      const ordersData = response.data.data;
      setOrders(ordersData);
      setError('');
      
      // Load existing reviews for completed orders
      await loadOrderReviews(ordersData);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load order history');
      showNotification('Error', 'Failed to load order history', 'error');
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top-right Notification */}
      <Notification
        isOpen={notification.isOpen}
        onClose={closeNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
      
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              My Orders
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Order history for {phone}
            </p>
          </div>
        </div>

        {/* Orders List */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Order History
              </h2>
              <Link
                to="/"
                className="btn-primary"
              >
                New Order
              </Link>
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
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      No orders found for this phone number
                    </p>
                    <Link
                      to="/"
                      className="btn-primary"
                    >
                      Start Ordering
                    </Link>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order._id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <Link
                        to={`/order/${order._id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                Order #{order.orderNumber}
                              </h3>
                              <span className={`status-badge ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                              <span className="capitalize">
                                {order.mealTime}
                              </span>
                              <span>
                                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              ₹{order.total.toFixed(0)}
                            </p>
                          </div>
                        </div>
                      </Link>
                      
                      {/* Review Section */}
                      {order.status === 'completed' && (
                        <>
                          {orderReviews[order._id] && orderReviews[order._id].length > 0 ? (
                            renderExistingReviews(order._id)
                          ) : (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                                  <Star className="w-4 h-4" />
                                  <span>How was your experience?</span>
                                </div>
                                <button
                                  onClick={(e) => openReviewModal(order, e)}
                                  className="btn-outline btn-sm flex items-center space-x-1"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  <span>Leave Review</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={closeReviewModal}
        order={reviewModal.order}
        customerPhone={phone}
        onReviewSubmitted={handleReviewSubmitted}
        isUpdate={reviewModal.isUpdate}
      />
    </div>
  );
};

export default CustomerOrders;
