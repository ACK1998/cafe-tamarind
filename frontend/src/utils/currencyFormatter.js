import { CURRENCY_CONFIG } from '../config/constants';

// Centralized currency formatter for Indian Rupees
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format currency without symbol (just the number)
export const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format currency with symbol for display
export const formatPrice = (amount) => {
  return `₹${formatAmount(amount)}`;
};
