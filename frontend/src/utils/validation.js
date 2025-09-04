import { VALIDATION_RULES } from '../config/constants';

// Email validation
export const isValidEmail = (email) => {
  return VALIDATION_RULES.EMAIL_REGEX.test(email);
};

// Phone validation
export const isValidPhone = (phone) => {
  return VALIDATION_RULES.PHONE_REGEX.test(phone);
};

// Password validation
export const isValidPassword = (password) => {
  return password && password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH;
};

// Name validation
export const isValidName = (name) => {
  return name && name.trim().length >= 2;
};

// Required field validation
export const isRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

// Price validation
export const isValidPrice = (price) => {
  return typeof price === 'number' && price >= 0;
};

// Quantity validation
export const isValidQuantity = (quantity) => {
  return Number.isInteger(quantity) && quantity > 0;
};

// Form validation helper
export const validateForm = (formData, rules) => {
  const errors = {};

  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const fieldRules = rules[field];

    if (fieldRules.required && !isRequired(value)) {
      errors[field] = `${field} is required`;
    } else if (value && fieldRules.email && !isValidEmail(value)) {
      errors[field] = 'Invalid email format';
    } else if (value && fieldRules.phone && !isValidPhone(value)) {
      errors[field] = 'Invalid phone format';
    } else if (value && fieldRules.password && !isValidPassword(value)) {
      errors[field] = `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`;
    } else if (value && fieldRules.name && !isValidName(value)) {
      errors[field] = 'Name must be at least 2 characters';
    } else if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] = `${field} must be at least ${fieldRules.minLength} characters`;
    } else if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[field] = `${field} must be less than ${fieldRules.maxLength} characters`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
