import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Trash2, Filter, TrendingUp, BarChart3, Users } from 'lucide-react';
import AdminHeader from '../components/AdminHeader';
import { feedbackAPI } from '../services/api';

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    rating: '',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' or 'analytics'

  useEffect(() => {
    fetchFeedback();
    fetchAnalytics();
  }, [filters]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await feedbackAPI.getAll(filters);
      
      if (response.data.success) {
        setFeedback(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setError('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await feedbackAPI.getAnalytics();
      
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when changing other filters
    }));
  };

  const deleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await feedbackAPI.delete(feedbackId);
      fetchFeedback(); // Refresh the list
    } catch (error) {
      console.error('Error deleting feedback:', error);
      setError('Failed to delete review');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderAnalytics = () => {
    if (!analytics) return null;

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.overview.totalReviews}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">Total Reviews</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.overview.avgRating}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">Average Rating</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="flex space-x-4">
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {analytics.overview.foodAvg || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Food</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {analytics.overview.serviceAvg || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Service</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Rated Items */}
        {analytics.topRatedItems && analytics.topRatedItems.length > 0 && (
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Top Rated Items
              </h3>
              <div className="space-y-3">
                {analytics.topRatedItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        {renderStars(Math.round(item.avgRating))}
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {item.avgRating}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {item.reviewCount} reviews
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReviews = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="form-select"
              >
                <option value="all">All Reviews</option>
                <option value="food">Food Only</option>
                <option value="service">Service Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rating
              </label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="form-select"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort By
              </label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('sortOrder', sortOrder);
                }}
                className="form-select"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="rating-desc">Highest Rating</option>
                <option value="rating-asc">Lowest Rating</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="card">
        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading reviews...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchFeedback}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              {feedback.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">No reviews found</p>
                </div>
              ) : (
                feedback.map((review) => (
                  <div
                    key={review._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {review.menuItemId?.name || 'Unknown Item'}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            review.reviewType === 'food' 
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
                          }`}>
                            {review.reviewType}
                          </span>
                          {renderStars(review.rating)}
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          <span>Order #{review.orderId?.orderNumber || 'Unknown'}</span>
                          <span className="mx-2">•</span>
                          <span>{review.isAnonymous ? 'Anonymous' : review.orderId?.customerName || 'Customer'}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>

                        {review.comment && (
                          <p className="text-gray-700 dark:text-gray-300 mt-2">
                            "{review.comment}"
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => deleteFeedback(review._id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Customer Reviews
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Monitor and manage customer feedback
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                All Reviews
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'reviews' ? renderReviews() : renderAnalytics()}
      </div>
    </div>
  );
};

export default AdminFeedback;
