const OrderReview = require('../models/OrderReview');
const Order = require('../models/Order');
const { validationResult } = require('express-validator');
const { generateReviewToken, verifyReviewToken, generateReviewUrl } = require('../services/reviewTokenService');

/**
 * @desc    Generate review token for an order
 * @route   POST /api/reviews/generate-token
 * @access  Public (for bill generation)
 */
const generateToken = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Generate review URL - prioritize environment variable, then try to detect from request
    let baseUrl = process.env.FRONTEND_URL;
    
    if (!baseUrl) {
      // Try to get from request origin/referer (works when frontend makes the request)
      const origin = req.headers.origin || req.headers.referer;
      
      if (origin) {
        // Extract base URL from origin/referer
        try {
          const url = new URL(origin);
          baseUrl = `${url.protocol}//${url.host}`;
          console.log('📡 Detected frontend URL from request headers:', baseUrl);
        } catch (e) {
          // Invalid URL, continue to fallback
        }
      }
      
      // If still no URL, try to get from request host
      if (!baseUrl) {
        const protocol = req.protocol || (req.secure ? 'https' : 'http');
        const host = req.get('host') || req.headers.host;
        
        if (host && !host.includes('localhost')) {
          // Production or network-accessible URL
          baseUrl = `${protocol}://${host.replace(/\/api.*$/, '')}`;
        } else {
          // Development fallback - use localhost but warn
          baseUrl = 'http://localhost:3006';
          console.warn('⚠️ Using localhost for review URL. Set FRONTEND_URL in .env or ensure frontend sends Origin header.');
        }
      }
    }
    
    console.log('🌐 Using frontend URL for review:', baseUrl);
    const reviewUrl = generateReviewUrl(order, baseUrl);

    res.json({
      success: true,
      data: {
        token: reviewUrl.split('token=')[1],
        reviewUrl
      }
    });
  } catch (error) {
    console.error('Generate review token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Validate review token and get order details
 * @route   GET /api/reviews/validate-token
 * @access  Public
 */
const validateToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Review token is required'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyReviewToken(token);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Invalid or expired review token'
      });
    }

    // Fetch order details (include pricingTier to check if employee)
    const order = await Order.findById(decoded.orderId)
      .select('orderNumber customerName customerPhone createdAt items total status pricingTier');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify order matches token data
    if (order.customerPhone !== decoded.customerPhone) {
      return res.status(403).json({
        success: false,
        message: 'Token does not match order'
      });
    }

    // Check if order is reviewable
    // Once bill is printed (token exists), allow review regardless of status
    // Only block cancelled orders
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot review a cancelled order'
      });
    }

    // Check if review already exists
    const existingReview = await OrderReview.findOne({ orderId: order._id });

    res.json({
      success: true,
      data: {
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          createdAt: order.createdAt,
          items: order.items,
          total: order.total,
          status: order.status,
          pricingTier: order.pricingTier
        },
        hasReviewed: !!existingReview,
        review: existingReview || null
      }
    });
  } catch (error) {
    console.error('Validate review token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Submit order review
 * @route   POST /api/reviews/submit
 * @access  Public
 */
const submitReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { token, rating, comment, isAnonymous, itemRatings } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Review token is required'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyReviewToken(token);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Invalid or expired review token'
      });
    }

    // Fetch order (include pricingTier to check if employee)
    const order = await Order.findById(decoded.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify order matches token
    if (order.customerPhone !== decoded.customerPhone) {
      return res.status(403).json({
        success: false,
        message: 'Token does not match order'
      });
    }

    // Check if order is reviewable
    // Once bill is printed (token exists), allow review regardless of status
    // Only block cancelled orders
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot review a cancelled order'
      });
    }

    // Validate item ratings if provided
    if (itemRatings && Array.isArray(itemRatings)) {
      for (const itemRating of itemRatings) {
        if (!itemRating.menuItemId || !itemRating.rating) {
          return res.status(400).json({
            success: false,
            message: 'Item ratings must include menuItemId and rating'
          });
        }
        if (itemRating.rating < 1 || itemRating.rating > 5) {
          return res.status(400).json({
            success: false,
            message: 'Item ratings must be between 1 and 5'
          });
        }
        // Verify item exists in order
        const orderItem = order.items.find(item => 
          item.menuItemId.toString() === itemRating.menuItemId.toString()
        );
        if (!orderItem) {
          return res.status(400).json({
            success: false,
            message: `Item ${itemRating.menuItemId} not found in order`
          });
        }
      }
    }

    // Check if review already exists
    const existingReview = await OrderReview.findOne({ orderId: order._id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already submitted for this order',
        data: existingReview
      });
    }

    // Find customer if exists
    const Customer = require('../models/Customer');
    const customer = await Customer.findOne({ phone: order.customerPhone });
    const customerId = customer ? customer._id : null;

    // Prepare item ratings data
    const itemRatingsData = itemRatings && Array.isArray(itemRatings) 
      ? itemRatings.map(itemRating => {
          const orderItem = order.items.find(item => 
            item.menuItemId.toString() === itemRating.menuItemId.toString()
          );
          return {
            menuItemId: itemRating.menuItemId,
            itemName: orderItem ? orderItem.name : 'Unknown Item',
            rating: itemRating.rating,
            comment: itemRating.comment || ''
          };
        })
      : [];

    // Create review
    const review = await OrderReview.create({
      orderId: order._id,
      customerPhone: order.customerPhone,
      customerId,
      rating,
      comment: comment || '',
      isAnonymous: isAnonymous || false,
      itemRatings: itemRatingsData
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    console.error('Submit review error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Review already submitted for this order'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get review by order ID
 * @route   GET /api/reviews/order/:orderId
 * @access  Public
 */
const getOrderReview = async (req, res) => {
  try {
    const { orderId } = req.params;

    const review = await OrderReview.findOne({ orderId })
      .populate('orderId', 'orderNumber customerName createdAt total');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found for this order'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Get order review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get all reviews (Admin)
 * @route   GET /api/reviews/admin/all
 * @access  Private/Admin
 */
const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, rating, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    let query = {};
    if (rating) {
      query.rating = parseInt(rating);
    }

    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await OrderReview.find(query)
      .populate('orderId', 'orderNumber customerName createdAt total')
      .populate('customerId', 'name phone')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await OrderReview.countDocuments(query);

    // Get statistics
    const stats = await OrderReview.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    const ratingCounts = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: stats[0]?.ratingDistribution.filter(r => r === rating).length || 0
    }));

    res.json({
      success: true,
      data: reviews,
      stats: {
        total: stats[0]?.totalReviews || 0,
        avgRating: Math.round((stats[0]?.avgRating || 0) * 10) / 10,
        ratingDistribution: ratingCounts
      },
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  generateToken,
  validateToken,
  submitReview,
  getOrderReview,
  getAllReviews
};

