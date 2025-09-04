import React from 'react';
import MenuItemCard from './MenuItemCard';

const SimpleMenuList = ({ groupedItems, onAddToCart, loading }) => {
  // Ensure groupedItems is an object
  const safeGroupedItems = groupedItems && typeof groupedItems === 'object' ? groupedItems : {};
  
  // Check if we have any items
  const hasItems = Object.keys(safeGroupedItems).length > 0;

  if (!hasItems && !loading) {
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
    <div className="space-y-8">
      {Object.entries(safeGroupedItems).map(([category, items]) => {
        // Ensure items is an array
        const safeItems = Array.isArray(items) ? items : [];
        
        if (safeItems.length === 0) return null;
        
        return (
          <div key={category} className="card">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {category}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {safeItems.map((item) => {
                  // Ensure item has required properties
                  if (!item || !item._id) return null;
                  
                  return (
                    <div key={item._id} className="fade-in">
                      <MenuItemCard
                        item={item}
                        onAddToCart={() => onAddToCart(item)}
                        dataItemId={item._id}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
      
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">Loading more items...</span>
        </div>
      )}
    </div>
  );
};

export default SimpleMenuList;
