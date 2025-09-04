import React, { useState, useEffect, useCallback } from 'react';
import { X, Star, MessageCircle, User, UserX, AlertCircle, CheckCircle } from 'lucide-react';
import { feedbackAPI } from '../services/api';

const ReviewModal = ({ 
  isOpen, 
  onClose, 
  order, 
  customerPhone,
  onReviewSubmitted,
  isUpdate = false 
}) => {
  const [reviews, setReviews] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [canReviewData, setCanReviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize reviews state when modal opens
  useEffect(() => {
    if (isOpen && order && customerPhone) {
      checkCanReview();
    }
  }, [isOpen, order, customerPhone, checkCanReview]);

  const checkCanReview = useCallback(async () => {
    try {
      setLoading(true);
      
      if (isUpdate) {
        // For updates, get existing reviews and all order items
        const [reviewResponse] = await Promise.all([
          feedbackAPI.getOrderFeedback(order._id, customerPhone)
        ]);
        
        const existingReviews = reviewResponse.data.data || [];
        
        // Initialize reviews state with existing data and all order items
        const initialReviews = {};
        order.items?.forEach(item => {
          const foodReview = existingReviews.find(r => 
            r.menuItemId._id === item.menuItemId && r.reviewType === 'food'
          );
          const serviceReview = existingReviews.find(r => 
            r.menuItemId._id === item.menuItemId && r.reviewType === 'service'
          );
          
          initialReviews[item.menuItemId] = {
            menuItemId: item.menuItemId,
            name: item.name,
            qty: item.qty,
            foodRating: foodReview?.rating || 0,
            serviceRating: serviceReview?.rating || 0,
            comment: foodReview?.comment || serviceReview?.comment || '',
            isAnonymous: foodReview?.isAnonymous || serviceReview?.isAnonymous || false
          };
        });
        
        setReviews(initialReviews);
        setCanReviewData({ canReview: true, reviewableItems: order.items || [] });
      } else {
        // For new reviews, check eligibility
        const response = await feedbackAPI.canReview(order._id, customerPhone);
        
        if (response.data.success) {
          setCanReviewData(response.data);
          
          // Initialize reviews state for reviewable items
          const initialReviews = {};
          response.data.reviewableItems?.forEach(item => {
            initialReviews[item.menuItemId] = {
              menuItemId: item.menuItemId,
              name: item.name,
              qty: item.qty,
              foodRating: 0,
              serviceRating: 0,
              comment: '',
              isAnonymous: false
            };
          });
          setReviews(initialReviews);
        }
      }
    } catch (error) {
      console.error('Error loading review information:', error);
      setError('Failed to load review information');
    } finally {
      setLoading(false);
    }
  }, [isUpdate, order, customerPhone]);

  const updateReview = (menuItemId, field, value) => {
    setReviews(prev => ({
      ...prev,
      [menuItemId]: {
        ...prev[menuItemId],
        [field]: value
      }
    }));
  };

  const renderStars = (rating, onRatingChange, type, menuItemId) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(menuItemId, type, star)}
            className={`p-1 transition-colors ${
              star <= rating
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            <Star 
              className={`w-6 h-6 ${star <= rating ? 'fill-current' : ''}`} 
            />
          </button>
        ))}
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Filter reviews that have at least one rating
      const reviewsToSubmit = Object.values(reviews).filter(review => 
        review.foodRating > 0 || review.serviceRating > 0
      );

      if (reviewsToSubmit.length === 0) {
        setError('Please provide at least one rating before submitting');
        setSubmitting(false);
        return;
      }

      const response = await feedbackAPI.submit({
        customerPhone,
        orderId: order._id,
        reviews: reviewsToSubmit
      });

      if (response.data.success) {
        setSuccess(`Successfully ${isUpdate ? 'updated' : 'submitted'} ${reviewsToSubmit.length} reviews!`);
        setTimeout(() => {
          onReviewSubmitted?.();
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting reviews:', error);
      setError(
        error.response?.data?.message || 
        'Failed to submit reviews. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isUpdate ? 'Update Your Reviews' : 'Review Your Order'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading...</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-800 dark:text-green-200">{success}</span>
            </div>
          )}

          {!loading && canReviewData && (
            <>
              {!canReviewData.canReview ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    {canReviewData.reason}
                  </p>
                  {canReviewData.existingReviews > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      You have already submitted {canReviewData.existingReviews} review(s) for this order.
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Rate your experience with each item and our service
                    </p>
                  </div>

                  {Object.values(reviews).map((review) => (
                    <div 
                      key={review.menuItemId}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {review.name}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Qty: {review.qty}
                        </span>
                      </div>

                      {/* Food Rating */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Food Quality
                        </label>
                        {renderStars(
                          review.foodRating, 
                          updateReview, 
                          'foodRating', 
                          review.menuItemId
                        )}
                      </div>

                      {/* Service Rating */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Service Quality
                        </label>
                        {renderStars(
                          review.serviceRating, 
                          updateReview, 
                          'serviceRating', 
                          review.menuItemId
                        )}
                      </div>

                      {/* Comment */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Comment (Optional)
                        </label>
                        <textarea
                          value={review.comment}
                          onChange={(e) => updateReview(review.menuItemId, 'comment', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          rows={3}
                          maxLength={500}
                          placeholder="Share your thoughts about this item..."
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {review.comment.length}/500 characters
                        </p>
                      </div>

                      {/* Anonymous Option */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`anonymous-${review.menuItemId}`}
                          checked={review.isAnonymous}
                          onChange={(e) => updateReview(review.menuItemId, 'isAnonymous', e.target.checked)}
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label 
                          htmlFor={`anonymous-${review.menuItemId}`}
                          className="text-sm text-gray-700 dark:text-gray-300 flex items-center cursor-pointer"
                        >
                          {review.isAnonymous ? (
                            <>
                              <UserX className="w-4 h-4 mr-1" />
                              Submit anonymously
                            </>
                          ) : (
                            <>
                              <User className="w-4 h-4 mr-1" />
                              Show my name
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  ))}

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting 
                        ? (isUpdate ? 'Updating...' : 'Submitting...') 
                        : (isUpdate ? 'Update Reviews' : 'Submit Reviews')
                      }
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
