import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Meal time state
  const [mealTime, setMealTime] = useState(() => {
    const saved = localStorage.getItem('mealTime');
    return saved || 'breakfast';
  });

  // Order type state
  const [orderType, setOrderType] = useState(() => {
    const saved = localStorage.getItem('orderType');
    return saved || 'NOW';
  });

  // Scheduled date and time for pre-orders
  const [scheduledDateTime, setScheduledDateTime] = useState(() => {
    const saved = localStorage.getItem('scheduledDateTime');
    return saved ? new Date(saved) : null;
  });

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Set order type
  const setOrderTypeHandler = (type) => {
    setOrderType(type);
  };

  // Update scheduled date time
  const updateScheduledDateTime = (dateTime) => {
    setScheduledDateTime(dateTime);
  };

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('mealTime', mealTime);
  }, [mealTime]);

  useEffect(() => {
    localStorage.setItem('orderType', orderType);
  }, [orderType]);

  useEffect(() => {
    localStorage.setItem('scheduledDateTime', scheduledDateTime ? scheduledDateTime.toISOString() : '');
  }, [scheduledDateTime]);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const value = {
    isDarkMode,
    toggleDarkMode,
    mealTime,
    setMealTime,
    orderType,
    setOrderType: setOrderTypeHandler,
    scheduledDateTime,
    updateScheduledDateTime
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
