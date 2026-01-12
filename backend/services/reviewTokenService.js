const jwt = require('jsonwebtoken');
const { JWT_CONFIG } = require('../config/constants');

/**
 * Generate a secure review token for an order
 * @param {Object} payload - Order details to encode
 * @param {string} payload.orderId - Order ID
 * @param {string} payload.invoiceNumber - Order number/invoice number
 * @param {string} payload.customerPhone - Customer phone number
 * @param {string} payload.orderDate - Order date (ISO string)
 * @param {string} [payload.customerId] - Optional customer ID
 * @returns {string} JWT token
 */
const generateReviewToken = (payload) => {
  const { orderId, invoiceNumber, customerPhone, orderDate, customerId } = payload;

  if (!orderId || !invoiceNumber || !customerPhone || !orderDate) {
    throw new Error('Missing required fields for review token generation');
  }

  const tokenPayload = {
    orderId,
    invoice: invoiceNumber,
    customerPhone,
    orderDate,
    ...(customerId && { customerId })
  };

  // Use a shorter expiry for review tokens (30 days)
  const expiresIn = process.env.REVIEW_TOKEN_EXPIRY || '30d';

  return jwt.sign(tokenPayload, process.env.JWT_SECRET || JWT_CONFIG.SECRET, {
    expiresIn
  });
};

/**
 * Verify and decode a review token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyReviewToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || JWT_CONFIG.SECRET);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Review token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid review token');
    }
    throw error;
  }
};

/**
 * Generate review URL with token
 * @param {Object} orderData - Order details
 * @param {string} baseUrl - Base URL of the frontend application
 * @returns {string} Review URL with token
 */
const generateReviewUrl = (orderData, baseUrl) => {
  const token = generateReviewToken({
    orderId: orderData._id || orderData.orderId,
    invoiceNumber: orderData.orderNumber || orderData.invoiceNumber,
    customerPhone: orderData.customerPhone,
    orderDate: orderData.createdAt || orderData.orderDate,
    customerId: orderData.customerId
  });

  // Ensure baseUrl doesn't have trailing slash
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  
  // Properly encode the token in the URL
  const encodedToken = encodeURIComponent(token);
  
  return `${cleanBaseUrl}/review?token=${encodedToken}`;
};

module.exports = {
  generateReviewToken,
  verifyReviewToken,
  generateReviewUrl
};

