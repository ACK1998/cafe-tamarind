import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import MenuItemCard from './MenuItemCard';

// Skeleton loading component
const MenuItemSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 relative">
    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 relative overflow-hidden">
      <div className="absolute inset-0 skeleton-shimmer"></div>
      <div className="flex items-center justify-center h-full relative z-10">
        <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-2xl pulse-soft"></div>
      </div>
    </div>
    <div className="p-6 relative">
      <div className="absolute inset-0 skeleton-shimmer opacity-30"></div>
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 pulse-soft"></div>
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-16 pulse-soft"></div>
      </div>
      <div className="space-y-2 mb-4 relative z-10">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full pulse-soft"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3 pulse-soft"></div>
      </div>
      <div className="flex justify-between items-center relative z-10">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20 pulse-soft"></div>
        <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-24 pulse-soft"></div>
      </div>
    </div>
  </div>
);

// Category header component
const CategoryHeader = ({ category }) => (
  <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 mb-4 sticky top-0 z-10 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 fade-in">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
      {category}
    </h2>
  </div>
);

const VirtualizedMenuList = ({ 
  groupedItems, 
  onAddToCart, 
  loading = false,
  itemsPerRow = 3,
  itemHeight = 320,
  containerHeight = 600 
}) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  
  // Flatten grouped items into a single array with category headers
  const flattenedItems = useMemo(() => {
    const items = [];
    
    // Ensure groupedItems is an object before processing
    const safeGroupedItems = groupedItems && typeof groupedItems === 'object' ? groupedItems : {};
    
    Object.entries(safeGroupedItems).forEach(([category, categoryItems]) => {
      // Ensure categoryItems is an array
      const safeCategoryItems = Array.isArray(categoryItems) ? categoryItems : [];
      
      // Skip empty categories
      if (safeCategoryItems.length === 0) return;
      
      // Add category header
      items.push({
        type: 'category',
        category,
        id: `category-${category}`
      });
      
      // Group items into rows for grid layout
      const rows = [];
      for (let i = 0; i < safeCategoryItems.length; i += itemsPerRow) {
        rows.push({
          type: 'row',
          items: safeCategoryItems.slice(i, i + itemsPerRow),
          id: `row-${category}-${Math.floor(i / itemsPerRow)}`
        });
      }
      
      items.push(...rows);
    });
    
    return items;
  }, [groupedItems, itemsPerRow]);

  // Add loading skeleton items if loading
  const itemsWithLoading = useMemo(() => {
    if (!loading) return flattenedItems;
    
    const skeletonRows = Array.from({ length: 5 }, (_, i) => ({
      type: 'skeleton',
      id: `skeleton-${i}`
    }));
    
    return [...flattenedItems, ...skeletonRows];
  }, [flattenedItems, loading]);

  const itemCount = itemsWithLoading.length;

  // Check if item is loaded (for infinite loader)
  const isItemLoaded = useCallback((index) => {
    return index < flattenedItems.length;
  }, [flattenedItems.length]);

  // Load more items (placeholder for infinite loading)
  const loadMoreItems = useCallback(async (startIndex, stopIndex) => {
    // This would typically fetch more data from the API
    // For now, it's handled by the parent component
    return Promise.resolve();
  }, []);

  // Render individual row item
  const Row = useCallback(({ index, style }) => {
    const item = itemsWithLoading[index];
    
    if (!item) {
      return (
        <div style={style}>
          <div className="p-4">
            <MenuItemSkeleton />
          </div>
        </div>
      );
    }

    if (item.type === 'category') {
      return (
        <div style={style}>
          <CategoryHeader category={item.category} />
        </div>
      );
    }

    if (item.type === 'skeleton') {
      return (
        <div style={style}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {Array.from({ length: itemsPerRow }, (_, i) => (
              <MenuItemSkeleton key={i} />
            ))}
          </div>
        </div>
      );
    }

    if (item.type === 'row') {
      return (
        <div style={style}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {item.items.map((menuItem, idx) => (
              <div key={menuItem._id} className="slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                <MenuItemCard
                  item={menuItem}
                  onAddToCart={() => onAddToCart(menuItem)}
                  dataItemId={menuItem._id}
                />
              </div>
            ))}
            {/* Fill empty slots in the row */}
            {Array.from({ 
              length: itemsPerRow - item.items.length 
            }, (_, i) => (
              <div key={`empty-${i}`} className="invisible">
                <MenuItemCard item={{}} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  }, [itemsWithLoading, onAddToCart, itemsPerRow]);

  // Handle scroll to update visible range
  const handleScroll = useCallback(({ visibleStartIndex, visibleStopIndex }) => {
    setVisibleRange({ start: visibleStartIndex, end: visibleStopIndex });
  }, []);

  if (itemCount === 0 && !loading) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          No Menu Items Found
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          No items are currently available.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Scroll progress indicator */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 bg-opacity-80 backdrop-blur-sm">
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
            style={{ 
              width: `${itemCount > 0 ? ((visibleRange.end / itemCount) * 100) : 0}%` 
            }}
          />
        </div>
      </div>

      {/* Virtualized list */}
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount + (loading ? 5 : 0)} // Add buffer for loading
        loadMoreItems={loadMoreItems}
      >
        {({ onItemsRendered, ref }) => (
          <List
            ref={ref}
            height={containerHeight}
            itemCount={itemCount}
            itemSize={itemHeight}
            onItemsRendered={({ visibleStartIndex, visibleStopIndex, ...rest }) => {
              handleScroll({ visibleStartIndex, visibleStopIndex });
              onItemsRendered({ visibleStartIndex, visibleStopIndex, ...rest });
            }}
            className="scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700"
          >
            {Row}
          </List>
        )}
      </InfiniteLoader>

      {/* Loading indicator at bottom */}
      {loading && (
        <div className="flex justify-center items-center py-8 fade-in">
          <div className="relative">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <div className="absolute inset-0 rounded-full border-2 border-orange-200 dark:border-orange-800 pulse-soft"></div>
          </div>
          <span className="ml-3 text-gray-600 dark:text-gray-300 pulse-soft">Loading more items...</span>
        </div>
      )}
    </div>
  );
};

export default VirtualizedMenuList;
