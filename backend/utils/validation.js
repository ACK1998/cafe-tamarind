const { VALIDATION_RULES } = require('../config/constants');

// Email validation
const isValidEmail = (email) => {
  return VALIDATION_RULES.EMAIL_REGEX.test(email);
};

// Phone validation
const isValidPhone = (phone) => {
  return VALIDATION_RULES.PHONE_REGEX.test(phone);
};

// Password validation
const isValidPassword = (password) => {
  return password && password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH;
};

// Name validation
const isValidName = (name) => {
  return name && name.trim().length >= 2;
};

// Price validation
const isValidPrice = (price) => {
  return typeof price === 'number' && price >= 0;
};

// Quantity validation
const isValidQuantity = (quantity) => {
  return Number.isInteger(quantity) && quantity > 0;
};

// ObjectId validation
const isValidObjectId = (id) => {
  return id && /^[0-9a-fA-F]{24}$/.test(id);
};

// Order status validation
const isValidOrderStatus = (status) => {
  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'paid', 'cancelled'];
  return validStatuses.includes(status);
};

// Order type validation
const isValidOrderType = (type) => {
  const validTypes = ['dine-in', 'takeaway', 'pre-order'];
  return validTypes.includes(type);
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidName,
  isValidPrice,
  isValidQuantity,
  isValidObjectId,
  isValidOrderStatus,
  isValidOrderType
};
