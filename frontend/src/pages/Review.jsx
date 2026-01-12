import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { reviewAPI } from '../services/api';

const Review = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Review form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [itemRatings, setItemRatings] = useState({}); // { menuItemId: { rating, comment } }

  useEffect(() => {
    if (!token) {
      setError('Invalid review link. Please use the QR code from your bill.');
      setLoading(false);
      return;
    }

    const validateToken = async () => {
      try {
        console.log('🔍 Validating token:', token ? token.substring(0, 20) + '...' : 'missing');
        const response = await reviewAPI.validateToken(token);
        console.log('✅ Token validation response:', response?.data);
        if (response.data.success) {
          setOrder(response.data.data.order);
          setHasReviewed(response.data.data.hasReviewed);
          if (response.data.data.review) {
            // Pre-fill if review exists
            setRating(response.data.data.review.rating);
            setComment(response.data.data.review.comment || '');
            setIsAnonymous(response.data.data.review.isAnonymous || false);
            setSubmitted(true);
          }
        } else {
          setError(response.data.message || 'Failed to validate review token');
        }
      } catch (err) {
        console.error('❌ Token validation error:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          apiUrl: err.config?.url
        });
        
        // Provide more specific error messages
        if (err.response?.status === 0 || err.message?.includes('Network Error')) {
          setError('Cannot connect to server. Please check your internet connection and ensure the server is running.');
        } else if (err.response?.status === 400) {
          setError(err.response?.data?.message || 'Invalid or expired review token. Please use a fresh QR code from your bill.');
        } else if (err.response?.status === 404) {
          setError('Order not found. The order may have been deleted.');
        } else {
          setError(err.response?.data?.message || 'Invalid or expired review link. Please contact us if you need assistance.');
        }
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleRatingClick = (value) => {
    if (!hasReviewed && !submitted) {
      setRating(value);
    }
  };

  const handleItemRatingClick = (menuItemId, value) => {
    if (!hasReviewed && !submitted) {
      setItemRatings(prev => ({
        ...prev,
        [menuItemId]: {
          ...prev[menuItemId],
          rating: value
        }
      }));
    }
  };

  const handleItemCommentChange = (menuItemId, comment) => {
    if (!hasReviewed && !submitted) {
      setItemRatings(prev => ({
        ...prev,
        [menuItemId]: {
          ...prev[menuItemId],
          comment: comment
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      setError('Please select a rating');
      return;
    }

    if (hasReviewed || submitted) {
      return;
    }

    setSubmitting(true);
    setError(null);

    // Prepare item ratings array (only include items with ratings)
    const itemRatingsArray = order?.items
      ?.filter(item => itemRatings[item.menuItemId]?.rating)
      .map(item => ({
        menuItemId: item.menuItemId,
        rating: itemRatings[item.menuItemId].rating,
        comment: itemRatings[item.menuItemId].comment?.trim() || ''
      })) || [];

    try {
      const response = await reviewAPI.submit({
        token,
        rating,
        comment: comment.trim(),
        isAnonymous,
        itemRatings: itemRatingsArray.length > 0 ? itemRatingsArray : undefined
      });

      if (response.data.success) {
        setSubmitted(true);
        setHasReviewed(true);
      } else {
        setError(response.data.message || 'Failed to submit review');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading review form...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Review Link Invalid</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-900 dark:bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {submitted || hasReviewed ? 'Thank You!' : 'Rate Your Experience'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {submitted || hasReviewed 
              ? 'Your review has been submitted' 
              : 'Help us improve by sharing your feedback'}
          </p>
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Order Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Order #:</span>
                <span className="text-gray-900 dark:text-white font-medium">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Date:</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total:</span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  ₹{Number(order.total).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 mb-1">Items:</p>
                <ul className="space-y-1">
                  {order.items?.map((item, index) => (
                    <li key={index} className="text-gray-900 dark:text-white text-xs">
                      {item.name} × {item.qty}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Review Form */}
        {!submitted && !hasReviewed && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                How would you rate your experience? *
              </label>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleRatingClick(value)}
                    className={`w-12 h-12 rounded-full text-2xl transition-all ${
                      rating >= value
                        ? 'bg-yellow-400 text-yellow-900'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    } hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            {/* Item Ratings (Optional) */}
            {order?.items && order.items.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Rate Individual Items (Optional)
                </label>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.name} × {item.qty}
                        </span>
                        {itemRatings[item.menuItemId]?.rating && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {itemRatings[item.menuItemId].rating === 1 && 'Poor'}
                            {itemRatings[item.menuItemId].rating === 2 && 'Fair'}
                            {itemRatings[item.menuItemId].rating === 3 && 'Good'}
                            {itemRatings[item.menuItemId].rating === 4 && 'Very Good'}
                            {itemRatings[item.menuItemId].rating === 5 && 'Excellent'}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-start space-x-1 mb-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleItemRatingClick(item.menuItemId, value)}
                            className={`w-8 h-8 rounded text-lg transition-all ${
                              itemRatings[item.menuItemId]?.rating >= value
                                ? 'bg-yellow-400 text-yellow-900'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                            } hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <textarea
                        placeholder="Optional comment for this item..."
                        value={itemRatings[item.menuItemId]?.comment || ''}
                        onChange={(e) => handleItemCommentChange(item.menuItemId, e.target.value)}
                        rows={2}
                        maxLength={500}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      {itemRatings[item.menuItemId]?.comment && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {itemRatings[item.menuItemId].comment.length}/500 characters
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comment */}
            <div className="mb-6">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Comments (Optional)
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={1000}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Tell us about your experience..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {comment.length}/1000 characters
              </p>
            </div>

            {/* Anonymous Option */}
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Submit anonymously
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!rating || submitting}
              className="w-full bg-gray-900 dark:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Success/Already Reviewed State */}
        {(submitted || hasReviewed) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Review Submitted!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Thank you for taking the time to share your feedback. We appreciate it!
            </p>
            {rating > 0 && (
              <div className="mb-4">
                <div className="flex justify-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <span
                      key={value}
                      className={`text-2xl ${
                        value <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                {comment && (
                  <p className="text-gray-700 dark:text-gray-300 italic text-sm mt-2">
                    "{comment}"
                  </p>
                )}
              </div>
            )}
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-900 dark:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Review;

