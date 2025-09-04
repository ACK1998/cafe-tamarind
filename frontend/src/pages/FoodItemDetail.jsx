import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Users, ShoppingCart, Plus, Minus, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import useStore from '../store/useStore';
import { menuAPI, feedbackAPI } from '../services/api';
import { formatPrice } from '../utils/currencyFormatter';

const FoodItemDetail = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, updateQuantity } = useStore();
  
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'reviews'

  const cartItem = cart.find(cartItem => cartItem._id === itemId);
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  useEffect(() => {
    fetchItemDetails();
    fetchReviews();
  }, [itemId]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const response = await menuAPI.getById(itemId);
      if (response.data.success) {
        setItem(response.data.data);
      } else {
        setError('Item not found');
      }
    } catch (err) {
      console.error('Error fetching item details:', err);
      setError('Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await feedbackAPI.getMenuItemFeedback(itemId, { type: 'food', limit: 10 });
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleAddToCart = () => {
    if (item) {
      for (let i = 0; i < quantity; i++) {
        addToCart(item);
      }
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const renderStars = (rating, size = 'w-4 h-4') => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderReviews = () => {
    if (reviews.length === 0) {
      return (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">No reviews yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {renderStars(review.rating)}
                <span className="font-medium text-gray-900 dark:text-white">
                  {review.rating}/5
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {review.isAnonymous ? 'Anonymous' : (review.userId?.name || 'Customer')}
              </span>
            </div>
            {review.comment && (
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                "{review.comment}"
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading item details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Item not found'}</p>
            <Link to="/" className="btn-primary">
              Back to Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAvailable = item.isAvailable && item.stock > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="btn-outline inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </button>
        </div>

        {/* Main Content - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image */}
          <div className="space-y-6">
            <div className="relative h-96 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-5xl font-bold">
                    {item.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              
              {/* Stock Status */}
              <div className="absolute top-4 right-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm ${
                  isAvailable 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                }`}>
                  {isAvailable ? `In Stock (${item.stock})` : 'Out of Stock'}
                </span>
              </div>

              {/* Rating Badge */}
              {item.rating && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/95 dark:bg-gray-800/95 px-4 py-2 rounded-full shadow-sm">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {item.rating.toFixed(1)}
                  </span>
                  {item.reviewCount && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({item.reviewCount})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Additional Images Placeholder */}
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Image {i}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {item.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {item.description || 'Delicious and freshly prepared'}
              </p>
              <div className="flex items-center space-x-4 mt-3">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {item.preparationTime || 15} min
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {item.portion || 'Regular'} Portion
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {formatPrice(item.price)}
              </span>
              {item.inHousePrice && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span>In-house: {formatPrice(item.inHousePrice)}</span>
                </div>
              )}
            </div>

            {/* Category & Meal Times */}
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</span>
                <span className="ml-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                  {item.category}
                </span>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Available for:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.availableFor?.map((mealTime) => (
                    <span key={mealTime} className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm capitalize">
                      {mealTime}
                    </span>
                  ))}
                </div>
              </div>

              {item.availableForPreOrder && (
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-green-600 dark:text-green-400">Available for Pre-order</span>
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            {isAvailable && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart - {formatPrice(item.price * quantity)}</span>
                </button>

                {cartQuantity > 0 && (
                  <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <span className="text-sm text-primary-700 dark:text-primary-300">
                      {cartQuantity} in cart
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(cartQuantity - 1)}
                        className="p-1 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-800 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{cartQuantity}</span>
                      <button
                        onClick={() => handleQuantityChange(cartQuantity + 1)}
                        className="p-1 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-800 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isAvailable && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-center font-medium">
                  Currently Out of Stock
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Reviews ({reviews.length})
              </button>
            </nav>
          </div>

          <div className="py-6">
            {activeTab === 'details' && (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h3>About this dish</h3>
                <p>{item.description || 'This delicious dish is prepared with fresh ingredients and traditional cooking methods.'}</p>
                
                <h3>Nutritional Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 not-prose">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">~400</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Calories</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">25g</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Protein</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">30g</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Carbs</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">15g</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Fat</div>
                  </div>
                </div>

                <h3>Ingredients</h3>
                <p>Fresh beef, aromatic spices, onions, tomatoes, and traditional curry base.</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {renderReviews()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodItemDetail;
