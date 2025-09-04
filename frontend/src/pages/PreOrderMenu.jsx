import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Filter, Search, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import SimpleMenuList from '../components/SimpleMenuList';
import ErrorBoundary from '../components/ErrorBoundary';
import useStore from '../store/useStore';
import usePaginatedMenu from '../hooks/usePaginatedMenu';

const PreOrderMenu = () => {
  const navigate = useNavigate();
  const { cart } = useStore();

  const cartItemCount = (cart || []).reduce((total, item) => total + item.quantity, 0);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'in-stock', 'out-of-stock'

  // Use the paginated menu hook
  const {
    groupedItems,
    categories,
    loading,
    loadingMore,
    error,
    hasNextPage,
    totalItems,
    displayedCount,
    loadMore
  } = usePaginatedMenu({
    selectedCategory,
    searchTerm,
    stockFilter,
    sortBy: 'default'
  });

  const handleAddToCart = (item) => {
    // Add a subtle animation feedback
    const button = document.querySelector(`[data-item-id="${item._id}"]`);
    if (button) {
      button.classList.add('animate-bounce-slow');
      setTimeout(() => {
        button.classList.remove('animate-bounce-slow');
      }, 600);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading pre-order menu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </button>
          
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Pre-Order Menu
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Schedule your favorite dishes for pickup
              </p>
            </div>
            
            {/* Schedule Pre-Order Button */}
            {cartItemCount > 0 && (
              <button
                onClick={() => navigate('/pre-order')}
                className="btn-primary inline-flex items-center ml-4"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Pre-Order ({cartItemCount})
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-with-icon"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline inline-flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Category Filters
            </button>
          </div>

          {/* Stock Filter - Always Visible */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Filter by Stock</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStockFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  stockFilter === 'all' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Items
              </button>
              <button
                onClick={() => setStockFilter('in-stock')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  stockFilter === 'in-stock' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                In Stock
              </button>
              <button
                onClick={() => setStockFilter('out-of-stock')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  stockFilter === 'out-of-stock' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Out of Stock
              </button>
            </div>
          </div>

          {/* Category Filter - Collapsible */}
          {showFilters && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Filter by Category</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === '' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All Categories
                </button>
                {(categories || []).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Menu Items */}
        {!loading && (
          <ErrorBoundary>
            <SimpleMenuList
              groupedItems={groupedItems || {}}
              onAddToCart={handleAddToCart}
              loading={loadingMore}
            />
          </ErrorBoundary>
        )}

        {/* Results Info - Below Menu Items */}
        {!loading && totalItems > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Showing {displayedCount} of {totalItems} items
              {searchTerm && ` matching "${searchTerm}"`}
              {selectedCategory && ` in ${selectedCategory}`}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Available for pre-order
              </div>
              {hasNextPage && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pre-Order Information */}
        <div className="mt-8 card">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-500" />
              Pre-Order Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">How Pre-Orders Work</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Select items from our pre-order menu</li>
                  <li>• Choose your preferred pickup date and time</li>
                  <li>• Orders are prepared 15 minutes before pickup</li>
                  <li>• Available pickup hours: 8:00 AM - 10:00 PM</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Important Notes</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Please arrive on time to ensure food quality</li>
                  <li>• Contact us if you need to modify pickup time</li>
                  <li>• Cancellations accepted up to 2 hours before pickup</li>
                  <li>• Pre-orders can be scheduled up to 30 days in advance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreOrderMenu;
