import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../config/constants';

const ITEMS_PER_PAGE = 20;

const usePaginatedMenu = (filters = {}) => {
  const [allItems, setAllItems] = useState([]);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasNextPage, setHasNextPage] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const { selectedCategory, searchTerm, stockFilter, sortBy } = filters;

  // Fetch all menu items initially
  const fetchAllMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check user role from localStorage
      const customerData = localStorage.getItem('customerData');
      let userRole = 'customer';
      
      if (customerData) {
        try {
          const user = JSON.parse(customerData);
          userRole = user.role || 'customer';
        } catch (e) {
          console.error('Error parsing customer data:', e);
        }
      }
      
      // Fetch appropriate menu based on user role
      const endpoint = userRole === 'employee' ? '/menu/inhouse' : '/menu/customer';
      const response = await axios.get(`${API_CONFIG.BASE_URL}${endpoint}`);
      setAllItems(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Failed to load menu items');
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/menu/categories`);
      const categoryData = response.data.data;
      
      const validCategories = categoryData
        .filter(cat => typeof cat === 'string' && cat.trim() !== '')
        .sort();
      
      setCategories(validCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // Filter and sort items based on current filters
  const filteredAndSortedItems = useMemo(() => {
    return allItems
      .filter(item => {
        const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
        const matchesSearch = (searchTerm === '') || 
                             (item.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                             (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        let matchesStock = true;
        if (stockFilter === 'in-stock') {
          matchesStock = item.stock > 0;
        } else if (stockFilter === 'out-of-stock') {
          matchesStock = item.stock === 0;
        }
        
        return matchesCategory && matchesSearch && matchesStock;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'rating-high':
            if (a.rating && b.rating) return b.rating - a.rating;
            if (a.rating && !b.rating) return -1;
            if (!a.rating && b.rating) return 1;
            return a.name.localeCompare(b.name);
            
          case 'rating-low':
            if (a.rating && b.rating) return a.rating - b.rating;
            if (a.rating && !b.rating) return -1;
            if (!a.rating && b.rating) return 1;
            return a.name.localeCompare(b.name);
            
          case 'name':
            return a.name.localeCompare(b.name);
            
          case 'price-low':
            return (a.price || 0) - (b.price || 0);
            
          case 'price-high':
            return (b.price || 0) - (a.price || 0);
            
          default:
            if (a.rating && !b.rating) return -1;
            if (!a.rating && b.rating) return 1;
            if (a.category !== b.category) {
              return a.category.localeCompare(b.category);
            }
            return a.name.localeCompare(b.name);
        }
      });
  }, [allItems, selectedCategory, searchTerm, stockFilter, sortBy]);

  // Group items by category (only if not sorting by rating)
  const groupedItems = useMemo(() => {
    const itemsToGroup = Array.isArray(displayedItems) ? displayedItems : [];
    
    if (sortBy === 'rating-high' || sortBy === 'rating-low') {
      return { 'All Items': itemsToGroup };
    }
    
    return itemsToGroup.reduce((acc, item) => {
      const category = item.category || 'OTHER ITEMS';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  }, [displayedItems, sortBy]);

  // Load more items (pagination)
  const loadMore = useCallback(() => {
    if (loadingMore || !hasNextPage) return;

    setLoadingMore(true);
    
    // Simulate async loading with setTimeout
    setTimeout(() => {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newItems = filteredAndSortedItems.slice(startIndex, endIndex);
      
      if (newItems.length > 0) {
        setDisplayedItems(prev => [...prev, ...newItems]);
        setCurrentPage(prev => prev + 1);
        setHasNextPage(endIndex < filteredAndSortedItems.length);
      } else {
        setHasNextPage(false);
      }
      
      setLoadingMore(false);
    }, 300); // Small delay to show loading state
  }, [loadingMore, hasNextPage, currentPage, filteredAndSortedItems]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
    setHasNextPage(true);
    
    // Load first page immediately
    const firstPageItems = filteredAndSortedItems.slice(0, ITEMS_PER_PAGE);
    setDisplayedItems(firstPageItems);
    setHasNextPage(filteredAndSortedItems.length > ITEMS_PER_PAGE);
  }, [filteredAndSortedItems]);

  // Initial data fetch
  useEffect(() => {
    fetchAllMenuItems();
    fetchCategories();
  }, [fetchAllMenuItems, fetchCategories]);

  // Auto-load more items when reaching the end
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !loadingMore) {
      loadMore();
    }
  }, [hasNextPage, loadingMore, loadMore]);

  return {
    items: displayedItems || [],
    groupedItems: groupedItems || {},
    categories: categories || [],
    loading: loading || false,
    loadingMore: loadingMore || false,
    error: error || '',
    hasNextPage: hasNextPage || false,
    totalItems: filteredAndSortedItems?.length || 0,
    displayedCount: displayedItems?.length || 0,
    loadMore: handleLoadMore,
    refetch: fetchAllMenuItems
  };
};

export default usePaginatedMenu;
