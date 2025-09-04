const Feedback = require('../models/Feedback');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Customer = require('../models/Customer');
const { validationResult } = require('express-validator');

// @desc    Submit feedback for completed order items
// @route   POST /api/feedback
// @access  Public (customers with order info)
const submitFeedback = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { 
      customerPhone,
      orderId, 
      reviews // Array of { menuItemId, foodRating, serviceRating, comment, isAnonymous }
    } = req.body;

    if (!customerPhone || !orderId || !reviews || reviews.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer phone, order ID, and reviews are required'
      });
    }

    // Verify order exists and belongs to customer
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.customerPhone !== customerPhone) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to review this order'
      });
    }

    // Check if order is completed
    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed orders'
      });
    }

    // Find customer by phone (optional - for linking if registered)
    const customer = await Customer.findOne({ phone: customerPhone });
    const userId = customer ? customer._id : null;

    const submittedReviews = [];
    const reviewErrors = [];

    // If this is an update (existing reviews found), delete existing reviews first
    const existingReviewsCheck = await Feedback.find({
      orderId,
      customerPhone
    });

    if (existingReviewsCheck.length > 0) {
      await Feedback.deleteMany({
        orderId,
        customerPhone
      });
    }

    for (const review of reviews) {
      const { menuItemId, foodRating, serviceRating, comment, isAnonymous } = review;

      // Validate menu item exists in the order
      const orderItem = order.items.find(item => item.menuItemId.toString() === menuItemId);
      if (!orderItem) {
        reviewErrors.push(`Menu item ${menuItemId} not found in order`);
        continue;
      }

      // Note: We removed the existing feedback check since we're allowing updates
      // Existing reviews are deleted above before creating new ones

      try {
        // Create separate feedback entries for food and service if both provided
        if (foodRating) {
          const foodFeedback = await Feedback.create({
            userId,
            customerPhone,
            orderId,
            menuItemId,
            rating: foodRating,
            reviewType: 'food',
            comment: comment || '',
            isAnonymous: isAnonymous || false
          });
          submittedReviews.push(foodFeedback);
        }

        if (serviceRating) {
          const serviceFeedback = await Feedback.create({
            userId,
            customerPhone,
            orderId,
            menuItemId,
            rating: serviceRating,
            reviewType: 'service',
            comment: comment || '',
            isAnonymous: isAnonymous || false
          });
          submittedReviews.push(serviceFeedback);
        }
      } catch (error) {
        console.error('Error creating feedback:', error);
        reviewErrors.push(`Failed to save review for ${orderItem.name}`);
      }
    }

    if (submittedReviews.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No reviews were submitted',
        errors: reviewErrors
      });
    }

    res.status(201).json({
      success: true,
      message: `Successfully submitted ${submittedReviews.length} reviews`,
      data: submittedReviews,
      errors: reviewErrors.length > 0 ? reviewErrors : undefined
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get feedback for a specific order
// @route   GET /api/feedback/order/:orderId
// @access  Public
const getOrderFeedback = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { customerPhone } = req.query;

    if (!customerPhone) {
      return res.status(400).json({
        success: false,
        message: 'Customer phone is required'
      });
    }

    // Verify order belongs to customer
    const order = await Order.findById(orderId);
    if (!order || order.customerPhone !== customerPhone) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or unauthorized'
      });
    }

    const feedback = await Feedback.find({ orderId, customerPhone })
      .populate('menuItemId', 'name image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Get order feedback error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get feedback for a menu item
// @route   GET /api/feedback/item/:menuItemId
// @access  Public
const getMenuItemFeedback = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const { type = 'all', page = 1, limit = 10 } = req.query;

    let query = { menuItemId };
    
    if (type !== 'all') {
      query.reviewType = type;
    }

    const skip = (page - 1) * limit;

    const feedback = await Feedback.find(query)
      .populate('userId', 'name')
      .populate('orderId', 'orderNumber createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(query);

    // Calculate average ratings
    const avgRatings = await Feedback.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$reviewType',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      food: avgRatings.find(r => r._id === 'food') || { avgRating: 0, count: 0 },
      service: avgRatings.find(r => r._id === 'service') || { avgRating: 0, count: 0 }
    };

    res.json({
      success: true,
      data: feedback,
      stats,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get menu item feedback error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Check if customer can review an order
// @route   GET /api/feedback/can-review/:orderId
// @access  Public
const canReviewOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { customerPhone } = req.query;

    if (!customerPhone) {
      return res.status(400).json({
        success: false,
        message: 'Customer phone is required'
      });
    }

    // Check order exists and belongs to customer
    const order = await Order.findById(orderId);
    if (!order || order.customerPhone !== customerPhone) {
      return res.json({
        success: true,
        canReview: false,
        reason: 'Order not found or unauthorized'
      });
    }

    // Check if order is completed
    if (order.status !== 'completed') {
      return res.json({
        success: true,
        canReview: false,
        reason: 'Order must be completed to leave a review'
      });
    }

    // Check if reviews already exist
    const existingReviews = await Feedback.find({ orderId, customerPhone });
    const reviewedItems = new Set();
    existingReviews.forEach(review => {
      reviewedItems.add(review.menuItemId.toString());
    });

    // Get items that can be reviewed
    const reviewableItems = order.items.filter(item => 
      !reviewedItems.has(item.menuItemId.toString())
    );

    res.json({
      success: true,
      canReview: reviewableItems.length > 0,
      reviewableItems: reviewableItems.map(item => ({
        menuItemId: item.menuItemId,
        name: item.name,
        qty: item.qty
      })),
      existingReviews: existingReviews.length
    });
  } catch (error) {
    console.error('Can review order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get all feedback (Admin only)
// @route   GET /api/feedback/admin/all
// @access  Private/Admin
const getAllFeedback = async (req, res) => {
  try {
    const { 
      type, 
      rating, 
      menuItemId, 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};
    
    if (type && type !== 'all') {
      query.reviewType = type;
    }
    
    if (rating) {
      query.rating = parseInt(rating);
    }
    
    if (menuItemId) {
      query.menuItemId = menuItemId;
    }

    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const feedback = await Feedback.find(query)
      .populate('userId', 'name email')
      .populate('menuItemId', 'name category image')
      .populate('orderId', 'orderNumber customerName createdAt')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(query);

    // Get statistics
    const stats = await Feedback.aggregate([
      { $match: query },
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
      data: feedback,
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
    console.error('Get all feedback error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Delete feedback (Admin only)
// @route   DELETE /api/feedback/admin/:feedbackId
// @access  Private/Admin
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.feedbackId);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    await Feedback.findByIdAndDelete(req.params.feedbackId);

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get feedback analytics (Admin only)
// @route   GET /api/feedback/admin/analytics
// @access  Private/Admin
const getFeedbackAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Overall statistics
    const overallStats = await Feedback.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          foodAvg: {
            $avg: {
              $cond: [{ $eq: ['$reviewType', 'food'] }, '$rating', null]
            }
          },
          serviceAvg: {
            $avg: {
              $cond: [{ $eq: ['$reviewType', 'service'] }, '$rating', null]
            }
          }
        }
      }
    ]);

    // Top rated items
    const topRatedItems = await Feedback.aggregate([
      { $match: { createdAt: { $gte: startDate }, reviewType: 'food' } },
      {
        $group: {
          _id: '$menuItemId',
          avgRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      },
      { $match: { reviewCount: { $gte: 3 } } }, // At least 3 reviews
      { $sort: { avgRating: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: '$menuItem' }
    ]);

    // Recent feedback trends
    const feedbackTrends = await Feedback.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$reviewType'
          },
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        period,
        overview: overallStats[0] || {
          totalReviews: 0,
          avgRating: 0,
          foodAvg: 0,
          serviceAvg: 0
        },
        topRatedItems: topRatedItems.map(item => ({
          name: item.menuItem.name,
          category: item.menuItem.category,
          avgRating: Math.round(item.avgRating * 10) / 10,
          reviewCount: item.reviewCount
        })),
        trends: feedbackTrends
      }
    });
  } catch (error) {
    console.error('Get feedback analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = {
  submitFeedback,
  getOrderFeedback,
  getMenuItemFeedback,
  canReviewOrder,
  getAllFeedback,
  deleteFeedback,
  getFeedbackAnalytics
};
