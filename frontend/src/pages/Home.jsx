import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ShoppingCart } from 'lucide-react';
import Navbar from '../components/Navbar';
import SimpleMenuList from '../components/SimpleMenuList';
import ErrorBoundary from '../components/ErrorBoundary';
import useStore from '../store/useStore';
import usePaginatedMenu from '../hooks/usePaginatedMenu';

const Home = () => {
  const navigate = useNavigate();
  const { cart } = useStore();

  const cartItemCount = (cart || []).reduce((total, item) => total + item.quantity, 0);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'in-stock', 'out-of-stock'
  const [sortBy, setSortBy] = useState('default'); // 'default', 'rating-high', 'rating-low', 'name', 'price-low', 'price-high'

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
    sortBy
  });




  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

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
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading menu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to{' '}
            <span className="text-orange-600 dark:text-orange-400">
              Cafe Tamarind
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover our delicious menu and place your order with ease
          </p>
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
                onChange={handleSearchChange}
                className="input-with-icon"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="default">Sort by Default</option>
              <option value="rating-high">Highest Rated</option>
              <option value="rating-low">Lowest Rated</option>
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
            </select>

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
        )}

        {/* Floating Cart Button */}
        <button
          onClick={() => navigate('/cart')}
          className="fixed bottom-6 right-6 w-14 h-14 gradient-primary rounded-full shadow-professional-hover flex items-center justify-center text-white hover:scale-110 transition-all duration-300 z-50"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Home;
